# user/get_quiz/app.py

import json
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("USER_QUIZZES_TABLE", "UserQuizzes")
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": ""
        }

    try:
        # === Authenticate ===
        authorizer = event.get("requestContext", {}).get("authorizer", {})
        user_id = authorizer.get("userId", "").strip()

        if not user_id:
            print("Unauthorized access attempt: Missing userId in authorizer")
            return response(401, {"error": "Unauthorized"})

        # === Validate input ===
        params = event.get("queryStringParameters") or {}
        quiz_id = str(params.get("quizId", "")).strip()
        course_id = str(params.get("courseId", "")).strip().upper()

        if not quiz_id or not course_id:
            return response(400, {"error": "Missing quizId or courseId"})

        # === Generate primary key ===
        pk = f"USER#{user_id}"
        sk = f"QUIZ#{course_id}#{quiz_id}"

        result = table.get_item(Key={"PK": pk, "SK": sk})
        item = result.get("Item")

        if not item:
            print(f"Quiz not found for PK={pk}, SK={sk}")
            return response(404, {"error": "Quiz not found"})

        return response(200, {
            "success": True,
            "quiz": item
        })

    except Exception as e:
        print("Error fetching quiz:", str(e))
        return response(500, {"error": "Internal server error", "message": str(e)})

def response(status, body_dict):
    return {
        "statusCode": status,
        "headers": cors_headers(),
        "body": json.dumps(body_dict)
    }

def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    }
