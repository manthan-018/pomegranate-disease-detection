import os
import uuid
from datetime import datetime
from pathlib import Path

import numpy as np
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_sqlalchemy import SQLAlchemy
from PIL import Image
from tensorflow.keras.models import load_model
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "fruit_health_model.keras"
FALLBACK_MODEL_PATH = BASE_DIR / "fruit_health_model.h5"
USERS_DB_PATH = BASE_DIR / "users.db"

CLASS_MAP = {
    0: "Alternaria",
    1: "Anthracnose",
    2: "Bacterial_Blight",
    3: "Cercospora",
    4: "Healthy",
}

IMAGE_SIZE = (224, 224)
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("FRUIT_GUARDIAN_SECRET", "fruit-guardian-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{USERS_DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["ADMIN_ACCESS_TOKEN"] = os.environ.get("ADMIN_ACCESS_TOKEN", "fruit-guardian-admin")

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, include_hash=False):
        payload = {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "createdAt": self.created_at.isoformat(),
        }
        if include_hash:
            payload["passwordHash"] = self.password_hash
        return payload


def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return User.query.get(user_id)


def login_user(user: User):
    session["user_id"] = user.id
    session["username"] = user.username


def logout_user():
    session.pop("user_id", None)
    session.pop("username", None)


def sanitize_next(next_url: str | None) -> str | None:
    if next_url and next_url.startswith("/"):
        return next_url
    return None


def load_trained_model() -> "load_model":
    if MODEL_PATH.exists():
        return load_model(MODEL_PATH)
    if FALLBACK_MODEL_PATH.exists():
        return load_model(FALLBACK_MODEL_PATH)
    raise FileNotFoundError(
        "No trained model file found. Expected fruit_health_model.keras or fruit_health_model.h5"
    )


model = load_trained_model()


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB").resize(IMAGE_SIZE)
    array = np.array(image, dtype=np.float32) / 255.0
    array = np.expand_dims(array, axis=0)
    return array


@app.route("/")
def index():
    user = get_current_user()
    if not user:
        next_url = sanitize_next(request.args.get("next")) or request.path
        return redirect(url_for("login_page", next=next_url))
    return render_template("index.html", user=user)


@app.route("/auth")
def auth_page():
    if session.get("user_id"):
        next_url = sanitize_next(request.args.get("next")) or url_for("index")
        return redirect(next_url)
    return redirect(url_for("login_page"))


@app.route("/login")
def login_page():
    if session.get("user_id"):
        next_url = sanitize_next(request.args.get("next")) or url_for("index")
        return redirect(next_url)
    return render_template("login.html")


@app.route("/register")
def register_page():
    if session.get("user_id"):
        next_url = sanitize_next(request.args.get("next")) or url_for("index")
        return redirect(next_url)
    return render_template("register.html")


@app.route("/admin")
def admin_page():
    if session.get("user_id"):
        next_url = sanitize_next(request.args.get("next")) or url_for("index")
        return redirect(next_url)
    return render_template("admin.html")


@app.route("/predict", methods=["POST"])
def predict():
    if not session.get("user_id"):
        return jsonify({"error": "authentication required"}), 401
    if "image" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify(
            {"error": f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"}
        ), 400

    try:
        img = Image.open(file.stream)
        processed = preprocess_image(img)
        predictions = model.predict(processed)[0]
        confidences = predictions / predictions.sum()
        top_index = int(np.argmax(confidences))
        response = {
            "label": CLASS_MAP.get(top_index, "Unknown"),
            "confidence": float(confidences[top_index]),
            "scores": [
                {"label": CLASS_MAP.get(i, str(i)), "confidence": float(score)}
                for i, score in enumerate(confidences)
            ],
            "requestId": uuid.uuid4().hex,
        }
        return jsonify(response)
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"error": f"Inference failed: {exc}"}), 500


@app.route("/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or request.form
    username = (payload.get("username") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already exists"}), 409

    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return jsonify({"message": "user registered", "user": user.to_dict()}), 201


@app.route("/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or request.form
    identifier = (payload.get("identifier") or "").strip()
    password = payload.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "identifier and password are required"}), 400

    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier.lower())
    ).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401

    login_user(user)
    return jsonify({"message": "login successful", "user": user.to_dict()}), 200


@app.route("/logout", methods=["POST"])
def logout():
    logout_user()
    if "application/json" in request.headers.get("Accept", ""):
        return jsonify({"message": "logged out"}), 200
    return redirect(url_for("login_page"))


@app.route("/admin/users")
def admin_users():
    token = request.args.get("token")
    if token != app.config["ADMIN_ACCESS_TOKEN"]:
        return jsonify({"error": "unauthorized"}), 403
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify(
        {"count": len(users), "users": [user.to_dict(include_hash=True) for user in users]}
    )


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)

