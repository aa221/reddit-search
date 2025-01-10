from flask import Flask, jsonify, request,redirect
import os,sys
from store.data_access_layer import upsert_user_data


sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
from app import app
from store.initialize_database import supabase


@app.route("/signin/google")
def signin_with_google():
    redirect_to_url = f"{request.host_url}callback"
    res = supabase.auth.sign_in_with_oauth(
        {
            "provider": "google",
            "options": {
                "redirect_to": redirect_to_url
            },
        }
    )
    print("Redirect URL:", res.url)
    return redirect(res.url)

@app.route("/callback")
def callback():
    code = request.args.get("code")
    next_url = request.args.get("next", "http://localhost:3000/search")  # Update as needed

    if code:
        res = supabase.auth.exchange_code_for_session({"auth_code": code})

    user_data = {
        "google_id": res.user.id,  # Replace with actual field
        "email": res.user.email,   # Replace with actual field
        "name": res.user.user_metadata.get("name"),  # Replace with actual field
        "picture": res.user.user_metadata.get("picture")  # Replace with actual field
    }

    try:
        upsert_user_data(user_data)
    except Exception as e:
        return str(e), 500  # Return a proper error response

    # Redirect to the frontend with userId as a query parameter
    frontend_callback_url = f"{next_url}?userId={user_data['google_id']}"
    return redirect(frontend_callback_url)
