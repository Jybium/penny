from database_config import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime, Column, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from typing import TYPE_CHECKING


if TYPE_CHECKING:
  from .chat_room_model import Chat_Room



class Chat_Message(Base):
  __tablename__ = "chat_messages"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
  message: Mapped[str] = mapped_column(Text, nullable=False)
  sender: Mapped[str] = mapped_column(String(50))

  # relationships
  chat_room_id: Mapped[UUID(as_uuid=True)] = mapped_column(ForeignKey("chat_rooms.id"))
  chat_room: Mapped["Chat_Room"] = relationship("Chat_Room", back_populates="messages")
