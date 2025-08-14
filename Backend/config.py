
import os
from dotenv import load_dotenv

# Load variables from .env file (you can skip this if using only system env vars)
load_dotenv()

class Config:
    # -----------------------
    # Flask Core Settings
    # -----------------------
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "t")

    # -----------------------
    # MySQL Database Settings
    # -----------------------
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "1122")
    MYSQL_DB = os.getenv("MYSQL_DB", "yourdatabase")

    # -----------------------
    # Local File Uploads
    # -----------------------
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

    # -----------------------
    # CORS Settings
    # -----------------------
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

    # -----------------------
    # AWS S3 Settings (optional)
    # -----------------------
    USE_S3 = os.getenv("USE_S3", "False").lower() in ("true", "1", "t")
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    AWS_S3_ENCRYPTION = os.getenv("AWS_S3_ENCRYPTION", "AES256")  # Server-side encryption

    @staticmethod
    def allowed_file(filename):
        """Check if the file has an allowed extension."""
        return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS
