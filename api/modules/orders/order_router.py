from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from utils.jwt_encode_decode import get_current_user
from database_config import get_db
from . import order_service
from .dtos.paginated_orders_response_dto import Paginated_Orders_Response_Dto
from .dtos.order_with_item_response_dto import Order_With_Items_Response_Dto




oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("/own", response_model=Paginated_Orders_Response_Dto, summary="Get paginated orders for the authenticated user")
async def get_own_orders(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
  user_info = await get_current_user(token, db)
  return await order_service.get_own_orders(user_info.id, db)


@router.get("/own/{order_id}", response_model=Order_With_Items_Response_Dto, summary="Get a specific order with its items for the authenticated user")
async def get_own_order_by_id(order_id: str, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
  user_info = await get_current_user(token, db)
  return await order_service.get_own_order_by_id(user_info.id, order_id, db)