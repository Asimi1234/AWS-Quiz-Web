# user/get_quizzes/app.py
import json
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("USER_QUIZZES_TABLE", "UserQuizzes")  # Fixed: consistent naming
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": ""
        }

    try:
        user_id = event.get("requestContext", {}).get("authorizer", {}).get("userId")
        if not user_id:
            return response(401, {"error": "Unauthorized"})

        print(f"Querying quizzes for user: {user_id}")
        
        result = table.query(KeyConditionExpression=Key("PK").eq(f"USER#{user_id}") & Key("SK").begins_with("QUIZ#"))
        items = result.get("Items", [])
        
        print(f"Found {len(items)} items")

        quizzes = []
        for item in items:
            # Use direct attributes only (no fallback logic)
            quiz_data = {
                "quizId": item.get("quizId"),
                "courseId": item.get("courseId"), 
                "title": item.get("title", "Untitled Quiz"),
                "createdAt": item.get("createdAt"),
                "questionCount": len(item.get("questions", []))
            }
            
            # Only add if we have required fields
            if quiz_data["quizId"] and quiz_data["courseId"]:
                quizzes.append(quiz_data)
                print(f"Added quiz: {quiz_data['title']} - ID: {quiz_data['quizId']}, Course: {quiz_data['courseId']}")

        print(f"Returning {len(quizzes)} valid quizzes")

        return response(200, {
            "success": True,
            "quizzes": quizzes
        })

    except Exception as e:
        print("Error:", str(e))
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