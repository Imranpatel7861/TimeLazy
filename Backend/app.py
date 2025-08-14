from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_mysqldb import MySQL
from flask_jwt_extended import JWTManager
import os
import config

# Create the Flask app instance
app = Flask(__name__)
app.config.from_object(config.Config)

# JWT configuration
app.config["JWT_SECRET_KEY"] = "your-secret-key"  # change to something secure
jwt = JWTManager(app)

# CORS configuration
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": config.Config.CORS_ORIGINS}})

# Upload folder configuration
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ✅ Route to serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Initialize MySQL
mysql = MySQL(app)
app.mysql = mysql

# Register Blueprints (modular routes)
from Routes.auth_routes import auth_bp
from Routes.personal_routes import personal_bp
from Routes.lab_routes import lab_bp
from Routes.classroom_routes import classroom_bp
from Routes.teacher_routes import teacher_bp
from Routes.profile_routes import profile_bp
from Routes.setting_routes import setting_bp
from Routes.password_routes import password_bp
from Routes.student_routes import student_bp  # ✅ student route for form submission
from Routes.contact_routes import contact_bp

# Register all Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(personal_bp)
app.register_blueprint(lab_bp)
app.register_blueprint(classroom_bp)
app.register_blueprint(teacher_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(setting_bp)
app.register_blueprint(password_bp)
app.register_blueprint(student_bp) 
app.register_blueprint(contact_bp)

# Health check route
@app.route('/')
def home():
    return 'Flask Modular Backend Running!'

# Run server
if __name__ == '__main__':
    app.run(debug=True)
