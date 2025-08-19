# user/update_quiz/app.py
import json
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("USER_QUIZZES_TABLE", "UserQuizzes")
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    if event["httpMethod"] == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    try:
        print("Incoming event:", json.dumps(event))
        user_id = event["requestContext"]["authorizer"]["userId"]
        body = json.loads(event["body"])

        course_id = body.get("courseId")
        quiz_id = body.get("quizId")
        title = body.get("title")
        questions = body.get("questions")

        if not course_id or not quiz_id or not questions:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Missing courseId, quizId or questions"})
            }

        pk = f"USER#{user_id}"
        sk = f"QUIZ#{course_id}#{quiz_id}"

        response = table.get_item(Key={"PK": pk, "SK": sk})
        if "Item" not in response:
            return {
                "statusCode": 404,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Quiz not found"})
            }

        # Update the quiz
        table.update_item(
            Key={"PK": pk, "SK": sk},
            UpdateExpression="SET title = :title, questions = :questions",
            ExpressionAttributeValues={
                ":title": title,
                ":questions": questions
            }
        )

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"message": "Quiz updated successfully"})
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
