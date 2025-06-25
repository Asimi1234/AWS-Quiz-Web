import json
import boto3
import decimal
from boto3.dynamodb.conditions import Key
from utils import decimal_default


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('QuizAttempts')



def lambda_handler(event, context):
    try:
        print("EVENT:", event)

        course_id = event.get("queryStringParameters", {}).get("course_id")

        if not course_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing course_id"})
            }

        response = table.query(
            IndexName='CourseIndex',
            KeyConditionExpression=Key('course_id').eq(course_id),
            ScanIndexForward=False,
            Limit=10
        )

        top_scores = response.get("Items", [])

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
