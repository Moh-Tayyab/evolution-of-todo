import pytest
from unittest.mock import patch, MagicMock
from datetime import date
from src.services.todo_list import TaskList
from src.services.notification_service import NotificationService

def test_notification_check():
    task_list = TaskList()
    # Task due today
    task_list.create_task("Due Today", due_date=date.today())
    # Task due future
    task_list.create_task("Future", due_date=date(2099, 1, 1))
    # Completed task
    t_comp = task_list.create_task("Done", due_date=date.today())
    task_list.toggle_complete(t_comp.id)
    
    service = NotificationService(task_list)
    
    with patch('plyer.notification.notify') as mock_notify:
        service.check_notifications()
        assert mock_notify.called
        args, kwargs = mock_notify.call_args
        assert "1 tasks" in kwargs['message'] or "Due Today" in kwargs['message']

def test_notification_service_start_stop():
    task_list = TaskList()
    service = NotificationService(task_list)
    with patch('threading.Thread') as mock_thread:
        service.start()
        assert service._running is True
        assert mock_thread.called
        service.stop()
        assert service._running is False

def test_run_periodic_once():
    task_list = TaskList()
    service = NotificationService(task_list)
    service._running = True
    
    # We want it to run the loop body exactly once.
    # The loop is: while self._running: sleep; if self._running: check
    # So we need to keep _running True during sleep, then set it to False.
    with patch('time.sleep') as mock_sleep:
        with patch.object(service, 'check_notifications') as mock_check:
            with patch.object(service.email_service, 'check_and_send') as mock_email:
                # First time through: keep running. Second time: stop.
                # Actually, if we set _running=False INSIDE check_notifications, it works.
                def side_effect_check():
                    service._running = False
                mock_check.side_effect = side_effect_check
                
                service._run_periodic()
                assert mock_check.called
                assert mock_email.called

def test_email_notification_check():
    task_list = TaskList()
    from src.models.priority import Priority
    # High priority due today
    task_list.create_task("High", priority=Priority.HIGH, due_date=date.today())
    
    service = NotificationService(task_list)
    
    with patch('src.services.email_service.EmailService.send_email') as mock_send:
        with patch('os.getenv', side_effect=lambda k, d=None: {
            "SMTP_HOST": "localhost",
            "SMTP_PORT": "25",
            "SENDER_EMAIL": "s@test.com",
            "RECIPIENT_EMAIL": "r@test.com"
        }.get(k, d)):
            service.email_service.check_and_send()
            assert mock_send.called
