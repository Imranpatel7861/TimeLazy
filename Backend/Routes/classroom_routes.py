from flask import Blueprint, request, jsonify, current_app

classroom_bp = Blueprint('classroom', __name__, url_prefix='/api')

@classroom_bp.route('/classrooms', methods=['GET'])
def get_classrooms():
    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT id,classroom_number FROM classrooms ORDER BY classroom_number")
    rows=cur.fetchall(); cur.close()
    return jsonify([{'id':r[0],'classroom_name':r[1]} for r in rows])

@classroom_bp.route('/classrooms', methods=['POST'])
def add_classroom():
    data=request.get_json(); num=data.get('classroom_name','').strip().upper()
    if not num: return jsonify({'error':'Required'}),400
    cur=current_app.mysql.connection.cursor()
    cur.execute("SELECT * FROM classrooms WHERE classroom_number=%s",(num,))
    if cur.fetchone(): cur.close(); return jsonify({'error':'Exists'}),409
    cur.execute("INSERT INTO classrooms (classroom_number) VALUES (%s)",(num,))
    current_app.mysql.connection.commit(); cur.close()
    return jsonify({'message':'Classroom added'}),201

@classroom_bp.route('/classrooms/<int:id>', methods=['DELETE'])
def del_classroom(id):
    cur=current_app.mysql.connection.cursor()
    cur.execute("DELETE FROM classrooms WHERE id=%s",(id,))
    current_app.mysql.connection.commit()
    cur.close()
    return jsonify({'message':'Deleted'}),200
