import sys, os
from typing import List, Dict
import chromadb
from langchain.text_splitter import CharacterTextSplitter
import uuid
from openai import OpenAI
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor
from itertools import islice
from tqdm import tqdm

load_dotenv()
open_ai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chromadb_client = chromadb.Client()
collection = chromadb_client.create_collection(
    name="reddit_collection",
    metadata={"hnsw:space": "cosine"}
)

splitter = CharacterTextSplitter(
    separator=" ",
    chunk_size=1500,
    chunk_overlap=100
)

def get_embedding(text, model="text-embedding-ada-002"):
    text = text.replace("\n", " ")
    response = open_ai_client.embeddings.create(input=[text], model=model)
    return response.data[0].embedding

def get_embeddings(texts: List[str], batch_size: int = 100, model: str = "text-embedding-ada-002") -> List[List[float]]:
    """Get embeddings for a large batch of texts by processing in smaller batches"""
    all_embeddings = []
    cleaned_texts = [" ".join(text.split()) for text in texts if text and isinstance(text, str)]
    
    # Process in parallel using ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for i in range(0, len(cleaned_texts), batch_size):
            batch = cleaned_texts[i:i + batch_size]
            try:
                response = open_ai_client.embeddings.create(
                    input=batch,
                    model=model
                )
                batch_embeddings = [res.embedding for res in response.data]
                all_embeddings.extend(batch_embeddings)
            except Exception as e:
                print(f"Error in batch {i//batch_size}: {str(e)}")
                continue
    
    return all_embeddings

def upload_reddit_content(reddit_content: List[Dict]) -> None:
    """Process and upload Reddit content with optimized batching"""
    if not reddit_content:
        return
    
    # Prepare all chunks and their metadata
    all_chunks = []
    all_metadata = []
    all_ids = []
    
    # Process posts in parallel
    def process_post(post):
        combined_text = f"{post.get('POST TITLE', '')} {post.get('POST CONTENT', '')} {' '.join(post.get('POST RESPONSES', []))}"
        if not combined_text.strip():
            return [], [], []
        
        chunks = splitter.split_text(combined_text)
        post_chunks = []
        post_metadata = []
        post_ids = []
        
        for chunk in chunks:
            post_chunks.append(chunk)
            post_metadata.append({
                "type": "combined_content",
                "title": post.get('POST TITLE', '')[:100]
            })
            post_ids.append(f"combined_{uuid.uuid4()}")
        
        return post_chunks, post_metadata, post_ids
    
    # Process posts in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(process_post, reddit_content))
        
    for chunks, metadata, ids in results:
        all_chunks.extend(chunks)
        all_metadata.extend(metadata)
        all_ids.extend(ids)
    
    print(f"Processing {len(all_chunks)} chunks...")
    
    # Get embeddings in optimized batches
    embeddings = get_embeddings(all_chunks)
    
    # Upload to ChromaDB in batches
    batch_size = 1000
    for i in range(0, len(all_chunks), batch_size):
        end_idx = min(i + batch_size, len(all_chunks))
        try:
            collection.add(
                embeddings=embeddings[i:end_idx],
                documents=all_chunks[i:end_idx],
                metadatas=all_metadata[i:end_idx],
                ids=all_ids[i:end_idx]
            )
        except Exception as e:
            print(f"Error during batch upload: {str(e)}")
            continue
    
    print(f"Successfully uploaded {len(embeddings)} chunks to ChromaDB")

# Example usage:
# upload_reddit_content(reddit_data)