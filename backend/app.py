from app import app
from flask_cors import CORS
import sys,os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__)))) #TODO:tidy this up

from app import login_routes,reddit_routes,chatbot_routes
CORS(app)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)  # Run locally on port 5000