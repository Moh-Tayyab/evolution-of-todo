import pytest
from unittest.mock import patch
from src.services.todo_list import TaskList
from src.cli.commands import handle_add_task
from src.models.priority import Priority

def test_cli_priority_tags_flow():
    """Test CLI commands for priority and tags (US2)."""
    task_list = TaskList()

    # 1. Add Task with Priority and Tags
    # Inputs: Title, Desc, Priority, Tags, DueDate, Recurrence
    inputs = ["Urgent Task", "Do it now", "high", "work, urgent", "", ""]
    with patch('src.cli.commands.Prompt.ask', side_effect=inputs):
        handle_add_task(task_list)

    assert len(task_list.get_all_tasks()) == 1
    task = task_list.get_all_tasks()[0]
    assert task.title == "Urgent Task"
    assert task.priority == Priority.HIGH
    assert "urgent" in task.tags
    assert "work" in task.tags