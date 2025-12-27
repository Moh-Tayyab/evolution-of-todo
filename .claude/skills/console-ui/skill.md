# Console UI Skill

## Overview
This skill provides expertise for building terminal user interfaces (TUI) in various languages.

## Usage
Invoke this skill when you need help with:
- Building terminal UI applications
- Implementing interactive menus
- Creating progress bars and spinners
- Handling keyboard input
- Formatting table and colored output

## Core Concepts

### Menu Systems

```python
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt

console = Console()

def show_menu():
    options = ["Add Todo", "List Todos", "Complete Todo", "Exit"]

    choice = Prompt.ask(
        "Choose an option:",
        choices=options,
    )

    if choice == "Add Todo":
        add_todo_menu()
    elif choice == "List Todos":
        list_todos()
```

### Tables

```python
from rich.table import Table

def display_todos(todos):
    table = Table(title="Todos")
    table.add_column("ID", style="cyan")
    table.add_column("Title", style="magenta")
    table.add_column("Status", style="green")

    for todo in todos:
        status = "✓" if todo.completed else "✗"
        table.add_row(todo.id, todo.title, status, todo.date)

    console.print(table)
```

### Progress Bars

```python
from rich.progress import Progress

def process_items(items):
    with Progress("[cyan]Processing...", len(items)) as progress:
        for item in items:
            # Process item
            progress.update(1)
            time.sleep(0.1)
```

### Spinners

```python
from yaspin.spinners import Spinner

def show_spinner():
    spinner = Spinner(Spinners.dots, text="Loading...")
    while loading:
        spinner.start()
        time.sleep(0.1)
        spinner.stop()
```

## Examples

### Input Validation

```python
from rich.prompt import Prompt, IntPrompt

def get_todo_input():
    title = Prompt.ask("[bold]Enter todo title:[/bold]", default="")

    while len(title) < 3:
        print_error("Title must be at least 3 characters")
        title = Prompt.ask("[bold]Enter todo title:[/bold]", default="")

    return title

priority = IntPrompt.ask(
    "[bold]Priority (1-5):[/bold]",
    choices=["1", "2", "3", "4", "5"],
    default="3"
)
```

### Multi-Selection

```python
from inquirer import checkbox

def select_multiple():
    answers = checkbox(
        'completed',
        message='Which todos would you like to complete?',
        choices=[
            ('todo1', 'Buy groceries'),
            ('todo2', 'Clean house'),
            ('todo3', 'Call mom'),
        ],
    )
    return answers
```

### Confirmation Prompts

```python
from rich.prompt import Confirm

def confirm_delete(todo_id):
    return Confirm.ask(
        f"[red]Are you sure you want to delete todo {todo_id}?[/red]",
        default=False
    )
```

### Error Messages

```python
from rich.console import Console
from rich.markup import escape

console = Console()

def print_error(message):
    console.print(f"[bold red]✗ Error:[/bold red] {escape(message)}")

def print_success(message):
    console.print(f"[bold green]✓ Success:[/bold green] {escape(message)}")

def print_warning(message):
    console.print(f"[bold yellow]⚠ Warning:[/bold yellow] {escape(message)}")
```

## Best Practices

1. **Clear labels** - Always label input fields
2. **Default values** - Provide sensible defaults
3. **Help text** - Include detailed help for all commands
4. **Color coding** - Use consistent color scheme
5. **Error handling** - Handle invalid input gracefully
6. **Exit strategy** - Always provide exit option
7. **Progress feedback** - Show progress for long operations
8. **Confirmation dialogs** - Ask before destructive actions
9. **Pagination** - For large datasets, show pages
10. **Keyboard shortcuts** - Implement common shortcuts for power users

## Common Pitfalls

### Poor Readability

```python
# BAD: Everything in one color
print("ID: 1 Title: Buy groceries Status: Incomplete")

# GOOD: Structured and colored
table = Table(title="Todo Item")
table.add_column("ID", style="cyan")
table.add_column("Title", style="magenta")
table.add_column("Status", style="green")
console.print(table)
```

### No Input Validation

```python
# BAD: Accepts any input
title = input("Enter title: ")

# GOOD: Validates input
while True:
    title = input("Enter title: ")
    if title and len(title) >= 3:
        break
    print_error("Title must be at least 3 characters")
```

### Missing Confirmation

```python
# BAD: No confirmation
def delete_todo(todo_id):
    # Delete immediately
    pass

# GOOD: Confirms first
def delete_todo(todo_id):
    if confirm_delete(todo_id):
        # Delete
        pass
    else:
        print("Operation cancelled")
```

### Blocking Main Loop

```python
# BAD: Blocks during processing
while True:
    choice = show_menu()
    process_choice(choice)  # This blocks
    time.sleep(1)  # And so does this

# GOOD: Async processing
import asyncio

async def main():
    while True:
        choice = await show_menu_async()
        await process_choice_async(choice)
```

## Tools Used
- **Read/Grep Tools:** Examine components, find patterns, read existing implementations
- **Write/Edit Tools:** Create new components, modify existing code
- **Bash:** Run dev servers, build apps, install dependencies
- **Context7 MCP:** Semantic search in React/TypeScript documentation

## Verification Process
After implementing components:
1. **Visual Check:** Start dev server and verify component renders
2. **Type Checking:** Run TypeScript compiler to verify no type errors
3. **Lint Check:** Run ESLint to catch code quality issues
4. **Build Check:** Execute production build to verify bundling works
5. **Browser Test:** Open component in browser and test interactions

## Error Patterns
Common errors to recognize:
- **Import errors:** Component file not found, incorrect import path
- **Type errors:** Invalid prop types, missing interface definitions
- **Runtime errors:** `Cannot read property`, `undefined is not an object`
- **Build errors:** CSS modules not resolved, missing dependencies
- **Hydration errors:** Server/client HTML mismatch in Next.js
