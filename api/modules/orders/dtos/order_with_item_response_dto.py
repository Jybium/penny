from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class Order_Detail_Dto(BaseModel):
    id: UUID = Field(description="ID of the order")
    user_id: UUID = Field(description="ID of the user who owns the order")
    paid_amount: float = Field(description="Amount paid for the order")
    paypal_order_id: str = Field(description="PayPal order ID associated with this order")
    is_autonomous: bool = Field(description="Whether the order was placed autonomously by the agent")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Order_Item_Response_Dto(BaseModel):
    id: UUID = Field(description="ID of the order item")
    order_id: UUID = Field(description="ID of the parent order")
    product_description: str = Field(description="Description of the purchased product")
    unit_price: float = Field(description="Price of a single unit")
    quantity: int = Field(description="Number of units purchased")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Order_With_Items_Response_Dto(BaseModel):
    order: Order_Detail_Dto
    order_items: list[Order_Item_Response_Dto]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "order": {
                    "id": "ef02cefe-3c9e-43f8-989c-e277771aa9f4",
                    "user_id": "456719b0-c7d1-41c2-a114-c484393d81de",
                    "paid_amount": 62.0,
                    "paypal_order_id": "69J11171G30769705",
                    "is_autonomous": False,
                    "created_at": "2026-11-01T01:52:08.464027",
                },
                "order_items": [
                    {
                        "id": "83a02332-5315-4ac9-9fc8-b15ceea5bc11",
                        "order_id": "ef02cefe-3c9e-43f8-989c-e277771aa9f4",
                        "product_description": "adidas Superstar \"White/Black\" sneakers",
                        "unit_price": 62.0,
                        "quantity": 1,
                        "created_at": "2026-11-01T01:52:08.483988",
                    }
                ],
            }
        }
    )