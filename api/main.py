import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from modules.users.user_router import router as users_router
from modules.auth.auth_router import router as auth_router
from modules.agent_interface.agent_interface_router import router as agent_interface_router
from modules.vault_tokens.vault_token_router import router as vault_token_router
from modules.orders.order_router import router as orders_router

logging.basicConfig(
    level=logging.INFO,
    format="{asctime} - {levelname} - {message}",
    style="{",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app = FastAPI(
    title="Penny",
    description="Penny API",
    version="1.0.0",
    contact={
        "name": "Prince Igwe",
        "url": "https://linkedin.com/in/prince-igwenagha",
    },
)

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8443",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8443",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users_router)
app.include_router(auth_router)
app.include_router(agent_interface_router)
app.include_router(vault_token_router)
app.include_router(orders_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}
