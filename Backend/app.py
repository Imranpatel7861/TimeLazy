# from flask import Flask, request, jsonify
# from flask_mysqldb import MySQL
# from flask_cors import CORS
# from werkzeug.security import generate_password_hash, check_password_hash
# from werkzeug.utils import secure_filename
# import os
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart

# app = Flask(__name__)

# # Enable CORS
# CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# # Upload folder
# UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# # MySQL config
# app.config['MYSQL_HOST'] = 'localhost'
# app.config['MYSQL_USER'] = 'root'
# app.config['MYSQL_PASSWORD'] = '1122'
# app.config['MYSQL_DB'] = 'yourdatabase'

# mysql = MySQL(app)

# @app.route('/')
# def home():
#     return 'Flask + MySQL Backend is Running!'

# # ----------------- AUTH -----------------
# @app.route('/api/signup', methods=['POST'])
# def signup():
#     data = request.get_json()
#     name, email, password = data.get('name'), data.get('email'), data.get('password')

#     if not name or not email or not password:
#         return jsonify({'message': 'All fields are required'}), 400

#     cur = mysql.connection.cursor()
#     cur.execute("SELECT * FROM admin WHERE email = %s", (email,))
#     if cur.fetchone():
#         cur.close()
#         return jsonify({'message': 'User already exists'}), 409

#     hashed_password = generate_password_hash(password)
#     cur.execute("INSERT INTO admin (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_password))
#     mysql.connection.commit()
#     cur.close()

#     return jsonify({'message': 'Signup successful'}), 201

# @app.route('/api/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     email, password = data.get('email'), data.get('password')

#     if not email or not password:
#         return jsonify({'message': 'Email and password required'}), 400

#     cur = mysql.connection.cursor()
#     cur.execute("SELECT id, name, email, password FROM admin WHERE email = %s", (email,))
#     user = cur.fetchone()
#     cur.close()

#     if user and check_password_hash(user[3], password):
#         return jsonify({'message': 'Login successful', 'user': {'id': user[0], 'name': user[1], 'email': user[2]}}), 200

#     return jsonify({'message': 'Invalid email or password'}), 401

# # ---------------- PERSONAL ----------------
# @app.route('/api/personal/signup', methods=['POST'])
# def personal_signup():
#     data = request.get_json()
#     name, email, password = data.get('name'), data.get('email'), data.get('password')

#     if not name or not email or not password:
#         return jsonify({'message': 'All fields are required'}), 400

#     cur = mysql.connection.cursor()
#     cur.execute("SELECT * FROM personal_users WHERE email = %s", (email,))
#     if cur.fetchone():
#         cur.close()
#         return jsonify({'message': 'User already exists'}), 409

#     hashed_password = generate_password_hash(password)
#     cur.execute("INSERT INTO personal_users (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_password))
#     mysql.connection.commit()
#     cur.close()

#     return jsonify({'message': 'Signup successful'}), 201

# @app.route('/api/personal/login', methods=['POST'])
# def personal_login():
#     data = request.get_json()
#     email, password = data.get('email'), data.get('password')

#     if not email or not password:
#         return jsonify({'message': 'Email and password required'}), 400

#     cur = mysql.connection.cursor()
#     cur.execute("SELECT id, name, email, password FROM personal_users WHERE email = %s", (email,))
#     user = cur.fetchone()
#     cur.close()

#     if user and check_password_hash(user[3], password):
#         return jsonify({'message': 'Login successful', 'user': {'id': user[0], 'name': user[1], 'email': user[2]}}), 200

#     return jsonify({'message': 'Invalid email or password'}), 401

# # ------------------ LABS ------------------
# @app.route('/api/labs', methods=['POST'])
# def add_lab():
#     data = request.get_json()
#     lab_name = data.get('lab_name', '').strip().upper()
#     if not lab_name:
#         return jsonify({'error': 'Lab number is required'}), 400

#     cur = mysql.connection.cursor()
#     try:
#         cur.execute("SELECT * FROM labs WHERE lab_name = %s", (lab_name,))
#         if cur.fetchone():
#             return jsonify({'error': f'Lab {lab_name} already exists'}), 409

#         cur.execute("INSERT INTO labs (lab_name) VALUES (%s)", (lab_name,))
#         mysql.connection.commit()
#         return jsonify({'message': f'Lab {lab_name} added successfully'}), 201
#     except Exception as e:
#         print("Error adding lab:", e)
#         return jsonify({'error': 'Database error'}), 500
#     finally:
#         cur.close()

# @app.route('/api/labs', methods=['GET'])
# def get_labs():
#     cur = mysql.connection.cursor()
#     try:
#         cur.execute("SELECT id, lab_name FROM labs ORDER BY lab_name ASC")
#         labs = [{'id': row[0], 'lab_name': row[1]} for row in cur.fetchall()]
#         return jsonify(labs), 200
#     except Exception as e:
#         return jsonify({'error': 'Failed to fetch labs'}), 500
#     finally:
#         cur.close()

# @app.route('/api/labs/<int:lab_id>', methods=['DELETE'])
# def delete_lab(lab_id):
#     cur = mysql.connection.cursor()
#     try:
#         cur.execute("DELETE FROM labs WHERE id = %s", (lab_id,))
#         mysql.connection.commit()
#         if cur.rowcount == 0:
#             return jsonify({'error': 'Lab not found'}), 404
#         return jsonify({'message': 'Lab deleted successfully'}), 200
#     except Exception as e:
#         return jsonify({'error': 'Failed to delete lab'}), 500
#     finally:
#         cur.close()

# # ------------------ TEACHERS ------------------
# @app.route('/api/teachers', methods=['POST'])
# def add_teacher():
#     data = request.get_json()
#     name, subject, email = data.get('name'), data.get('subject'), data.get('email')

#     if not name or not subject or not email:
#         return jsonify({'error': 'All fields are required'}), 400

#     cur = mysql.connection.cursor()
#     try:
#         cur.execute("SELECT * FROM teachers WHERE email = %s", (email,))
#         if cur.fetchone():
#             return jsonify({'error': 'Teacher with this email already exists'}), 409

#         cur.execute("INSERT INTO teachers (name, subject, email) VALUES (%s, %s, %s)", (name, subject, email))
#         mysql.connection.commit()
#         return jsonify({'message': 'Teacher added successfully'}), 201
#     except Exception as e:
#         return jsonify({'error': 'Failed to add teacher'}), 500
#     finally:
#         cur.close()

# @app.route('/api/teachers', methods=['GET'])
# def get_teachers():
#     cur = mysql.connection.cursor()
#     try:
#         cur.execute("SELECT id, name, subject, email FROM teachers ORDER BY name ASC")
#         teachers = [{'id': row[0], 'name': row[1], 'subject': row[2], 'email': row[3]} for row in cur.fetchall()]
#         return jsonify(teachers), 200
#     except Exception as e:
#         return jsonify({'error': 'Failed to fetch teachers'}), 500
#     finally:
#         cur.close()

# # ------------------ PROFILE ------------------
# @app.route('/api/profile', methods=['POST'])
# def update_profile():
#     try:
#         name = request.form.get('name')
#         email = request.form.get('email')
#         gender = request.form.get('gender')
#         organization = request.form.get('organization')
#         phone = request.form.get('phone')
#         address = request.form.get('address')
#         profile_pic = request.files.get('profilePic')

#         profile_pic_filename = None
#         if profile_pic:
#             filename = secure_filename(profile_pic.filename)
#             profile_pic.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
#             profile_pic_filename = filename

#         cur = mysql.connection.cursor()
#         cur.execute("""
#             INSERT INTO user_profiles (name, email, gender, organization, phone, address, profile_pic)
#             VALUES (%s, %s, %s, %s, %s, %s, %s)
#             ON DUPLICATE KEY UPDATE
#                 name=VALUES(name), gender=VALUES(gender), organization=VALUES(organization),
#                 phone=VALUES(phone), address=VALUES(address), profile_pic=VALUES(profile_pic)
#         """, (name, email, gender, organization, phone, address, profile_pic_filename))
#         mysql.connection.commit()
#         cur.close()

#         return jsonify({'message': 'Profile updated successfully'}), 200
#     except Exception as e:
#         return jsonify({'error': 'Failed to update profile'}), 500

# # ------------------ FORGOT PASSWORD ------------------
# @app.route('/api/admin/forgot-password', methods=['POST'])
# def forgot_password():
#     data = request.get_json()
#     email = data.get('email')

#     if not email:
#         return jsonify({'message': 'Email required'}), 400

#     cur = mysql.connection.cursor()
#     cur.execute("SELECT * FROM admin WHERE email = %s", (email,))
#     user = cur.fetchone()
#     cur.close()

#     if not user:
#         return jsonify({'message': 'User not found'}), 404

#     # Try sending the email
#     try:
#         sender_email = "imrankpatel7861@gmail.com"
#         sender_password = "xmmp uzlf mjxy uygi"  # Make sure this is your real Gmail app password
#         receiver_email = email

#         msg = MIMEMultipart("alternative")
#         msg["Subject"] = "Reset Your Password"
#         msg["From"] = sender_email
#         msg["To"] = receiver_email

#         html = f"""
       
# <html>
#   <body>
#     <div style="text-align: center;">
#       <img src="https://i.postimg.cc/3RHQctZv/logo.jpg" alt="Timelazy Logo" width="300" style="margin-bottom: 10px;" />
#     </div>
#     <h2>Hello User</h2>
#     <p>Msg From <strong>TIMELAZY</strong>,<br>
#        Click <a href="http://localhost:5173/resetpassword?email={email}">here</a> to reset your password.
#     </p>
#   </body>
# </html>

# """


#         msg.attach(MIMEText(html, "html"))

#         with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
#             server.login(sender_email, sender_password)
#             server.sendmail(sender_email, receiver_email, msg.as_string())

#         return jsonify({'message': 'Password reset link sent!'}), 200

#     except Exception as e:
#         print("❌ Error sending email:", e)  # Logs to console
#         return jsonify({'message': 'Server error. Please try again later.'}), 500


#  # ------------------ RESET PASSWORD ------------------
# @app.route('/api/admin/resetpassword', methods=['POST'])  # ✅ CORRECT
# def reset_admin_password():
#     data = request.get_json()
#     email = data.get('email')
#     new_password = data.get('newPassword')

#     if not email or not new_password:
#         return jsonify({'message': 'Email and new password are required.'}), 400

#     cur = mysql.connection.cursor()
#     cur.execute("SELECT * FROM admin WHERE email = %s", (email,))
#     user = cur.fetchone()

#     if not user:
#         return jsonify({'message': 'Admin user not found.'}), 404

#     try:
#         hashed_password = generate_password_hash(new_password)
#         cur.execute("UPDATE admin SET password = %s WHERE email = %s", (hashed_password, email))
#         mysql.connection.commit()
#         cur.close()
#         return jsonify({'message': 'Password reset successful.'}), 200
#     except Exception as e:
#         print("❌ Error resetting password:", e)
#         return jsonify({'message': 'Internal server error'}), 500



# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask
from flask_cors import CORS
from flask_mysqldb import MySQL
import os
import config

app = Flask(__name__)
app.config.from_object(config.Config)

CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": config.Config.CORS_ORIGINS}})

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'upload')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

mysql = MySQL(app)
app.mysql = mysql

from Routes.auth_routes import auth_bp
from Routes.personal_routes import personal_bp
from Routes.lab_routes import lab_bp
from Routes.classroom_routes import classroom_bp
from Routes.teacher_routes import teacher_bp
from Routes.profile_routes import profile_bp
from Routes.setting_routes import setting_bp
from Routes.password_routes import password_bp

app.register_blueprint(auth_bp)
app.register_blueprint(personal_bp)
app.register_blueprint(lab_bp)
app.register_blueprint(classroom_bp)
app.register_blueprint(teacher_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(setting_bp)
app.register_blueprint(password_bp)

@app.route('/')
def home():
    return 'Flask Modular Backend Running!'

if __name__ == '__main__':
    app.run(debug=True)
