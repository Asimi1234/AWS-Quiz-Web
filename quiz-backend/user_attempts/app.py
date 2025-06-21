import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('QUIZ_ATTEMPTS_TABLE', 'QuizAttempts')
table = dynamodb.Table(table_name)

MAX_FREE_ATTEMPTS = 5
MAX_ADMIN_ATTEMPTS = 60

def lambda_handler(event, context):
    cors_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

    print("Received event:", json.dumps(event))

    method = event.get("httpMethod")

    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": ""
        }

    elif method == "GET":
        params = event.get("queryStringParameters") or {}
        user_id = params.get("user_id")
        course_id = params.get("course_id")
        is_admin = params.get("is_admin", "false").lower() == "true"

        if not user_id or not course_id:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Missing user_id or course_id"})
            }

        try:
            response = table.get_item(Key={"user_id": user_id, "course_id": course_id})
            item = response.get("Item", {})

            attempts_field = "admin_attempts" if is_admin else "free_attempts"
            attempts = item.get(attempts_field, 0)
            attempts = int(attempts) if isinstance(attempts, Decimal) else attempts

            max_attempts = MAX_ADMIN_ATTEMPTS if is_admin else MAX_FREE_ATTEMPTS
            remaining_attempts = max(0, max_attempts - attempts)

            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({
                    "success": True,
                    "attempts": attempts,
                    "max_attempts": max_attempts,
                    "remaining_attempts": remaining_attempts,
                    "is_admin": is_admin
                })
            }

        except Exception as e:
            print("Error fetching attempts:", str(e))
            return {
                "statusCode": 500,
                "headers": cors_headers,
                "body": json.dumps({"error": "Internal Server Error"})
            }

    elif method == "POST":
        try:
            body = json.loads(event.get("body", "{}"))
            user_id = body.get("user_id")
            course_id = body.get("course_id")
            is_admin = body.get("is_admin", False)

            if not user_id or not course_id:
                return {
                    "statusCode": 400,
                    "headers": cors_headers,
                    "body": json.dumps({"error": "Missing user_id or course_id"})
                }

            timestamp = datetime.utcnow().isoformat() + "Z"
            attempts_field = "admin_attempts" if is_admin else "free_attempts"
            max_attempts = MAX_ADMIN_ATTEMPTS if is_admin else MAX_FREE_ATTEMPTS

            response = table.update_item(
                Key={"user_id": user_id, "course_id": course_id},
                UpdateExpression=f"""
                    SET {attempts_field} = if_not_exists({attempts_field}, :zero) + :inc,
                        last_attempt = :ts,
                        is_admin = :admin
                """,
                ExpressionAttributeValues={
                    ":inc": 1,
                    ":zero": 0,
                    ":ts": timestamp,
                    ":admin": is_admin
                },
                ReturnValues="ALL_NEW"
            )

            new_attempts = response["Attributes"].get(attempts_field, 1)
            new_attempts = int(new_attempts) if isinstance(new_attempts, Decimal) else new_attempts

            remaining_attempts = max(0, max_attempts - new_attempts)

            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({
                    "success": True,
                    "current_attempts": new_attempts,
                    "remaining_attempts": remaining_attempts,
                    "max_attempts": max_attempts,
                    "timestamp": timestamp
                })
            }

        except json.JSONDecodeError:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Invalid JSON in request body"})
            }

        except Exception as e:
            print("Error recording attempt:", str(e))
            return {
                "statusCode": 500,
                "headers": cors_headers,
                "body": json.dumps({"error": "Internal Server Error"})
            }

    else:
        return {
            "statusCode": 405,
            "headers": cors_headers,
            "body": json.dumps({"error": f"Method {method} not allowed"})
        }
