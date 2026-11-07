from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class Chat_Message_Response_Dto(BaseModel):
    id: UUID = Field(description="ID of the chat message")
    chat_room_id: UUID = Field(description="ID of the chat room the message belongs to")
    message: str = Field(description="Message text (agent replies may contain markdown)")
    sender: str = Field(description="User ID of the sender, or \"Penny\" for agent replies")
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "3f37a33d-feab-4cc7-9e51-365bba0c548c",
                "chat_room_id": "b87e383b-706e-4fe5-8508-925a2e288465",
                "message": "what are you about?",
                "sender": "85fbb8c2-489f-4258-9c4a-7e422941da21",
                "created_at": "2026-11-01T17:56:38.614208",
            }
        },
    )