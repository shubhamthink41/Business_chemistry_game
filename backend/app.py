import json
import logging
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv
import os

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)


# Load .env file
load_dotenv()

# Access the variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")


# FastAPI Endpoint for transcripts
TRANSCRIPT_API_URL = 'https://fastapi-server-1081098542602.us-central1.run.app/session/{roomId}/transcript'

# Initialize logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Cache to track transcript lengths per roomId
transcript_cache = {}


@app.route('/', methods=['GET'])
def health_check():
    """
    Simple health check endpoint to verify server status.
    """
    return jsonify({
        'status': 'healthy',
        'message': 'Server is up and running'
    }), 200


@app.route('/api/analyze_transcripts/', methods=['POST'])
def analyze_transcripts():
    """
    Handles POST requests to analyze transcripts based on roomId.
    """
    try:
        # Get the incoming JSON data
        data = request.get_json()

        # Log the incoming request data for debugging
        logger.info(f"Received request data: {data}")

        room_id = data.get('roomId')
        if not room_id:
            logger.error("Missing roomId in the request")
            return jsonify({'error': 'roomId is required'}), 400

        # Log the roomId for debugging
        logger.info(f"Extracted roomId: {room_id}")

        # Fetch and check if we should process the new transcript
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

        # Check if the conversation has ended
        if has_conversation_ended(transcript_data):
            logger.info(
                "Conversation has ended. No further analysis required.")
            # return jsonify({'message': 'Conversation has ended'}), 200

        # Check if enough new entries are available for processing
        existing_length = transcript_cache.get(room_id, 0)
        new_length = len(transcript_data.get('conversations', []))
        if new_length - existing_length < 2:
            logger.info("Not enough new entries to process.")
            dummy_response = {
                'question': 'No valid question processed',
                'answer': 'No valid answer processed',
                'scores': {
                    'pioneer': 0,
                    'driver': 0,
                    'integrator': 0,
                    'guardian': 0
                }
            }

            return jsonify({"results": [dummy_response]}), 200

        # Update cache for the roomId
        transcript_cache[room_id] = new_length

        # Extract questions and answers from the transcripts
        questions_and_answers = extract_questions_and_answers(
            transcript_data, existing_length)
        # if not questions_and_answers:
        # logger.error("No valid questions and answers found in transcripts")
        # return jsonify({'error': 'No questions and answers found in transcripts'}), 400

        # Send each question-answer pair to Groq for scoring
        for idx, qa in enumerate(questions_and_answers, start=1):
            question = qa.get('question')
            answer = qa.get('answer')

            if not question or not answer:
                logger.warning(f"Skipping invalid QA pair: {qa}")
                continue

            # Log each question-answer pair
            logger.info(
                f"Processing question {idx}: {question} with answer: {answer}")

            # Send question-answer to Groq for scoring
            groq_response = send_to_groq(question, answer, idx)
            logger.info(f"groq scoring:{groq_response}")

        # Return the aggregated results
            if (groq_response):
                return jsonify({'results': [groq_response]}), 200
            else:
                dummy_response = {
                    'question': 'No valid question processed',
                    'answer': 'No valid answer processed',
                    'scores': {
                        'pioneer': 0,
                        'driver': 0,
                        'integrator': 0,
                        'guardian': 0
                    }
                }

                return jsonify({"results": [dummy_response]}), 200

    except HTTPException as e:
        logger.error(f"HTTP Error: {str(e)}")
        return jsonify({'error': 'HTTP Error'}), e.code
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500


def has_conversation_ended(transcript_data):
    """
    Checks if the agent's transcript contains a phrase indicating the conversation has ended.
    """
    if isinstance(transcript_data, dict) and 'conversations' in transcript_data:
        conversations = transcript_data['conversations']

        if isinstance(conversations, list):
            for entry in conversations:
                if isinstance(entry, dict):  # Ensure each entry is a dictionary
                    role = entry.get('role')
                    content = entry.get('content', '').strip().lower()

                    if role == 'assistant' and 'end the conversation' in content:
                        return True
    return False


def extract_questions_and_answers(transcript_data, existing_length):
    """
    Extracts question-answer pairs from the transcript data, ensuring a full exchange (user and assistant) is complete.
    Only processes new entries beyond the existing length.
    """
    questions_and_answers = []
    current_question = None
    conversations = transcript_data.get('conversations', [])

    # Only process new entries beyond the existing length
    for entry in conversations[existing_length:]:
        if isinstance(entry, dict):  # Ensure each entry is a dictionary
            role = entry.get('role')
            content = entry.get('content', '').strip()

            if role == 'assistant':  # Assistant asks a question
                current_question = content
            elif role == 'user' and current_question:  # User responds to the last question
                questions_and_answers.append({
                    'question': current_question,
                    'answer': content
                })
                current_question = None  # Reset after pairing the question with its answer

    # Log complete exchanges
    logger.info(f"Complete exchanges: {questions_and_answers}")
    return questions_and_answers


def send_to_groq(question, answer, question_id):
    """
    Sends a question-answer pair to the Groq API for scoring.
    """
    try:
        # Check if the answer is out-of-context (e.g., greeting or non-relevant response)
        # If the answer is not out-of-context, send to Groq for scoring
        groq_response = get_groq_scores(question, answer)
        return groq_response

    except Exception as e:
        logger.error(
            f"Error processing question {question_id} with Groq: {str(e)}")
        return {
            'question': question,
            'answer': answer,
            'scores': {
                "pioneer": 0,
                "driver": 0,
                "integrator": 0,
                "guardian": 0
            },
            'error': 'Unexpected error'
        }


def get_groq_scores(question, answer):
    """
    Sends a valid question-answer pair to the Groq API and returns the scores.
    """
    try:
        # Define Groq API request payload
        message = {
            "role": "system",
            "content": f"""
            You are a business chemistry assessment score evaluator. Analyze the following question and answer pair and provide scores  out of 5 for Pioneer, Driver, Integrator, and Guardian. 
            If the intent of the answer does not look like answer to the question,assign 1.
            Only respond in JSON format with the following structure:
            {{
                "scores": {{
                    "pioneer": X,
                    "driver": Y,
                    "integrator": Z,
                    "guardian": W
                }}
            }}

            Question: '{question}'
            Answer: '{answer}'
            """
            f"""if the question  does not exist in this list of  questions,assign score 0 for every category to that question answer pair:
            "You're stuck in a Las Vegas elevator with Elon Musk and a stand-up comedian. How do you keep everyone entertained for the next 5 min?",
  "You've been given a free round-the-world ticket, but you can only choose three completely unrelated activities in 3 different cities. What would they be?",
  "You are in MasterChef USA and you have been asked to reinvent a classic dish from your favorite cuisine. What dish would you like to reinvent and how? Also, what name would you give.",
  "During a poker tournament, you realize the person next to you is Jeff Bezos. What would be your reaction?",
  "As a Hollywood Director you have an opportunity to re-write the ending for a famous movie of yours. Which moview would this be and what would be the alternate ending.",
  "You have the opportunity to suggest an unconventional team-building exercise that would actually make people want to participate enthusiastically. What would it be?",
  "You are throwing a house party and have the opportunity to invite 3 famous celebrities. Who would they be and why",
  "You discover a unique athletic ability that no one else has and you can use it any sport of your choice? what will your superpower be and which sport will you use it in?",
  "You’re invited to a private dinner with the captain of your favorite sports team. What conversation starter do you use to break the ice?",
  "You find yourself living out the plot of your favorite movie, but with the ability to change one critical moment. What would you alter?",
  "Design the most unique travel experience possible that doesn't involve traditional tourism. What's your concept?",
  "You have been given a flight ticket to an unknown destination, but you have to leave in the next 10 min, what all will you pack in your bag?",
  "You have the opportunity to suggest an unconventional team-building exercise that would actually make people want to participate enthusiastically. What would it be?",
  "You've just hit the jackpot on a slot machine. What are your immediate thoughts and how do you plan to handle this sudden wealth?"
            """
        }

        groq_payload = {
            "model": "llama3-8b-8192",
            "messages": [message]
        }

        headers = {
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json',
        }

        response = requests.post(
            GROQ_API_URL, json=groq_payload, headers=headers)

        # Log the raw response
        logger.info(f"Groq raw response: {response.text}")

        if response.status_code != 200:
            raise ValueError(
                f"Groq API returned status {response.status_code}")

        groq_response = response.json()
        content = groq_response.get('choices', [{}])[0].get(
            'message', {}).get('content', '{}')

        # Parse content as JSON
        try:
            scores = json.loads(content).get('scores', {
                "pioneer": 0,
                "driver": 0,
                "integrator": 0,
                "guardian": 0
            })
            groq_sending = True
            logger.info(f"scores assigned by groq:{scores}")
            return {
                'question': question,
                'answer': answer,
                'scores': scores
            }

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON response from Groq: {content}")
            scores = {
                "pioneer": 0,
                "driver": 0,
                "integrator": 0,
                "guardian": 0
            }
            logger.info(f"scores assigned by groq:{scores}")

    except Exception as e:
        logger.error(
            f"Error processing question and answer with Groq: {str(e)}")
        return {
            'question': question,
            'answer': answer,
            'scores': {
                "pioneer": 0,
                "driver": 0,
                "integrator": 0,
                "guardian": 0
            },
            'error': 'Unexpected error'
        }


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
