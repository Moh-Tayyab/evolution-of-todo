"""
CLI menu interface for the Todo application.

@spec FR-001: Interactive console menu with numbered options
@spec FR-010: Return to main menu after each operation
@spec FR-011: Clean exit option with goodbye message
"""

from typing import Optional
from ..services.todo_manager import TodoManager


def display_menu() -> None:
    """
    Display the main menu with 6 numbered options.

    @spec FR-001: Numbered options for Add Task, View Tasks, Update Task,
                  Delete Task, Toggle Complete, Exit
    @spec US3-AS1: Clear labels with numbering 1-6
    """
    print("\n=== TODO APP ===")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Toggle Complete")
    print("6. Exit")


def add_task_prompt(manager: TodoManager) -> None:
    """
    Prompt user to add a new task.

    Args:
        manager: TodoManager instance to add task to

    @spec FR-002: Title required, description optional
    @spec US2-AS4: Empty description accepted (press Enter to skip)
    """
    print("\n--- Add Task ---")
    title = input("Enter task title: ").strip()

    if not title:
        print("Error: Title cannot be empty")
        return

    description = input("Enter task description (optional, press Enter to skip): ").strip()

    try:
        manager.add_task(title, description)
        print("Task added successfully!")
    except ValueError as e:
        print(f"Error: {e}")


def view_tasks_prompt(manager: TodoManager) -> None:
    """
    Display all tasks with formatted output.

    Args:
        manager: TodoManager instance to get tasks from

    @spec FR-005: Display format [ID] [Status] Title - Description: {description}
    @spec US2-AS3: Friendly message when list is empty
    """
    print("\n--- Tasks ---")
    tasks = manager.view_tasks()

    if not tasks:
        print("No tasks available. Add some tasks to get started!")
        return

    for task in tasks:
        status = "[x]" if task.completed else "[ ]"
        desc = f"Description: {task.description}" if task.description else "(no description)"
        print(f"[{task.id}] {status} {task.title} - {desc}")


def update_task_prompt(manager: TodoManager) -> None:
    """
    Prompt user to update an existing task.

    Args:
        manager: TodoManager instance to update task in

    @spec FR-006: Update title and/or description by ID
    @spec FR-010: Success message and return to menu
    """
    print("\n--- Update Task ---")

    try:
        task_id = int(input("Enter task ID to update: "))
    except ValueError:
        print("Error: Invalid task ID. Please enter a number.")
        return

    new_title = input("Enter new title (or press Enter to keep current): ").strip()
    new_description = input("Enter new description (or press Enter to keep current): ").strip()

    if not new_title and not new_description:
        print("No changes made.")
        return

    try:
        manager.update_task(
            task_id=task_id,
            new_title=new_title if new_title else None,
            new_description=new_description if new_description else None
        )
        print("Task updated successfully!")
    except ValueError as e:
        print(f"Error: {e}")


def delete_task_prompt(manager: TodoManager) -> None:
    """
    Prompt user to delete a task by ID.

    Args:
        manager: TodoManager instance to delete task from

    @spec FR-007: Delete task by ID
    @spec FR-010: Success message and return to menu
    """
    print("\n--- Delete Task ---")

    try:
        task_id = int(input("Enter task ID to delete: "))
    except ValueError:
        print("Error: Invalid task ID. Please enter a number.")
        return

    # Show task details before deletion
    task = manager.get_task_by_id(task_id)
    if not task:
        print(f"Task ID {task_id} not found")
        return

    status = "[x]" if task.completed else "[ ]"
    print(f"\nTask to delete: [{task.id}] {status} {task.title}")
    confirm = input("Are you sure you want to delete this task? (y/N): ").strip().lower()

    if confirm == 'y':
        try:
            manager.delete_task(task_id)
            print("Task deleted successfully!")
        except ValueError as e:
            print(f"Error: {e}")
    else:
        print("Deletion cancelled.")


def toggle_complete_prompt(manager: TodoManager) -> None:
    """
    Prompt user to toggle task completion status.

    Args:
        manager: TodoManager instance to toggle task in

    @spec FR-008: Toggle completion status by ID
    @spec FR-010: Success message and return to menu
    """
    print("\n--- Toggle Complete ---")

    try:
        task_id = int(input("Enter task ID to mark complete/incomplete: "))
    except ValueError:
        print("Error: Invalid task ID. Please enter a number.")
        return

    try:
        task = manager.toggle_complete(task_id)
        status = "complete" if task.completed else "incomplete"
        print(f"Task marked {status}!")
    except ValueError as e:
        print(f"Error: {e}")


def exit_handler() -> None:
    """
    Display goodbye message and exit application.

    @spec FR-011: Clean exit with goodbye message
    @spec US3-AS2: Goodbye message displayed
    """
    print("\nThank you for using Todo App. Goodbye!")


def get_menu_choice() -> Optional[int]:
    """
    Get and validate user's menu choice.

    Returns:
        Integer between 1-6 if valid, None otherwise

    @spec FR-009: Invalid option handling
    @spec FR-012: Validate all user inputs without crashing
    """
    try:
        choice = int(input("\nEnter option (1-6): "))
        if 1 <= choice <= 6:
            return choice
        else:
            print("Error: Invalid option. Please try again.")
            return None
    except ValueError:
        print("Error: Invalid option. Please try again.")
        return None
