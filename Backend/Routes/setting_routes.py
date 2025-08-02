from flask import Blueprint, request, jsonify

setting_bp = Blueprint('setting', __name__, url_prefix='/api')

@setting_bp.route('/settings', methods=['GET'])
def get_settings():
    # Example static config
    return jsonify({'theme':'light','notifications':True}),200

@setting_bp.route('/settings', methods=['POST'])
def update_settings():
    data = request.get_json()
    # Save settings to DB if needed
    return jsonify({'message':'Settings updated','data':data}),200
