from flask import Blueprint, request, jsonify, current_app

teacher_bp = Blueprint('teacher', __name__, url_prefix='/api')

# 🔹 GET all teachers
@teacher_bp.route('/teachers', methods=['GET'])
def get_teachers():
    cur = current_app.mysql.connection.cursor()
    try:
        cur.execute("SELECT id, name, subject, email FROM teachers ORDER BY name ASC")
        teachers = [{'id': row[0], 'name': row[1], 'subject': row[2], 'email': row[3]} for row in cur.fetchall()]
        return jsonify(teachers), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch teachers'}), 500
    finally:
        cur.close()

# 🔹 POST new teacher
@teacher_bp.route('/teachers', methods=['POST'])
def add_teacher():
    data = request.get_json()
    name, subject, email = data.get('name'), data.get('subject'), data.get('email')

    if not name or not subject or not email:
        return jsonify({'error': 'All fields are required'}), 400

    cur = current_app.mysql.connection.cursor()
    try:
        cur.execute("SELECT * FROM teachers WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({'error': 'Teacher with this email already exists'}), 409

        cur.execute("INSERT INTO teachers (name, subject, email) VALUES (%s, %s, %s)", (name, subject, email))
        current_app.mysql.connection.commit()
        return jsonify({'message': 'Teacher added successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to add teacher'}), 500
    finally:
        cur.close()

# 🔹 PUT update teacher
@teacher_bp.route('/teachers/<int:teacher_id>', methods=['PUT'])
def update_teacher(teacher_id):
    data = request.get_json()
    name, subject, email = data.get('name'), data.get('subject'), data.get('email')

    if not name or not subject or not email:
        return jsonify({'error': 'All fields are required'}), 400

    cur = current_app.mysql.connection.cursor()
    try:
        cur.execute("SELECT * FROM teachers WHERE id = %s", (teacher_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Teacher not found'}), 404

        cur.execute(
            "UPDATE teachers SET name = %s, subject = %s, email = %s WHERE id = %s",
            (name, subject, email, teacher_id)
        )
        current_app.mysql.connection.commit()
        return jsonify({'message': 'Teacher updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to update teacher'}), 500
    finally:
        cur.close()

# 🔹 DELETE teacher
@teacher_bp.route('/teachers/<int:teacher_id>', methods=['DELETE'])
def delete_teacher(teacher_id):
    cur = current_app.mysql.connection.cursor()
    try:
        cur.execute("SELECT * FROM teachers WHERE id = %s", (teacher_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Teacher not found'}), 404

        cur.execute("DELETE FROM teachers WHERE id = %s", (teacher_id,))
        current_app.mysql.connection.commit()
        return jsonify({'message': 'Teacher deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to delete teacher'}), 500
    finally:
        cur.close()
