"""
CLI Commands Contract

Defines the interface for all command handlers accessible from the main menu.

@spec: specs/001-phase-i-complete/spec.md
User Stories 1-8: All feature interactions via CLI
"""

from typing import Protocol

class CLICommands(Protocol):
    """Contract for CLI command handlers."""

    def handle_view_all(self) -> None:
        """
        Display all tasks with formatting.

        Requirements: FR-003, FR-004, FR-022, FR-025, FR-062
        Display Format:
          [ID] [x]/[ ] [PRIORITY] Title - Tags: tag1, tag2 - Due: YYYY-MM-DD
        """
        ...

    def handle_add_task(self) -> None:
        """
        Prompt for task details and create new task.

        Requirements: FR-001, FR-093, FR-094
        Prompts: Title (required), Description (optional), Priority, Tags, Due Date, Recurrence
        Validation: Title non-empty (FR-016)
        """
        ...

    def handle_update_task(self) -> None:
        """
        Prompt for task ID and fields to update.

        Requirements: FR-008, FR-009, FR-011, FR-093, FR-094
        Prompts: Task ID, then fields to update (title, description, priority, tags, due date)
        Validation: Task ID exists
        """
        ...

    def handle_delete_task(self) -> None:
        """
        Prompt for task ID and confirmation, then delete.

        Requirements: FR-007, FR-010, FR-093, FR-094
        Prompts: Task ID, then confirmation (Y/N)
        Validation: Task ID exists
        """
        ...

    def handle_toggle_complete(self) -> None:
        """
        Prompt for task ID and toggle completion status.

        Requirements: FR-005, FR-006, FR-093, FR-094
        Prompts: Task ID
        Validation: Task ID exists
        Side Effect: If recurring, create next instance (FR-051)
        """
        ...

    def handle_search(self) -> None:
        """
        Prompt for search keyword and display matching tasks.

        Requirements: FR-030, FR-037, FR-093, FR-094
        Prompts: Keyword
        Display: Same format as handle_view_all
        """
        ...

    def handle_filter(self) -> None:
        """
        Display filter submenu and apply selected filters.

        Requirements: FR-031, FR-032, FR-033, FR-034, FR-035, FR-036, FR-037
        Submenu: Status, Priority, Date Range, Clear Filters, Back
        Display: Same format as handle_view_all
        """
        ...

    def handle_voice_input(self) -> None:
        """
        Record voice input, transcribe, and create task.

        Requirements: FR-070, FR-071, FR-072, FR-073, FR-074, FR-075
        Steps:
          1. Prompt user to speak (30s max)
          2. Record audio
          3. Transcribe to text
          4. Create task with transcribed title
          5. On error: display message, offer manual entry (FR-074)
        """
        ...

    def handle_exit(self) -> None:
        """
        Exit the application.

        Requirements: FR-092
        """
        ...
