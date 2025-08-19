import json
import boto3
from boto3.dynamodb.conditions import Key
from utils import decimal_default

# AWS resources
dynamodb = boto3.resource('dynamodb')
quiz_attempts_table = dynamodb.Table('QuizAttempts')
users_table = dynamodb.Table('Users')

# === CORS headers helper ===
def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

# === Main Lambda Handler ===
def lambda_handler(event, context):
    try:
        course_id = event.get("queryStringParameters", {}).get("course_id")

        if not course_id:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Missing course_id"})
            }

        # Query top attempts by score using a GSI (CourseIndex)
        response = quiz_attempts_table.query(
            IndexName='CourseIndex',
            KeyConditionExpression=Key('course_id').eq(course_id),
            ProjectionExpression="user_id, course_id, score",
            ScanIndexForward=False,  # Highest scores first
            Limit=25  # Buffer in case of duplicates or filtering
        )

        items = response.get("Items", [])
        # Ensure we have top 10 sorted in descending score order
        top_scores = sorted(items, key=lambda x: x.get('score', 0), reverse=True)[:10]

        # Extract unique user_ids
        user_ids = list({attempt['user_id'] for attempt in top_scores})
        keys = [{'user_id': uid} for uid in user_ids[:100]]  # BatchGetItem limit

        # Fetch usernames
        users_response = dynamodb.batch_get_item(
            RequestItems={
                'Users': {
                    'Keys': keys,
                    'ProjectionExpression': 'user_id, username'
                }
            }
        )
        users = users_response.get('Responses', {}).get('Users', [])
        user_map = {user['user_id']: user['username'] for user in users}

        # Add usernames and ranks
        for idx, entry in enumerate(top_scores, 1):
            entry['username'] = user_map.get(entry['user_id'], f"User {entry['user_id'][:6]}")
            entry['rank'] = idx

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"leaderboard": top_scores}, default=decimal_default)
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": str(e)})
        }
