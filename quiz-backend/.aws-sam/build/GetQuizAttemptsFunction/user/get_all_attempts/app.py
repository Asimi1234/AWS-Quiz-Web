# user/get_all_attempts/app.py
import json
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr

# === DynamoDB setup ===
dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("ATTEMPTS_TABLE", "UserQuizAttempts")
table = dynamodb.Table(TABLE_NAME)

def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
    }

# === Lambda entry point ===
def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": ""
        }

    try:
        print(f"EVENT: {json.dumps(event)}")

        # === Extract user ID ===
        authorizer_ctx = event["requestContext"]["authorizer"]
        user_id = authorizer_ctx.get("userId")
        if not user_id:
            return {
                "statusCode": 403,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Unauthorized"})
            }

        # === Optional quizId filter ===
        query_params = event.get("queryStringParameters") or {}
        quiz_id_filter = query_params.get("quizId")

        partition_key = f"USER#{user_id}"

        # === Query DynamoDB ===
        response = table.query(
            KeyConditionExpression=Key("PK").eq(partition_key)
        )

        items = response.get("Items", [])

        # === Filter by quizId if provided ===
        if quiz_id_filter:
            items = [
                item for item in items
                if item.get("quizId") == quiz_id_filter
            ]

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({
                "success": True,
                "attempts": items
            })
        }

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({
                "error": "Internal server error",
                "message": str(e)
            })
        }
