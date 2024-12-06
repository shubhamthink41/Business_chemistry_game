from flask import Blueprint , jsonify
from controller.transcript_controller import analyze_transcripts

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
    return analyze_transcripts()
