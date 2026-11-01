from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class Vault_Payment_Token_Response_Dto(BaseModel):
  id: UUID = Field(description="ID of the stored payment token record")
  user_id: UUID = Field(description="ID of the authenticated user")
  paypal_payment_token: str = Field(
      description="Encrypted PayPal vault payment token for the saved payment method"
  )
  created_at: datetime

  model_config = ConfigDict(
      from_attributes=True,
      json_schema_extra={
        "example": {
          "id": "fdcbd4e6-997a-4574-9c6b-53fa046f1f92",
          "user_id": "456719b0-c7d1-41c2-a114-c484393d81de",
          "paypal_payment_token": "gAAAAABq4pxv...",
          "created_at": "2026-10-29T02:07:59.091949",
        }
      },
  )