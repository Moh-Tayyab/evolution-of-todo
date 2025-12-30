from enum import Enum

class Recurrence(Enum):
    """
    Recurrence patterns for repeating tasks.

    @spec: specs/001-phase-i-complete/spec.md
    User Story 5: Recurring Tasks
    """
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

    def __str__(self) -> str:
        """Display format for UI."""
        return self.value.capitalize()
