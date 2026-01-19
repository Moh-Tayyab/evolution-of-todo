# TDD Example: Todo Tests

import pytest
from datetime import datetime


class Todo:
    def __init__(self, title: str):
        self.title = title
        self.completed = False
        self.created_at = datetime.now()


# Test: Create todo
def test_create_todo():
    todo = Todo("Buy groceries")
    assert todo.title == "Buy groceries"
    assert todo.completed is False
    assert todo.created_at is not None


# Test: Complete todo
def test_complete_todo():
    todo = Todo("Write tests")
    todo.completed = True
    assert todo.completed is True


# Test: Title validation
def test_todo_title_must_not_be_empty():
    with pytest.raises(ValueError):
        Todo("")


def test_todo_title_must_not_be_whitespace():
    with pytest.raises(ValueError):
        Todo("   ")


# Test: Created at timestamp
def test_todo_created_at_is_datetime():
    todo = Todo("New task")
    assert isinstance(todo.created_at, datetime)


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
