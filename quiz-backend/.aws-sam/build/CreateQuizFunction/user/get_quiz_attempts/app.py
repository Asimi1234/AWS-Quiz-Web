# user/get_quiz_attempts/app.py

import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from utils import decimal_default

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get("USER_QUIZ_ATTEMPTS_TABLE", "UserQuizAttempts"))

def lambda_handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["userId"]
        quiz_id = event.get("queryStringParameters", {}).get("quiz_id")

        if not quiz_id:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Missing quiz_id in query parameters"})
            }

        pk = f"USER#{user_id}"
        sk_prefix = f"ATTEMPT#{quiz_id}#"

        response = table.query(
            KeyConditionExpression=Key("PK").eq(pk) & Key("SK").begins_with(sk_prefix)
        )

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({
                "attempts": response.get("Items", [])
            }, default=decimal_default)
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": str(e)})
        }

def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    }
