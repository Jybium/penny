from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database_config import get_db
from utils.jwt_encode_decode import get_current_user
from . import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.get("/own")
async def get_user_orders(
  token: str = Depends(oauth2_scheme),
  db: Session = Depends(get_db)
):
  user_info = await get_current_user(token, db)
  return await order_service.get_user_orders(user_info.id, db)


@router.get("/own/{order_id}")
async def get_user_order(
  order_id: str,
  token: str = Depends(oauth2_scheme),
  db: Session = Depends(get_db)
):
  user_info = await get_current_user(token, db)
  return await order_service.get_user_order(user_info.id, order_id, db)

