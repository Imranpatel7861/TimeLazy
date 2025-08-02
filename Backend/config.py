import os

class Config:
    SECRET_KEY = 'your-secret-key'
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = '1122'
    MYSQL_DB = 'yourdatabase'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'upload')
    CORS_ORIGINS = ["http://localhost:5173"]
