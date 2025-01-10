from dotenv import load_dotenv
import os,sys
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from langchain.agents import initialize_agent, AgentType
from langchain.llms import OpenAI
from langchain.prompts.chat import ChatPromptTemplate, SystemMessagePromptTemplate
from langchain.schema import SystemMessage
from langchain.memory import ConversationBufferMemory
# Remove old search import:
# from tool import search

# Import your new tool-creation function:

from store import data_access_layer

load_dotenv()


def initialize_chat_agent(llm, search_tool):
    """
    Initialize a chat agent with system prompts and configuration.
    """
    # Create system prompt
    system_message = SystemMessage(
    content=(
        "You are a helpful assistant responsible for answering the user's question using only the information "
        "from a single, already-chosen subreddit. You also have access to your memory of the conversation, which "
        "may already contain relevant answers. Format your responses in one of these two ways:\n\n"
        "1. If you need to search for new information (i.e., it's not already in your memory):\n"
        "Action: Reddit Information Search\n"
        "Action Input: your search query here\n\n"
        "2. If you already have enough information in your memory:\n"
        "Final Answer: your complete response here\n\n"
        "Remember:\n"
        "- Always check your conversation memory before searching.\n"
        "- Only use the Reddit Information Search tool if the answer isn't in your memory.\n"
        "- Always maintain this exact formatting.\n"
        "- Never search other subreddits.\n"
        "- If you have enough information from memory, go straight to Final Answer."
    )
)
    
    system_message_prompt = SystemMessagePromptTemplate.from_template(system_message.content)
    prompt = ChatPromptTemplate.from_messages([system_message_prompt])

    # Initialize the agent with base configuration
    agent = initialize_agent(
        tools=[search_tool],
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        max_iterations=1,
        early_stopping_method="generate",
        handle_parsing_errors=True,
        return_intermediate_steps=True

    )

    
    return agent


def start_chat_session(subreddit_name, query, user_id, agent):
    """
    Start a new chat session with temporary memory.
    """
    # Create a new memory instance for this session
    memory_content = data_access_layer.fetch_conversation_data(subreddit_name, user_id)

    memory = ConversationBufferMemory(
        memory_key="chat_history", 
        return_messages=True, 
        input_memory=memory_content
    )
    
    # Attach memory to the agent
    agent.memory = memory
    
    # Now run the query
    response = agent({"input":query})



    ## save the response in the conversation table
    data_access_layer.upload_conversation_data(subreddit_name,user_id,{query:response["output"]})
    

    return response["output"]

# def main():
#     # 1. Create the subreddit-specific tool (e.g., r/dubai)
#     subreddit_name = "AskReddit"
#     subreddit_search_tool = create_subreddit_search_tool(subreddit_name)
    
#     # 2. Initialize the agent with that tool
#     agent = initialize_chat_agent(llm, subreddit_search_tool)
     
#     # 3. Start a chat session for this subreddit
#     user_query = "How do you handle raising kids?"
#     user_id = "123"
#     run_chat = start_chat_session(subreddit_name, user_query, user_id, agent=agent)

#     print(run_chat)
#     return run_chat

# if __name__ == "__main__":
#     main()
