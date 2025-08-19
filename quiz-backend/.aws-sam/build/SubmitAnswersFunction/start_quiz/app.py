import json
import random
import os
from question_bank import QUESTION_BANK

# === Lambda Entry Point ===
def lambda_handler(event, context):
    # CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": ""
        }

    try:
        print(f"Event: {json.dumps(event)}")

        # === Extract user ID from JWT claims passed by API Gateway ===
        authorizer_ctx = event.get("requestContext", {}).get("authorizer", {})
        user_id = authorizer_ctx.get("userId")


        # === Course ID Extraction ===
        course_id = None

        if event.get("queryStringParameters"):
            course_id_raw = event["queryStringParameters"].get("courseId")
            if course_id_raw:
                course_id = course_id_raw.upper()

        if not course_id and event.get("body"):
            try:
                body = json.loads(event["body"])
                course_id_raw = body.get("courseId")
                if course_id_raw:
                    course_id = course_id_raw.upper()
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                return {
                    "statusCode": 400,
                    "headers": cors_headers(),
                    "body": json.dumps({"error": "Invalid JSON in request body"})
                }

        if not course_id:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({
                    "error": "Missing courseId parameter",
                    "availableCourses": list(QUESTION_BANK.keys())
                })
            }

        if course_id not in QUESTION_BANK:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({
                    "error": f"Invalid courseId: {course_id}",
                    "availableCourses": list(QUESTION_BANK.keys())
                })
            }

        # === Select Questions ===
        questions = QUESTION_BANK[course_id]
        num_questions = min(25, len(questions))
        selected_questions = random.sample(questions, num_questions)

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({
                "success": True,
                "courseId": course_id,
                "totalQuestions": len(selected_questions),
                "questions": selected_questions
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({
                "error": "Internal server error",
                "message": str(e)
            })
        }

def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
    }
