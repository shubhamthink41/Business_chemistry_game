from flask import Blueprint, jsonify

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
