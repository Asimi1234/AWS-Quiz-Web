import json
import boto3
import os
from datetime import datetime
from utils import decimal_default

# DynamoDB setup
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get("QUIZ_ATTEMPTS_TABLE", "QuizAttempts"))

def lambda_handler(event, context):
    try:
        print("EVENT:", event)

        # === Extract userId from custom Lambda authorizer context ===
        try:
            authorizer_ctx = event["requestContext"]["authorizer"]
            user_id = authorizer_ctx.get("userId")
            if not user_id:
                raise ValueError("Missing userId")
        except Exception as e:
            return {
                "statusCode": 401,
                "headers": cors_headers(),
                "body": json.dumps({"error": f"Unauthorized: {str(e)}"})
            }
        
        # === Parse body ===
        body = json.loads(event.get("body", "{}"))
        course_id = body.get("course_id")
        final_score = body.get("score")

        if not course_id or final_score is None:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Missing course_id or score"})
            }

        # === Update the score in DynamoDB ===
        table.update_item(
            Key={
                'user_id': user_id,
                'course_id': course_id
            },
            UpdateExpression='SET score = :s, last_attempt = :ts',
            ExpressionAttributeValues={
                ':s': final_score,
                ':ts': datetime.utcnow().isoformat()
            }
        )

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"success": True, "message": "Score submitted successfully."}, default=decimal_default)
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": str(e)}, default=decimal_default)
        }

def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }
