# user/get_dashboard/app.py
import json
import os
import boto3
from boto3.dynamodb.conditions import Key, Attr
from utils import decimal_default

dynamodb = boto3.resource("dynamodb")
QUIZZES_TABLE = os.environ.get("USER_QUIZZES_TABLE", "UserQuizzes")
ATTEMPTS_TABLE = os.environ.get("USER_QUIZ_ATTEMPTS_TABLE", "UserQuizAttempts")

quizzes_table = dynamodb.Table(QUIZZES_TABLE)
attempts_table = dynamodb.Table(ATTEMPTS_TABLE)

def lambda_handler(event, context):
    print("Using table:", quizzes_table.table_name)
    try:
        print("EVENT:", event)

        # === Get User ID from authorizer ===
        authorizer_ctx = event.get("requestContext", {}).get("authorizer", {})
        user_id = authorizer_ctx.get("userId")

        if not user_id:
            return unauthorized_response("Missing userId from context")

        partition_key = f"USER#{user_id}"

        # === Fetch quizzes created by user ===
        quiz_resp = quizzes_table.query(
            KeyConditionExpression=Key("PK").eq(partition_key)
        )
        user_quizzes = quiz_resp.get("Items", [])

        # === Fetch quiz attempts by user ===
        attempt_resp = attempts_table.query(
            KeyConditionExpression=Key("PK").eq(partition_key)
        )
        user_attempts = attempt_resp.get("Items", [])

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({
                "success": True,
                "userId": user_id,
                "totalQuizzesCreated": len(user_quizzes),
                "totalAttemptsMade": len(user_attempts),
                "recentAttempts": sorted(user_attempts, key=lambda x: x.get("timestamp", ""), reverse=True)[:5]
            }, default=decimal_default)
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": str(e)})
        }

def unauthorized_response(message):
    return {
        "statusCode": 401,
        "headers": cors_headers(),
        "body": json.dumps({"error": message})
    }

def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    }
