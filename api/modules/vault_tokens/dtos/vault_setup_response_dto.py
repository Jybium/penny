from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class Paypal_Vault_Setup_Dto(BaseModel):
  payer_vault_setup_approval_link: str = Field(
    description="PayPal URL the user must visit to approve saving their payment method"
  )
  vault_setup_token_id: str = Field(
    description="PayPal setup token ID, used afterwards to create the payment token"
  )


class Vault_Setup_Token_Response_Dto(BaseModel):
  user_id: UUID = Field(description="ID of the authenticated user")
  paypal_response: Paypal_Vault_Setup_Dto

  model_config = ConfigDict(
    json_schema_extra={
      "example": {
        "user_id": "456719b0-c7d1-41c2-a114-c484393d81de",
        "paypal_response": {
          "payer_vault_setup_approval_link": "https://www.sandbox.paypal.com/agreements/approve?approval_session_id=3AC925980H637404C",
          "vault_setup_token_id": "3AC925980H637404C",
        },
      }
    }
  )