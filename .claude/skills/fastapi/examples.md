# FastAPI Examples

## Table of Contents
- [Basic API Structure](#basic-api-structure)
- [CRUD Operations](#crud-operations)
- [Pydantic Models](#pydantic-models)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## Basic API Structure

### Simple Hello World
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

### CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## CRUD Operations

### Create (POST)
```python
from pydantic import BaseModel

class TodoCreate(BaseModel):
    title: str
    description: str | None = None

@app.post("/todos")
async def create_todo(todo: TodoCreate):
    # Save to database
    return {"id": 1, **todo.dict()}
```

### Read (GET)
```python
@app.get("/todos/{todo_id}")
async def get_todo(todo_id: int):
    # Fetch from database
    return {"id": todo_id, "title": "Example"}
```

### Update (PUT)
```python
@app.put("/todos/{todo_id}")
async def update_todo(todo_id: int, todo: TodoCreate):
    # Update in database
    return {"id": todo_id, **todo.dict()}
```

### Delete (DELETE)
```python
@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int):
    # Delete from database
    return {"message": "Deleted"}
```

## Pydantic Models

### Request Model
```python
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str = "Anonymous"

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "user@example.com",
                    "password": "secure123",
                    "name": "John Doe"
                }
            ]
        }
    }
}
```

### Response Model
```python
from datetime import datetime

class TodoResponse(BaseModel):
    id: int
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}
```

## Authentication

### JWT Authentication
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    # Verify JWT token
    if not verify_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    return get_user_from_token(token)

@app.get("/protected")
async def protected_route(user: dict = Depends(get_current_user)):
    return {"user": user}
```

## Error Handling

### Custom Exception Handler
```python
from fastapi import Request, status
from fastapi.responses import JSONResponse

class ItemNotFoundError(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id

@app.exception_handler(ItemNotFoundError)
async def item_not_found_handler(request: Request, exc: ItemNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"error": f"Item {exc.item_id} not found"}
    )
```
