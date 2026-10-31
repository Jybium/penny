from fastapi import File, UploadFile, HTTPException, status
from agentic_workflows.ai_layer import ai
from agentic_workflows.tools.channel3_tools import image_search


async def chat_with_agent(human_msg: str, user_thread_id: str, image_content: str = None):
  ai_response = await ai.invoke(human_msg, user_thread_id, image_content)
  return {"user_id": user_thread_id, "message": human_msg, "penny": ai_response}


async def image_product_search_test(file: UploadFile = File(...)):
  if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")

  file_content = await file.read()
  return await image_search(file_content)
