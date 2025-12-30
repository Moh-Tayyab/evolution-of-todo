import pytest
from unittest.mock import patch
from src.services.todo_list import TaskList
from src.cli.commands import (
    handle_add_task,
    handle_update_task,
    handle_delete_task,
    handle_toggle_complete,
    handle_view_all
)

def test_service_crud_flow():
    """Test the core service logic for US1 flow."""
    task_list = TaskList()
    
    # 1. Create Task
    task = task_list.create_task("Buy groceries", "Milk and eggs")
    assert task.id == 1
    assert task.title == "Buy groceries"
    assert task.description == "Milk and eggs"
    assert task.is_completed is False
    
    # 2. View Tasks
    tasks = task_list.get_all_tasks()
    assert len(tasks) == 1
    assert tasks[0] == task
    
    # 3. Update Task
    updated = task_list.update_task(1, title="Buy fresh groceries")
    assert updated.title == "Buy fresh groceries"
    assert task_list.get_task(1).title == "Buy fresh groceries"
    
    # 4. Toggle Complete
    completed = task_list.toggle_complete(1)
    assert completed.is_completed is True
    assert completed.completed_at is not None
    
    # 5. Delete Task
    deleted = task_list.delete_task(1)
    assert deleted is True
    assert len(task_list.get_all_tasks()) == 0

def test_cli_commands_flow():
    """Test CLI commands using mocked input."""
    task_list = TaskList()
    
    # Add Task via CLI
    # Inputs: Title, Desc, Priority, Tags, DueDate, Recurrence
    add_inputs = ["CLI Task", "Desc", "medium", "work", "", ""]
    with patch('src.cli.commands.Prompt.ask', side_effect=add_inputs):
        handle_add_task(task_list)
    
    assert len(task_list.get_all_tasks()) == 1
    task = task_list.get_all_tasks()[0]
    assert task.title == "CLI Task"
    
    # Update Task via CLI
    # Inputs: ID, Title, Desc, Priority, Tags, DueDate, Recurrence
    # Note: 'Prompt.ask' is called for ID, then Title, Desc...
    update_inputs = ["1", "Updated Task", "Updated Desc", "high", "home", "", ""]
    with patch('src.cli.commands.Prompt.ask', side_effect=update_inputs):
        handle_update_task(task_list)
        
    assert task.title == "Updated Task"
    assert task.description == "Updated Desc"
    
    # Toggle Complete via CLI
    # Input: ID
    with patch('src.cli.commands.Prompt.ask', side_effect=["1"]):
        handle_toggle_complete(task_list)
    assert task.is_completed is True
    
    # Delete Task via CLI
    # Input: ID. Confirm is separate.
    with patch('src.cli.commands.Prompt.ask', side_effect=["1"]):
        with patch('src.cli.commands.Confirm.ask', return_value=True):
            handle_delete_task(task_list)
    assert len(task_list.get_all_tasks()) == 0