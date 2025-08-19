import json
import os
import jwt
import datetime
import uuid
import requests
import boto3
from boto3.dynamodb.conditions import Key

# Environment variables
GOOGLE_CLIENT_ID = os.environ['GOOGLE_CLIENT_ID']
SECRET_KEY = os.environ['SECRET_KEY']

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
        "Vary": "Origin",
        "Access-Control-Allow-Credentials": "true"
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"message": "CORS OK"})}

    try:
        body = json.loads(event.get("body", "{}"))
        access_token = body.get("access_token")

        if not access_token:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Missing access_token"})
            }

        # Fetch user info from Google
        user_info_response = requests.get(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            params={"alt": "json"},
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if user_info_response.status_code != 200:
            return {
                "statusCode": 401,
                "headers": cors_headers,
                "body": json.dumps({"message": "Invalid Google access_token"})
            }

        idinfo = user_info_response.json()

        # Extract Google user info
        google_user_id = idinfo.get('id')
        email = idinfo.get('email', '').lower()
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')

        if not email:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Email not found in Google response"})
            }

        # Check if user exists in DynamoDB by email
        response = users_table.query(
            IndexName='EmailIndex',
            KeyConditionExpression=Key('email').eq(email)
        )

        if not response['Items']:
            # Create a new user
            user_id = str(uuid.uuid4())
            username = name or email.split("@")[0]
            users_table.put_item(
                Item={
                    'user_id': user_id,
                    'email': email,
                    'username': username,
                    'google_id': google_user_id,
                    'picture': picture,
                    'created_at': datetime.datetime.utcnow().isoformat()
                }
            )
        else:
            user_item = response['Items'][0]
            user_id = user_item['user_id']
            username = user_item.get('username', email.split("@")[0])

        # Create JWT token including username
        app_token = jwt.encode(
            {
                'userId': user_id,
                'email': email,
                'username': username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=3)
            },
            SECRET_KEY,
            algorithm='HS256'
        )

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({'token': app_token})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": str(e)})
        }
