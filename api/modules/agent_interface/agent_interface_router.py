import json
from fastapi import APIRouter, Depends, Request, File, Form, UploadFile, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from utils.jwt_encode_decode import get_current_user
from modules.agent_interface import agent_interface_service
from modules.agent_interface.dtos.send_penny_message_dto import Send_Penny_Message_Dto
from database_config import get_db
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from utils.sse_management import stream_sse

router = APIRouter(prefix="/agent", tags=["Agent Interface"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# @router.post("/chat")
# async def chat_with_agent(
#   body: Send_Penny_Message_Dto, 
#   token: str = Depends(oauth2_scheme), 
#   db: Session = Depends(get_db)
# ):
#   user_info = await get_current_user(token, db)
#   image_content: str # todo image content should be file content from the multipart form
#   return await agent_interface_service.chat_with_agent(
#     human_msg=body.message, user_thread_id=user_info.id, image_content=image_content
#   )


@router.post("/chat")
async def chat_with_agent(
  # file: UploadFile = File(...),
  file: UploadFile | None = File(None),
  query: str = Form(""),
  token: str = Depends(oauth2_scheme), 
  db: Session = Depends(get_db)
):
  if file is not None and file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")
  image_content: str | None = None

  if file is not None:
    image_content = await file.read() 
  
  user_info = await get_current_user(token, db)
  
  return await agent_interface_service.chat_with_agent(
    human_msg=query, user_thread_id=user_info.id, image_content=image_content
  )


@router.get("/sse-stream")
async def sse_stream(request: Request):
  return await stream_sse(request)

# @router.post("/image-search")
# async def image_product_search_test(file: UploadFile = File(...)):
#   return await agent_interface_service.image_product_search_test(file)