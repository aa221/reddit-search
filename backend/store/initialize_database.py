from supabase import create_client, Client
from dotenv import load_dotenv
import os


"""
This initializes supabase (our giant storage unit)
"""


load_dotenv()  # Load environment variables from .env file

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(SUPABASE_URL,"here")


if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set")



SUPABASE_URL = os.getenv("SUPABASE_URL")
print("DEBUG: SUPABASE_URL is:", SUPABASE_URL)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

