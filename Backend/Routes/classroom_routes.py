from flask import Blueprint, request, jsonify, current_app

classroom_bp = Blueprint('classroom', __name__, url_prefix='/api')

# ---------------------- Add Classroom ----------------------
@classroom_bp.route('/classrooms', methods=['POST'])
def add_classroom():
    data = request.json
    classroom_number = data.get('classroom_number')
    admin_id = data.get('admin_id')

    if not classroom_number or not admin_id:
        return jsonify({"error": "Missing classroom_number or admin_id"}), 400

    import MySQLdb.cursors
    cur = current_app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    try:
        cur.execute(
            "INSERT INTO classrooms (classroom_number, admin_id) VALUES (%s, %s)",
            (classroom_number, admin_id)
        )
        current_app.mysql.connection.commit()
        return jsonify({"message": "Classroom added successfully"}), 201
    except Exception as e:
        print("Error adding classroom:", e)
        return jsonify({"error": "Failed to add classroom"}), 500
    finally:
        cur.close()


# ---------------------- Get Classrooms ----------------------

@classroom_bp.route('/classrooms', methods=['GET'])
def get_classrooms():
    admin_id = request.args.get('admin_id')

    import MySQLdb.cursors
    cur = current_app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    try:
        if admin_id:
            cur.execute("""
                SELECT id, classroom_number 
                FROM classrooms 
                WHERE admin_id = %s
                ORDER BY classroom_number ASC
            """, (admin_id,))
        else:
            cur.execute("""
                SELECT id, classroom_number, admin_id 
                FROM classrooms
                ORDER BY classroom_number ASC
            """)
        classrooms = cur.fetchall()
        return jsonify(classrooms), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to fetch classrooms"}), 500
    finally:
        cur.close()


# ---------------------- Delete Classroom ----------------------
@classroom_bp.route('/classrooms/<int:classroom_id>', methods=['DELETE'])
def delete_classroom(classroom_id):
    admin_id = request.args.get('admin_id')

    if not admin_id:
        return jsonify({"error": "admin_id is required"}), 400

    cur = current_app.mysql.connection.cursor()
    try:
        # Verify ownership before deleting
        cur.execute("""
            SELECT id FROM classrooms 
            WHERE id = %s AND admin_id = %s
        """, (classroom_id, admin_id))
        if not cur.fetchone():
            return jsonify({"error": "Classroom not found or unauthorized"}), 404

        cur.execute("DELETE FROM classrooms WHERE id = %s", (classroom_id,))
        current_app.mysql.connection.commit()

        return jsonify({"message": "Classroom deleted successfully"}), 200

    except Exception as e:
        current_app.logger.error(f"Error deleting classroom: {e}")
        return jsonify({"error": "Failed to delete classroom"}), 500

    finally:
        cur.close()
