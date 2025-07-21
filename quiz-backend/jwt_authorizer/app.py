import json
import jwt
import os

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise Exception("SECRET_KEY environment variable not set")

def lambda_handler(event, context):
    token = event.get("authorizationToken", "").replace("Bearer ", "")

    if not token:
        raise Exception("Unauthorized")

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise Exception("Unauthorized")
    except jwt.InvalidTokenError:
        raise Exception("Unauthorized")

    user_id = decoded["userId"]
    auth_context = {
        "userId": decoded["userId"],
        "email": decoded["email"],
        "username": decoded["username"]
    }

    # Generate a wildcard resource ARN to cover all routes
    method_arn = event["methodArn"]

    # This will strip down to: arn:aws:execute-api:<region>:<account>:<api-id>/<stage>
    # and append /* to allow all resources under that stage
    resource_arn = method_arn.rsplit("/", 2)[0] + "/*"

    return generate_policy(user_id, "Allow", resource_arn, context=auth_context)


def generate_policy(principal_id, effect, resource, context=None):
    auth_response = {
        "principalId": principal_id,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": effect,
                    "Resource": resource
                }
            ]
        }
    }

    if context:
        auth_response["context"] = context

    return auth_response