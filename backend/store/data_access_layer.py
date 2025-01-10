from .initialize_database import supabase
from flask import jsonify

"""
Upload, retrieve, insert user and conversation related data into supabase. 
"""


def upsert_user_data(user_data):
    """
    Upserts user data into the Supabase table.

    :param user_data: A dictionary containing user data with keys:
                      'google_id', 'email', 'name', 'picture'
    """
    try:
        response = supabase.table('users').upsert(user_data).execute()
        return {
            "status_code": 200,
            "message": "Successfully Uploaded Data"
        }
    except Exception as e:
        print("An error occurred:", e)



## adds in a row to the conversation table.... this will be used to show it on the frontend 
## it will also be used to feed the agent the memory. 
## conversation data is as such {User_prompt: chat_answer}
def upload_conversation_data(subreddit, user_id, conversation_data):
    """
    Uploads conversation history to the Supabase table.

    :param subreddit: The subreddit to associate with the conversation data.
    :param user_id: The user ID to associate with the conversation data.
    :param conversation_data: The conversation data to upload.
    :return: A JSON response indicating the success or failure of the upload.
    """
    try:
        response = supabase.table('conversation_history').insert({
            "subreddit": subreddit,
            "google_id": user_id,
            "chat_history": conversation_data
        }).execute()
        return {
            "status_code": 200,
            "message": "Data uploaded successfully",
            "data": response.data
        }
    except Exception as e:
        print("An error occurred:", e)
        return {
            "status_code": 500,
            "message": "Failed to upload data"
        }
    
    

## fetches conversation history from the conversation table, given a subreddit and user id
## The data is structured as [{Question1: Answer1},{Question2:Answer2}]
## So oldest conversation wil be the first in the list. 
def fetch_conversation_data(subreddit, user_id):
    """
    Fetches conversation history from the Supabase table.

    :param subreddit: The subreddit to filter the conversation data.
    :param user_id: The user ID to filter the conversation data.
    :return: A list containing the conversation history.
    """
    try:
        response = supabase.table('conversation_history').select("chat_history").eq("subreddit", subreddit).eq("google_id", user_id).execute()
        # Check if response data is empty
        if not response.data:            
            return []  # Return empty list if no data
        return response.data  # Return data directly as a list
    except Exception as e:
        print("An error occurred:", e)
        return []  # Ensure a list is returned in case of an error


def delete_conversation_data(subreddit, user_id):
    """
    Deletes all conversation history associated with a subreddit and user ID from the Supabase table.

    :param subreddit: The subreddit to filter the conversation data.
    :param user_id: The user ID to filter the conversation data.
    :return: A JSON response indicating the success or failure of the deletion.
    """
    try:
        response = supabase.table('conversation_history').delete().eq("subreddit", subreddit).eq("google_id", user_id).execute()
        return {
            "status_code": 200,
            "message": "Data deleted successfully",
            "data": response.data
        }
    except Exception as e:
        print("An error occurred:", e)
        return {
            "status_code": 500,
            "message": "Failed to delete data"
        }




