from fastapi import File, UploadFile, HTTPException, status
from agentic_workflows.ai_layer import ai
from agentic_workflows.agents.checkpoint_operations import CheckPointer
from agentic_workflows.tools.channel3_tools import image_search, image_search_test
from utils.sse_management import publish_sse


checkpointer = CheckPointer()


async def chat_with_agent(human_msg: str, user_thread_id: str, image_content: str = None):
  ai_response = await ai.invoke(human_msg, user_thread_id, image_content)
  try:
    await publish_sse({
      "user_id": str(user_thread_id),
      "message": human_msg,
      "penny": ai_response,
    })
  except Exception:
    pass
  return {"user_id": user_thread_id, "message": human_msg, "penny": ai_response}


async def adelete_thread_checkpoints(user_thread_id: str):
  await checkpointer.adelete_thread_checkpoints(user_thread_id)
  return {
    "message": "checkpoints deleted successfully"
  }


async def image_product_search_test(file: UploadFile = File(...)):
  if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")

  file_content = await file.read()
  return await image_search_test(file_content)
