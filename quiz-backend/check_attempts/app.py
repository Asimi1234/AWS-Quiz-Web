import json
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from decimal import Decimal

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('QuizAttempts')

MAX_FREE_ATTEMPTS = 5
MAX_ADMIN_ATTEMPTS = 60

def lambda_handler(event, context):
    print("Received event:", json.dumps(event, default=str))

    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT"
    }

    method = event.get("httpMethod")

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"message": "CORS preflight passed"})}

    try:
        # Determine request params/body values
        if method in ["POST", "PUT"]:
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            course_id = body.get('course_id')
            is_admin = body.get('is_admin', False)
        else:
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('user_id')
            course_id = query_params.get('course_id')
            is_admin = query_params.get('is_admin', 'false').lower() == 'true'

        if not user_id or not course_id:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({'success': False, 'message': 'Missing user_id or course_id'})
            }

        response = table.get_item(Key={'user_id': user_id, 'course_id': course_id})
        item = response.get('Item', {})

        attempts_field = "admin_attempts" if is_admin else "free_attempts"
        max_attempts = MAX_ADMIN_ATTEMPTS if is_admin else MAX_FREE_ATTEMPTS

        current_attempts = item.get(attempts_field, 0)
        current_attempts = int(current_attempts) if isinstance(current_attempts, Decimal) else current_attempts
        remaining_attempts = max(0, max_attempts - current_attempts)

        if method == "POST":
            # Increment attempt count
            new_attempts = current_attempts + 1

            table.update_item(
                Key={'user_id': user_id, 'course_id': course_id},
                UpdateExpression=f"SET {attempts_field} = :val",
                ExpressionAttributeValues={':val': new_attempts}
            )

            remaining_attempts = max(0, max_attempts - new_attempts)

            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({
                    'success': True,
                    'current_attempts': new_attempts,
                    'remaining_attempts': remaining_attempts,
                    'max_attempts': max_attempts,
                    'message': 'Attempt recorded successfully'
                })
            }

        elif method == "GET":
            # Return current attempts info
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({
                    'success': True,
                    'current_attempts': current_attempts,
                    'remaining_attempts': remaining_attempts,
                    'max_attempts': max_attempts,
                    'can_attempt': remaining_attempts > 0
                })
            }

        else:
            return {
                "statusCode": 405,
                "headers": cors_headers,
                "body": json.dumps({'success': False, 'message': f'Method {method} not allowed'})
            }

    except ClientError as e:
        print(f"DynamoDB Error: {str(e)}")
        return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'success': False, 'message': str(e)})}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'success': False, 'message': str(e)})}
