from pydantic import BaseModel, Field
from typing import Optional


class Product_Search_Request_Parser(BaseModel):
  """
  product_description: str = Field(description="product description of the query")
  gender: str = Field(description="gender described in the query")
  max_price: int = Field(description="maximum amount the user budgeted for")
  min_price: int = Field(description="minimum amount the user is willing to pay")
  """
  product_description: str = Field(..., description="product description of the query")
  # optional filter fields
  gender: Optional[str] = Field(None, description="gender described in the query")
  min_price: Optional[int] = Field(None, description="minimum amount the user is willing to pay")
  max_price: Optional[int] = Field(None, description="maximum amount the user budgeted for")


from typing import Literal, Optional
from pydantic import BaseModel, Field

class Product_Image_Search_Request_Parser(BaseModel):
  gender: Optional[Literal["male", "female"]] = Field(
    None, description='"male" or "female" if the query states it, otherwise null'
  )
  min_price: Optional[float] = Field(
    None, description="Lower bound of a price range, otherwise null"
  )
  max_price: Optional[float] = Field(
    None, description="Maximum budget or upper bound of a price range, otherwise null"
  )