import json
import os
import boto3
from boto3.dynamodb.conditions import Key

# CORS headers for all responses
def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

# Consistent API response format
def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": cors_headers(),
        "body": json.dumps(body)
    }

# Initialize DynamoDB table (ensure your Lambda has DynamoDB read permissions)
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
            response = attempts_table.get_item(
                Key={
                    "user_id": user_id,
                    "course_id": course_id
                }
            )
            item = response.get("Item", {})
            current_attempts = item.get("attempt_count", 0)
        except Exception as db_err:
            print("DynamoDB query error:", str(db_err))
            return generate_response(500, {"message": "Error accessing attempts data", "error": str(db_err)})

        max_attempts = 5
        remaining_attempts = max_attempts - current_attempts
        can_attempt = remaining_attempts > 0

        result = {
            "success": True,
            "user_id": user_id,
            "course_id": course_id,
            "current_attempts": current_attempts,
            "remaining_attempts": remaining_attempts,
            "max_attempts": max_attempts,
            "can_attempt": can_attempt
        }

        return generate_response(200, result)

    except Exception as e:
        print("Unhandled error:", str(e))
        return generate_response(500, {"message": "Internal server error", "error": str(e)})
