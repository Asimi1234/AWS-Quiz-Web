import json
import boto3
import decimal
from datetime import datetime
from utils import decimal_default


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('QuizAttempts')


def lambda_handler(event, context):
    try:
        print("EVENT:", event)
        body = json.loads(event.get("body", "{}"))

        user_id = body.get("user_id")
        course_id = body.get("course_id")
        final_score = body.get("score")

        if not user_id or not course_id or final_score is None:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({"error": "Missing user_id, course_id, or score"})
            }

        table.update_item(
            Key={
                'user_id': user_id,
                'course_id': course_id
            },
            UpdateExpression='SET score = :s, last_attempt = :ts',
            ExpressionAttributeValues={
                ':s': final_score,
                ':ts': datetime.utcnow().isoformat()
            }
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"success": True, "message": "Score submitted successfully."}, default=decimal_default)
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)}, default=decimal_default)
        }
