# user/create_quiz/app.py

import json
import os
import uuid
import boto3
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("USER_QUIZ_TABLE", "UserQuizzes")
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": ""
        }

    try:
        authorizer = event.get("requestContext", {}).get("authorizer", {})
        user_id = authorizer.get("userId", "").strip()

        if not user_id:
            print("Missing userId in authorizer context:", authorizer)
            return response(401, {"error": "Unauthorized"})

        body = json.loads(event.get("body") or "{}")

        course_id = str(body.get("courseId", "")).strip().upper()
        title = str(body.get("title", "")).strip()
        questions = body.get("questions", [])

        if not course_id or not title or not isinstance(questions, list) or len(questions) == 0:
            return response(400, {"error": "Missing or invalid courseId, title, or questions"})

        quiz_id = str(uuid.uuid4())[:8]
        timestamp = datetime.utcnow().isoformat()

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"QUIZ#{course_id}#{quiz_id}",
            "quizId": quiz_id,
            "courseId": course_id,
            "title": title,
            "questions": questions,
            "createdAt": timestamp
        }

        table.put_item(Item=item)

        return response(201, {
            "success": True,
            "message": "Quiz created successfully",
            "quizId": quiz_id,
            "courseId": course_id,
            "title": title
        })

    except Exception as e:
        print("Exception occurred:", str(e))
        return response(500, {
            "error": "Internal server error",
            "message": str(e)
        })

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
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }
