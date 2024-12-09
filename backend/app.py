
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from routes.api_routes import api_routes  # Import the routes

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Load .env file
load_dotenv()
     

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)