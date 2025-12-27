# Console UI Menu System

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
import sys

console = Console()


class Menu:
    """Interactive console menu with keyboard navigation"""

    def __init__(self, title: str, options: list):
        self.title = title
        self.options = options
        self.selected = 0

    def display(self):
        """Display the menu with selection indicator"""

        # Create table for menu
        table = Table(title=self.title, show_header=False)
        table.add_column("Option", width=4)
        table.add_column("Item", width=40)

        for i, option in enumerate(self.options):
            # Add selection indicator
            if i == self.selected:
                table.add_row("[green]→[/green]", f"[bold yellow]{option}[/bold yellow]")
            else:
                table.add_row("  ", option)

        console.print(table)
        console.print("\n[cyan]Use ↑↓ to navigate, Enter to select, q to quit[/cyan]")

    def navigate(self, key: str) -> bool:
        """Handle keyboard navigation"""

        if key == "up" and self.selected > 0:
            self.selected -= 1
        elif key == "down" and self.selected < len(self.options) - 1:
            self.selected += 1
        elif key == "enter":
            return True  # Selection made
        elif key == "q":
            sys.exit(0)

        return False

    def run(self):
        """Run the interactive menu"""

        import keyboard

        while True:
            console.clear()
            self.display()

            # Wait for key press
            key = keyboard.read_key()

            if key == "up":
                self.navigate("up")
            elif key == "down":
                self.navigate("down")
            elif key == "enter":
                return self.selected
            elif key == "q":
                sys.exit(0)


# Usage example
def main():
    menu = Menu(
        title="Todo Manager",
        options=[
            "Add new todo",
            "List all todos",
            "Complete todo",
            "Delete todo",
            "Exit"
        ]
    )

    selection = menu.run()
    console.print(f"\n[green]Selected: {menu.options[selection]}[/green]")


if __name__ == "__main__":
    main()
