import pytest
from src.models.task import Task
from src.models.priority import Priority
from src.models.recurrence import Recurrence

def test_task_model_validation():
    with pytest.raises(ValueError, match="cannot be empty"):
        Task(id=1, title="")
    
    with pytest.raises(ValueError, match="must be positive"):
        Task(id=0, title="Valid")

    with pytest.raises(ValueError, match="Custom recurrence requires interval"):
        Task(id=1, title="Valid", recurrence=Recurrence.CUSTOM)

def test_priority_enum():
    assert Priority.HIGH.value == "high"
    assert Priority("medium") == Priority.MEDIUM

def test_recurrence_enum():
    assert Recurrence.DAILY.value == "daily"
    assert Recurrence("weekly") == Recurrence.WEEKLY
