import logging
from flask import request, jsonify
from werkzeug.exceptions import HTTPException
import requests
import os
import json


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# Access the variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")


TRANSCRIPT_API_URL = 'https://fastapi-server-1081098542602.us-central1.run.app/session/{roomId}/transcript'


def analyze_transcripts():
    """
    Handles POST requests to analyze transcripts based on roomId.
    """
    try:

        data = request.get_json()

        # Log the incoming request data for debugging
        logger.info(f"Received request data: {data}")

        room_id = data.get('roomId')
        if not room_id:
            logger.error("Missing roomId in the request")
            return jsonify({'error': 'roomId is required'}), 400

        # Log the roomId for debugging
        logger.info(f"Extracted roomId: {room_id}")

        # Fetch the transcript data from the FastAPI endpoint
        transcript_url = TRANSCRIPT_API_URL.format(roomId=room_id)
        transcript_response = requests.get(transcript_url)

        # Log the transcript response status
        logger.info(
            f"Fetched transcript response status: {transcript_response.status_code}")
        if transcript_response.status_code != 200:
            logger.error(
                f"Error fetching transcripts: {transcript_response.text}")
            return jsonify({'error': 'Failed to fetch transcripts'}), 502

        # Parse the transcript data
        transcript_data = transcript_response.json()
        logger.info(f"Transcript data received: {transcript_data}")

        # Extract the entire conversation from the transcript
        conversations = transcript_data.get('conversations', [])

        if not conversations:
            logger.error("No conversations found in transcript data")
            return jsonify({'error': 'No conversations found'}), 400

        # Send the entire conversation to Groq for analysis
        groq_response = send_to_groq(conversations)

        # Return the final analysis response from Groq
        return jsonify({'final_analysis': groq_response}), 200

    except HTTPException as e:
        logger.error(f"HTTP Error: {str(e)}")
        return jsonify({'error': 'HTTP Error'}), e.code
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500