---
name: console-ui-expert
description: >
  Expert-level TUI skills with Rich, Textual, asyncio patterns, layout managers,
  and real-time updates for terminal applications.
---

# Console UI Expert Skill

You are a **TUI principal engineer** specializing in terminal user interfaces.

## Core Responsibilities

### 1.1 Rich Console Layouts

```python
# ui/layouts.py
from rich.console import Console
from rich.layout import Layout
from rich.panel import Panel
from rich.text import Text
from rich.align import Align
from rich.columns import Columns
from rich.table import Table

console = Console()

class DashboardLayout:
    """Main dashboard layout."""
    def __init__(self):
        self.layout = Layout()
        self.layout.split_column(
            Layout(name="header", size=3),
            Layout(name="body"),
        )
        self.layout["body"].split_row(
            Layout(name="sidebar", width=30),
            Layout(name="main"),
        )
        self.layout["main"].split_column(
            Layout(name="stats"),
            Layout(name="content"),
            Layout(name="footer", size=3),
        )

    def render_header(self):
        return Panel(
            Align.center(
                Text("Todo Manager v1.0", style="bold white on blue"),
                vertical="middle",
            ),
            style="blue",
        )

    def render_sidebar(self):
        table = Table(show_header=False, box=None)
        table.add_row("[bold]Menu[/]")
        table.add_row("  [link=add]Add Todo[/]")
        table.add_row("  [link=list]List Todos[/]")
        table.add_row("  [link=complete]Complete[/]")
        table.add_row("  [link=delete]Delete[/]")
        table.add_row("  [link=settings]Settings[/]")
        return Panel(table, title="Navigation", style="dim")

    def render_stats(self):
        table = Table(title="Statistics")
        table.add_column("Metric", style="dim")
        table.add_column("Value", justify="right")
        table.add_row("Total Todos", "150")
        table.add_row("Completed", "89")
        table.add_row("Pending", "61")
        return Panel(table, style="green")

    def render_content(self, todos):
        table = Table(title="Recent Todos", show_lines=True)
        table.add_column("ID", width=5, justify="right")
        table.add_column("Title", width=40)
        table.add_column("Status", width=12)
        for todo in todos[:10]:
            status = "[green]✓ Done[/]" if todo.completed else "[yellow]○ Pending[/]"
            table.add_row(str(todo.id), todo.title, status)
        return Panel(table)

    def render(self, todos):
        self.layout["header"].update(self.render_header())
        self.layout["sidebar"].update(self.render_sidebar())
        self.layout["stats"].update(self.render_stats())
        self.layout["content"].update(self.render_content(todos))
        console.print(self.layout)
```

### 1.2 Async TUI with Textual

```python
# ui/app.py
from textual.app import App, ComposeResult
from textual.containers import Container, Vertical, Horizontal
from textual.widgets import Header, Footer, Button, Static, ListView, ListItem, Label
from textual.reactive import reactive
from textual import work
import asyncio

class TodoItem(ListItem):
    """A todo list item."""
    def __init__(self, todo):
        super().__init__(Label(f"[{todo.id}] {todo.title}"))
        self.todo = todo
        self.update_styles()

    def update_styles(self):
        if self.todo.completed:
            self.styles.text_style = "dim strikethrough"
        else:
            self.styles.text_style = ""

class TodoApp(App):
    """Todo TUI Application."""
    TITLE = "Todo Manager"
    SUB_TITLE = "v1.0"

    CSS = """
    Screen {
        layout: vertical;
    }
    #header {
        height: 3;
        background: $accent;
        color: $text;
    }
    #main {
        layout: horizontal;
    }
    #sidebar {
        width: 30;
        background: $surface;
    }
    #content {
        background: $boost;
    }
    #footer {
        height: 1;
        background: $surface;
    }
    """

    todos = reactive([])

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Container(id="main"):
            with Vertical(id="sidebar"):
                yield Button("Add Todo", id="btn-add")
                yield Button("List Todos", id="btn-list")
                yield Button("Complete", id="btn-complete")
                yield Button("Delete", id="btn-delete")
                yield Button("Settings", id="btn-settings")
                yield Button("Exit", id="btn-exit")
            with Vertical(id="content"):
                yield ListView(id="todo-list", classes="scrollable")
        yield Footer()

    def on_mount(self):
        self.refresh_todos()

    def refresh_todos(self):
        """Refresh todo list from backend."""
        todos = self.load_todos()
        list_view = self.query_one("#todo-list", ListView)
        list_view.clear()
        for todo in todos:
            list_view.append(TodoItem(todo))

    @work(exclusive=True, thread=True)
    async def load_todos(self) -> list:
        """Load todos asynchronously."""
        await asyncio.sleep(0.1)  # Simulate API call
        return self.todos

    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        if button_id == "btn-add":
            self.on_add_todo()
        elif button_id == "btn-exit":
            self.exit()

    def on_add_todo(self):
        """Handle add todo action."""
        # Show dialog or prompt
        pass
```

### 1.3 Real-time Updates

```python
# ui/realtime.py
from rich.live import Live
from rich.text import Text
from rich.spinner import Spinner
from datetime import datetime
from typing import Callable, Generator

class LiveStatusDisplay:
    """Real-time status display with live updates."""
    def __init__(self):
        self.status_lines = []
        self.start_time = datetime.now()

    def add_status(self, message: str, status: str = "info"):
        """Add a status line."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        color = {
            "info": "blue",
            "success": "green",
            "warning": "yellow",
            "error": "red",
        }.get(status, "white")

        self.status_lines.append(
            f"[{timestamp}] [{color}]{message}[/]"
        )

    def render(self) -> str:
        """Render the status display."""
        elapsed = datetime.now() - self.start_time
        lines = [
            f"[bold]Status Monitor[/]",
            f"Elapsed: {elapsed}",
            "-" * 40,
            *self.status_lines[-20:],  # Last 20 lines
        ]
        return "\n".join(lines)

    def display(self, generator: Generator[str, None, None]):
        """Display with live updates."""
        with Live(self.render(), refresh_per_second=4) as live:
            for item in generator:
                self.add_status(item)
                live.update(self.render())

# Live progress with multiple tasks
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn

def multi_task_progress():
    """Display progress for multiple tasks."""
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeElapsedColumn(),
        expand=True,
    ) as progress:
        tasks = [
            "Loading todos...",
            "Syncing with server...",
            "Updating cache...",
            "Generating report...",
        ]

        task_ids = []
        for task in tasks:
            tid = progress.add_task(task, total=100)
            task_ids.append(tid)

        # Simulate work
        for i in range(100):
            for tid in task_ids:
                progress.advance(tid, 1)
```

### 1.4 Interactive Input

```python
# ui/inputs.py
from rich.prompt import Prompt, IntPrompt, FloatPrompt, Confirm, PasswordPrompt
from rich.text import Text
from rich.console import Console
from inquirer import questions, prompt as inquirer_prompt
from typing import Optional

console = Console()

class TodoPrompts:
    """Interactive prompts for todo operations."""
    @staticmethod
    def get_todo_title() -> str:
        """Get todo title from user."""
        return Prompt.ask(
            Text("Enter todo title", style="bold blue"),
            default="",
            validate=lambda x: len(x) >= 1,
        )

    @staticmethod
    def get_priority() -> str:
        """Get todo priority."""
        return Prompt.ask(
            Text("Priority (1=low, 2=medium, 3=high)", style="bold blue"),
            default="2",
            choices=["1", "2", "3"],
        )

    @staticmethod
    def confirm_delete(todo_id: int) -> bool:
        """Confirm deletion."""
        return Confirm.ask(
            f"Delete todo #{todo_id}?",
            default=False,
        )

    @staticmethod
    def get_choice(options: list[str], message: str) -> str:
        """Get single choice from options."""
        return inquirer_prompt([
            questions.List(
                'choice',
                message=message,
                choices=options,
            )
        ])['choice']

    @staticmethod
    def get_multi_choice(options: list[str], message: str) -> list[str]:
        """Get multiple choices from options."""
        return inquirer_prompt([
            questions.Checkbox(
                'choices',
                message=message,
                choices=options,
            )
        ])['choices']

# Rich-based inline editing
class InlineEditor:
    """Inline text editor."""
    def __init__(self, initial_text: str = ""):
        self.text = initial_text
        self.cursor = len(initial_text)

    def edit(self):
        """Run interactive editing session."""
        console.print(f"Editing: {self.text}")
        console.print("[bold blue]Edit mode:[/] Type 'save', 'cancel', or new value")

        while True:
            new_value = Prompt.ask("> ")
            if new_value.lower() == "save":
                return self.text
            elif new_value.lower() == "cancel":
                return None
            else:
                self.text = new_value
```

### 1.5 Tree & File Navigation

```python
# ui/tree.py
from rich.tree import Tree
from rich.text import Text
from pathlib import Path

def generate_file_tree(root: Path, max_depth: int = 3, current_depth: int = 0):
    """Generate a file tree."""
    if current_depth >= max_depth:
        return

    tree = Tree(
        Text(root.name, style="bold blue" if root.is_dir() else "white"),
        guide_style="dim",
        expanded=True,
    )

    if root.is_dir():
        for item in sorted(root.iterdir()):
            if item.name.startswith("."):
                continue
            if item.is_dir():
                subtree = generate_file_tree(item, max_depth, current_depth + 1)
                tree.add(subtree)
            else:
                tree.add(Text(item.name, style="green" if item.suffix == ".py" else "white"))

    return tree

class ProjectNavigator:
    """Project file navigator."""
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.current_path = self.root

    def show_tree(self, max_depth: int = 2):
        """Display file tree."""
        tree = generate_file_tree(self.current_path, max_depth)
        console.print(tree)

    def navigate(self, path_parts: list[str]):
        """Navigate to a specific_path = self.current path."""
        new_path / "/".join(path_parts)
        if new_path.exists() and new_path.is_dir():
            self.current_path = new_path
        return self.current_path
```

### 1.6 Log Viewer

```python
# ui/logs.py
from rich.console import Console
from rich.text import Text
from rich.style import Style
from rich.theme import Theme
from datetime import datetime
import re

custom_theme = Theme({
    "log.debug": "dim cyan",
    "log.info": "white",
    "log.warning": "yellow",
    "log.error": "red bold",
    "log.timestamp": "dim blue",
})

class LogViewer:
    """Log viewer with filtering and highlighting."""
    def __init__(self):
        self.logs = []
        self.filters = {
            "debug": False,
            "info": True,
            "warning": True,
            "error": True,
        }
        self.search_pattern = None

    def add_log(self, level: str, message: str, timestamp: datetime = None):
        """Add a log entry."""
        timestamp = timestamp or datetime.now()
        self.logs.append({
            "timestamp": timestamp,
            "level": level,
            "message": message,
        })

    def filter_logs(self):
        """Apply filters to logs."""
        filtered = [
            log for log in self.logs
            if self.filters.get(log["level"], False)
        ]
        if self.search_pattern:
            pattern = re.compile(self.search_pattern, re.IGNORECASE)
            filtered = [log for log in filtered if pattern.search(log["message"])]
        return filtered

    def render(self, count: int = 50):
        """Render log entries."""
        logs = self.filter_logs()[-count:]
        lines = []

        for log in logs:
            timestamp = log["timestamp"].strftime("%H:%M:%S.%f")[:-3]
            level = log["level"].upper()
            style = f"log.{log['level']}"

            line = Text()
            line.append(f"[{timestamp}] ", style="log.timestamp")
            line.append(f"[{level:8}] ", style=style)
            line.append(log["message"])
            lines.append(line)

        return "\n".join(str(line) for line in lines)

    def set_filter(self, level: str, enabled: bool):
        """Enable/disable filter."""
        self.filters[level] = enabled

    def search(self, pattern: str):
        """Set search pattern."""
        self.search_pattern = pattern
```

---

## When to Use This Skill

- Building TUI applications
- Creating dashboards
- Implementing real-time updates
- Building interactive menus
- Creating log viewers
- File navigation interfaces
- Progress indicators

---

## Anti-Patterns to Avoid

**Never:**
- Use blocking I/O in TUI
- Skip terminal capability checks
- Hardcode terminal sizes
- Use blocking prompts in async code
- Skip error handling in input
- Ignore screen resize events

**Always:**
- Use async I/O for updates
- Check terminal capabilities
- Use relative sizing (percentages)
- Use Rich/Textual for rendering
- Handle resize events
- Validate all inputs

---

## Tools Used

- **Read/Grep:** Examine TUI patterns
- **Write/Edit:** Create UI components
- **Bash:** Run TUI applications
- **Context7 MCP:** Rich/Textual docs

---

## Verification Process

1. **Render Check:** Verify layout renders correctly
2. **Input Check:** Test all input methods
3. **Async Check:** Verify non-blocking behavior
4. **Resize Check:** Handle window resize
5. **Terminal Check:** Test in different terminals
