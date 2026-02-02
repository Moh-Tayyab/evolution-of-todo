#!/usr/bin/env python3
#!/usr/bin/env python3
"""
generate.py

Generate script for Claude Code skills automation.

Author: Evolution of Todo Project
Version: 1.0.0
License: MIT
"""

"""
CLI Builder - Generate Click-Based CLI Applications
====================================================

Production-grade tool for generating command-line interface applications
using Click, Rich, and modern CLI patterns.

Features:
- Generate complete CLI application structure
- Include Rich output formatting
- Add interactive prompts with inquirer
- Support for subcommands and groups
- Generate configuration file support
- Include shell completion scripts
- Add testing templates

Usage:
    python -m cli_builder --name mycli --dir ./mycli
    python -m cli_builder --name mycli --with-rich --with-config
    python -m cli_builder --name mycli --commands status,logs,config

Author: Claude Code Engineering Team
Version: 1.0.0
License: MIT
"""

import os
import sys
import shutil
import argparse
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime


@dataclass
class CLIConfig:
    """Configuration for CLI application generation."""
    name: str
    directory: Path
    description: str = "CLI Application"
    version: str = "1.0.0"
    author: str = "Your Name"
    email: str = "your.email@example.com"

    # Feature flags
    with_rich: bool = True
    with_config: bool = True
    with_prompts: bool = True
    with_completion: bool = True
    with_tests: bool = True

    # Commands to generate
    commands: List[str] = field(default_factory=list)

    # Python version
    python_version: str = "3.11"


class CLIApplicationGenerator:
    """
    Generate production-ready CLI applications.

    Creates a complete CLI application with:
    - Proper Click structure
    - Rich output formatting
    - Configuration management
    - Interactive prompts
    - Shell completions
    - Testing setup
    - Documentation
    """

    def __init__(self, config: CLIConfig):
        """Initialize the generator."""
        self.config = config
        self.cli_root = config.directory / config.name

    def generate(self) -> None:
        """Generate the complete CLI application."""
        print(f"Generating CLI application: {self.config.name}")
        print(f"Directory: {self.cli_root}")

        # Create directory structure
        self._create_directory_structure()

        # Generate configuration files
        self._generate_pyproject_toml()
        self._generate_readme()
        self._generate_gitignore()

        # Generate CLI application
        self._generate_main_cli()
        self._generate_commands()

        # Generate utilities
        if self.config.with_rich:
            self._generate_rich_output()

        if self.config.with_config:
            self._generate_config_module()

        if self.config.with_prompts:
            self._generate_prompts_module()

        # Generate completions
        if self.config.with_completion:
            self._generate_completions()

        # Generate tests
        if self.config.with_tests:
            self._generate_tests()

        print(f"\n✅ CLI application generated successfully!")
        print(f"\nNext steps:")
        print(f"  1. cd {self.cli_root}")
        print(f"  2. uv venv")
        print(f"  3. source .venv/bin/activate")
        print(f"  4. uv pip install -r requirements.txt")
        print(f"  5. {self.config.name} --help")

    def _create_directory_structure(self) -> None:
        """Create the CLI directory structure."""
        dirs = [
            self.cli_root,
            self.cli_root / self.config.name.replace("-", "_"),  # Package name
            self.cli_root / "tests",
            self.cli_root / "docs",
        ]

        for dir_path in dirs:
            dir_path.mkdir(parents=True, exist_ok=True)

    def _generate_pyproject_toml(self) -> None:
        """Generate pyproject.toml."""
        package_name = self.config.name.replace("-", "_")

        content = f'''[project]
name = "{self.config.name}"
version = "{self.config.version}"
description = "{self.config.description}"
authors = [
    {{name = "{self.config.author}", email = "{self.config.email}"}},
]
dependencies = [
    "click>=8.1.0",{"    "rich>=13.7.0"," if self.config.with_rich else ""}
    {"    "inquirer>=3.1.0"," if self.config.with_prompts else ""}
    {"    "pydantic>=2.4.0"," if self.config.with_config else ""}
    "python-dotenv>=1.0.0",
]
requires-python = ">={self.config.python_version}"
readme = "README.md"
license = {{text = "MIT"}}

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "ruff>=0.1.0",
    "mypy>=1.7.0",
]

[project.scripts]
{self.config.name} = "{package_name}.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
target-version = "py{self.config.python_version.replace('.', '')}"
line-length = 120

[tool.mypy]
python_version = "{self.config.python_version}"
'''

        (self.cli_root / "pyproject.toml").write_text(content)

    def _generate_main_cli(self) -> None:
        """Generate main CLI entry point."""
        package_name = self.config.name.replace("-", "_")

        main_content = f'''"""CLI application entry point."""

import sys
from pathlib import Path

import click
{"from rich.console import Console" if self.config.with_rich else ""}
{"from rich.table import Table" if self.config.with_rich else ""}

from {package_name}.config import load_config
{"from {package_name}.output import print_success, print_error" if self.config.with_rich else ""}

console = Console() if self.config.with_rich else None


@click.group()
@click.version_option(version="{self.config.version}")
@click.option(
    "--config",
    "-c",
    type=click.Path(exists=True),
    help="Path to configuration file",
)
@click.option(
    "--verbose", "-v",
    is_flag=True,
    help="Enable verbose output",
)
@click.pass_context
def cli(ctx, config, verbose):
    """{self.config.description}"""
    ctx.ensure_object(dict)
    ctx.obj = {{"config": load_config(config) if self.config.with_config else {{}}}
    ctx.obj["verbose"] = verbose


@cli.command()
def status():
    """Show application status."""
    {"console.print(" if self.config.with_rich else ""}{"[bold green]✓[/] " if self.config.with_rich else ""}CLI is running properly{"." if self.config.with_rich else ""})


@cli.command()
@click.argument("name", default="World")
def hello(name):
    """Say hello to NAME."""
    {"console.print(f"Hello, [bold blue]{{name}}[/]!") if self.config.with_rich else f"print(f'Hello, {{name}}!')"}


def main():
    """Main entry point."""
    cli()


if __name__ == "__main__":
    main()
'''

        cli_path = self.cli_root / package_name / "cli.py"
        cli_path.parent.mkdir(exist_ok=True)
        cli_path.write_text(main_content)

        # __init__.py
        (self.cli_root / package_name / "__init__.py").write_text(f'''"""{self.config.description} package."""

__version__ = "{self.config.version}"
__author__ = "{self.config.author} <{self.config.email}>"
''')

    def _generate_commands(self) -> None:
        """Generate command modules."""
        package_name = self.config.name.replace("-", "_")
        commands_dir = self.cli_root / package_name / "commands"
        commands_dir.mkdir(exist_ok=True)

        (commands_dir / "__init__.py").write_text('"""Command modules."""')

        # Example commands
        for command_name in self.config.commands:
            command_content = f'''"""{command_name.capitalize()} command."""

import click

from {package_name}.output import print_success, print_error


@click.command()
def {command_name}():
    """{command_name.capitalize()} command description."""
    print_success("{command_name} command executed!")
'''

            (commands_dir / f"{command_name}.py").write_text(command_content)

    def _generate_rich_output(self) -> None:
        """Generate Rich output utilities."""
        package_name = self.config.name.replace("-", "_")
        output_dir = self.cli_root / package_name / "output"
        output_dir.mkdir(exist_ok=True)

        output_content = '''"""Rich output formatting utilities."""

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn
from rich import print as rprint

console = Console()


def print_success(message: str) -> None:
    """Print success message."""
    rprint(f"[bold green]✓[/] {{message}}")


def print_error(message: str) -> None:
    """Print error message."""
    rprint(f"[bold red]✗[/] {{message}}")


def print_warning(message: str) -> None:
    """Print warning message."""
    rprint(f"[bold yellow]⚠[/] {{message}}")


def print_table(title: str, columns: list, rows: list) -> None:
    """Print data as a formatted table."""
    table = Table(title=title, show_header=True)
    for col in columns:
        table.add_column(col)
    for row in rows:
        table.add_row(*row)
    console.print(table)


def print_panel(content: str, title: str = None) -> None:
    """Print content in a panel."""
    console.print(Panel(content, title=title))


def with_progress(description: str):
    """Context manager for progress tracking."""
    return Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{{task.description}}"),
        BarColumn(),
        TextColumn("[progress.percentage]{{task.percentage:>3.0f}}%"),
        console=console,
    )
'''

        (output_dir / "__init__.py").write_text('"""Output utilities."""')
        (output_dir / "rich_output.py").write_text(output_content)

    def _generate_config_module(self) -> None:
        """Generate configuration management."""
        package_name = self.config.name.replace("-", "_")
        config_dir = self.cli_root / package_name / "config"
        config_dir.mkdir(exist_ok=True)

        config_content = '''"""Configuration management."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional
import json

@dataclass
class Config:
    """Application configuration."""
    verbose: bool = False
    debug: bool = False
    config_file: Optional[Path] = None

    @classmethod
    def from_file(cls, path: Path) -> "Config":
        """Load configuration from file."""
        if not path.exists():
            return cls()

        with open(path) as f:
            data = json.load(f)
        return cls(**data)


def load_config(config_path: Optional[str] = None) -> Config:
    """Load configuration from file or environment."""
    if config_path:
        return Config.from_file(Path(config_path))
    return Config()
'''

        (config_dir / "__init__.py").write_text('"""Configuration module."""')
        (config_dir / "settings.py").write_text(config_content)

    def _generate_prompts_module(self) -> None:
        """Generate interactive prompts utilities."""
        package_name = self.config.name.replace("-", "_")
        prompts_dir = self.cli_root / package_name / "prompts"
        prompts_dir.mkdir(exist_ok=True)

        prompts_content = '''"""Interactive prompts utilities."""

from typing import List, Optional
import inquirer


def prompt_choice(message: str, choices: List[str]) -> str:
    """Prompt user to choose from options."""
    return inquirer.list_input(
        message=message,
        choices=choices,
    )


def prompt_confirm(message: str, default: bool = False) -> bool:
    """Prompt user for confirmation."""
    return inquirer.confirm(message, default=default)


def prompt_text(message: str, default: str = "") -> str:
    """Prompt user for text input."""
    return inquirer.text(message, default=default)


def prompt_password(message: str) -> str:
    """Prompt user for password."""
    return inquirer.password(message)
'''

        (prompts_dir / "__init__.py").write_text('"""Prompts module."""')
        (prompts_dir / "interactive.py").write_text(prompts_content)

    def _generate_completions(self) -> None:
        """Generate shell completion scripts."""
        bash_completion = f'''# Bash completion for {self.config.name}

_{self.config.name}_completion() {{
    local cur prev words cword
    _init_completion || return

    cur="${{COMP_WORDS[COMP_CWORD]}}"
    prev="${{COMP_WORDS[COMP_CWORD-1]}}"
    words="${{COMP_WORDS[@]}}"
    cword="${{COMP_CWORD}}"

    if [[ ${{cword}} -eq 1 ]]; then
        case "${{cur}}" in
            *)
                COMPREPLY=($(compgen -W "status hello {' '.join(self.config.commands)}" -- "${{cur}}"))
                ;;
        esac
    fi
}}

complete -F _{self.config.name}_completion {self.config.name}
'''

        zsh_completion = f'''# Zsh completion for {self.config.name}

#compdef {self.config.name}

_{self.config.name}() {{
    local -a commands
    commands=(
        'status:Show application status'
        'hello:Say hello'
        {''.join([f'\'{cmd}:{cmd} command\'' for cmd in self.config.commands])}
    )

    if (( CURRENT == 2 )); then
        _describe 'command' commands
    else
        _message "no more arguments"
    fi
}}

_{self.config.name} "$@"
'''

        (self.cli_root / "completions" / "bash.bash").write_text(bash_completion)
        (self.cli_root / "completions" / "zsh.zsh").write_text(zsh_completion)

    def _generate_tests(self) -> None:
        """Generate test files."""
        tests_dir = self.cli_root / "tests"

        conftest_content = '''"""Pytest configuration."""

import pytest
from click.testing import CliRunner
from pathlib import Path

# Add project root to path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.fixture
def runner():
    """Create CLI test runner."""
    from cli import cli
    return CliRunner()


@pytest.fixture
def temp_config(tmp_path):
    """Create temporary config file."""
    import json

    config_file = tmp_path / "config.json"
    config_file.write_text(json.dumps({{"verbose": True}}))
    return str(config_file)
'''

        test_main_content = '''"""Test CLI commands."""

from cli import cli


def test_status(runner):
    """Test status command."""
    result = runner.invoke(cli, ["status"])
    assert result.exit_code == 0
    assert "✓" in result.output or "running" in result.output.lower()


def test_hello(runner):
    """Test hello command."""
    result = runner.invoke(cli, ["hello", "World"])
    assert result.exit_code == 0
    assert "World" in result.output
'''

        (tests_dir / "conftest.py").write_text(conftest_content)
        (tests_dir / "test_cli.py").write_text(test_main_content)

    def _generate_readme(self) -> None:
        """Generate README.md."""
        content = f'''# {self.config.name}

{self.config.description}

## Installation

```bash
# Using pip
pip install {self.config.name}

# Using uv
uv pip install {self.config.name}
```

## Usage

```bash
# Show help
{self.config.name} --help

# Run commands
{self.config.name} status
{self.config.name} hello World
```

## Development

```bash
# Install development dependencies
uv pip install -e ".[dev]"

# Run tests
pytest

# Format code
ruff check . --fix
```

## Configuration

Create a configuration file at `~/.config/{self.config.name}/config.json`:

```json
{{
    "verbose": true,
    "debug": false
}}
```

## Shell Completion

### Bash
```bash
# Add to ~/.bash_completion.d/
cp completions/bash.bash ~/.bash_completion.d/{self.config.name}
source ~/.bash_completion.d/{self.config.name}
```

### Zsh
```bash
# Add to ~/.zsh/completion/
cp completions/zsh.zsh ~/.zsh/completion/_{self.config.name}
# Add to ~/.zshrc
echo "source ~/.zsh/completion/_{self.config.name}" >> ~/.zshrc
```
'''

        (self.cli_root / "README.md").write_text(content)

    def _generate_gitignore(self) -> None:
        """Generate .gitignore."""
        content = '''# Python
__pycache__/
*.py[cod]
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.venv/
venv/
ENV/
env.bak/
venv.bak/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
.pytest_cache/
.coverage
htmlcov/

# Configuration
.env.local
'''

        (self.cli_root / ".gitignore").write_text(content)


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="CLI Builder - Generate Click-based CLI applications",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --name mycli --dir ./mycli
  %(prog)s --name mycli --with-rich --with-config
  %(prog)s --name mycli --commands status,logs,config
        """
    )

    parser.add_argument(
        "--name", "-n",
        type=str,
        required=True,
        help="CLI application name"
    )

    parser.add_argument(
        "--dir", "-d",
        type=Path,
        default=Path.cwd(),
        help="Output directory"
    )

    parser.add_argument(
        "--description",
        type=str,
        default="CLI Application",
        help="Application description"
    )

    parser.add_argument(
        "--author",
        type=str,
        default="Your Name",
        help="Author name"
    )

    parser.add_argument(
        "--email",
        type=str,
        default="your.email@example.com",
        help="Author email"
    )

    # Feature flags
    parser.add_argument(
        "--with-rich",
        action="store_true",
        default=True,
        help="Include Rich output formatting (default: True)"
    )

    parser.add_argument(
        "--with-config",
        action="store_true",
        default=True,
        help="Include configuration management (default: True)"
    )

    parser.add_argument(
        "--with-prompts",
        action="store_true",
        default=True,
        help="Include interactive prompts (default: True)"
    )

    parser.add_argument(
        "--with-completion",
        action="store_true",
        default=True,
        help="Include shell completions (default: True)"
    )

    parser.add_argument(
        "--with-tests",
        action="store_true",
        default=True,
        help="Include test suite (default: True)"
    )

    parser.add_argument(
        "--without-rich",
        action="store_true",
        help="Skip Rich output formatting"
    )

    parser.add_argument(
        "--without-config",
        action="store_true",
        help="Skip configuration management"
    )

    parser.add_argument(
        "--without-prompts",
        action="store_true",
        help="Skip interactive prompts"
    )

    parser.add_argument(
        "--without-completion",
        action="store_true",
        help="Skip shell completions"
    )

    parser.add_argument(
        "--without-tests",
        action="store_true",
        help="Skip test suite"
    )

    parser.add_argument(
        "--commands",
        type=str,
        help="Comma-separated list of commands to generate"
    )

    args = parser.parse_args()

    # Parse commands
    commands = []
    if args.commands:
        commands = [c.strip() for c in args.commands.split(",")]

    # Create config
    config = CLIConfig(
        name=args.name,
        directory=args.dir,
        description=args.description,
        author=args.author,
        email=args.email,
        with_rich=not args.without_rich and args.with_rich,
        with_config=not args.without_config and args.with_config,
        with_prompts=not args.without_prompts and args.with_prompts,
        with_completion=not args.without_completion and args.with_completion,
        with_tests=not args.without_tests and args.with_tests,
        commands=commands,
    )

    # Generate CLI application
    try:
        generator = CLIApplicationGenerator(config)
        generator.generate()
        sys.exit(0)
    except Exception as e:
        print(f"Error generating CLI: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
