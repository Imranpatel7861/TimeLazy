from flask import Blueprint, request, jsonify
from db import mysql

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT name, email, gender, organization, phone, address, profile_pic FROM user_profiles WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()

    if not user:
        return jsonify({'message': 'Profile not found'}), 404

    return jsonify({
        'name': user[0],
        'email': user[1],
        'gender': user[2],
        'organization': user[3],
        'phone': user[4],
        'address': user[5],
        'profile_pic': user[6]
    }), 200
