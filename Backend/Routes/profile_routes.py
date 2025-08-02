import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

@profile_bp.route('/profile', methods=['POST'])
def update_profile():
    form=request.form; pic=request.files.get('profilePic')
    fn=None
    if pic:
        fn=secure_filename(pic.filename)
        pic.save(os.path.join(current_app.config['UPLOAD_FOLDER'], fn))
    cur=current_app.mysql.connection.cursor()
    cur.execute("""
        INSERT INTO user_profiles (name,email,gender,organization,phone,address,profile_pic)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
        name=VALUES(name),gender=VALUES(gender),
        organization=VALUES(organization),phone=VALUES(phone),
        address=VALUES(address),profile_pic=VALUES(profile_pic)
    """, (form.get('name'),form.get('email'),form.get('gender'),
          form.get('organization'),form.get('phone'),
          form.get('address'),fn))
    current_app.mysql.connection.commit(); cur.close()
    return jsonify({'message':'Profile updated'}),200
