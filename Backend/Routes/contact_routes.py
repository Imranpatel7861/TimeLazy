from flask import Blueprint, request, jsonify
from db import mysql

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/api/contact', methods=['POST'])
def handle_contact():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')

    if not all([name, email, subject, message]):
        return jsonify({'error': 'Missing fields'}), 400

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO contactus (name, email, subject, message)
        VALUES (%s, %s, %s, %s)
    """, (name, email, subject, message))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Message received successfully'}), 200
