
from dotenv import load_dotenv
import os,sys
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool
from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory
from .RAG import rag_search_pipeline
import json


"""
A file defining the tools that the chatbot will use.
"""


def create_subreddit_search_tool(subreddit_name: str) -> Tool:
    """Return a Tool instance that can only search within the given subreddit_name."""
    def _run(query: str, limit=3) -> str:
        return rag_search_pipeline(subreddit_name, query, limit)

    return Tool(
        name="Reddit Information Search",
        func=_run,
        description=(
            f"Searches only within r/{subreddit_name} for threads matching a query. "
            "Takes in 'query' (the search term) and optionally 'limit' (number of threads to retrieve)."
        ),
    )
