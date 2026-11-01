from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class Chat_Response_Dto(BaseModel):
  user_id: UUID = Field(description="ID of the authenticated user")
  message: str = Field(description="The user's query that was sent to the agent")
  penny: str = Field(description="The agent's reply (may contain markdown)")

  model_config = ConfigDict(
    json_schema_extra={
      "example": {
        "user_id": "456719b0-c7d1-41c2-a114-c484393d81de",
        "message": "capture payment on the order",
        "penny": "Your payment has been captured successfully.\n\n**Order summary**\n- Quantity: 1\n- Total: $120.51 USD",
      }
    }
  )