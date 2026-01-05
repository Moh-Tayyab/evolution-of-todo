from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.prompt import IntPrompt

console = Console()

def display_menu():
    """Display the main application menu using Rich."""
    
    title = Text("INTELLIGENT TODO MANAGER v2.0", justify="center", style="bold cyan")
    panel = Panel(title, border_style="blue", padding=(1, 2))
    console.print(panel)
    
    menu_options = [
        ("1", "View All Tasks"),
        ("2", "Add Task"),
        ("3", "Update Task"),
        ("4", "Delete Task"),
        ("5", "Complete Task (Toggle)"),
        ("6", "Search & Filter Tasks"),
        ("7", "Sort Tasks"),
        ("8", "Add Task by Voice"),
        ("9", "Exit Application")
    ]
    
    for key, description in menu_options:
        console.print(f"[bold green]{key}.[/bold green] {description}")
    
    console.print(f"[blue]{'='*36}[/blue]")

def get_menu_choice() -> int:
    """Prompt for and validate menu choice (1-9) using Rich."""
    choice = IntPrompt.ask(
        "Enter your choice", 
        choices=[str(i) for i in range(1, 10)],
        show_choices=False,
        show_default=False
    )
    return choice
