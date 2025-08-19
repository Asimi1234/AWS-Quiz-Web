import json
import boto3
from boto3.dynamodb.conditions import Key

# DynamoDB table setup
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    cors_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }

    # Handle CORS preflight
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

        # Query EmailIndex
        email_result = users_table.query(
            IndexName='EmailIndex',
            KeyConditionExpression=Key('email').eq(email),
            Limit=1
        )

        # Query username-index
        username_result = users_table.query(
            IndexName='username-index',
            KeyConditionExpression=Key('username').eq(username),
            Limit=1
        )

        # Check if either exists
        exists = bool(email_result['Items'] or username_result['Items'])

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"exists": exists})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": "An error occurred.", "error": str(e)})
        }
