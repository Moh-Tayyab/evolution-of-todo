"""
Main entry point for the Todo application.

Implements the main application loop with menu-driven interaction.

@spec FR-001: Interactive console menu
@spec FR-010: Return to menu after each operation
@spec FR-011: Clean exit functionality
"""

from .cli.menu import (
    display_menu,
    add_task_prompt,
    view_tasks_prompt,
    update_task_prompt,
    delete_task_prompt,
    toggle_complete_prompt,
    exit_handler,
    get_menu_choice
)
from .services.todo_manager import TodoManager


def main() -> None:
    """
    Main application loop.

    Instantiates TodoManager and runs the menu-driven interface.

    @spec FR-001: Display numbered menu options
    @spec FR-010: Return to menu after all operations
    @spec FR-011: Graceful exit on option 6
    """
    # Initialize TodoManager for in-memory task storage
    manager = TodoManager()

    # Main application loop
    while True:
        # Display menu
        display_menu()

        # Get and validate user choice
        choice = get_menu_choice()

        # Route to appropriate action
        if choice == 1:
            add_task_prompt(manager)
        elif choice == 2:
            view_tasks_prompt(manager)
        elif choice == 3:
            update_task_prompt(manager)
        elif choice == 4:
            delete_task_prompt(manager)
        elif choice == 5:
            toggle_complete_prompt(manager)
        elif choice == 6:
            # Exit application
            exit_handler()
            break


if __name__ == "__main__":
    main()
