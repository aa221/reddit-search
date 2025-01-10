from flask import Flask, jsonify, request,redirect
import os,sys
from store.data_access_layer import upsert_user_data

sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
from app import app
from store.initialize_database import supabase
from services import search_reddit

@app.route('/search_subreddits', methods=['GET'])
def search_reddit_route():
    query = request.args.get('query', '')
    
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    subreddits = search_reddit.search_subreddits(query)  # Now returns a list
    print(subreddits)
    
    return jsonify(subreddits)   # Flask jsonify will serialize the list correctly



