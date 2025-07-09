import json
import boto3
import jwt
import datetime
import os
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

SECRET_KEY = os.environ['SECRET_KEY']

def lambda_handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"message": "CORS OK"})}

    try:
        body = json.loads(event.get("body", "{}"))
        email = body.get("email")

        if not email:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Missing email"})
            }

        # Query user by email
        response = users_table.scan(
            FilterExpression=Key('email').eq(email)
        )

        if not response['Items']:
            return {
                "statusCode": 404,
                "headers": cors_headers,
                "body": json.dumps({"message": "Email not found"})
            }

        user = response['Items'][0]

        # Create a short-lived reset token
        reset_token = jwt.encode(
            {
                'userId': user['user_id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
            },
            SECRET_KEY,
            algorithm='HS256'
        )

        # Here you'd send this token via email — for now, just return it
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "message": "Password reset link sent (mock)",
                "reset_token": reset_token
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": str(e)})
        }
