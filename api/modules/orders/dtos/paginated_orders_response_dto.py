from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class Order_Response_Dto(BaseModel):
    id: UUID = Field(description="ID of the order")
    paid_amount: float = Field(description="Amount paid for the order")
    tag: str = Field(..., description="Tag description of the order")
    paypal_order_id: str = Field(description="PayPal order ID associated with this order")
    is_autonomous: bool = Field(description="Whether the order was placed autonomously by the agent")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Paginated_Orders_Response_Dto(BaseModel):
    items: list[Order_Response_Dto]
    total: int = Field(description="Total number of orders for the user")
    limit: int = Field(description="Maximum number of items returned per page")
    offset: int = Field(description="Number of items skipped")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": [
                    {
                        "id": "ef02cefe-3c9e-43f8-989c-e277771aa9f4",
                        "paid_amount": 62.0,
                        "paypal_order_id": "69J11171G30769705",
                        "is_autonomous": False,
                        "created_at": "2026-11-01T01:52:08.464027",
                    }
                ],
                "total": 2,
                "limit": 10,
                "offset": 0,
            }
        }
    )