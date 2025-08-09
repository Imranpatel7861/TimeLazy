from flask import Blueprint, request, jsonify, current_app

lab_bp = Blueprint('labs', __name__, url_prefix='/api')

@lab_bp.route('/labs', methods=['GET'])
def get_labs():
    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT id, lab_name FROM labs ORDER BY lab_name")
    labs = [{'id': r[0], 'lab_name': r[1]} for r in cur.fetchall()]
    cur.close()
    return jsonify(labs)

@lab_bp.route('/labs', methods=['POST'])
def add_lab():
    data = request.get_json()
    name = data.get('lab_name', '').strip().upper()

    if not name:
        return jsonify({'error': 'Lab name required'}), 400

    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT * FROM labs WHERE lab_name = %s", (name,))
    if cur.fetchone():
        cur.close()
        return jsonify({'error': 'Exists'}), 409

    cur.execute("INSERT INTO labs (lab_name) VALUES (%s)", (name,))
    current_app.mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Lab added'}), 201

@lab_bp.route('/labs/<int:lab_id>', methods=['DELETE'])
def delete_lab(lab_id):
    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT * FROM labs WHERE id = %s", (lab_id,))
    if not cur.fetchone():
        cur.close()
        return jsonify({'error': 'Lab not found'}), 404

    cur.execute("DELETE FROM labs WHERE id = %s", (lab_id,))
    current_app.mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Lab deleted'}), 200
