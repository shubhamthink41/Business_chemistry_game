from model.model import User
from flask import request, jsonify
from model.model import User
from app import db


def create_user():
    try:
        data = request.json
        username = data.get('username')
        image = data.get('image') if data.get('image') else 'dummy_image.png'
        house = data.get('house', '')

        user = User(
            username=username,
            image=image,
            house=house
        )

        db.session.add(user)
        db.session.commit()

        return jsonify(
            {"message": "user created successfully"},
        ), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
