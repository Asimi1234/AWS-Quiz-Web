# user/submit_quiz/app.py
import json
import os
import boto3
from datetime import datetime
from utils import decimal_default  # optional: for Decimal serialization

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("USER_ATTEMPTS_TABLE", "UserQuizAttempts")
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    try:
        # === Extract userId from Lambda authorizer ===
        authorizer = event["requestContext"]["authorizer"]
        user_id = authorizer.get("userId")
        if not user_id:
            raise ValueError("Missing userId in token")

        # === Parse body ===
        body = json.loads(event.get("body", "{}"))
        quiz_id = body.get("quiz_id")
        course_id = body.get("course_id")
        score = body.get("score")
        total_questions = body.get("total_questions")
        correct_answers = body.get("correct_answers")

        if not all([quiz_id, course_id, score is not None, total_questions, correct_answers]):
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Missing required fields"})
            }

        timestamp = datetime.utcnow().isoformat()
        partition_key = f"USER#{user_id}"
        sort_key = f"ATTEMPT#{quiz_id}#{timestamp}"

        # === Write attempt ===
        table.put_item(Item={
            "PK": partition_key,
            "SK": sort_key,
            "quiz_id": quiz_id,
            "course_id": course_id,
            "score": score,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "submitted_at": timestamp
        })

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"success": True, "message": "Quiz submitted successfully"}, default=decimal_default)
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": str(e)})
        }

def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }
