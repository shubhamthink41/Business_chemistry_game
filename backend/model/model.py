from sqlalchemy.sql import func
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    image = db.Column(db.String(120), nullable=True)  # image url
    house = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True),
                           server_default=func.now())

    def __repr__(self):
        return f"<User {self.username}>"
