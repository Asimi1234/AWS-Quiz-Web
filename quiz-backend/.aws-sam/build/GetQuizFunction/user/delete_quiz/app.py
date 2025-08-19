# user/delete_quiz/app.py
import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("USER_QUIZZES_TABLE", "UserQuizzes")  # Fixed: consistent naming
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    if event["httpMethod"] == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    try:
        print("Incoming event:", json.dumps(event, default=str))  # Added: better logging
        user_id = event.get("requestContext", {}).get("authorizer", {}).get("userId")
        body = json.loads(event["body"])

        course_id = body.get("courseId")
        quiz_id = body.get("quizId")
        print(f"User ID: {user_id}, Course ID: {course_id}, Quiz ID: {quiz_id}")  # Added: debugging

        if not course_id or not quiz_id:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Missing courseId or quizId"})
            }

        pk = f"USER#{user_id}"
        sk = f"QUIZ#{course_id}#{quiz_id}"

        print(f"Attempting to delete quiz with PK: {pk}, SK: {sk}")  # Added: debugging

        # Check if quiz exists before deleting
        response = table.get_item(Key={"PK": pk, "SK": sk})
        if "Item" not in response:
            print("Quiz not found in database")  # Added: debugging
            return {
                "statusCode": 404,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Quiz not found"})
            }

        # Delete the quiz
        table.delete_item(Key={"PK": pk, "SK": sk})
        print("Quiz deleted successfully")  # Added: debugging

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"message": "Quiz deleted successfully"})
        }

    except Exception as e:
        print("Error:", str(e))
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