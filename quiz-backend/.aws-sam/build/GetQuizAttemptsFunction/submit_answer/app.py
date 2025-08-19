import json
import os
from course_answers import COURSE_ANSWERS

# === Text normalization helper ===
def normalize(text):
    return " ".join(text.strip().split())

# === Lambda entry point ===
def lambda_handler(event, context):
    # CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": ""
        }

    try:
        print("EVENT:", event)

        # === Extract userId from API Gateway authorizer claims ===
        authorizer_ctx = event["requestContext"]["authorizer"]
        user_id = authorizer_ctx.get("userId")
        print(f"Verified user: {user_id}")

        # === Parse request ===
        body = json.loads(event.get("body", "{}"))
        course_id = body.get("courseId")
        question_id = body.get("question_id")
        user_answer = body.get("answer", "")

        if not course_id or course_id not in COURSE_ANSWERS:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Invalid or missing courseId"})
            }

        correct_answer = COURSE_ANSWERS[course_id].get(question_id, "")
        is_correct = normalize(user_answer) == normalize(correct_answer)

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"correct": is_correct})
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 400,
            "headers": cors_headers(),
            "body": json.dumps({"error": str(e)})
        }

def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
    }
