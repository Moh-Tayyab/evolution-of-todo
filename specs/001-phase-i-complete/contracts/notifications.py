"""
Notification Service Contract

Defines the interface for browser and email notification management.

@spec: specs/001-phase-i-complete/spec.md
User Story 6: Due Dates and Reminders (browser notifications)
User Story 8: Email Notifications for High-Priority Tasks
"""

from typing import Protocol
from models.task import Task
from models.notification import Notification, NotificationType

class NotificationService(Protocol):
    """Contract for notification management operations."""

    def trigger_browser_notification(self, task: Task) -> None:
        """
        Send a desktop notification for a task.

        Requirements: FR-064, FR-065, FR-067
        Trigger Conditions (Clarification):
          - Task due date is today OR overdue
          - Task is not completed
        Implementation:
          - Uses plyer.notification.notify()
          - Gracefully handles permission denial (FR-067)
        """
        ...

    def check_notifications(self, tasks: list[Task]) -> list[Notification]:
        """
        Check all tasks and identify which need notifications.

        Requirements: FR-064, FR-065
        Trigger Logic:
          - Browser: due date is today or overdue
          - Email: high-priority task due within 24h or overdue
        Returns: List of notifications to send
        """
        ...

    def cancel_notification(self, task_id: int) -> None:
        """
        Cancel pending notification for a task.

        Requirements: FR-066
        Use Case: Task marked complete before notification triggers
        """
        ...

class EmailNotificationService(Protocol):
    """Contract for email notification operations."""

    def send_email(self, task: Task, subject: str, body: str) -> bool:
        """
        Send email notification for a task.

        Requirements: FR-080, FR-081, FR-082, FR-083, FR-084, FR-085
        Trigger Conditions:
          - Task priority is HIGH
          - Due date within 24 hours OR overdue
        Implementation:
          - Uses smtplib (standard library)
          - Reads config from environment variables (FR-083)
          - Gracefully handles missing config (FR-084)
          - Gracefully handles send failures (FR-085)
          - Prevents duplicate emails (FR-086)
        Returns: True if sent, False if skipped/failed
        """
        ...

    def is_configured(self) -> bool:
        """
        Check if email configuration is complete.

        Requirements: FR-083, FR-084
        Returns: True if all required env vars present
        """
        ...
