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
            IndexName='CourseIndexNew',
            KeyConditionExpression=Key('base_course_id').eq(course_id),
            ProjectionExpression="user_id, course_id, score",
            ScanIndexForward=False,  # Highest scores first
            Limit=50  # Increased buffer to ensure we get top 10 after sorting
        )

        items = response.get("Items", [])
        
        # Handle empty results gracefully
        if not items:
            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({
                    "leaderboard": [],
                    "message": "No attempts found for this course yet"
                }, default=decimal_default)
            }
        
        # Sort all attempts by score (highest first) and take top 10
        top_scores = sorted(items, key=lambda x: x.get('score', 0), reverse=True)[:10]

        # Extract unique user_ids for username lookup (avoid duplicate API calls)
        unique_user_ids = list(set([attempt['user_id'] for attempt in top_scores]))
        
        # Only fetch usernames if we have users to fetch
        user_map = {}
        if unique_user_ids:
            keys = [{'user_id': uid} for uid in unique_user_ids[:100]]  # BatchGetItem limit

            # Fetch usernames for unique users
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

        # Add usernames and ranks to ALL attempts (including multiple per user)
        leaderboard = []
        for idx, attempt in enumerate(top_scores, 1):
            leaderboard.append({
                'user_id': attempt['user_id'],
                'course_id': attempt['course_id'],
                'score': attempt['score'],
                'username': user_map.get(attempt['user_id'], f"User {attempt['user_id'][:6]}"),
                'rank': idx
            })

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"leaderboard": leaderboard}, default=decimal_default)
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": str(e)})
        }