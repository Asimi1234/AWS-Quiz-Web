import json
import boto3
import jwt
import datetime
import os
import requests
from boto3.dynamodb.conditions import Key

# Initialize DynamoDB resource and table
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

# Environment variables
SECRET_KEY = os.environ['SECRET_KEY']
BREVO_API_KEY = os.environ['BREVO_API_KEY']
SENDER_EMAIL = os.environ['SENDER_EMAIL']
FRONTEND_URL = os.environ['FRONTEND_URL']
LOGO_URL = os.environ.get("LOGO_URL", "https://res.cloudinary.com/dlytakuhd/image/upload/v1748332310/logo_z5esiq.png")

# Email sending function using Brevo API
def send_reset_email(to_email, reset_link):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - IzyQuiz</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); position: relative;">
            
            <!-- Decorative top bar -->
            <div style="height: 6px; background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);"></div>
            
            <!-- Header Section -->
            <div style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); position: relative;">
                <!-- Logo container with subtle shadow -->
                <div style="display: inline-block; padding: 20px; background: #ffffff; border-radius: 50%; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    <img src="{LOGO_URL}" alt="IzyQuiz Logo" style="width: 60px; height: 60px; display: block;" />
                </div>
                
                <h1 style="color: #2d3748; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    🔐 Password Reset
                </h1>
                <p style="color: #4a5568; margin: 10px 0 0 0; font-size: 16px; opacity: 0.8;">
                    Secure your account in just one click
                </p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <!-- Greeting with emoji -->
                <p style="font-size: 18px; color: #2d3748; margin: 0 0 20px 0; font-weight: 600;">
                    👋 Hello there!
                </p>
                
                <!-- Main message with better typography -->
                <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
                    We received a request to reset your password for your <strong style="color: #2d3748;">IzyQuiz</strong> account. 
                    Don't worry - it happens to the best of us! Click the button below to create a new, secure password.
                </p>

                <!-- Call-to-action button with hover effect -->
                <div style="text-align: center; margin: 40px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                        <tr>
                            <td style="border-radius: 50px; background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); padding: 2px;">
                                <a href="{reset_link}" 
                                   style="display: inline-block; 
                                          padding: 16px 40px; 
                                          background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); 
                                          color: #ffffff; 
                                          text-decoration: none; 
                                          font-size: 18px; 
                                          font-weight: 600; 
                                          border-radius: 50px; 
                                          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                                          transition: all 0.3s ease;">
                                    🚀 Reset My Password
                                </a>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Security note with icon -->
                <div style="background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%); 
                           border-left: 4px solid #38b2ac; 
                           padding: 20px; 
                           border-radius: 8px; 
                           margin: 30px 0;">
                    <p style="margin: 0; font-size: 14px; color: #2d3748; line-height: 1.5;">
                        <strong>🛡️ Security Note:</strong> This link will expire in <strong>15 minutes</strong> for your security. 
                        If you didn't request this reset, you can safely ignore this email - your password won't be changed.
                    </p>
                </div>

                <!-- Alternative action -->
                <p style="font-size: 14px; color: #718096; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                    Having trouble with the button? Copy and paste this link into your browser:<br>
                    <a href="{reset_link}" style="color: #667eea; word-break: break-all; text-decoration: underline;">
                        {reset_link}
                    </a>
                </p>
            </div>

            <!-- Footer -->
            <div style="padding: 30px; 
                       background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); 
                       border-top: 1px solid #e2e8f0; 
                       text-align: center;">
                
                <!-- Social proof / trust indicators -->
                <div style="margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #4a5568; font-weight: 600;">
                        📧 Trusted by thousands of quiz creators worldwide
                    </p>
                </div>

                <!-- Company info -->
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #a0aec0; line-height: 1.4;">
                    &copy; {datetime.datetime.now().year} <strong>IzyQuiz</strong> - Making quizzes easy and fun!
                </p>
                
                <!-- Contact info -->
                <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                    Questions? Visit our help center.
                </p>
            </div>
        </div>
        
        <!-- Mobile responsiveness -->
        <style>
            @media screen and (max-width: 600px) {{
                .container {{ margin: 20px auto !important; }}
                .content {{ padding: 30px 20px !important; }}
                .header {{ padding: 30px 20px !important; }}
                .button {{ padding: 14px 30px !important; font-size: 16px !important; }}
            }}
        </style>
    </body>
    </html>
    """

    payload = {
        "sender": {"name": "IzyQuiz Support Team", "email": SENDER_EMAIL},
        "to": [{"email": to_email}],
        "subject": "🔐 Reset Your IzyQuiz Password - Quick & Secure",
        "htmlContent": html_content
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        print(f"Brevo API response: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Failed to send email via Brevo API: {str(e)[:150]}")
        return False

# Lambda handler
def lambda_handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

    # CORS preflight handling
    if event.get('httpMethod') == 'OPTIONS':
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"message": "CORS OK"})}

    try:
        request_id = context.aws_request_id if context else "no-request-id"
        print(f"START Request ID: {request_id}")

        body = json.loads(event.get("body", "{}"))
        email = body.get("email")

        if not email:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Missing email"})
            }

        email = email.lower()
        response = users_table.query(
            IndexName='EmailIndex',
            KeyConditionExpression=Key('email').eq(email)
        )

        print(f"User lookup result: {response['Items']}")

        if not response['Items']:
            return {
                "statusCode": 404,
                "headers": cors_headers,
                "body": json.dumps({"message": "Email not found"})
            }

        user = response['Items'][0]

        # Generate short-lived reset token
        reset_token = jwt.encode(
            {
                'userId': user['user_id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
            },
            SECRET_KEY,
            algorithm='HS256'
        )

        if isinstance(reset_token, bytes):
            reset_token = reset_token.decode("utf-8")

        # Construct reset link
        reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

        # Send reset email
        email_sent = send_reset_email(email, reset_link)

        if email_sent:
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({"message": "Password reset link sent successfully."})
            }
        else:
            return {
                "statusCode": 500,
                "headers": cors_headers,
                "body": json.dumps({"message": "Failed to send reset email."})
            }

    except Exception as e:
        print(f"Error [{request_id}]: {str(e)[:150]}")
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": "Internal server error."})
        }
