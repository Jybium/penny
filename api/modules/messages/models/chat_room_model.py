import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database_config import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from modules.users.models.user_model import User
  from .chat_message_model import Chat_Message



class Chat_Room(Base):
  __tablename__ = "chat_rooms"
  
  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

  # relationships
  user_id: Mapped[UUID(as_uuid=True)] = mapped_column(ForeignKey("users.id"))
  user: Mapped["User"] = relationship("User", back_populates="chat_room")

  messages: Mapped[list["Chat_Message"]] = relationship("Chat_Message", back_populates="chat_room", cascade="all, delete-orphan")