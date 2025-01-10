import sys,os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from .search_reddit import search_within_subreddit
from store.chroma_db import get_embedding,get_embeddings,upload_reddit_content,collection
"""
The RAG pipeline that will take in a given search term, find the results online, store it in chroma db,
then return the most relevant information to the user depending on cosine similarity.
"""


import time



## takes in a subreddit name and a query, then returns the relevant information from the subreddits, to a given query. 
## returns the ingotmation as a giant string.
def rag_search_pipeline(subreddit_name, query, limit=3):
    print("Entering rag_search_pipeline...")
    start_time = time.time()

    # Timing search_within_subreddit
    search_start_time = time.time()
    print("Calling search_within_subreddit...")
    results = search_within_subreddit(subreddit_name, query, limit)
    search_end_time = time.time()
    print("search_within_subreddit returned with", len(results), "results")  
    print(f"search_within_subreddit execution time: {search_end_time - search_start_time:.2f} seconds")

    # Timing upload_reddit_content
    upload_start_time = time.time()
    print("Uploading content to Chroma DB...")
    upload_reddit_content(results)
    upload_end_time = time.time()
    print("upload_reddit_content done")
    print(f"upload_reddit_content execution time: {upload_end_time - upload_start_time:.2f} seconds")

    # Timing get_embedding
    embedding_start_time = time.time()
    print("Creating embedding for query...")
    query_embedding = get_embedding(query)
    embedding_end_time = time.time()
    print("Embedding done, querying collection...")
    print(f"get_embedding execution time: {embedding_end_time - embedding_start_time:.2f} seconds")

    # Timing collection.query
    query_start_time = time.time()
    similar_results = collection.query(query_embeddings=[query_embedding], n_results=10)
    query_end_time = time.time()
    print("Collection query complete")
    print(f"collection.query execution time: {query_end_time - query_start_time:.2f} seconds")

    end_time = time.time()
    print(f"Total execution time: {end_time - start_time:.2f} seconds")
    similar_result_string = ' '.join(similar_results['documents'][0])

    return similar_result_string




if __name__ == "__main__":
    rag_search_pipeline("dubai","where to thrift clothes?")
    print("Finished!")



    
    
