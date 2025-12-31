---
name: cli-builder-expert
description: >
  Expert-level CLI skills with Click, argparse, rich output, interactive prompts,
  subcommands, completions, and production deployment patterns.
---

# CLI Builder Expert Skill

You are a **CLI principal engineer** specializing in production-grade command-line interfaces.

## Core Responsibilities

### 1.1 Click Framework Mastery

```python
# cli/app.py
import click
from functools import wraps
from typing import Callable, Any

# Custom decorators
def verbose_option(func: Callable) -> Callable:
    @click.option("-v", "--verbose", is_flag=True, help="Enable verbose output")
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def common_options(func: Callable) -> Callable:
    """Apply common options to all commands."""
    @click.option(
        "--config",
        "-c",
        type=click.Path(exists=True),
        help="Config file path",
    )
    @click.option(
        "--log-level",
        type=click.Choice(["DEBUG", "INFO", "WARNING", "ERROR"]),
        default="INFO",
        help="Logging level",
    )
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# Base command group with context
class CLIContext:
    """Global CLI context passed to all commands."""
    def __init__(self, verbose: bool = False, config_path: str = None):
        self.verbose = verbose
        self.config_path = config_path
        self.config = None

pass_context = click.make_pass_decorator(CLIContext)

@click.group()
@click.option(
    "--config",
    "-c",
    type=click.Path(exists=True),
    help="Path to configuration file",
)
@click.option(
    "--verbose",
    "-v",
    is_flag=True,
    help="Enable verbose mode",
)
@click.pass_context
def cli(ctx: click.Context, config: str, verbose: bool):
    """Todo CLI - Manage your tasks efficiently."""
    ctx.obj = CLIContext(verbose=verbose, config_path=config)
    if verbose:
        click.echo(f"Config: {config}")

# Subcommand with context
@cli.group()
def todo():
    """Manage todos."""
    pass

@todo.command("add")
@click.argument("title")
@click.option(
    "--description", "-d",
    help="Todo description",
)
@click.option(
    "--priority", "-p",
    type=click.Choice(["low", "medium", "high"]),
    default="medium",
)
@pass_context
def add_todo(ctx: CLIContext, title: str, description: str, priority: str):
    """Add a new todo."""
    if ctx.verbose:
        click.echo(f"Adding todo: {title} with priority {priority}")

    click.echo(f"✓ Added: {title} (priority: {priority})")

@todo.command("list")
@click.option(
    "--completed/--pending",
    default=None,
    help="Filter by completion status",
)
@click.option(
    "--format", "-f",
    type=click.Choice(["simple", "table", "json"]),
    default="table",
)
@pass_context
def list_todos(ctx: CLIContext, completed: bool, format: str):
    """List todos."""
    todos = []  # Fetch from storage

    if format == "json":
        import json
        click.echo(json.dumps(todos, indent=2))
    else:
        for todo in todos:
            status = "✓" if todo.completed else "○"
            click.echo(f"{status} {todo.title}")

@todo.command("complete")
@click.argument("id", type=int)
@pass_context
def complete_todo(ctx: CLIContext, id: int):
    """Mark todo as complete."""
    click.echo(f"✓ Completed todo #{id}")

# Nested groups
@cli.group()
def user():
    """User management commands."""
    pass

@user.group()
def settings():
    """User settings commands."""
    pass

@settings.command("show")
def show_settings():
    """Display user settings."""
    click.echo("Settings...")
```

### 1.2 Rich Output & Progress

```python
# cli/output.py
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn
from rich.progress import track
from rich.style import Style
from rich.markdown import Markdown
from rich import print as rprint

console = Console()

def print_table(title: str, columns: list, rows: list):
    """Print data as a formatted table."""
    table = Table(title=title, show_header=True, header_style="bold magenta")
    for col in columns:
        table.add_column(col, justify="left")

    for row in rows:
        table.add_row(*row)

    console.print(table)

def print_todo_table(todos: list):
    """Print todos in a nice table."""
    table = Table(title="Todos", show_header=True)
    table.add_column("ID", width=4, justify="right")
    table.add_column("Title", width=30)
    table.add_column("Priority", width=10)
    table.add_column("Status", width=10)

    for todo in todos:
        status_style = "green" if todo.completed else "yellow"
        table.add_row(
            str(todo.id),
            todo.title,
            todo.priority.upper(),
            f"[{status_style}]{'Done' if todo.completed else 'Pending'}[/]",
        )

    console.print(table)

def print_panel(content: str, title: str = None):
    """Print content in a panel."""
    console.print(Panel(content, title=title))

def print_markdown(content: str):
    """Render and print markdown."""
    console.print(Markdown(content))

# Progress bars
def process_items(items: list, description: str = "Processing"):
    """Process items with progress bar."""
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
    ) as progress:
        task = progress.add_task(description, total=len(items))
        for item in items:
            # Process item
            progress.advance(task)

def process_sequentially(items: list):
    """Process items one by one."""
    for i, item in enumerate(track(items, description="Processing")):
        # Process item
        pass

# Styled output
def print_success(message: str):
    """Print success message."""
    console.print(f"[bold green]✓[/] {message}")

def print_error(message: str):
    """Print error message."""
    console.print(f"[bold red]✗[/] {message}")

def print_warning(message: str):
    """Print warning message."""
    console.print(f"[bold yellow]⚠[/] {message}")

def print_info(message: str):
    """Print info message."""
    console.print(f"[bold blue]ℹ[/] {message}")
```

### 1.3 Interactive Prompts

```python
# cli/prompts.py
import inquirer
from inquirer import questions
from inquirer.themes import Theme
from rich.prompt import Prompt as RichPrompt
from rich.text import Text

class CustomTheme(Theme):
    """Custom theme for prompts."""
    def __init__(self):
        super().__init__()
        self.Question.markup = "[bold blue]"
        self.Question.separator = " [bold]#[/] "
        self.Answer.color = "green"
        self.Selected.color = "green"
        self.Selected.description_color = "grey"

def prompt_title() -> str:
    """Prompt for todo title."""
    return inquirer.text(
        message="Enter todo title:",
        validate=lambda x: len(x) >= 3 if x else False,
        error_message="Title must be at least 3 characters",
    )

def prompt_priority() -> str:
    """Prompt for todo priority."""
    return inquirer.list_input(
        message="Select priority:",
        choices=[("Low", "low"), ("Medium", "medium"), ("High", "high")],
        default="medium",
    )

def prompt_confirmation(message: str) -> bool:
    """Prompt for confirmation."""
    return inquirer.confirm(message, default=False)

def prompt_multiple(choices: list[str]) -> list[str]:
    """Prompt for multiple selections."""
    return inquirer.checkbox(
        message="Select options:",
        choices=choices,
    )

def prompt_password() -> str:
    """Prompt for password (hidden input)."""
    return inquirer.password(
        message="Enter password:",
        validate=lambda x: len(x) >= 8 if x else False,
    )

def prompt_editor() -> str:
    """Prompt with editor."""
    return inquirer.editor(
        message="Enter description (opens editor):",
    )

# Rich-based prompts
from rich.prompt import Prompt, IntPrompt, FloatPrompt, Confirm

class NumberPrompt(IntPrompt):
    """Custom number prompt."""
    @property
    def make_value(self, value: str) -> int:
        try:
            return int(value)
        except ValueError:
            return 0

def prompt_todo_count() -> int:
    """Prompt for number of todos."""
    return NumberPrompt.ask(
        Text("How many todos to create?", style="bold blue"),
        default=1,
        choices=[str(i) for i in range(1, 11)],
    )

def prompt_yes_no(question: str) -> bool:
    """Simple yes/no prompt."""
    return Confirm.ask(question, default=False)
```

### 1.4 Configuration Management

```python
# cli/config.py
import os
import json
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field
from functools import lru_cache

@dataclass
class CLIConfig:
    """CLI configuration."""
    verbose: bool = False
    config_path: Optional[str] = None
    theme: str = "default"
    output_format: str = "table"
    default_priority: str = "medium"
    confirm_delete: bool = True
    auto_save: bool = False

    # File paths
    data_dir: str = "~/.local/share/todo"
    config_dir: str = "~/.config/todo"

    @classmethod
    def from_file(cls, path: str) -> "CLIConfig":
        """Load config from file."""
        if not os.path.exists(path):
            return cls()

        with open(path) as f:
            data = json.load(f)
            return cls(**data)

    def to_file(self, path: str):
        """Save config to file."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(self.__dict__, f, indent=2)

    @property
    def data_dir_path(self) -> Path:
        return Path(os.path.expanduser(self.data_dir))

    @property
    def config_dir_path(self) -> Path:
        return Path(os.path.expanduser(self.config_dir))

    def get_data_file(self, filename: str) -> Path:
        """Get path to data file."""
        self.data_dir_path.mkdir(parents=True, exist_ok=True)
        return self.data_dir_path / filename

@lru_cache
def get_config() -> CLIConfig:
    """Get cached configuration."""
    config_path = os.environ.get("TODO_CONFIG")
    if config_path and os.path.exists(config_path):
        return CLIConfig.from_file(config_path)
    return CLIConfig()
```

### 1.5 Subcommands & Plugin System

```python
# cli/plugins.py
from typing import Dict, Type
from abc import ABC, abstractmethod
from importlib import import_module

class BaseCommand(ABC):
    """Base class for pluggable commands."""
    name: str
    help: str

    @abstractmethod
    def add_command(self, cli: click.Group):
        """Add command to CLI."""
        pass

class PluginManager:
    """Manage CLI plugins."""
    def __init__(self):
        self._plugins: Dict[str, BaseCommand] = {}

    def register(self, plugin: BaseCommand):
        """Register a plugin."""
        self._plugins[plugin.name] = plugin

    def load_from_module(self, module_name: str):
        """Load plugins from module."""
        module = import_module(module_name)
        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if isinstance(attr, type) and issubclass(attr, BaseCommand) and attr != BaseCommand:
                self.register(attr())

    def register_commands(self, cli: click.Group):
        """Register all plugins with CLI."""
        for plugin in self._plugins.values():
            plugin.add_command(cli)

# Example plugin
class StatsCommand(BaseCommand):
    """Statistics plugin."""
    name = "stats"
    help = "Show todo statistics"

    def add_command(self, cli: click.Group):
        @cli.command("stats")
        def stats():
            """Show todo statistics."""
            click.echo("Statistics...")
```

### 1.6 Shell Completions

```python
# cli/completions.py
import os
from typing import List

def install_bash_completion():
    """Install bash completion."""
    import subprocess
    script = """
_todo_completion() {
    local cur prev words cword
    _init_completion || return

    if [[ "$cur" == -* ]]; then
        COMPREPLY=($(compgen -W "
            --verbose -v
            --help -h
            --config -c
            --format -f
            --completed
            --pending
        " -- "$cur"))
    else
        COMPREPLY=($(compgen -W "
            add
            list
            complete
            delete
            edit
            stats
        " -- "$cur"))
    fi
}

complete -F _todo_completion todo
"""
    os.makedirs(os.path.expanduser("~/.bash_completion.d"), exist_ok=True)
    with open(os.path.expanduser("~/.bash_completion.d/todo"), "w") as f:
        f.write(script)

def install_zsh_completion():
    """Install zsh completion."""
    script = """
#compdef todo

_todo() {
    local -a commands
    commands=(
        'add:Add a new todo'
        'list:List todos'
        'complete:Mark todo as complete'
        'delete:Delete a todo'
        'stats:Show statistics'
    )

    _describe -t commands 'todo command' commands
}

_todo
"""
    comp_dir = os.path.expanduser("~/.zsh/completion")
    os.makedirs(comp_dir, exist_ok=True)
    with open(os.path.join(comp_dir, "_todo"), "w") as f:
        f.write(script)

def install_fish_completion():
    """Install fish completion."""
    script = """
complete -c todo -f
complete -c todo -a '(todo --generate-completion)'
"""
    with open(os.path.expanduser("~/.config/fish/completions/todo.fish"), "w") as f:
        f.write(script)

def setup_completions(shell: str = None):
    """Setup shell completions."""
    if shell is None:
        shell = os.environ.get("SHELL", "").split("/")[-1]

    if shell == "bash":
        install_bash_completion()
    elif shell == "zsh":
        install_zsh_completion()
    elif shell == "fish":
        install_fish_completion()
```

---

## When to Use This Skill

- Building CLI applications with Click
- Creating interactive prompts
- Adding rich output formatting
- Managing configuration files
- Setting up shell completions
- Implementing plugin systems
- Creating progress indicators

---

## Anti-Patterns to Avoid

**Never:**
- Use `print()` instead of logging
- Skip error handling
- Hardcode paths or values
- Block on long operations
- Skip help text
- Mix synchronous and async

**Always:**
- Use `click.group()` for structure
- Add `--help` to all commands
- Validate inputs with `@click.option`
- Use `rich` for formatted output
- Handle KeyboardInterrupt gracefully
- Return proper exit codes
- Test interactive prompts

---

## Tools Used

- **Read/Grep:** Examine CLI structure
- **Write/Edit:** Create commands
- **Bash:** Run CLI, test completions
- **Context7 MCP:** Click documentation

---

## Verification Process

1. **Help Check:** `cli --help`
2. **Command Help:** `cli command --help`
3. **Completion:** Test tab completion
4. **Error Handling:** Test invalid inputs
5. **Exit Codes:** Verify 0 for success, 1 for errors
