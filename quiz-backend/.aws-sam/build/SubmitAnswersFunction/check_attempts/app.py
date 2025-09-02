import json
import os
import boto3
import decimal
from boto3.dynamodb.conditions import Key

# CORS headers for all responses
def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }
def decimal_default(obj):
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError

# Consistent API response format
def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": cors_headers(),
        "body": json.dumps(body, default=decimal_default)  # Add decimal handler
    }

# Initialize DynamoDB table
dynamodb = boto3.resource('dynamodb')
attempts_table = dynamodb.Table('QuizAttempts')

def lambda_handler(event, context):
    try:
        # Handle CORS preflight request
        if event.get('httpMethod') == 'OPTIONS':
            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"message": "Preflight OK"})
            }

        # Extract user info from the authorizer's context
        auth_context = event.get("requestContext", {}).get("authorizer", {})
        user_id = auth_context.get("userId")
        is_admin = auth_context.get("isAdmin") == "true"

        # Allow admin override of user_id via query string
        params = event.get('queryStringParameters') or {}
        if is_admin:
            user_id = params.get("user_id", user_id)

        if not user_id:
            return generate_response(400, {"message": "User ID not provided"})

        course_id = params.get("course_id")
        if not course_id:
            return generate_response(400, {"message": "Missing course_id query parameter"})

        try:
            # Initialize attempts list
            all_attempts = []
            
            # Method 1: Try to find new format attempts (composite keys)
            try:
                response = attempts_table.query(
                    KeyConditionExpression=Key('user_id').eq(user_id) & Key('course_id').begins_with(f"{course_id}#")
                )
                new_attempts = response.get("Items", [])
                all_attempts.extend(new_attempts)
                print(f"Found {len(new_attempts)} new format attempts")
            except Exception as e:
                print(f"New format query failed: {str(e)}")
            
            # Method 2: Also check for old format attempts (single key)
            try:
                old_response = attempts_table.get_item(
                    Key={
                        "user_id": user_id,
                        "course_id": course_id  # Original format without timestamp
                    }
                )
                old_item = old_response.get("Item")
                if old_item:
                    all_attempts.append(old_item)
                    print(f"Found 1 old format attempt")
            except Exception as e:
                print(f"Old format query failed: {str(e)}")
            
            current_attempts = len(all_attempts)
            print(f"Total attempts found: {current_attempts}")
            
        except Exception as db_err:
            print("DynamoDB query error:", str(db_err))
            # Fallback: assume no attempts if queries fail
            current_attempts = 0
            all_attempts = []

        max_attempts = 5
        remaining_attempts = max_attempts - current_attempts
        can_attempt = remaining_attempts > 0

        # Include attempt history for debugging/frontend use
        attempt_history = []
        for item in sorted(all_attempts, key=lambda x: x.get("timestamp", x.get("last_attempt", "")), reverse=True):
            attempt_history.append({
                "score": item.get("score"),
                "timestamp": item.get("timestamp") or item.get("last_attempt"),
                "attempt_id": item.get("course_id"),
                "format": "new" if "#" in str(item.get("course_id", "")) else "old"
            })

        result = {
            "success": True,
            "user_id": user_id,
            "course_id": course_id,
            "current_attempts": current_attempts,
            "remaining_attempts": remaining_attempts,
            "max_attempts": max_attempts,
            "can_attempt": can_attempt,
            "attempt_history": attempt_history
        }

        return generate_response(200, result)

    except Exception as e:
        print("Unhandled error:", str(e))
        return generate_response(500, {"message": "Internal server error", "error": str(e)})