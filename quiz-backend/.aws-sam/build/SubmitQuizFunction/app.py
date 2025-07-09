import json
import boto3
import decimal
import jwt
import os
from datetime import datetime
from utils import decimal_default

# DynamoDB setup
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('QuizAttempts')

# JWT secret key
SECRET_KEY = os.environ['SECRET_KEY']

def verify_token(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}

def lambda_handler(event, context):
    try:
        print("EVENT:", event)

        # === Verify JWT token ===
        auth_header = event['headers'].get('Authorization')
        if not auth_header:
            return {
                "statusCode": 401,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Missing token"})
            }

        token = auth_header.split(" ")[1]
        verification_result = verify_token(token)

        if "error" in verification_result:
            return {
                "statusCode": 401,
                "headers": cors_headers(),
                "body": json.dumps({"error": verification_result["error"]})
            }

        # Get trusted userId from token payload
        user_id = verification_result["userId"]

        # Parse body
        body = json.loads(event.get("body", "{}"))
        course_id = body.get("course_id")
        final_score = body.get("score")

        if not course_id or final_score is None:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Missing course_id or score"})
            }

        # Update the DynamoDB item
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
