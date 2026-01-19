#!/usr/bin/env python3
"""Interactive Todo CLI with inquirer prompts"""

import inquirer
import json
from pathlib import Path

STORAGE_FILE = Path.home() / ".todo-cli" / "todos.json"


def load_todos():
    if STORAGE_FILE.exists():
        with open(STORAGE_FILE) as f:
            return json.load(f)
    return []


def save_todos(todos):
    STORAGE_FILE.parent.mkdir(exist_ok=True)
    with open(STORAGE_FILE, "w") as f:
        json.dump(todos, f, indent=2)


def interactive_menu():
    """Interactive menu-driven CLI"""

    while True:
        action = inquirer.list_input(
            message="What would you like to do?",
            choices=["Add todo", "List todos", "Complete todo", "Delete todo", "Exit"],
        )

        if action == "Add todo":
            questions = [
                inquirer.text("title", message="Enter todo title:"),
                inquirer.text(
                    "description",
                    message="Enter description (optional):",
                    allow_empty=True,
                ),
            ]
            answers = inquirer.prompt(questions)

            todos = load_todos()
            todos.append({
                "id": len(todos) + 1,
                "title": answers["title"],
                "description": answers["description"],
                "completed": False
            })
            save_todos(todos)
            print(f"✓ Added: {answers['title']}")

        elif action == "List todos":
            todos = load_todos()
            if not todos:
                print("No todos yet!")
            else:
                for todo in todos:
                    status = "✓" if todo["completed"] else "○"
                    print(f"\n  {todo['id']}. [{status}] {todo['title']}")
                    if todo.get("description"):
                        print(f"     {todo['description']}")

        elif action == "Complete todo":
            todos = load_todos()
            incomplete = [t for t in todos if not t["completed"]]

            if not incomplete:
                print("No incomplete todos!")
                continue

            todo_id = inquirer.list_input(
                message="Select todo to complete:",
                choices=[(f"{t['id']}. {t['title']}", t['id']) for t in incomplete],
            )

            for todo in todos:
                if todo["id"] == todo_id:
                    todo["completed"] = True
                    save_todos(todos)
                    print(f"✓ Completed: {todo['title']}")
                    break

        elif action == "Delete todo":
            todos = load_todos()
            todo_id = inquirer.list_input(
                message="Select todo to delete:",
                choices=[(f"{t['id']}. {t['title']}", t['id']) for t in todos],
            )

            todos = [t for t in todos if t["id"] != todo_id]
            save_todos(todos)
            print(f"✓ Deleted todo #{todo_id}")

        elif action == "Exit":
            print("Goodbye!")
            break


if __name__ == "__main__":
    interactive_menu()
