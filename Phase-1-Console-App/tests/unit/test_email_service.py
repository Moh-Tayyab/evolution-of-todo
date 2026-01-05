import pytest
from unittest.mock import patch, MagicMock
from src.services.email_service import EmailService
from src.services.todo_list import TaskList
from src.models.priority import Priority
from datetime import date

def test_send_email_success():
    task_list = TaskList()
    service = EmailService(task_list)
    task = MagicMock()
    task.title = "Test"
    task.due_date = "2025-01-01"
    task.description = "Desc"
    
    with patch('smtplib.SMTP') as mock_smtp:
        # Mock context manager
        instance = mock_smtp.return_value.__enter__.return_value
        result = service.send_email("s@t.com", "r@t.com", "pass", "host", 25, task)
        assert result is True
        assert instance.send_message.called

def test_send_email_failure():
    task_list = TaskList()
    service = EmailService(task_list)
    task = MagicMock()
    
    with patch('smtplib.SMTP', side_effect=Exception("SMTP Error")):
        result = service.send_email("s@t.com", "r@t.com", "pass", "host", 25, task)
        assert result is False

def test_check_and_send_high_priority():
    task_list = TaskList()
    task_list.create_task("High", priority=Priority.HIGH, due_date=date.today())
    service = EmailService(task_list)
    
    with patch('os.getenv', side_effect=lambda k, d=None: "value" if k != "SMTP_PORT" else "25"):
        with patch.object(service, 'send_email', return_value=True) as mock_send:
            service.check_and_send()
            assert mock_send.called
            assert "1_" in list(service.sent_notifications)[0]
            
            # Second call should not send again (duplicate protection)
            service.check_and_send()
            assert mock_send.call_count == 1
