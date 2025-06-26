from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User
import schemas
from auth import hash_password, verify_password, create_access_token
from fastapi.middleware.cors import CORSMiddleware
from routers import tasks 

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS settings for frontend
app.add_middleware(
   CORSMiddleware,
   allow_origins=["http://localhost:5173"],
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)

# Dependency for getting DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Register route
@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_pw = hash_password(user.password)
    new_user = User(username=user.username, password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

# Login route
@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


app.include_router(tasks.router)
