from enum import Enum

class Priority(Enum):
    """
    Task priority levels for organizational categorization.

    @spec: specs/001-phase-i-complete/spec.md
    User Story 2: Task Organization with Priorities
    """
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

    def __str__(self) -> str:
        """Display format for UI."""
        if self == Priority.MEDIUM:
            return "[MED]"
        return f"[{self.value.upper()}]"

    @property
    def sort_order(self) -> int:
        """Numeric sort order (1=highest priority)."""
        order = {
            Priority.HIGH: 1,
            Priority.MEDIUM: 2,
            Priority.LOW: 3
        }
        return order[self]
