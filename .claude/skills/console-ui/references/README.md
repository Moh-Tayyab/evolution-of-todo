# Console UI References

Official documentation and resources for building terminal user interfaces (TUI) in Python.

## Official Resources

### Rich Documentation
- **Website**: https://rich.readthedocs.io/
- **GitHub**: https://github.com/Textualize/rich
- **Documentation**: https://rich.readthedocs.io/en/stable/
- **Gallery**: https://rich.readthedocs.io/en/stable/gallery.html

### Textual (TUI Framework)
- **Website**: https://textual.textualize.io/
- **GitHub**: https://github.com/Textualize/textual
- **Documentation**: https://textual.textualize.io/getting_started/
- **Examples**: https://textual.textualize.io/examples/

### Prompt Toolkit
- **Website**: https://python-prompt-toolkit.readthedocs.io/
- **GitHub**: https://github.com/prompt-toolkit/python-prompt-toolkit

## Installation

```bash
# Rich for terminal output
pip install rich

# Textual for full TUI applications
pip install textual

# Prompt Toolkit for interactive prompts
pip install prompt-toolkit
```

## Rich Examples

### Progress Bars
```python
from rich.progress import track
import time

def process_items(items):
    for item in track(items, description="Processing..."):
        time.sleep(0.1)
        # Process item
```

### Tables
```python
from rich.console import Console
from rich.table import Table

console = Console()

table = Table(title="Tasks")
table.add_column("ID", style="cyan", width=6)
table.add_column("Title", style="magenta")
table.add_column("Status", justify="right", style="green")

table.add_row("1", "Fix bug", "Done")
table.add_row("2", "Add feature", "In Progress")
table.add_row("3", "Write tests", "Pending")

console.print(table)
```

### Syntax Highlighting
```python
from rich.syntax import Syntax
from rich.console import Console

console = Console()
code = '''
def hello():
    print("Hello, World!")
'''
syntax = Syntax(code, "python", theme="monokai", line_numbers=True)
console.print(syntax)
```

### Panels and Boxes
```python
from rich.panel import Panel
from rich.console import Console

console = Console()
console.print(Panel("Hello, [bold red]World![/bold red]!", title="Welcome"))
```

### Trees
```python
from rich.tree import Tree
from rich.console import Console

console = Console()
tree = Tree("Project")
tree.add("src")
tree.add("tests")
tree.add("README.md")
console.print(tree)
```

## Textual Examples

### Simple TUI App
```python
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Static, Button, Input

class TodoApp(App):
    CSS_PATH = "todo.css"
    TITLE = "Todo App"

    def compose(self) -> ComposeResult:
        yield Header()
        yield Static("Enter a task:")
        yield Input(placeholder="Task description...")
        yield Button("Add")
        yield Footer()

if __name__ == "__main__":
    app = TodoApp()
    app.run()
```

### Data Table
```python
from textual.app import App, ComposeResult
from textual.widgets import DataTable

class TableApp(App):
    def compose(self) -> ComposeResult:
        table = DataTable()
        table.add_column("ID")
        table.add_column("Name")
        table.add_column("Status")
        table.add_row("1", "Task 1", "Done")
        table.add_row("2", "Task 2", "Pending")
        yield table
```

## Prompt Toolkit Examples

### Simple Prompt
```python
from prompt_toolkit import prompt

name = prompt('What is your name? ')
print(f'Hello, {name}!')
```

### Password Input
```python
from prompt_toolkit import prompt

password = prompt('Enter password: ', is_password=True)
```

### Autocompletion
```python
from prompt_toolkit import prompt
from prompt_toolkit.completion import WordCompleter

commands = ['add', 'delete', 'update', 'list', 'quit']
completer = WordCompleter(commands)

while True:
    command = prompt('> ', completer=completer)
    if command == 'quit':
        break
```

### Multi-line Input
```python
from prompt_toolkit import prompt

text = prompt('Enter text: ', multiline=True)
```

## Layout Managers

### Columns
```python
from textual.containers import Horizontal, Vertical
from textual.widgets import Static

class LayoutApp(App):
    def compose(self) -> ComposeResult:
        with Horizontal():
            with Vertical():
                yield Static("Left Top")
                yield Static("Left Bottom")
            with Vertical():
                yield Static("Right")
```

### Grid
```python
from textual.containers import Grid
from textual.widgets import Button

class GridApp(App):
    def compose(self) -> ComposeResult:
        with Grid(gutter=(1, 1)):
            for i in range(9):
                yield Button(f"Button {i}")
```

## Styling

### CSS in Textual
```css
/* todo.css */
Screen {
    background: #1a1a1a;
}

Button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 1 2;
}

Button:hover {
    background: #2563eb;
}

Input {
    background: #2d2d2d;
    border: solid #555;
    padding: 1 2;
}
```

### Inline Styles
```python
from rich.console import Console

console = Console()
console.print("[bold red]Error:[/bold red] Something went wrong!")
console.print("[italic]Note:[/italic] This is important")
```

## Events

### Button Clicks
```python
from textual.app import App, ComposeResult
from textual.widgets import Button

class ButtonApp(App):
    def compose(self) -> ComposeResult:
        yield Button("Click me", id="btn")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn":
            self.exit("Button was pressed!")
```

### Input Changes
```python
from textual.widgets import Input

class InputApp(App):
    def on_input_changed(self, event: Input.Changed) -> None:
        if len(event.value) > 10:
            self.query_one(Input).border_title = "Too long!"
```

## Async Operations

### Background Tasks
```python
from textual.app import App, ComposeResult
from textual.widgets import Static
import asyncio

class AsyncApp(App):
    def compose(self) -> ComposeResult:
        yield Static("Loading...", id="status")

    def on_mount(self) -> None:
        self.run_worker(self.load_data)

    async def load_data(self):
        status = self.query_one("#status", Static)
        await asyncio.sleep(2)
        status.update("Data loaded!")
```

## Best Practices

### Performance
- Use virtual scrolling for large lists
- Batch DOM updates
- Debounce expensive operations
- Use worker threads for I/O

### Accessibility
- Support keyboard navigation
- Provide clear focus indicators
- Include keyboard shortcuts
- Support screen readers (text mode)

### User Experience
- Show loading states
- Provide clear feedback
- Handle errors gracefully
- Save user preferences

## Testing

### Textual Testing
```python
from textual.app import App
from textual.widgets import Button

async def test_button():
    app = App()
    async with app.run_test() as pilot:
        await pilot.click(Button)
        assert app.result is not None
```

## Related Libraries

- **Blessed**: https://blessed.readthedocs.io/
- **Urchin**: https://github.com/ohnose/urchin
- **Asciimatics**: https://asciimatics.readthedocs.io/
- **Curtsies**: https://curtsies.readthedocs.io/

## Resources

- **Textual Tutorial**: https://textual.textualize.io/tutorial/
- **Rich Tutorial**: https://rich.readthedocs.io/en/stable/introduction.html
- **TUI Best Practices**: https://clig.dev/
