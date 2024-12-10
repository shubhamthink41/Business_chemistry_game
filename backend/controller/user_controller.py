from model.model import User
from app import db
from google.cloud import storage
from werkzeug.utils import secure_filename
from flask import request, jsonify

GCS_BUCKET_NAME = 'bc_game_bucket'

storage_client = storage.Client()

def upload_image_to_gcs(image):
    """Uploads the image to GCS and returns the public URL"""
    filename = secure_filename(image.filename)
    bucket = storage_client.bucket(GCS_BUCKET_NAME)

    blob = bucket.blob(f'images/{filename}')
    blob.upload_from_file(image)

    blob.make_public()

    return blob.public_url

def create_user():
    try:
        data = request.form
        username = data.get('username')
        image = request.files.get('image')
        house = data.get('house', '')

        if image:
            image_url = upload_image_to_gcs(image)
        else:
            image_url = 'dummy_image.png'

        user = User(
            username=username,
            image=image_url,
            house=house
        )

        db.session.add(user)
        db.session.commit()

        user_data = {
            "id": user.id,
            "username": user.username,
            "image": user.image,
            "house": user.house,
        }

        return jsonify({"message": "User created successfully", "user": user_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def edit_user(user_id):
    try:
        data = request.form
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        if 'username' in data:
            user.username = data['username']
        if 'house' in data:
            user.house = data['house']
        if 'image' in request.files:
            image = request.files['image']
            user.image = upload_image_to_gcs(image)

        db.session.commit()

        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to update user"}), 500


def get_all_users():
    try:
        users = User.query.all()

        if not users:
            return jsonify({"message": "No users found"}), 404

        users_data = [
            {"id": user.id, "username": user.username,
                "image": user.image, "house": user.house}
            for user in users
        ]
        return jsonify(users_data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch users"}), 500
