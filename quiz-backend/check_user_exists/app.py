import json
import boto3
from boto3.dynamodb.conditions import Attr

# DynamoDB table reference
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"message": "CORS OK"})
        }

    try:
        body = json.loads(event.get("body", "{}"))
        username = body.get("username")
        email = body.get("email")

        if not username or not email:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Missing username or email"})
            }

        # Scan for existing user by username
        username_response = users_table.scan(
            FilterExpression=Attr('username').eq(username)
        )

        # Scan for existing user by email
        email_response = users_table.scan(
            FilterExpression=Attr('email').eq(email)
        )

        if username_response['Items'] or email_response['Items']:
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({"exists": True})
            }

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"exists": False})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": "An error occurred.", "error": str(e)})
        }
