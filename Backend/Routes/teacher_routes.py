from flask import Blueprint, request, jsonify, current_app

teacher_bp = Blueprint('teacher', __name__, url_prefix='/api')

# Helper function to generate abbreviation
def generate_abbreviation(name):
    return ''.join([part[0].upper() for part in name.split()])


# 🔹 POST new teacher
@teacher_bp.route('/teachers', methods=['POST'])
def add_teacher():
    data = request.get_json()
    name = data.get('name')
    subject = data.get('subject')
    email = data.get('email')
    admin_id = data.get('admin_id')  # <-- get admin_id from request

    if not name or not subject or not email or not admin_id:
        return jsonify({'error': 'All fields are required'}), 400

    abbreviation = generate_abbreviation(name)

    cur = current_app.mysql.connection.cursor()
    try:
        # Check if teacher email already exists
        cur.execute("SELECT * FROM teachers WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({'error': 'Teacher with this email already exists'}), 409

        # Insert new teacher with admin_id
        cur.execute(
            "INSERT INTO teachers (name, subject, email, abbreviation, admin_id) VALUES (%s, %s, %s, %s, %s)",
            (name, subject, email, abbreviation, admin_id)
        )
        current_app.mysql.connection.commit()
        return jsonify({'message': 'Teacher added successfully'}), 201
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to add teacher'}), 500
    finally:
        cur.close()


@teacher_bp.route('/teachers', methods=['GET'])
def get_teachers():
    admin_id = request.args.get('admin_id')
    cur = current_app.mysql.connection.cursor()
    try:
        if admin_id:
            admin_id = int(admin_id)  # cast to int
            cur.execute(
                "SELECT id, name, subject, email, abbreviation FROM teachers WHERE admin_id = %s ORDER BY name ASC",
                (admin_id,)
            )
        else:
            cur.execute(
                "SELECT id, name, subject, email, abbreviation FROM teachers ORDER BY name ASC"
            )
        teachers = [{
            'id': row[0],
            'name': row[1],
            'subject': row[2],
            'email': row[3],
            'abbreviation': row[4]
        } for row in cur.fetchall()]
        return jsonify(teachers), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to fetch teachers'}), 500
    finally:
        cur.close()


# 🔹 PUT update teacher
@teacher_bp.route('/teachers/<int:teacher_id>', methods=['PUT'])
def update_teacher(teacher_id):
    data = request.get_json()
    name, subject, email = data.get('name'), data.get('subject'), data.get('email')
    if not name or not subject or not email:
        return jsonify({'error': 'All fields are required'}), 400

    abbreviation = generate_abbreviation(name)

    cur = current_app.mysql.connection.cursor()
    try:
        cur.execute("SELECT * FROM teachers WHERE id = %s", (teacher_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Teacher not found'}), 404

        cur.execute(
            "UPDATE teachers SET name = %s, subject = %s, email = %s, abbreviation = %s WHERE id = %s",
            (name, subject, email, abbreviation, teacher_id)
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
