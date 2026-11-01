import logging
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from database_config import get_db
from .models.chat_room_model import Chat_Room

async def create_chat_room(user_id: str, db: Session = Depends(get_db)):
  """this is called once a user registers on the platform to create a chat room between the user and Penny"""
  try:
    # check if the user already has a chat room
    existing_chat_room = db.query(Chat_Room).filter(Chat_Room.user_id == user_id).first()
    if existing_chat_room:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Chat room for this user already exists"
      )

    new_chat_room = Chat_Room(user_id=user_id)
    db.add(new_chat_room)
    db.commit()
    return new_chat_room
  except HTTPException as e:
    logging.error(f"Error creating chat room: {e}")
    raise e