import json
import boto3
import jwt
import datetime
import os
import bcrypt
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
        username = body.get("username")
        password = body.get("password")

        if not username or not password:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Missing username or password"})
            }

        # Query for the user by username via GSI
        response = users_table.query(
            IndexName='username-index',
            KeyConditionExpression=Key('username').eq(username)
        )

        if not response['Items']:
            return {
                "statusCode": 401,
                "headers": cors_headers,
                "body": json.dumps({"message": "Invalid username or password"})
            }

        user = response['Items'][0]

        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return {
                "statusCode": 401,
                "headers": cors_headers,
                "body": json.dumps({"message": "Invalid username or password"})
            }

        # Issue JWT
        token = jwt.encode(
            {
                'userId': user['user_id'],
                'username': username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=3)
            },
            SECRET_KEY,
            algorithm='HS256'
        )

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                'token': token,
                'userId': user['user_id'],
                'username': username
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": str(e)})
        }
