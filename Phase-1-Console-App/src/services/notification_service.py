import time
import threading
from datetime import date
from plyer import notification
from src.services.todo_list import TaskList
from src.services.email_service import EmailService

class NotificationService:
    def __init__(self, task_list: TaskList):
        self.task_list = task_list
        self.email_service = EmailService(task_list)
        self._running = False
        self._thread = None

    def start(self):
        """Start the periodic notification check in a background thread."""
        if self._running:
            return
        self._running = True
        # Initial check
        self.check_notifications()
        self.email_service.check_and_send()
        # Start thread for periodic checks
        self._thread = threading.Thread(target=self._run_periodic, daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False

    def _run_periodic(self):
        while self._running:
            # Sleep for 5 minutes (300 seconds)
            time.sleep(300)
            if self._running:
                self.check_notifications()
                self.email_service.check_and_send()

    def check_notifications(self):
        """Check for tasks due today or overdue and trigger notifications."""
        tasks = self.task_list.get_all_tasks()
        today = date.today()
        
        due_tasks = [
            t for t in tasks 
            if not t.is_completed and t.due_date and t.due_date <= today
        ]
        
        if due_tasks:
            count = len(due_tasks)
            titles = [t.title for t in due_tasks[:3]]
            message = f"You have {count} tasks due or overdue!"
            if count <= 3:
                message = f"Due/Overdue: {', '.join(titles)}"
            else:
                message = f"Due/Overdue: {', '.join(titles)} and {count-3} more."
                
            try:
                notification.notify(
                    title="Todo Manager Reminder",
                    message=message,
                    app_name="Intelligent Todo Manager",
                    timeout=10
                )
            except Exception as e:
                # Silently fail if notifications are not supported or fail
                pass
