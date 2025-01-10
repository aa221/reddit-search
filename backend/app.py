from app import app
from flask_cors import CORS
import os

# Enable CORS
CORS(app)

# Register Blueprints or Routes
from app import login_routes, reddit_routes, chatbot_routes

if __name__ == "__main__":
    # Get the port from the environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    # Bind to all interfaces
    app.run(host="0.0.0.0", port=port)
