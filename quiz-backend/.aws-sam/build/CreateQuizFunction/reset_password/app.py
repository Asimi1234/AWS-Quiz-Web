import json
import boto3
import jwt
import datetime
import os
import bcrypt

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
        token = body.get("token")
        new_password = body.get("new_password")

        if not token or not new_password:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Missing token or new password"})
            }

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token['userId']
        except jwt.ExpiredSignatureError:
            return {
                "statusCode": 401,
                "headers": cors_headers,
                "body": json.dumps({"message": "Reset token has expired"})
            }
        except jwt.InvalidTokenError:
            return {
                "statusCode": 401,
                "headers": cors_headers,
                "body": json.dumps({"message": "Invalid reset token"})
            }

        # Hash the new password
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Update the user's password in DynamoDB
        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression="SET password_hash = :ph",
            ExpressionAttributeValues={':ph': hashed_password}
        )

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"message": "Password reset successful"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": str(e)})
        }
