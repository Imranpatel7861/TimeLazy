from flask import Blueprint, request, jsonify, current_app
import re
import logging

lab_bp = Blueprint('labs', __name__, url_prefix='/api')

@lab_bp.route('/labs', methods=['GET'])
def get_labs():
    admin_id = request.args.get('admin_id', type=int)
    if not admin_id:
        return jsonify({'error': 'Admin ID is required'}), 400

    cur = None
    try:
        cur = current_app.mysql.connection.cursor()
        cur.execute("""
            SELECT id, lab_name
            FROM labs
            WHERE admin_id = %s
            ORDER BY lab_name
        """, (admin_id,))
        labs = [{'id': r[0], 'lab_name': r[1]} for r in cur.fetchall()]
        return jsonify(labs)
    except Exception as e:
        current_app.logger.error(f"Error fetching labs: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if cur:
            cur.close()

@lab_bp.route('/labs', methods=['POST'])
def add_lab():
    data = request.get_json()
    name = data.get('lab_name', '').strip().upper()
    admin_id = data.get('admin_id')

    if not admin_id:
        return jsonify({'error': 'Admin ID is required'}), 400
    if not name:
        return jsonify({'error': 'Lab name required'}), 400

    if not re.match(r'^[A-Z0-9\-_]+$', name):
        return jsonify({'error': 'Invalid lab name format'}), 400

    cur = None
    try:
        cur = current_app.mysql.connection.cursor()
        current_app.mysql.connection.begin()

        # Check if lab already exists
        cur.execute("SELECT * FROM labs WHERE lab_name = %s AND admin_id = %s", (name, admin_id))
        if cur.fetchone():
            current_app.mysql.connection.rollback()
            return jsonify({'error': 'Lab already exists'}), 409

        # Insert new lab
        cur.execute("INSERT INTO labs (lab_name, admin_id) VALUES (%s, %s)", (name, admin_id))
        current_app.mysql.connection.commit()
        return jsonify({'message': 'Lab added'}), 201
    except Exception as e:
        current_app.logger.error(f"Error adding lab: {e}")
        if current_app.mysql.connection:
            current_app.mysql.connection.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if cur:
            cur.close()

@lab_bp.route('/labs/<int:lab_id>', methods=['DELETE'])
def delete_lab(lab_id):
    admin_id = request.args.get('admin_id', type=int)
    if not admin_id:
        return jsonify({'error': 'Admin ID is required'}), 400

    cur = None
    try:
        cur = current_app.mysql.connection.cursor()
        current_app.mysql.connection.begin()

        # Check if lab exists
        cur.execute("SELECT * FROM labs WHERE id = %s AND admin_id = %s", (lab_id, admin_id))
        if not cur.fetchone():
            current_app.mysql.connection.rollback()
            return jsonify({'error': 'Lab not found'}), 404

        # Delete lab
        cur.execute("DELETE FROM labs WHERE id = %s AND admin_id = %s", (lab_id, admin_id))
        current_app.mysql.connection.commit()
        current_app.logger.info(f"Lab {lab_id} deleted by admin {admin_id}")
        return jsonify({'message': 'Lab deleted'}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting lab: {e}")
        if current_app.mysql.connection:
            current_app.mysql.connection.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if cur:
            cur.close()
