from flask import Blueprint, request, jsonify
import os

setting_bp = Blueprint('setting', __name__, url_prefix='/api')

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@setting_bp.route('/profile', methods=['POST'])
def update_profile():
    try:
        name = request.form.get('name')
        email = request.form.get('email')
        gender = request.form.get('gender')
        organization = request.form.get('organization')
        phone = request.form.get('phone')
        address = request.form.get('address')

        profile_pic = request.files.get('profilePic')
        profile_pic_filename = None

        if profile_pic:
            profile_pic_filename = profile_pic.filename
            save_path = os.path.join(UPLOAD_FOLDER, profile_pic_filename)
            profile_pic.save(save_path)

        return jsonify({
            "message": "Profile updated successfully",
            "data": {
                "name": name,
                "email": email,
                "gender": gender,
                "organization": organization,
                "phone": phone,
                "address": address,
                "profilePic": profile_pic_filename
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
