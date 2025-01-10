import sys,os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
from services.reddit_client import reddit
import time
from concurrent.futures import ThreadPoolExecutor

"""
The logic to search for a subreddit, but also to search for the topics within a subreddit.
"""


## does not handle pagination yet.
## simply gets the name, public description, and icon of a subreddit.
## used for when someone searches for a subreddit.
def search_subreddits(query, limit=20):
    results = reddit.subreddits.search(query, limit=limit)
    
    subreddit_list = list(results)
    subreddits = []
        
    for sub in subreddit_list:
        icon_img = sub.icon_img if sub.icon_img else sub.community_icon
        subreddit_details = {
            "display_name": sub.display_name,
            "public_description": sub.public_description,
            "icon": icon_img,
            "subscribers": sub.subscribers,
            "id": sub.id
        }
        subreddits.append(subreddit_details)
    return subreddits




from concurrent.futures import ThreadPoolExecutor
import time

def process_post(post):
    """Process a single post to extract title, content, and responses."""
    return {
        "POST TITLE": post.title,
        "POST CONTENT": post.selftext,
        "POST RESPONSES": get_comments_from_thread(post.id)
    }


def search_within_subreddit(subreddit_name, query, limit=3):
    start_time = time.time()  # Start the timer
    subreddit = reddit.subreddit(subreddit_name)  # Get the subreddit object
    results = list(subreddit.search(query, limit=limit))  # Get the results
    
    # Multithread the processing of posts
    with ThreadPoolExecutor(max_workers=limit) as executor:
        posts = list(executor.map(process_post, results))  # Map each post to a thread

    end_time = time.time()  # End the timer
    print(f"Search completed in {end_time - start_time:.2f} seconds.")  # Print the elapsed time
    return posts


def get_comments_from_thread(thread_id):
    thread = reddit.submission(id=thread_id)
    thread.comments.replace_more(limit=5)  # Load first 20 comments
    
    # Flatten comments and limit to the first 10
    return [
        comment.body
        for comment in thread.comments.list()  # Limit to first 20 comments
    ]



#print(search_within_subreddit("dubai","nintendo",2)[0]['POST RESPONSES'])


