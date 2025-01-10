from flask import Flask, jsonify, request,redirect
import os,sys
from store.data_access_layer import upsert_user_data,delete_conversation_data
from langchain_openai import ChatOpenAI




sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
from app import app
from store.initialize_database import supabase
from services import chatbot,tool
from store import data_access_layer



llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENAI_API_KEY"),  # Correct parameter name
    temperature=0.2,
)


@app.route('/chat', methods=['POST'])  # Define API endpoint
def chat_with_bot():
    """
    Handle a single user chat session via API.
    """

    user_input = request.json.get("message")  # Get user input from JSON request
    subreddit_name = request.json.get("subreddit")  # Get subreddit from JSON request
    user_id = request.json.get("user_id")  # Get user input from JSON request
    
    subreddit_search_tool = tool.create_subreddit_search_tool(subreddit_name)
    agent = chatbot.initialize_chat_agent(llm, subreddit_search_tool)

    
    if not user_input:
        return jsonify({"error": "No message provided"}), 400  # Error if no message
    if not subreddit_name:
        return jsonify({"error": "No subreddit provided"}), 400  # Error if no message
    
    response = chatbot.start_chat_session(subreddit_name,user_input,user_id,agent)  # Start a new session
    return jsonify({"response": response})  # Return response as JSON


# if there is history it returns it and puts it in the convo.
# Otherwise it is blank.
@app.route('/chat_history', methods=['POST'])  # Define API endpoint
def chat_history():
    try:
        subreddit_name = request.json.get("subreddit")  # Get subreddit from JSON request
        user_id = request.json.get("user_id")  # Get user input from JSON request
        conversation_history = data_access_layer.fetch_conversation_data(subreddit_name,user_id)
        return jsonify({"response": conversation_history})  # Return response as JSON
    except Exception as e:
        return jsonify({"error": "No subreddit provided"}), 400  # Error if no message

    

@app.route('/delete_conversation', methods=['POST'])
def delete_conversation():
    subreddit_name = request.json.get("subreddit")  # Get subreddit from JSON request
    user_id = request.json.get("user_id")  # Get user input from JSON request
    
    
    if not subreddit_name:
        return jsonify({"error": "subreddit name parameter is required"}), 400
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400

    response = delete_conversation_data(subreddit_name,user_id)
    if response["status_code"] == 200:
        return jsonify({"success":response["message"]  })
    else:

        return jsonify({"error": response["message"]}), response["status_code"]




    