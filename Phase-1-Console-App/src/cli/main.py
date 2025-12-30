import sys
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from src.services.todo_list import TaskList
from src.cli.menu import display_menu, get_menu_choice
from src.services.notification_service import NotificationService
from src.cli.commands import (
    handle_view_all,
    handle_add_task,
    handle_update_task,
    handle_delete_task,
    handle_toggle_complete,
    handle_search,
    handle_filter,
    handle_sort,
    handle_voice_add
)

console = Console()

def handle_search_filter(task_list: TaskList):
    console.print(Panel("Search & Filter", style="bold blue"))
    console.print("1. Search by Keyword")
    console.print("2. Filter by Attributes")
    
    choice = Prompt.ask("Select option", choices=["1", "2"])
    if choice == '1':
        handle_search(task_list)
    elif choice == '2':
        handle_filter(task_list)

def main():
    task_list = TaskList()
    notification_service = NotificationService(task_list)
    notification_service.start()
    
    while True:
        display_menu()
        choice = get_menu_choice()
        
        if choice == 1:
            handle_view_all(task_list)
        elif choice == 2:
            handle_add_task(task_list)
        elif choice == 3:
            handle_update_task(task_list)
        elif choice == 4:
            handle_delete_task(task_list)
        elif choice == 5:
            handle_toggle_complete(task_list)
        elif choice == 6:
            handle_search_filter(task_list)
        elif choice == 7:
             handle_sort(task_list)
        elif choice == 8:
             handle_voice_add(task_list)
        elif choice == 9:
            console.print("Exiting application. Goodbye!", style="bold blue")
            sys.exit(0)

if __name__ == "__main__":
    main()