# app/__init__.py
from flask import Flask
import sys,os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__)))) #TODO:tidy this up


from flask_cors import CORS

app = Flask(__name__)
CORS(app)


