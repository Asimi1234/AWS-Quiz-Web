import json
import boto3
import jwt
import datetime
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from boto3.dynamodb.conditions import Key
import requests

# Initialize DynamoDB resource and table
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('Users')

# Environment variables
SECRET_KEY = os.environ['SECRET_KEY']
SMTP_SERVER = 'smtp-relay.brevo.com'
SMTP_PORT = int(os.environ.get('SMTP_PORT'))
SMTP_USERNAME = os.environ['SMTP_USERNAME']
SMTP_PASSWORD = os.environ['SMTP_PASSWORD']
SENDER_EMAIL = os.environ['SENDER_EMAIL']
FRONTEND_URL = os.environ['FRONTEND_URL']  # e.g., https://your-frontend.com

# Email sending function

def send_reset_email(to_email, reset_link):
    """
    Sends a password reset email via Brevo Email API.
    SMTP code is commented out for now — can switch back when SMTP is activated.
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = "Password Reset Request"
    msg['From'] = SENDER_EMAIL
    msg['To'] = to_email

    text_content = f"Hello,\n\nYou requested a password reset. Click the link below to reset your password:\n\n{reset_link}\n\nIf you didn't request this, you can ignore this email."
    html_content = f"""
    <html>
    <body>
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="{reset_link}">Reset Password</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
    </body>
    </html>
    """

    msg.attach(MIMEText(text_content, 'plain'))
    msg.attach(MIMEText(html_content, 'html'))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        print("Email sent successfully via SMTP.")
        return True
    except Exception as e:
        print(f"Failed to send email via SMTP: {e}")
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
        body = json.loads(event.get("body", "{}"))
        email = body.get("email")

        if not email:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"message": "Missing email"})
            }
        email = email.lower() 
        # Query user by email using EmailIndex
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
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"message": str(e)})
        }
