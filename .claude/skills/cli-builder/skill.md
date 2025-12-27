# CLI Builder Skill

## Overview
This skill provides expertise for building command-line interfaces (CLI) in various languages.

## Usage
Invoke this skill when you need help with:
- Building CLI applications
- Implementing argument parsing
- Creating interactive prompts
- Adding help documentation
- Handling CLI output formatting

## Core Concepts

### Basic CLI Structure

```python
import argparse

def main():
    parser = argparse.ArgumentParser(description='Todo CLI')
    parser.add_argument('--list', action='store_true', help='List all todos')
    parser.add_argument('--add', type=str, help='Add a new todo')
    parser.add_argument('--complete', type=int, help='Mark todo as complete')

    args = parser.parse_args()

    if args.list:
        list_todos()
    elif args.add:
        add_todo(args.add)
    elif args.complete:
        complete_todo(args.complete)

if __name__ == '__main__':
    main()
```

### Interactive Prompts

```python
import inquirer

def get_user_input():
    questions = [
        inquirer.List('action',
                    message='What would you like to do?',
                    choices=['Add todo', 'List todos', 'Complete todo', 'Exit'],
                ),
        inquirer.Input('title',
                   message='Enter todo title:',
                   when=lambda answers: answers['action'] == 'Add todo',
                  ),
    ]
    return inquirer.prompt(questions)
```

### Output Formatting

```python
import rich
from rich.console import Console
from rich.table import Table

console = Console()

def display_todos(todos):
    table = Table(title="Todos")
    table.add_column("ID", style="cyan")
    table.add_column("Title", style="magenta")
    table.add_column("Status", style="green")

    for todo in todos:
        table.add_row(todo.id, todo.title, "✓" if todo.completed else "✗")

    console.print(table)
```

## Examples

### Colorful Output

```python
from colorama import Fore, Style

def print_success(message):
    print(f"{Fore.GREEN}{Style.BRIGHT}✓ {message}{Style.RESET_ALL}")

def print_error(message):
    print(f"{Fore.RED}{Style.BRIGHT}✗ {message}{Style.RESET_ALL}")
```

### Progress Indicators

```python
from tqdm import tqdm
import time

def process_items(items):
    for item in tqdm(items, desc="Processing"):
        time.sleep(0.1)
```

## Best Practices

1. **Clear help text** - Document all commands and arguments
2. **Consistent naming** - Use predictable command names
3. **Error handling** - Provide clear error messages
4. **Exit codes** - Use meaningful exit codes
5. **Output formatting** - Use tables, colors for readability
6. **Interactive defaults** - Provide sensible defaults
7. **Validation** - Validate user input before processing
8. **Configuration** - Support config files for customization
9. **Testing** - Write tests for CLI commands
10. **Auto-completion** - Provide shell completion if possible

## Common Pitfalls

### Poor Error Messages

```python
# BAD
print("Error")

# GOOD
print(f"Error: Failed to connect to database at {db_url}")
print(f"Hint: Check that the database server is running and URL is correct")
```

### No Input Validation

```python
# BAD
def add_todo(title):
    # Add todo directly

# GOOD
def add_todo(title):
    if not title or len(title) < 3:
        raise ValueError("Title must be at least 3 characters")
```

## Tools Used
- **Read/Grep Tools:** Examine code, find patterns, read existing implementations
- **Write/Edit Tools:** Create new code/commands, modify existing files
- **Bash:** Run scripts, execute commands, install dependencies

## Verification Process
After implementing changes:
1. **Syntax Check:** Verify code syntax (Python/TypeScript)
2. **Function Check:** Run commands/tests to verify they work
3. **Output Check:** Verify expected output matches actual
4. **Integration Check:** Test with existing codebase

## Error Patterns
Common errors to recognize:
- **Syntax errors:** Missing imports, incorrect syntax
- **Logic errors:** Wrong control flow, incorrect conditions
- **Integration errors:** Incompatible versions, missing dependencies
- **Runtime errors:** Exceptions during execution
- **Configuration errors:** Missing required files/settings
