from langchain_openai import ChatOpenAI
import os

llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENAI_API_KEY"),  # Correct parameter name
    temperature=0.2,
)
