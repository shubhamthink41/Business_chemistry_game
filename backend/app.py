from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from model.model import db
from routes.api_routes import api_routes
from config import Config

load_dotenv()


app = Flask(__name__)
CORS(app)
app.register_blueprint(api_routes)
app.config.from_object(Config)


db.init_app(app)
with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True)