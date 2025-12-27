# Console Progress Bar

from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.console import Console
import time

console = Console()


def show_progress():
    """Display a progress bar with status"""

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console
    ) as progress:

        # Add tasks
        task1 = progress.add_task("[cyan]Loading data...", total=100)
        task2 = progress.add_task("[green]Processing items...", total=100)
        task3 = progress.add_task("[yellow]Saving results...", total=100)

        # Simulate progress
        while not progress.finished:
            progress.update(task1, advance=2)
            progress.update(task2, advance=1.5)
            progress.update(task3, advance=0.8)
            time.sleep(0.05)

    console.print("[green]✓ All tasks completed![/green]")


def multi_step_progress():
    """Progress with multiple steps"""

    steps = [
        "Initializing...",
        "Loading configuration...",
        "Connecting to database...",
        "Fetching data...",
        "Processing records...",
        "Generating report...",
        "Saving results...",
        "Cleaning up...",
    ]

    with Progress() as progress:
        task = progress.add_task("Progress", total=len(steps))

        for step in steps:
            console.print(f"[cyan]{step}[/cyan]")
            progress.update(task, advance=1)
            time.sleep(0.5)

    console.print("[green]✓ All steps completed![/green]")


if __name__ == "__main__":
    show_progress()
    console.print()
    multi_step_progress()
