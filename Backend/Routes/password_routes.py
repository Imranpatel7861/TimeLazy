from flask import Blueprint, request, jsonify
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

    try:
        sender_email = "imrankpatel7861@gmail.com"
        sender_password = "xmmp uzlf mjxy uygi"  # Gmail app password
        receiver_email = email

        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reset Your Password"
        msg["From"] = sender_email
        msg["To"] = receiver_email

        # HTML body with dynamic email
        html = f"""
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              @media screen and (max-width: 600px) {{
                .email-container {{
                  width: 100% !important;
                  padding: 10px !important;
                }}
                .btn {{
                  width: 100% !important;
                  display: block !important;
                }}
              }}
            </style>
          </head>
          <body style="margin:0; padding:0; font-family:'Segoe UI', sans-serif; background-color:#f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
              <tr>
                <td align="center">
                  <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" 
                    style="background:white; padding:30px; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.1);">
                    <tr>
                      <td align="center" style="padding-bottom:20px;">
                        <img src="https://i.ibb.co/HLRqzFx8/logo.jpg" alt="Timelazy Logo" style="max-width:150px; height:auto; display:block;" />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h2 style="color:#333; margin:0;">Hi there 👋</h2>
                        <p style="font-size:16px; color:#555; line-height:1.5;">
                          You requested to reset your password for your <strong>Timelazy</strong> account. Click the button below to proceed:
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:30px 0;">
                        <a href="http://localhost:5173/resetpassword?email={email}" target="_blank" class="btn" 
                          style="background-color:#4CAF50; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-size:16px; display:inline-block;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p style="font-size:14px; color:#999;">
                          If you didn’t request this, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 0;">
                        <hr style="border:none; border-top:1px solid #eee;" />
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:12px; color:#aaa;">
                        © 2025 Timelazy · All rights reserved.<br>
                        Need help? Contact us at 
                        <a href="mailto:support@timelazy.com" style="color:#4CAF50;">support@timelazy.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """

        # Attach HTML content
        msg.attach(MIMEText(html, "html"))

        # Send email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())

        return jsonify({'message': 'Password reset email sent successfully'}), 200

    except Exception as e:
        print("❌ Email sending failed:", e)
        return jsonify({'message': 'Failed to send reset email'}), 500


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
        cur.close()
        return jsonify({'message': 'User not found'}), 404

    try:
        hashed_password = generate_password_hash(new_password)
        cur.execute("UPDATE admin SET password = %s WHERE email = %s", (hashed_password, email))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Password reset successful'}), 200
    except Exception as e:
        print("❌ Error resetting password:", e)
        cur.close()
        return jsonify({'message': 'Internal server error'}), 500
