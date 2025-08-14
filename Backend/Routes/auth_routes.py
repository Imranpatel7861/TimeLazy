from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name, email, password = data.get('name'), data.get('email'), data.get('password')
    if not name or not email or not password:
        return jsonify({'message': 'All fields required'}), 400
    
    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT * FROM admin WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        return jsonify({'message': 'User already exists'}), 409
    
    hashed = generate_password_hash(password)
    cur.execute("INSERT INTO admin (name,email,password) VALUES (%s,%s,%s)", (name,email,hashed))
    current_app.mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Signup successful'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')

    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT id, name, email, password FROM admin WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()

    if row and check_password_hash(row[3], password):
        access_token = create_access_token(
            identity={'id': row[0], 'name': row[1], 'email': row[2]},
            expires_delta=datetime.timedelta(hours=2)
        )
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {'id': row[0], 'name': row[1], 'email': row[2]}
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user = get_jwt_identity()
    return jsonify({'user': current_user}), 200

# --------- Add this dashboard route ---------
@auth_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user = get_jwt_identity()
    user_id = current_user['id']

    cur = current_app.mysql.connection.cursor()
    # Replace 'dashboard_data' with your actual dashboard table name
    # Make sure it has a user_id column to filter by logged-in user
    cur.execute("SELECT * FROM dashboard_data WHERE user_id = %s", (user_id,))
    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    cur.close()

    data = [dict(zip(columns, row)) for row in rows]

    return jsonify({
        'user': current_user,
        'data': data
    }), 200
