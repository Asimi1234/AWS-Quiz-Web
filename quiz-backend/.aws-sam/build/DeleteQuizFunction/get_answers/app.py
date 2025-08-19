import json
import os
from get_answers import ANSWER_BANK

# === Normalize function ===
def normalize(text):
    """Normalize text for comparison"""
    if not text:
        return ""
    return " ".join(str(text).strip().split())

# === CORS headers ===
def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

# === Main Lambda entry point ===
def lambda_handler(event, context):

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"message": "CORS preflight passed"})
        }

    try:
        # === Extract user ID from JWT claims ===
        authorizer_ctx = event.get("requestContext", {}).get("authorizer", {})
        user_id = authorizer_ctx.get("userId")



        # === Extract course ID ===
        course_id = None
        if event.get("queryStringParameters"):
            course_id = event["queryStringParameters"].get("courseId")

        if not course_id and event.get("body"):
            try:
                body = json.loads(event["body"])
                course_id = body.get("courseId")
            except json.JSONDecodeError:
                pass

        if not course_id:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({
                    "success": False,
                    "error": "Missing courseId parameter"
                })
            }

        if course_id not in ANSWER_BANK:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({
                    "success": False,
                    "error": f"Course '{course_id}' not found in answer bank"
                })
            }

        correct_answers = ANSWER_BANK[course_id]
        normalized_correct_answers = {k: normalize(v) for k, v in correct_answers.items()}

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({
                "success": True,
                "courseId": course_id,
                "correct_answers": normalized_correct_answers,
                "total_questions": len(normalized_correct_answers)
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({
                "success": False,
                "error": f"Internal server error: {str(e)}"
            })
        }
