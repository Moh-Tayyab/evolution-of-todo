# FastAPI Todo API

from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Todo API", version="1.0.0")


# Pydantic models
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None


class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool


# In-memory storage
todos_db: List[dict] = []
todo_id_counter = 0


@app.get("/api/todos", response_model=List[TodoResponse], status_code=status.HTTP_200_OK)
async def get_todos():
    """Get all todos"""
    return [
        TodoResponse(**todo) for todo in todos_db
    ]


@app.get("/api/todos/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: int):
    """Get a specific todo by ID"""
    todo = next((t for t in todos_db if t["id"] == todo_id), None)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return TodoResponse(**todo)


@app.post("/api/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(todo: TodoCreate):
    """Create a new todo"""
    global todo_id_counter
    todo_id_counter += 1

    new_todo = {
        "id": todo_id_counter,
        "title": todo.title,
        "description": todo.description,
        "completed": False
    }
    todos_db.append(new_todo)

    return TodoResponse(**new_todo)


@app.put("/api/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: int, todo: TodoCreate):
    """Update an existing todo"""
    for i, t in enumerate(todos_db):
        if t["id"] == todo_id:
            todos_db[i].update({
                "title": todo.title,
                "description": todo.description
            })
            return TodoResponse(**todos_db[i])

    raise HTTPException(status_code=404, detail="Todo not found")


@app.delete("/api/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int):
    """Delete a todo"""
    global todos_db
    todos_db = [t for t in todos_db if t["id"] != todo_id]
    return None


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
