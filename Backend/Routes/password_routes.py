from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from db import mysql

password_bp = Blueprint('password', __name__, url_prefix='/api/admin')


@password_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email required'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM admin WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Send reset link via email
    try:
        sender_email = "imrankpatel7861@gmail.com"
        sender_password = "xmmp uzlf mjxy uygi"  # App Password from Gmail
        receiver_email = email

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reset Your Password"
        msg["From"] = sender_email
        msg["To"] = receiver_email

        html = f"""
        <html>
  <head>
    <style>
      @media screen and (max-width: 600px) {{
        .email-container {{
          width: 100% !important;
          padding: 10px !important;
        }}
        .btn {{
          width: 100% !important;
        }}
      }}
    </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4;">
    <div class="email-container" style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">

      <div style="text-align: center;">
        <img src="https://i.postimg.cc/3RHQctZv/logo.jpg" alt="Timelazy Logo" width="180" style="margin-bottom: 20px;" />
      </div>

      <h2 style="color: #333;">Hi there 👋</h2>
      <p style="font-size: 16px; color: #555;">
        You requested to reset your password for your <strong>Timelazy</strong> account. Click the button below to proceed:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/resetpassword?email={email}" target="_blank"
           class="btn"
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
          Reset Password
        </a>
      </div>

      <p style="font-size: 14px; color: #999;">
        If you didn’t request this, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

      <p style="font-size: 12px; color: #aaa; text-align: center;">
        © 2025 Timelazy · All rights reserved.<br>
        Need help? Contact us at <a href="mailto:support@timelazy.com" style="color: #4CAF50;">support@timelazy.com</a>
      </p>

    </div>
  </body>
</html>

        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())

        return jsonify({'message': 'Password reset link sent!'}), 200

    except Exception as e:
        print("❌ Error sending email:", e)
        return jsonify({'message': 'Server error. Please try again later.'}), 500


@password_bp.route('/resetpassword', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('newPassword')

    if not email or not new_password:
        return jsonify({'message': 'Email and new password are required'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM admin WHERE email = %s", (email,))
    user = cur.fetchone()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    try:
        hashed_password = generate_password_hash(new_password)
        cur.execute("UPDATE admin SET password = %s WHERE email = %s", (hashed_password, email))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Password reset successful'}), 200
    except Exception as e:
        print("❌ Error resetting password:", e)
        return jsonify({'message': 'Internal server error'}), 500
