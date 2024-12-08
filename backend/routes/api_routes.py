from flask import Blueprint, jsonify, request


api_routes = Blueprint('api_routes', __name__)


@api_routes.route('/', methods=['GET'])
def health_check():
    """
    Simple health check endpoint to verify server status.
    """
    return jsonify({
        'status': 'healthy',
        'message': 'Server is up and running'
    }), 200


@api_routes.route('/api/analyze_transcripts/', methods=['POST'])
def analyze_transcripts_route():
    from controller.transcript_controller import analyze_transcripts
    return analyze_transcripts()

# CRUD


@api_routes.route('/api/getStarted', methods=['POST'])
def create_user_route():
    from controller.user_controller import create_user
    return create_user()


@api_routes.route('/api/updateUser', methods=['POST'])
def update_user_route():
    from controller.user_controller import edit_user
    user_id = request.form.get("user_id") 
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    return edit_user(user_id)


@api_routes.route('/api/getall', methods=['POST'])
def get_all_user_route():
    from controller.user_controller import get_all_users
    return get_all_users()
