import pytest
from datetime import date, timedelta
from src.services.todo_list import TaskList, NO_VALUE
from src.models.priority import Priority
from src.models.recurrence import Recurrence

def test_task_creation():
    task_list = TaskList()
    task = task_list.create_task("Test Task", "Test Desc", Priority.HIGH, ["tag1"])
    assert task.id == 1
    assert task.title == "Test Task"
    assert task.priority == Priority.HIGH
    assert "tag1" in task.tags

def test_update_task_with_sentinel():
    task_list = TaskList()
    task = task_list.create_task("Original", "Desc", Priority.MEDIUM)
    
    # Update title only
    task_list.update_task(1, title="New Title")
    assert task.title == "New Title"
    assert task.description == "Desc" # Should stay same
    
    # Unset description
    task_list.update_task(1, description=None)
    assert task.description is None
    
    # Unset priority
    task_list.update_task(1, priority=None)
    assert task.priority is None

def test_search_tasks():
    task_list = TaskList()
    task_list.create_task("Apple", "Fruit")
    task_list.create_task("Banana", "Fruit")
    task_list.create_task("Carrot", "Vegetable")
    
    results = task_list.search_tasks("fruit")
    assert len(results) == 2
    
    results = task_list.search_tasks("Banana")
    assert len(results) == 1

def test_filter_tasks():
    task_list = TaskList()
    t1 = task_list.create_task("T1", priority=Priority.HIGH)
    t2 = task_list.create_task("T2", priority=Priority.LOW)
    task_list.toggle_complete(t2.id)
    
    high_p = task_list.filter_tasks(priority=Priority.HIGH)
    assert len(high_p) == 1
    assert high_p[0].title == "T1"
    
    completed = task_list.filter_tasks(is_completed=True)
    assert len(completed) == 1
    assert completed[0].title == "T2"

def test_sort_tasks():
    task_list = TaskList()
    task_list.create_task("C", due_date=date.today() + timedelta(days=2))
    task_list.create_task("A", due_date=date.today())
    task_list.create_task("B", due_date=date.today() + timedelta(days=1))
    
    sorted_tasks = task_list.get_sorted_tasks("due_date")
    assert sorted_tasks[0].title == "A"
    assert sorted_tasks[1].title == "B"
    assert sorted_tasks[2].title == "C"
    
    sorted_alpha = task_list.get_sorted_tasks("alphabetical")
    assert sorted_alpha[0].title == "A"
    assert sorted_alpha[1].title == "B"
    assert sorted_alpha[2].title == "C"

def test_recurrence_daily():
    task_list = TaskList()
    due = date(2025, 12, 29)
    task = task_list.create_task("Daily Task", due_date=due, recurrence=Recurrence.DAILY)
    
    # Complete the task
    task_list.toggle_complete(task.id)
    
    # Check if a new task was created
    all_tasks = task_list.get_all_tasks()
    assert len(all_tasks) == 2
    new_task = all_tasks[1]
    assert new_task.title == "Daily Task"
    assert new_task.due_date == date(2025, 12, 30)
    assert new_task.is_completed is False

def test_recurrence_monthly_leap_year():
    task_list = TaskList()
    # Jan 31 -> Feb 28 (non-leap) or Feb 29 (leap)
    # 2024 was leap, 2025 is not.
    due = date(2025, 1, 31)
    task = task_list.create_task("Monthly", due_date=due, recurrence=Recurrence.MONTHLY)
    
    task_list.toggle_complete(task.id)
    new_task = task_list.get_all_tasks()[1]
    assert new_task.due_date == date(2025, 2, 28)
