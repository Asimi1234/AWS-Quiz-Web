import json
import boto3
import jwt
import datetime
import os
import bcrypt
import uuid
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
        email = body.get("email")
        password = body.get("password")

        if not username or not email or not password:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Missing username, email, or password"})
            }

        # Check for existing username via GSI
        response = users_table.query(
            IndexName='username-index',
            KeyConditionExpression=Key('username').eq(username)
        )

        if response['Items']:
            return {
                "statusCode": 409,
                "headers": cors_headers,
                "body": json.dumps({"message": "Username already exists"})
            }

        # Generate UUID for user_id
        user_id = str(uuid.uuid4())

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Save user record
        users_table.put_item(
            Item={
                'user_id': user_id,
                'username': username,
                'email': email,
                'password_hash': hashed_password,
                'created_at': datetime.datetime.utcnow().isoformat()
            }
        )

        # Issue JWT token
        token = jwt.encode(
            {
                'userId': user_id,
                'username': username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=3)
            },
            SECRET_KEY,
            algorithm='HS256'
        )

        return {
            "statusCode": 201,
            "headers": cors_headers,
            "body": json.dumps({'token': token})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": str(e)})
        }
