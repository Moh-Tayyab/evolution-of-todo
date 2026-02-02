# CLI Builder References

Official documentation and resources for building professional command-line interfaces in Python.

## Official Resources

### Click Documentation
- **Official Website**: https://click.palletsprojects.com/
- **GitHub**: https://github.com/pallets/click
- **Documentation**: https://click.palletsprojects.com/en/stable/
- **API Reference**: https://click.palletsprojects.com/en/stable/api/
- **Changelog**: https://click.palletsprojects.com/en/stable/changes/

### Typer (Modern Alternative)
- **Website**: https://typer.tiangolo.com/
- **GitHub**: https://github.com/tiangolo/typer
- **Documentation**: https://typer.tiangolo.com/

### Rich (Terminal Formatting)
- **Website**: https://rich.readthedocs.io/
- **GitHub**: https://github.com/Textualize/rich
- **Documentation**: https://rich.readthedocs.io/en/stable/

## Core Concepts

### Click Basics
- **Commands**: Decorator-based command definition
- **Arguments**: Required positional parameters
- **Options**: Optional named parameters (flags)
- **Groups**: Organizing related commands
- **Context**: Passing state between commands

### Terminal Output
- **Rich Formatting**: Colors, styles, tables, progress bars
- **Prompt Handling**: Interactive user input
- **Confirmation**: Yes/no prompts with defaults
- **Progress Indicators**: Bars, spinners, status updates

## Quick Start

### Basic Command Structure
```python
import click

@click.command()
@click.option('--count', default=1, help='Number of greetings.')
@click.option('--name', prompt='Your name', help='The person to greet.')
def hello(count, name):
    """Simple program that greets NAME COUNT times."""
    for _ in range(count):
        click.echo(f'Hello, {name}!')

if __name__ == '__main__':
    hello()
```

### Command Groups
```python
@click.group()
def cli():
    """CLI for managing tasks."""
    pass

@cli.command()
@click.argument('title')
def add(title):
    """Add a new task."""
    click.echo(f'Added task: {title}')

@cli.command()
@click.argument('task_id', type=int)
def complete(task_id):
    """Mark a task as complete."""
    click.echo(f'Marked task {task_id} as complete')
```

## Advanced Patterns

### Subcommands with Groups
```python
@click.group()
def admin():
    """Admin commands."""
    pass

@admin.group()
def user():
    """User management."""
    pass

@user.command()
@click.argument('username')
def create(username):
    """Create a new user."""
    click.echo(f'Creating user: {username}')
```

### Custom Validators
```python
def validate_email(ctx, param, value):
    if value and '@' not in value:
        raise click.BadParameter('Email must contain @')
    return value

@click.command()
@click.option('--email', callback=validate_email)
def register(email):
    click.echo(f'Registering: {email}')
```

### Environment Variables
```python
@click.command()
@click.option('--api-key', envvar='API_KEY', help='API key from env.')
def authenticate(api_key):
    click.echo(f'Using API key: {api_key[:8]}...')
```

## Rich Integration

### Progress Bars
```python
from rich.progress import track
import time

def process_items(items):
    for item in track(items, description="Processing..."):
        time.sleep(0.1)
```

### Tables
```python
from rich.console import Console
from rich.table import Table

console = Console()

table = Table(title="Tasks")
table.add_column("ID", style="cyan")
table.add_column("Title", style="magenta")
table.add_column("Status", justify="right")

table.add_row("1", "Fix bug", "Done")
table.add_row("2", "Add feature", "In Progress")

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
syntax = Syntax(code, "python", theme="monokai")
console.print(syntax)
```

## Input Handling

### Prompts
```python
@click.command()
def setup():
    name = click.prompt('Your name')
    email = click.prompt('Your email', type=click.Email())
    password = click.prompt('Password', hide_input=True, confirmation_prompt=True)
    click.echo(f'User: {name} <{email}>')
```

### Confirmations
```python
@click.command()
@click.confirmation_option(prompt='Are you sure you want to delete?')
def delete():
    click.echo('Deleted!')
```

### Choices
```python
@click.command()
@click.option('--format', type=click.Choice(['json', 'yaml', 'toml']), default='json')
def export(format):
    click.echo(f'Exporting as {format}')
```

## File Handling

### File Paths
```python
@click.command()
@click.argument('input', type=click.Path(exists=True))
@click.option('--output', type=click.Path(), default='output.txt')
def process(input, output):
    click.echo(f'Processing {input} to {output}')
```

### File Reading
```python
@click.command()
@click.argument('file', type=click.File('r'))
def count_lines(file):
    lines = file.readlines()
    click.echo(f'{len(lines)} lines')
```

## Configuration

### Config Files
```python
import click
from configparser import ConfigParser

@click.group()
@click.option('--config', type=click.Path(), default='config.ini')
@click.pass_context
def cli(ctx, config):
    ctx.ensure_object(dict)
    parser = ConfigParser()
    parser.read(config)
    ctx.obj['config'] = parser
```

### Default Profiles
```python
@click.command()
@click.option('--profile', type=click.Choice(['dev', 'prod']), default='dev')
def deploy(profile):
    if profile == 'dev':
        url = 'https://dev.example.com'
    else:
        url = 'https://example.com'
    click.echo(f'Deploying to {url}')
```

## Testing

### Click Testing
```python
from click.testing import CliRunner

def test_hello():
    runner = CliRunner()
    result = runner.invoke(hello, ['--name', 'World'])
    assert result.exit_code == 0
    assert 'Hello, World!' in result.output
```

### Isolated Filesystem
```python
def test_with_files():
    runner = CliRunner()
    with runner.isolated_filesystem():
        with open('input.txt', 'w') as f:
            f.write('test content')
        result = runner.invoke(process, ['input.txt'])
        assert result.exit_code == 0
```

## Best Practices

### Command Organization
```python
# Structure your CLI logically
@click.group()
def main():
    """Main CLI entry point."""
    pass

@main.group()
def db():
    """Database commands."""
    pass

@main.group()
def user():
    """User management commands."""
    pass
```

### Help Text
```python
@click.command()
@click.option('--count', default=1, help='Number of iterations.', show_default=True)
@click.argument('name', metavar='NAME', required=True)
def process(count, name):
    """
    Process items for NAME.

    NAME is the identifier of the item to process.

    Example: cli process item1 --count 5
    """
    pass
```

### Error Handling
```python
@click.command()
@click.argument('file', type=click.Path(exists=True))
def read(file):
    try:
        with open(file) as f:
            content = f.read()
        click.echo(content)
    except click.ClickException as e:
        click.echo(f'Error: {e}', err=True)
        raise click.Abort()
```

## Shell Completion

### Bash Completion
```python
# Add to ~/.bashrc
eval "$(_YOUR_CLI_COMPLETE=bash_source your-cli)"
```

### Zsh Completion
```python
# Add to ~/.zshrc
eval "$(_YOUR_CLI_COMPLETE=zsh_source your-cli)"
```

## Deployment

### Package with setuptools
```python
# setup.py
from setuptools import setup

setup(
    name='mycli',
    version='1.0.0',
    py_modules=['cli'],
    install_requires=[
        'click>=8.0',
        'rich>=12.0',
    ],
    entry_points={
        'console_scripts': [
            'mycli=cli:main',
        ],
    },
)
```

### PyPI Distribution
```bash
python -m build
twine upload dist/*
```

## Related Libraries

- **Prompt Toolkit**: https://python-prompt-toolkit.readthedocs.io/
- **Questionary**: https://questionary.readthedocs.io/
- **Textual**: https://textual.textualize.io/
- **Cleo**: https://cleo.readthedocs.io/

## Resources

- **Click Examples**: https://github.com/pallets/click/tree/main/examples
- **Rich Gallery**: https://rich.readthedocs.io/en/stable/gallery.html
- **CLI Design Guidelines**: https://clig.dev/
