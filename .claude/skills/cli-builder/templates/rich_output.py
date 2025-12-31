#!/usr/bin/env python3
"""Todo CLI with Rich formatting"""

import json
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

STORAGE_FILE = Path.home() / ".todo-cli" / "todos.json"
console = Console()


def load_todos():
    if STORAGE_FILE.exists():
        with open(STORAGE_FILE) as f:
            return json.load(f)
    return []


def save_todos(todos):
    STORAGE_FILE.parent.mkdir(exist_ok=True)
    with open(STORAGE_FILE, "w") as f:
        json.dump(todos, f, indent=2)


def display_todos(todos):
    """Display todos in a formatted table"""

    if not todos:
        console.print(Panel("No todos yet!", style="yellow"))
        return

    # Create summary
    total = len(todos)
    completed = sum(1 for t in todos if t["completed"])
    pending = total - completed

    # Print summary
    summary = Text.assemble(
        ("Total: ", "white"),
        (f"{total} ", "cyan"),
        ("| Completed: ", "white"),
        (f"{completed} ", "green"),
        ("| Pending: ", "white"),
        (f"{pending}", "yellow")
    )
    console.print(Panel(summary, title="Summary"))

    # Create table
    table = Table(title="Todos", show_header=True, header_style="bold magenta")
    table.add_column("ID", style="cyan", width=6)
    table.add_column("Title", style="white")
    table.add_column("Description", style="dim", width=30)
    table.add_column("Status", justify="center", width=10)

    for todo in todos:
        status = "✓ Complete" if todo["completed"] else "○ Pending"
        status_style = "green" if todo["completed"] else "yellow"

        table.add_row(
            str(todo["id"]),
            todo["title"],
            todo.get("description", "-"),
            Text(status, style=status_style)
        )

    console.print(table)


def add_todo(title, description=""):
    """Add a new todo with rich output"""
    todos = load_todos()
    todo_id = len(todos) + 1
    todos.append({
        "id": todo_id,
        "title": title,
        "description": description,
        "completed": False
    })
    save_todos(todos)

    console.print(f"✓ Added todo #{todo_id}", style="green bold")


def main():
    # Demo usage
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "add" and len(sys.argv) > 2:
            add_todo(sys.argv[2])
        elif sys.argv[1] == "list":
            display_todos(load_todos())
    else:
        display_todos(load_todos())


if __name__ == "__main__":
    main()
