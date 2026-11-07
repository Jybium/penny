from sqlalchemy import text
from sqlalchemy.orm import Session
from database_config import Base, get_db
from fastapi import Depends



def wipe_database(user_id: str, db: Session = Depends(get_db)):

  # get every table registered on db models except the alembic_version 
  table_names = ", ".join(f'"{t.name}"' for t in Base.metadata.sorted_tables)

  db.execute(text(f"TRUNCATE TABLE {table_names} RESTART IDENTITY CASCADE"))
  db.commit()
  return{
    "message": f"Database wiped by {user_id}"
  }

