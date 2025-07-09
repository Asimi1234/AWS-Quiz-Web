import json
import os
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

# Load secret key from environment
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise Exception("SECRET_KEY environment variable not set")

# CORS headers for all responses
def cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

# JWT token verification
def verify_token(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded
    except ExpiredSignatureError:
        return {"error": "Token expired"}
    except InvalidTokenError:
        return {"error": "Invalid token"}

# Main Lambda handler
def lambda_handler(event, context):
    try:
        # Handle CORS preflight request
        if event.get('httpMethod') == 'OPTIONS':
            return {
                "statusCode": 200,
                "headers": cors_headers(),
                "body": json.dumps({"message": "Preflight OK"})
            }

        # Check Authorization header
        headers = event.get('headers', {})
        token = headers.get('Authorization', '').replace('Bearer ', '')

        if not token:
            return generate_response(401, {"message": "Missing Authorization token"})

        # Verify JWT token
        verification_result = verify_token(token)
        if 'error' in verification_result:
            return generate_response(401, {"message": verification_result["error"]})

        user_id = verification_result.get("userId")

        # Check query parameters
        params = event.get('queryStringParameters') or {}
        is_admin = params.get("is_admin", "false").lower() == "true"
        if is_admin:
            user_id = params.get("user_id", user_id)

        if not user_id:
            return generate_response(400, {"message": "User ID not provided"})

        course_id = params.get("course_id")
        if not course_id:
            return generate_response(400, {"message": "Missing course_id query parameter"})

        # Simulated lookup logic (replace this with your DynamoDB or database logic)
        max_attempts = 5
        current_attempts = 0  # fetch actual attempts from database here
        remaining_attempts = max_attempts - current_attempts
        can_attempt = remaining_attempts > 0

        result = {
            "success": True,
            "user_id": user_id,
            "course_id": course_id,
            "current_attempts": current_attempts,
            "remaining_attempts": remaining_attempts,
            "max_attempts": max_attempts,
            "can_attempt": can_attempt
        }

        return generate_response(200, result)

    except Exception as e:
        print("Unhandled error:", str(e))
        return generate_response(500, {"message": "Internal server error", "error": str(e)})

# Consistent API response format with CORS headers
def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": cors_headers(),
        "body": json.dumps(body)
    }
