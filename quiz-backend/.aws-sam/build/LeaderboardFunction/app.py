import json
import boto3
from boto3.dynamodb.conditions import Key
from utils import decimal_default

dynamodb = boto3.resource('dynamodb')
quiz_attempts_table = dynamodb.Table('QuizAttempts')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    try:
        print("EVENT:", event)
        course_id = event.get("queryStringParameters", {}).get("course_id")

        if not course_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing course_id"})
            }

        # Query top 10 attempts by score for the course
        response = quiz_attempts_table.query(
            IndexName='CourseIndex',
            KeyConditionExpression=Key('course_id').eq(course_id),
            ScanIndexForward=False,  # descending order - highest scores first
            Limit=10
        )

        top_scores = response.get("Items", [])

        # Extract unique user_ids
        user_ids = list({attempt['user_id'] for attempt in top_scores})

        # Batch get users from Users table to get usernames
        keys = [{'user_id': uid} for uid in user_ids]

        users_response = dynamodb.batch_get_item(
            RequestItems={
                'Users': {
                    'Keys': keys,
                    'ProjectionExpression': 'user_id, username'
                }
            }
        )

        users = users_response.get('Responses', {}).get('Users', [])

        # Create mapping user_id -> username
        user_map = {user['user_id']: user['username'] for user in users}

        # Add username to each leaderboard entry
        for entry in top_scores:
            entry['username'] = user_map.get(entry['user_id'], "Unknown User")

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"leaderboard": top_scores}, default=decimal_default)
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
