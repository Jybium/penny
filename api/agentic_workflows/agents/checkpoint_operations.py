import logging
import os
from dotenv import load_dotenv
from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
import asyncio
import warnings
from langchain_core.runnables.config import RunnableConfig


load_dotenv(override=True)


ENVIRONMENT=os.environ.get("ENVIRONMENT")


POSTGRES_USER = os.environ.get("DB_USERNAME")
POSTGRES_PASSWORD = os.environ.get("DB_PASSWORD")
POSTGRES_DB = os.environ.get("DB_NAME")
POSTGRES_HOST = os.environ.get("DB_HOST")
POSTGRES_PORT = os.environ.get("DB_PORT")

LOCAL_DB = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}"
)

REMOTE_DB= ( os.environ.get("REMOTE_DATABASE_URL") )

DATABASE_URL = REMOTE_DB if ENVIRONMENT == "production" else LOCAL_DB

connection_kwargs = {
  "autocommit": True,
  "prepare_threshold": 0,
}


class CheckPointer():
  def __init__(self):
    # ignore all warnings
    # i used this to ignore the RuntimeWarning when opening the async pool AsyncConnectionPool 
    warnings.filterwarnings('ignore')


  async def alist_checkpoints(self, thread_id: str):
    """list all checkpoints in the database asynchronously"""
    try:
      connection_pool = AsyncConnectionPool(
          conninfo=DATABASE_URL,
          max_size=30,
          kwargs=connection_kwargs
      )
      await connection_pool.open()
      checkpointer = AsyncPostgresSaver(connection_pool)
      thread1 = {"configurable": { "thread_id": thread_id }}
      # print(f"listing checkpoints:{checkpointer.alist(config=thread1)}")
      async for checkpoint in checkpointer.alist(config=thread1):
        logging.info(f"LLM Workflow: Reading persistent checkpoint {checkpoint}")
      checkpoints_response = [checkpoint async for checkpoint in checkpointer.alist(config=thread1)]
      return checkpoints_response
    finally:
      await connection_pool.close()
  

  async def adelete_thread_checkpoints(self, thread_id: str):
    """delete all checkpoints assciated with a  thread"""
    try:
      connection_pool = AsyncConnectionPool(
          conninfo=DATABASE_URL,
          max_size=30,
          kwargs=connection_kwargs
      )
      await connection_pool.open()
      checkpointer = AsyncPostgresSaver(connection_pool)

      logging.info(f"Deleting agent persistence checkpoints in thread {thread_id} ")

      await checkpointer.adelete_thread(thread_id)

      logging.info(f"Deleted agent persistence checkpoints in thread {thread_id}")

    finally:
      await connection_pool.close()




checkpointer = CheckPointer()

# calling checkpoint operations
# asyncio.run(checkpointer.alist_checkpoints("c3c93932-0c5f-4ef0-a74f-ac888a0c8067"))
# asyncio.run(checkpointer.adelete_thread_checkpoints("c3c93932-0c5f-4ef0-a74f-ac888a0c8067")) # the string argument is the thread_id