import logging
from agentic_workflows.ai_layer import ai
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from database_config import get_db

from .enums.gender import Gender
from .enums.role import Role
from .models.user_model import User
from modules.messages.chat_room_service import create_chat_room


async def create_user(
  first_name: str,
  last_name: str,
  email: str,
  password: str,
  gender: Gender,
  db: Session = Depends(get_db),
):
  try:
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exists"
      )

    new_user = User(
      email=email,
      password=password,
      first_name=first_name,
      last_name=last_name,
      gender=gender,
      role=Role.CUSTOMER
    )
    db.add(new_user)
    db.commit()

    # creating a chat room for the new user
    await create_chat_room(user_id=new_user.id, db=db)
    return new_user
  except HTTPException as e:
    logging.error(f"Error creating user: {e}")
    raise e


async def get_user_by_email(email: str, db: Session = Depends(get_db)):
	try:
		user = db.query(User).filter(User.email == email).first()
		if not user:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
			)
		return user
	except HTTPException as e:
		logging.error(f"Error in user lookup by email: {e}")
		if e.status_code == status.HTTP_404_NOT_FOUND:
			raise e
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Failed to get user by email",
		)

