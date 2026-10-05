from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "pending"
    due_date: Optional[date] = None

class TaskOut(TaskCreate):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)
