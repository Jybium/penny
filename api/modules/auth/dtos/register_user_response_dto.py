from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr


class User_Response_Dto(BaseModel):
  id: UUID
  email: EmailStr
  first_name: str
  last_name: str
  gender: str
  role: str
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)  