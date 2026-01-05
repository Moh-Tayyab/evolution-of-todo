import smtplib
import os
import logging
from email.mime.text import MIMEText
from datetime import datetime, date, timedelta
from src.services.todo_list import TaskList
from src.models.priority import Priority
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self, task_list: TaskList):
        self.task_list = task_list
        self.sent_notifications = set() # To avoid duplicates in current session

    def check_and_send(self):
        """Check for high-priority tasks due/overdue and send emails."""
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = os.getenv("SMTP_PORT")
        sender = os.getenv("SENDER_EMAIL")
        recipient = os.getenv("RECIPIENT_EMAIL")
        password = os.getenv("SMTP_PASSWORD")

        if not all([smtp_host, smtp_port, sender, recipient]):
            # Silently return if config missing
            return

        tasks = self.task_list.get_all_tasks()
        today = date.today()
        tomorrow = today + timedelta(days=1)

        for task in tasks:
            if task.is_completed or task.priority != Priority.HIGH or not task.due_date:
                continue

            # Trigger: due within 24h or overdue
            if task.due_date <= today or task.due_date == tomorrow:
                trigger_id = f"{task.id}_{task.due_date}_due"
                if trigger_id not in self.sent_notifications:
                    if self.send_email(sender, recipient, password, smtp_host, int(smtp_port), task):
                        self.sent_notifications.add(trigger_id)

    def send_email(self, sender, recipient, password, host, port, task):
        try:
            subject = f"IMPORTANT: Task '{task.title}' is Due/Overdue"
            body = f"The following high-priority task requires your attention:\n\n"
            body += f"Title: {task.title}\n"
            body += f"Due Date: {task.due_date}\n"
            body += f"Description: {task.description}\n\n"
            body += "Please complete it as soon as possible."

            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From'] = sender
            msg['To'] = recipient

            with smtplib.SMTP(host, port) as server:
                if password:
                    server.starttls()
                    server.login(sender, password)
                server.send_message(msg)
            return True
        except Exception as e:
            logging.error(f"Failed to send email: {e}")
            return False
