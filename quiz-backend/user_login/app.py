import json
import boto3
import jwt
import datetime
import os
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('QuizAttempts')

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
        user_id = body.get("userId")

        if not user_id:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Missing userId"})
            }

        # Check if user_id exists in any course
        response = table.query(
            KeyConditionExpression=Key('user_id').eq(user_id)
        )

        if not response['Items']:
            return {
                "statusCode": 401,
                "headers": cors_headers,
                "body": json.dumps({"message": "Invalid User ID"})
            }

        # Issue JWT
        token = jwt.encode(
            {
                'userId': user_id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=3)
            },
            SECRET_KEY,
            algorithm='HS256'
        )

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({'token': token})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": str(e)})
        }
