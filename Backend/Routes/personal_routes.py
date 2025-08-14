from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

personal_bp = Blueprint('personal', __name__, url_prefix='/api/personal')

@personal_bp.route('/signup', methods=['POST'])
def personal_signup():
    data = request.get_json()
    name, email, password = data.get('name'), data.get('email'), data.get('password')

    if not name or not email or not password:
        return jsonify({'message': 'All fields are required'}), 400

    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT * FROM personal_users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        return jsonify({'message': 'User already exists'}), 409

    hashed = generate_password_hash(password)
    cur.execute(
        "INSERT INTO personal_users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed)
    )
    current_app.mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Signup successful'}), 201

@personal_bp.route('/login', methods=['POST'])
def personal_login():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400

    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT id, name, email, password, profile_pic FROM personal_users WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()

    if row and check_password_hash(row[3], password):
        profile_pic_url = None
        if row[4]:
            if row[4].startswith("http"):
                profile_pic_url = row[4]
            else:
                profile_pic_url = f"{request.host_url}uploads/{row[4]}"

        user_data = {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'profile_pic': profile_pic_url
        }

        access_token = create_access_token(identity=user_data, expires_delta=timedelta(days=1))

        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': user_data
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@personal_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    return jsonify(current_user), 200

@personal_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_personal_dashboard():
    current_user = get_jwt_identity()
    user_id = current_user['id']

    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT * FROM personal_data WHERE user_id = %s", (user_id,))
    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    cur.close()

    data = [dict(zip(columns, row)) for row in rows]

    return jsonify({
        'user': current_user,
        'data': data
    }), 200
