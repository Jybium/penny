from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

from utils.jwt_encode_decode import get_current_user
from database_config import get_db
from sqlalchemy.orm import Session
from . import vault_token_service
from .dtos.setup_token_exchange_dto import Exchange_Vault_Setup_Token_Dto
from .dtos.vault_setup_response_dto import Vault_Setup_Token_Response_Dto
from .dtos.vault_payment_token_response_dto import Vault_Payment_Token_Response_Dto

router = APIRouter(prefix="/vault", tags=["Vault Management"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/setup-token", response_model=Vault_Setup_Token_Response_Dto, summary="Generate a PayPal vault setup token for the current user")
async def generate_vault_setup_token(token: str = Depends(oauth2_scheme),  db: Session = Depends(get_db)):
  user_info = await get_current_user(token, db)
  return await vault_token_service.generate_vault_setup_token(user_info.id)


@router.post("/setup-token-exchange", response_model=Vault_Payment_Token_Response_Dto, summary="Exchange a PayPal vault setup token for a vault payment token")
async def exchange_vault_setup_token_for_vault_payment_token(
  body: Exchange_Vault_Setup_Token_Dto,
  token: str = Depends(oauth2_scheme),
  db: Session = Depends(get_db)
):
  user_info = await get_current_user(token, db)
  return await vault_token_service.exchange_vault_setup_token_for_vault_payment_token(user_info.id, body.setup_token, db)


@router.get("/own", summary="Get the current user's decrypted PayPal vault token")
async def get_user_paypal_vault_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
  user_info = await get_current_user(token, db)
  return await vault_token_service.get_user_paypal_vault_token(user_info.id, db)


@router.delete("/own", summary="Delete the current user's PayPal vault token")
async def delete_user_paypal_vault_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
  user_info = await get_current_user(token, db)
  return await vault_token_service.delete_user_paypal_vault_token(user_info.id, db)