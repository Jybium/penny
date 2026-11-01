import logging
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from database_config import get_db
from .models.chat_message_model import Chat_Message
from .models.chat_room_model import Chat_Room


async def save_message(user_id: str, sender: str, message: str, db: Session = Depends(get_db)):
  """this is called once a user sends a message to Penny to save the message in the database"""
  try:
    chat_room = db.query(Chat_Room).filter(Chat_Room.user_id == user_id).first()
    if not chat_room:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Chat room for this user does not exist"
      )
    # save the message in the database
    new_message = Chat_Message(
      sender=sender,
      message=message,
      chat_room_id=chat_room.id,
    )
    db.add(new_message)
    db.commit()
  except HTTPException as e:
    logging.error(f"Error saving message: {e}")
    raise e