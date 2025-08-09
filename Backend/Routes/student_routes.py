from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
import os

app = Flask(__name__)
CORS(app)

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '1122'
app.config['MYSQL_DB'] = 'yourdatabase'

mysql = MySQL(app)

student_bp = Blueprint('student', __name__, url_prefix='/api/admin')

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@student_bp.route('/students', methods=['GET'])
def get_students():
    year = request.args.get('year')
    division = request.args.get('division')
    cur = mysql.connection.cursor(dictionary=True)
    query = "SELECT * FROM students"
    params = []
    if year and division:
        query += " WHERE year=%s AND division=%s"
        params.extend([year, division])
    cur.execute(query, params)
    students = cur.fetchall()
    cur.close()
    return jsonify(students), 200

@student_bp.route('/students', methods=['POST'])
def add_student():
    data = request.json
    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO students (rollNo, name, email, year, division) VALUES (%s, %s, %s, %s, %s)",
        (data['rollNo'], data['name'], data['email'], data['year'], data['division'])
    )
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Student added successfully"}), 201

@student_bp.route('/students/bulk', methods=['POST'])
def bulk_upload_students():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    year = request.form.get('year')
    division = request.form.get('division')
    if not file.filename.endswith('.txt'):
        return jsonify({"error": "Only TXT files are supported"}), 400
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    cur = mysql.connection.cursor()
    for line in lines:
        parts = line.strip().split(',')
        if len(parts) == 3:
            rollNo, name, email = parts
            cur.execute(
                "INSERT INTO students (rollNo, name, email, year, division) VALUES (%s, %s, %s, %s, %s)",
                (rollNo.strip(), name.strip(), email.strip(), year, division)
            )
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Bulk upload successful"}), 201

@student_bp.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM students WHERE id=%s", (student_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Student deleted successfully"}), 200

app.register_blueprint(student_bp)

if __name__ == '__main__':
    app.run(debug=True)
