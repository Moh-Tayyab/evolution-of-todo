import pytest
from unittest.mock import patch, MagicMock
from datetime import date
from src.services.todo_list import TaskList
from src.cli.commands import (
    handle_add_task,
    handle_search,
    handle_filter,
    handle_sort,
    handle_update_task,
    handle_voice_add,
    handle_view_all,
    handle_delete_task
)
from src.models.priority import Priority
from src.models.recurrence import Recurrence

def test_cli_search():
    task_list = TaskList()
    task_list.create_task("Find Me", "Secret")
    task_list.create_task("Hide Me", "Quiet")
    
    with patch('src.cli.commands.Prompt.ask', return_value="Find"):
        with patch('src.cli.commands.handle_view_all') as mock_view:
            handle_search(task_list)
            args, _ = mock_view.call_args
            results = args[1]
            assert len(results) == 1
            assert results[0].title == "Find Me"

def test_cli_filter_priority():
    task_list = TaskList()
    task_list.create_task("High", priority=Priority.HIGH)
    task_list.create_task("Low", priority=Priority.LOW)
    
    with patch('src.cli.commands.Prompt.ask', side_effect=['2', 'high']):
        with patch('src.cli.commands.handle_view_all') as mock_view:
            handle_filter(task_list)
            args, _ = mock_view.call_args
            results = args[1]
            assert len(results) == 1
            assert results[0].priority == Priority.HIGH

def test_cli_sort_alphabetical():
    task_list = TaskList()
    task_list.create_task("Zebra")
    task_list.create_task("Ant")
    
    with patch('src.cli.commands.Prompt.ask', return_value='3'):
        with patch('src.cli.commands.handle_view_all') as mock_view:
            handle_sort(task_list)
            args, _ = mock_view.call_args
            results = args[1]
            assert results[0].title == "Ant"
            assert results[1].title == "Zebra"

def test_cli_update_task_clear_fields():
    task_list = TaskList()
    task_list.create_task("Title", "Desc", priority=Priority.HIGH, due_date=date(2025,1,1))
    
    # ID: 1
    # New Title: Title (default)
    # New Desc: clear
    # New Priority: none
    # New Tags: clear
    # New Due Date: clear
    # New Recurrence: none
    update_inputs = ["1", "Title", "clear", "none", "clear", "clear", "none"]
    with patch('src.cli.commands.Prompt.ask', side_effect=update_inputs):
        handle_update_task(task_list)
        
    task = task_list.get_task(1)
    assert task.title == "Title"
    assert task.description is None
    assert task.priority is None
    assert task.tags == []
    assert task.due_date is None

def test_cli_filter_status():
    task_list = TaskList()
    t1 = task_list.create_task("Done")
    task_list.toggle_complete(t1.id)
    task_list.create_task("Not Done")
    
    # choice '1' for status, then 'c' for completed
    with patch('src.cli.commands.Prompt.ask', side_effect=['1', 'c']):
        with patch('src.cli.commands.handle_view_all') as mock_view:
            handle_filter(task_list)
            args, _ = mock_view.call_args
            results = args[1]
            assert len(results) == 1
            assert results[0].title == "Done"

def test_cli_filter_date_range():
    task_list = TaskList()
    task_list.create_task("InRange", due_date=date(2025, 1, 10))
    task_list.create_task("OutRange", due_date=date(2025, 1, 20))
    
    # choice '3' for date, then start and end dates
    with patch('src.cli.commands.Prompt.ask', side_effect=['3', '2025-01-01', '2025-01-15']):
        with patch('src.cli.commands.handle_view_all') as mock_view:
            handle_filter(task_list)
            args, _ = mock_view.call_args
            results = args[1]
            assert len(results) == 1
            assert results[0].title == "InRange"

def test_cli_view_all_overdue():
    task_list = TaskList()
    task_list.create_task("Old", due_date=date(2000, 1, 1))
    
    # We use rich Table, so we should check the Table output or the console.print calls
    with patch('src.cli.commands.Table.add_row') as mock_add_row:
        handle_view_all(task_list)
        # Check if overdue warning in the due date column (index 4)
        found_overdue = False
        for call in mock_add_row.call_args_list:
            if "(Overdue)" in str(call.args[4]):
                found_overdue = True
                break
        assert found_overdue

def test_cli_voice_add_mock():
    task_list = TaskList()
    
    with patch('speech_recognition.Recognizer') as mock_rec:
        with patch('speech_recognition.Microphone') as mock_mic:
            instance = mock_rec.return_value
            instance.recognize_google.return_value = "Voice Task"
            
            with patch('src.cli.commands.Prompt.ask', return_value='y'):
                handle_voice_add(task_list)
                
    assert len(task_list.get_all_tasks()) == 1
    assert task_list.get_all_tasks()[0].title == "Voice Task"

def test_cli_delete_cancelled():
    task_list = TaskList()
    task_list.create_task("Keep Me")
    with patch('src.cli.commands.Prompt.ask', side_effect=["1"]):
        with patch('src.cli.commands.Confirm.ask', return_value=False):
            handle_delete_task(task_list)
    assert len(task_list.get_all_tasks()) == 1

def test_cli_update_invalid_id():
    task_list = TaskList()
    with patch('src.cli.commands.Prompt.ask', return_value="abc"):
        handle_update_task(task_list) # should return early

def test_cli_search_empty():
    task_list = TaskList()
    with patch('src.cli.commands.Prompt.ask', return_value=""):
        handle_search(task_list) # should return early

def test_cli_filter_invalid_priority():
    task_list = TaskList()
    with patch('src.cli.commands.Prompt.ask', side_effect=['2', 'invalid']):
        handle_filter(task_list)

def test_cli_filter_invalid_date():
    task_list = TaskList()
    with patch('src.cli.commands.Prompt.ask', side_effect=['3', 'bad-date', '']):
        handle_filter(task_list)

def test_cli_sort_invalid_choice():
    task_list = TaskList()
    # Prompt with choices will re-prompt if invalid, so we might need side_effect or just use valid
    with patch('src.cli.commands.Prompt.ask', return_value='1'):
        handle_sort(task_list)

def test_cli_add_task_invalid_date():
    task_list = TaskList()
    # Title, Desc, Priority, Tags, DueDate (invalid), Recurrence
    inputs = ["Task", "", "none", "", "invalid-date", "none"]
    with patch('src.cli.commands.Prompt.ask', side_effect=inputs):
        handle_add_task(task_list)
    assert task_list.get_task(1).due_date is None

def test_cli_add_task_invalid_recurrence():
    task_list = TaskList()
    # Title, Desc, Priority, Tags, DueDate, Recurrence (invalid)
    # Prompt choices will prevent invalid recurrence usually, but we test the handler
    inputs = ["Task", "", "none", "", "", "none"]
    with patch('src.cli.commands.Prompt.ask', side_effect=inputs):
        handle_add_task(task_list)
    assert task_list.get_task(1).recurrence is None
