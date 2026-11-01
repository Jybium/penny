from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

from utils.jwt_encode_decode import get_current_user
from database_config import get_db
from sqlalchemy.orm import Session
from . import chat_message_service

router = APIRouter(prefix="/messages", tags=["Messages"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.get("/own", summary="Get the latest messages for the current user")
async def get_latest_messages(
  token: str = Depends(oauth2_scheme),
  db: Session = Depends(get_db)
):
  user_info = await get_current_user(token, db)
  return chat_message_service.get_latest_messages(user_id=user_info.id, db=db)


@router.delete("/own", summary="Delete all messages for the current user")
async def delete_messages(
  token: str = Depends(oauth2_scheme),
  db: Session = Depends(get_db)
):
  user_info = await get_current_user(token, db)
  return await chat_message_service.delete_messages(user_id=user_info.id, db=db)