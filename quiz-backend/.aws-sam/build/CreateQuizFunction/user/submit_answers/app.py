# user/submit_answers/app.py
import json
import os
import boto3
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
QUIZZES_TABLE = os.environ.get("USER_QUIZZES_TABLE", "UserQuizzes")
ATTEMPTS_TABLE = os.environ.get("ATTEMPTS_TABLE", "UserQuizAttempts")


def lambda_handler(event, context):
    # CORS Preflight
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": ""
        }

    try:
        print("EVENT:", event)

        # Extract userId
        authorizer_ctx = event["requestContext"]["authorizer"]
        user_id = authorizer_ctx.get("userId")
        if not user_id:
            raise Exception("Missing userId from token")

        # Parse request body
        body = json.loads(event.get("body", "{}"))
        quiz_id = body.get("quizId")
        submitted_answers = body.get("answers", {})

        if not quiz_id or not submitted_answers:
            return error_response("Missing quizId or answers")

        # Fetch quiz from UserQuizzes
        quiz_item = fetch_quiz(user_id, quiz_id)
        if not quiz_item:
            return error_response("Quiz not found")

        correct_count = 0
        total_questions = len(quiz_item.get("questions", []))
        answer_results = {}

        for q in quiz_item["questions"]:
            qid = q.get("id")
            correct = normalize(q.get("answer", ""))
            submitted = normalize(submitted_answers.get(qid, ""))
            is_correct = submitted == correct
            answer_results[qid] = is_correct
            if is_correct:
                correct_count += 1

        # Save attempt (optional, but recommended)
        attempt_id = str(uuid.uuid4())
        save_attempt(user_id, quiz_id, attempt_id, correct_count, total_questions, submitted_answers)

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({
                "quizId": quiz_id,
                "score": correct_count,
                "total": total_questions,
                "correctAnswers": answer_results
            })
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": str(e)})
        }


def fetch_quiz(user_id, quiz_id):
    table = dynamodb.Table(QUIZZES_TABLE)
    # Since we don't know the courseId in this case, do a scan (or optimize later)
    response = table.query(
        KeyConditionExpression="PK = :pk",
        ExpressionAttributeValues={":pk": f"USER#{user_id}"}
    )
    for item in response.get("Items", []):
        if item.get("quizId") == quiz_id:
            return item
    return None


def save_attempt(user_id, quiz_id, attempt_id, score, total, answers):
    table = dynamodb.Table(ATTEMPTS_TABLE)
    timestamp = datetime.utcnow().isoformat()

    table.put_item(Item={
        "PK": f"USER#{user_id}",
        "SK": f"ATTEMPT#{quiz_id}#{timestamp}",
        "quizId": quiz_id,
        "attemptId": attempt_id,
        "submittedAt": timestamp,
        "score": Decimal(str(score)),
        "total": Decimal(str(total)),
        "answers": answers
    })


def normalize(text):
    return " ".join(text.strip().lower().split()) if text else ""


def error_response(msg, status=400):
    return {
        "statusCode": status,
        "headers": cors_headers(),
        "body": json.dumps({"error": msg})
    }


def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
    }
