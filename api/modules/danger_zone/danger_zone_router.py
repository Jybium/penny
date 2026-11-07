from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, APIRouter, HTTPException, status
from database_config import get_db
from sqlalchemy.orm import Session
from modules.danger_zone import danger_zone_service
from utils.jwt_encode_decode import get_current_user


router = APIRouter(prefix="/danger-zone", tags=["Danger Zone"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.delete("/db-wipe")
async def wipe_database(
  token: str = Depends(oauth2_scheme),
  db: Session = Depends(get_db)
):
  try:
    user_info = await get_current_user(token, db)
    return danger_zone_service.wipe_database(user_info.id,db)
  except HTTPException as e:
    raise HTTPException(detail="Data not found", status_code=status.HTTP_404_NOT_FOUND)