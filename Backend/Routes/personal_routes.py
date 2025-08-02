from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

personal_bp = Blueprint('personal', __name__, url_prefix='/api/personal')

@personal_bp.route('/signup', methods=['POST'])
def personal_signup():
    data = request.get_json()
    name,email,password = data.get('name'),data.get('email'),data.get('password')
    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT * FROM personal_users WHERE email = %s",(email,))
    if cur.fetchone():
        cur.close()
        return jsonify({'message':'User exists'}),409
    hashed = generate_password_hash(password)
    cur.execute("INSERT INTO personal_users (name,email,password) VALUES (%s,%s,%s)",(name,email,hashed))
    current_app.mysql.connection.commit()
    cur.close()
    return jsonify({'message':'Personal signup successful'}), 201

@personal_bp.route('/login', methods=['POST'])
def personal_login():
    data=request.get_json()
    email,password = data.get('email'), data.get('password')
    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT id,name,email,password FROM personal_users WHERE email=%s",(email,))
    row = cur.fetchone()
    cur.close()
    if row and check_password_hash(row[3], password):
        return jsonify({'message':'Login successful','user':{'id':row[0],'name':row[1],'email':row[2]}}),200
    return jsonify({'message':'Invalid credentials'}),401
