from flask import Blueprint, request, jsonify, current_app

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    email = request.args.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    cur = current_app.mysql.connection.cursor()
    cur.execute(
        "SELECT name, email, profile_pic FROM personal_users WHERE email = %s LIMIT 1",
        (email,)
    )
    row = cur.fetchone()
    cur.close()

    if not row:
        return jsonify({'error': 'User not found'}), 404

    profile_data = {
        'name': row[0],
        'email': row[1],
        'profile_pic': row[2]  # e.g., filename or full URL
    }

    return jsonify(profile_data), 200
