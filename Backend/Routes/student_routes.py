from flask import Blueprint, request, jsonify, current_app
from flask_cors import CORS
import os

student_bp = Blueprint('student', __name__, url_prefix='/api/admin')
CORS(student_bp)  # Enable CORS for this Blueprint

# ---------------------- GET Students ----------------------
@student_bp.route('/students', methods=['GET'])
def get_students():
    admin_id = request.args.get('admin_id')
    year = request.args.get('year')
    division = request.args.get('division')

    if not admin_id:
        return jsonify({"error": "admin_id is required"}), 400

    query = "SELECT * FROM students WHERE admin_id = %s"
    filters, params = [], [admin_id]

    if year:
        filters.append("year = %s")
        params.append(year)
    if division:
        filters.append("division = %s")
        params.append(division)

    if filters:
        query += " AND " + " AND ".join(filters)

    try:
        cur = current_app.mysql.connection.cursor(dictionary=True)
        cur.execute(query, tuple(params))
        students = cur.fetchall()
        return jsonify(students), 200
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cur.close()

# ---------------------- Add Single Student ----------------------
@student_bp.route('/students', methods=['POST'])
def add_student():
    data = request.json
    required_fields = ['rollNo', 'name', 'prn', 'year', 'division', 'admin_id']

    if not all(key in data for key in required_fields):
        missing_fields = [field for field in required_fields if field not in data]
        return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400

    try:
        cur = current_app.mysql.connection.cursor()
        cur.execute(
            "INSERT INTO students (roll_no, name, prn, year, division, admin_id) VALUES (%s, %s, %s, %s, %s, %s)",
            (data['rollNo'], data['name'], data['prn'], data['year'], data['division'], data['admin_id'])
        )
        current_app.mysql.connection.commit()
        return jsonify({"message": "Student added successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cur.close()

# ---------------------- Bulk Upload Students ----------------------
@student_bp.route('/students/bulk', methods=['POST'])
def bulk_upload_students():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    year = request.form.get('year')
    division = request.form.get('division')
    admin_id = request.form.get('admin_id')

    if not admin_id:
        return jsonify({"error": "admin_id is required"}), 400

    if not file.filename.endswith('.txt'):
        return jsonify({"error": "Only TXT files are supported"}), 400

    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        cur = current_app.mysql.connection.cursor()
        for line in lines:
            parts = line.strip().split(',')
            if len(parts) == 3:
                roll_no, name, prn = parts
                cur.execute(
                    "INSERT INTO students (roll_no, name, prn, year, division, admin_id) VALUES (%s, %s, %s, %s, %s, %s)",
                    (roll_no.strip(), name.strip(), prn.strip(), year, division, admin_id)
                )
        current_app.mysql.connection.commit()
        return jsonify({"message": "Bulk upload successful"}), 201
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500
    finally:
        cur.close()

# ---------------------- Delete Student ----------------------
@student_bp.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    admin_id = request.args.get('admin_id')
    if not admin_id:
        return jsonify({"error": "admin_id is required"}), 400

    try:
        cur = current_app.mysql.connection.cursor()
        cur.execute("SELECT id FROM students WHERE id = %s AND admin_id = %s", (student_id, admin_id))
        if not cur.fetchone():
            return jsonify({"error": "Student not found or not authorized"}), 404

        cur.execute("DELETE FROM students WHERE id = %s AND admin_id = %s", (student_id, admin_id))
        current_app.mysql.connection.commit()
        return jsonify({"message": "Student deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cur.close()
