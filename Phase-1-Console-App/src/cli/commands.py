from datetime import datetime, date
from typing import List, Optional
from src.services.todo_list import TaskList, NO_VALUE
from src.cli.input_validators import validate_non_empty, validate_id
from src.models.priority import Priority
from src.models.recurrence import Recurrence
from src.models.task import Task
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt, Confirm
from rich.panel import Panel
from rich.text import Text

console = Console()

def handle_view_all(task_list: TaskList, tasks_to_show: Optional[List[Task]] = None, title: str = "ALL TASKS"):
    """Display tasks with status and details using a Rich Table."""
    tasks = tasks_to_show if tasks_to_show is not None else task_list.get_all_tasks()
    
    if not tasks:
        console.print(Panel(f"No tasks found for: [bold]{title}[/bold]", style="yellow"))
        return

    table = Table(title=title)
    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("Done", justify="center")
    table.add_column("Priority")
    table.add_column("Title", style="magenta")
    table.add_column("Due Date")
    table.add_column("Recurrence")
    table.add_column("Tags")

    for task in tasks:
        status = "[green]✓[/green]" if task.is_completed else "[red]✗[/red]"
        
        priority_str = ""
        if task.priority:
            if task.priority == Priority.HIGH:
                priority_str = "[bold red]HIGH[/bold red]"
            elif task.priority == Priority.MEDIUM:
                priority_str = "[yellow]MED[/yellow]"
            else:
                priority_str = "[blue]LOW[/blue]"
        
        due_str = str(task.due_date) if task.due_date else ""
        if not task.is_completed and task.due_date and task.due_date < date.today():
            due_str = f"[bold red]{due_str} (Overdue)[/bold red]"
            
        recurrence_str = ""
        if task.recurrence:
            recurrence_str = task.recurrence.value
            if task.recurrence == Recurrence.CUSTOM and task.recurrence_interval:
                recurrence_str += f" ({task.recurrence_interval}d)"
        
        tags_str = ", ".join(task.tags) if task.tags else ""
        
        table.add_row(
            str(task.id),
            status,
            priority_str,
            task.title,
            due_str,
            recurrence_str,
            tags_str
        )

    console.print(table)

def _input_due_date() -> Optional[date]:
    date_str = Prompt.ask("Due date (YYYY-MM-DD)", default="").strip()
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        console.print("Invalid date format. Using None.", style="yellow")
        return None

def _input_recurrence() -> tuple[Optional[Recurrence], Optional[int]]:
    r_str = Prompt.ask(
        "Recurrence",
        choices=["daily", "weekly", "monthly", "custom", "none"],
        default="none"
    ).lower()
    
    if r_str == "none":
        return None, None
        
    try:
        recurrence = Recurrence(r_str)
        interval = None
        if recurrence == Recurrence.CUSTOM:
            interval_str = Prompt.ask("Custom interval (days)", default="1")
            if interval_str.isdigit():
                interval = int(interval_str)
        return recurrence, interval
    except ValueError:
        console.print("Invalid recurrence. Using None.", style="yellow")
        return None, None

def handle_add_task(task_list: TaskList):
    """Prompt user to add a new task."""
    console.print(Panel("Add New Task", style="bold blue"))
    
    while True:
        title = Prompt.ask("Task title").strip()
        if validate_non_empty(title):
            break
        console.print("Title cannot be empty.", style="bold red")
    
    description = Prompt.ask("Description (optional)", default="").strip()
    
    # Priority
    priority_str = Prompt.ask(
        "Priority",
        choices=["high", "medium", "low", "none"],
        default="none"
    )
    priority = None
    if priority_str != "none":
        priority = Priority(priority_str)
            
    # Tags
    tags_input = Prompt.ask("Tags (comma-separated, optional)", default="").strip()
    tags = [tag.strip() for tag in tags_input.split(",") if tag.strip()] if tags_input else []
        
    due_date = _input_due_date()
    recurrence, interval = _input_recurrence()
    
    try:
        task = task_list.create_task(
            title=title, 
            description=description, 
            priority=priority, 
            tags=tags,
            due_date=due_date,
            recurrence=recurrence,
            recurrence_interval=interval
        )
        console.print(f"✓ Task created successfully (ID: {task.id})", style="bold green")
    except ValueError as e:
        console.print(f"Error: {e}", style="bold red")

def handle_update_task(task_list: TaskList):
    """Prompt user to update an existing task."""
    console.print(Panel("Update Task", style="bold blue"))
    id_str = Prompt.ask("Enter task ID")
    if not validate_id(id_str):
        console.print("Invalid ID.", style="bold red")
        return
    
    task_id = int(id_str)
    task = task_list.get_task(task_id)
    if not task:
        console.print(f"Task ID {task_id} not found.", style="bold red")
        return
        
    # Title
    new_title = Prompt.ask("New title", default=task.title)
    
    # Description
    current_desc = task.description if task.description else ""
    new_desc = Prompt.ask("New description ('clear' to unset)", default=current_desc)
    
    # Priority
    current_priority = task.priority.value if task.priority else "none"
    new_priority_str = Prompt.ask(
        "New priority", 
        choices=["high", "medium", "low", "none"], 
        default=current_priority
    )
    
    # Tags
    current_tags = ", ".join(task.tags)
    new_tags_str = Prompt.ask("New tags (comma-separated, 'clear' to remove all)", default=current_tags)
    
    # Due Date
    current_due = str(task.due_date) if task.due_date else ""
    new_due_str = Prompt.ask("New due date (YYYY-MM-DD, 'clear' to unset)", default=current_due)

    # Recurrence
    current_rec = task.recurrence.value if task.recurrence else "none"
    new_rec_str = Prompt.ask(
        "New recurrence", 
        choices=["daily", "weekly", "monthly", "custom", "none"], 
        default=current_rec
    )

    # Prepare update arguments
    update_kwargs = {"task_id": task_id}
    
    if new_title != task.title:
        update_kwargs["title"] = new_title
        
    if new_desc != current_desc:
        update_kwargs["description"] = None if new_desc == 'clear' else new_desc
        
    if new_priority_str != current_priority:
        if new_priority_str == 'none':
            update_kwargs["priority"] = None
        else:
            update_kwargs["priority"] = Priority(new_priority_str)

    if new_tags_str != current_tags:
        update_kwargs["tags"] = [] if new_tags_str == 'clear' else [tag.strip() for tag in new_tags_str.split(",") if tag.strip()]

    if new_due_str != current_due:
        if new_due_str == 'clear' or new_due_str == "":
            update_kwargs["due_date"] = None
        else:
            try:
                update_kwargs["due_date"] = datetime.strptime(new_due_str, "%Y-%m-%d").date()
            except ValueError:
                console.print("Invalid date format. Keeping current.", style="yellow")

    if new_rec_str != current_rec:
        if new_rec_str == 'none':
            update_kwargs["recurrence"] = None
            update_kwargs["recurrence_interval"] = None
        else:
            update_kwargs["recurrence"] = Recurrence(new_rec_str)
            if update_kwargs["recurrence"] == Recurrence.CUSTOM:
                interval_str = Prompt.ask("Custom interval (days)", default="1")
                if interval_str.isdigit():
                    update_kwargs["recurrence_interval"] = int(interval_str)

    try:
        updated_task = task_list.update_task(**update_kwargs)
        if updated_task:
            console.print(f"✓ Task ID {task_id} updated successfully.", style="bold green")
        else:
            console.print("No changes made.", style="yellow")
    except ValueError as e:
        console.print(f"Error: {e}", style="bold red")

def handle_delete_task(task_list: TaskList):
    """Prompt user to delete a task."""
    console.print(Panel("Delete Task", style="bold red"))
    id_str = Prompt.ask("Enter task ID")
    if not validate_id(id_str):
        console.print("Invalid ID.", style="bold red")
        return
        
    task_id = int(id_str)
    task = task_list.get_task(task_id)
    if not task:
        console.print(f"Task ID {task_id} not found.", style="bold red")
        return
    
    if task.recurrence:
        confirm = Prompt.ask(
            f"Task '{task.title}' is recurring. Delete (o)nly this instance or (a)ll future instances?",
            choices=["o", "a", "n"],
            default="n"
        )
        if confirm == 'n':
            console.print("Deletion cancelled.", style="yellow")
            return
        # Logic for o/a...
    else:
        if not Confirm.ask(f"Are you sure you want to delete '{task.title}'?"):
            console.print("Deletion cancelled.", style="yellow")
            return

    if task_list.delete_task(task_id):
        console.print(f"✓ Task ID {task_id} deleted.", style="bold green")
    else:
        console.print("Error deleting task.", style="bold red")

def handle_toggle_complete(task_list: TaskList):
    """Prompt user to toggle completion status of a task."""
    console.print(Panel("Complete/Uncomplete Task", style="bold blue"))
    id_str = Prompt.ask("Enter task ID")
    if not validate_id(id_str):
        console.print("Invalid ID.", style="bold red")
        return
        
    task_id = int(id_str)
    task = task_list.toggle_complete(task_id)
    if task:
        status = "complete" if task.is_completed else "incomplete"
        color = "green" if task.is_completed else "yellow"
        console.print(f"✓ Task ID {task_id} marked as [{color}]{status}[/{color}].", style="bold " + color)
    else:
        console.print(f"Task ID {task_id} not found.", style="bold red")

def handle_search(task_list: TaskList):
    """Prompt user to search tasks."""
    console.print(Panel("Search Tasks", style="bold blue"))
    query = Prompt.ask("Enter keyword to search").strip()
    if not query:
        console.print("Empty search query.", style="yellow")
        return
    
    results = task_list.search_tasks(query)
    handle_view_all(task_list, results, title=f"SEARCH RESULTS FOR '{query}'")

def handle_filter(task_list: TaskList):
    """Prompt user to filter tasks."""
    console.print(Panel("Filter Tasks", style="bold blue"))
    console.print("1. Filter by Status")
    console.print("2. Filter by Priority")
    console.print("3. Filter by Date Range")
    console.print("4. Clear Filters (Show All)")
    
    choice = Prompt.ask("Select filter option", choices=["1", "2", "3", "4"])
    
    if choice == '1':
        status = Prompt.ask("Show (c)ompleted or (i)ncomplete tasks?", choices=["c", "i"])
        is_completed = True if status == 'c' else False
        results = task_list.filter_tasks(is_completed=is_completed)
        handle_view_all(task_list, results, title="FILTERED BY STATUS")
    elif choice == '2':
        p_str = Prompt.ask("Enter priority", choices=["high", "medium", "low"])
        try:
            p = Priority(p_str)
            results = task_list.filter_tasks(priority=p)
            handle_view_all(task_list, results, title="FILTERED BY PRIORITY")
        except ValueError:
            console.print("Invalid priority.", style="bold red")
    elif choice == '3':
        start_str = Prompt.ask("Start date (YYYY-MM-DD)", default="")
        end_str = Prompt.ask("End date (YYYY-MM-DD)", default="")
        start_date = None
        end_date = None
        try:
            if start_str: start_date = datetime.strptime(start_str, "%Y-%m-%d").date()
            if end_str: end_date = datetime.strptime(end_str, "%Y-%m-%d").date()
            results = task_list.filter_tasks(start_date=start_date, end_date=end_date)
            handle_view_all(task_list, results, title="FILTERED BY DATE RANGE")
        except ValueError:
            console.print("Invalid date format.", style="bold red")
    elif choice == '4':
        handle_view_all(task_list)

def handle_sort(task_list: TaskList):
    """Prompt user to sort tasks."""
    console.print(Panel("Sort Tasks", style="bold blue"))
    console.print("1. Sort by Due Date")
    console.print("2. Sort by Priority")
    console.print("3. Sort Alphabetically")
    
    choice = Prompt.ask("Select sort option", choices=["1", "2", "3"])
    
    sort_by = None
    if choice == '1': sort_by = "due_date"
    elif choice == '2': sort_by = "priority"
    elif choice == '3': sort_by = "alphabetical"
    
    if sort_by:
        results = task_list.get_sorted_tasks(sort_by)
        handle_view_all(task_list, results, title=f"SORTED BY {sort_by.upper()}")

import os
import sys
from contextlib import contextmanager

@contextmanager
def _suppress_stderr():
    """Suppress C-level stderr output (e.g. ALSA errors)."""
    saved_stderr_fd = None
    original_stderr_fd = None
    devnull = None
    suppressed = False

    try:
        original_stderr_fd = sys.stderr.fileno()
        saved_stderr_fd = os.dup(original_stderr_fd)
        devnull = open(os.devnull, 'w')
        os.dup2(devnull.fileno(), original_stderr_fd)
        suppressed = True
    except Exception:
        # If suppression setup fails, ignore and proceed without suppression
        pass

    try:
        yield
    finally:
        if suppressed:
            try:
                os.dup2(saved_stderr_fd, original_stderr_fd)
                os.close(saved_stderr_fd)
                if devnull:
                    devnull.close()
            except Exception:
                pass

def handle_voice_add(task_list: TaskList):
    """Add a task using voice input."""
    import speech_recognition as sr
    
    console.print(Panel("Add Task by Voice", style="bold purple"))
    
    r = sr.Recognizer()
    try:
        # Suppress ALSA noise during initialization
        with _suppress_stderr():
            console.print("Adjusting for ambient noise... please wait.", style="italic dim")
            with sr.Microphone() as source:
                r.adjust_for_ambient_noise(source, duration=1)
                console.print("Listening... (Speak your task title clearly)", style="bold green blink")
                # Restore stderr for user interaction/errors? No, keep it clean.
                # Actually we need stdout for 'Listening...', stderr is the issue.
                audio = r.listen(source, timeout=10, phrase_time_limit=30)
        
        console.print("Transcribing...", style="italic cyan")
        title = r.recognize_google(audio)
        console.print(f"I heard: '[bold]{title}[/bold]'", style="cyan")
        
        confirm = Prompt.ask(f"Create task with this title?", choices=["y", "n"], default="y")
        if confirm == 'y':
            task = task_list.create_task(title=title)
            console.print(f"✓ Task created successfully (ID: {task.id})", style="bold green")
        else:
            console.print("Task creation cancelled.", style="yellow")

    except (OSError, Exception) as e:
        # Catch OSError (PyAudio no device) and others
        error_msg = str(e)
        if "No Default Input Device Available" in error_msg or isinstance(e, OSError):
             console.print("\nMicrophone not detected or unavailable.", style="bold red")
        else:
             console.print(f"\nAn error occurred: {e}", style="bold red")
             
        fallback = Prompt.ask("Would you like to enter the task manually instead?", choices=["y", "n"], default="y")
        if fallback == 'y':
            handle_add_task(task_list)
        else:
            console.print("Operation cancelled.", style="yellow")
    except sr.UnknownValueError:
        console.print("Could not understand audio. Please try again or enter manually.", style="bold red")
        fallback = Prompt.ask("Would you like to enter the task manually instead?", choices=["y", "n"], default="y")
        if fallback == 'y':
            handle_add_task(task_list)
    except sr.RequestError as e:
        console.print(f"Could not request results from service; {e}", style="bold red")