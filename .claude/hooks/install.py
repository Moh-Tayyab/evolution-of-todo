#!/usr/bin/env python3
# @spec: Git Hooks System for Evolution of Todo Project
# Installation script for git hooks
#
# This script installs the git hooks from .claude/hooks/ into .git/hooks/
# It creates symbolic links (or copies on systems without symlink support)
# and makes the hooks executable.
#
# Usage:
#   python install.py              # Install all hooks
#   python install.py --uninstall  # Remove all hooks
#   python install.py --list       # List installed hooks
#   python install.py --force      # Force reinstall (overwrite existing)
#
# Exit codes:
#   0 - Success
#   1 - Error occurred

from __future__ import annotations

import sys
import os
import shutil
import argparse
from pathlib import Path

# ANSI color codes for output
class Colors:
    RESET = "\033[0m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    RED = "\033[91m"
    BOLD = "\033[1m"

    @staticmethod
    def supports_color() -> bool:
        """Check if terminal supports color."""
        return hasattr(sys.stdout, 'isatty') and sys.stdout.isatty()

def colorize(message: str, color: str) -> str:
    """Add color to message if terminal supports it."""
    if Colors.supports_color():
        return f"{color}{message}{Colors.RESET}"
    return message

def success(msg: str):
    """Print success message."""
    print(colorize("✓ " + msg, Colors.GREEN))

def warning(msg: str):
    """Print warning message."""
    print(colorize("⚠ " + msg, Colors.YELLOW))

def error(msg: str):
    """Print error message."""
    print(colorize("✗ " + msg, Colors.RED))

def info(msg: str):
    """Print info message."""
    print(colorize("ℹ " + msg, Colors.BLUE))

def bold(msg: str):
    """Print bold message."""
    print(colorize(msg, Colors.BOLD))


# Available hooks
HOOKS = [
    "pre-commit",
    "pre-push",
    "post-checkout",
    "post-merge",
    "pre-execute",
    "post-execute",
]


def get_hooks_directory() -> Path:
    """
    Get the directory containing the hook scripts.

    Returns:
        Path to the hooks directory (.claude/hooks/)
    """
    # Get the directory where this script is located
    script_path = Path(__file__).resolve()
    return script_path.parent


def get_git_hooks_directory() -> Path:
    """
    Get the .git/hooks directory.

    Returns:
        Path to .git/hooks directory
    """
    # Get git root
    git_root = Path.cwd()
    for parent in [git_root, *git_root.parents]:
        if (parent / ".git").exists():
            return parent / ".git" / "hooks"

    # If not in a git repo, try cwd/.git/hooks
    return Path.cwd() / ".git" / "hooks"


def is_hook_installed(hook_name: str, git_hooks_dir: Path) -> bool:
    """
    Check if a hook is already installed.

    Args:
        hook_name: Name of the hook
        git_hooks_dir: Path to .git/hooks directory

    Returns:
        True if hook is installed, False otherwise
    """
    hook_path = git_hooks_dir / hook_name
    return hook_path.exists() or hook_path.is_symlink()


def install_hook(hook_name: str, hooks_dir: Path, git_hooks_dir: Path, force: bool = False) -> bool:
    """
    Install a single hook.

    Args:
        hook_name: Name of the hook to install
        hooks_dir: Source directory for hooks (.claude/hooks/)
        git_hooks_dir: Destination directory (.git/hooks/)
        force: Force reinstall even if hook exists

    Returns:
        True if installation succeeded, False otherwise
    """
    source = hooks_dir / hook_name
    destination = git_hooks_dir / hook_name

    # Check if source exists
    if not source.exists():
        error(f"Hook not found: {source}")
        return False

    # Check if already installed
    if not force and is_hook_installed(hook_name, git_hooks_dir):
        warning(f"Hook already installed: {hook_name}")
        return True

    # Remove existing hook/symlink
    if destination.exists() or destination.is_symlink():
        try:
            destination.unlink()
        except OSError as e:
            error(f"Failed to remove existing hook: {e}")
            return False

    # Create symlink (preferred)
    try:
        destination.symlink_to(source)
        success(f"Installed: {hook_name} (symlink)")

        # Make sure it's executable
        destination.chmod(0o755)
        return True

    except OSError:
        # Symlink failed, try copying
        try:
            shutil.copy2(source, destination, follow_symlinks=True)
            destination.chmod(0o755)
            success(f"Installed: {hook_name} (copied)")
            return True

        except (OSError, shutil.Error) as e:
            error(f"Failed to install {hook_name}: {e}")
            return False


def install_hooks(force: bool = False) -> int:
    """
    Install all hooks.

    Args:
        force: Force reinstall even if hooks exist

    Returns:
        Exit code (0 = success, 1 = failure)
    """
    hooks_dir = get_hooks_directory()
    git_hooks_dir = get_git_hooks_directory()

    bold("\n" + "=" * 60)
    bold("  Installing Git Hooks")
    bold("=" * 60 + "\n")

    # Check if we're in a git repository
    if not git_hooks_dir.exists():
        error("Not in a git repository")
        error(f"Expected directory: {git_hooks_dir}")
        return 1

    info(f"Source: {hooks_dir}")
    info(f"Target: {git_hooks_dir}")
    print()

    # Create git hooks directory if needed
    git_hooks_dir.mkdir(parents=True, exist_ok=True)

    # Install each hook
    installed = 0
    failed = 0
    skipped = 0

    for hook_name in HOOKS:
        if install_hook(hook_name, hooks_dir, git_hooks_dir, force=force):
            installed += 1
        else:
            failed += 1

    print()
    bold("=" * 60)

    if failed == 0:
        success(f"Installation complete: {installed} hook(s) installed")
        print()
        info("Hooks are now active!")
        info("They will run automatically on git operations.")
        print()
        info("To bypass a hook temporarily:")
        info("  git commit --no-verify")
        info("  git push --no-verify")
        print()
        return 0
    else:
        error(f"Installation failed: {failed}/{len(HOOKS)} hook(s) failed")
        return 1


def uninstall_hooks() -> int:
    """
    Uninstall all installed hooks.

    Returns:
        Exit code (0 = success, 1 = failure)
    """
    git_hooks_dir = get_git_hooks_directory()

    bold("\n" + "=" * 60)
    bold("  Uninstalling Git Hooks")
    bold("=" * 60 + "\n")

    if not git_hooks_dir.exists():
        warning("Not in a git repository")
        return 0

    removed = 0
    not_found = 0

    for hook_name in HOOKS:
        hook_path = git_hooks_dir / hook_name

        if hook_path.exists() or hook_path.is_symlink():
            try:
                hook_path.unlink()
                success(f"Removed: {hook_name}")
                removed += 1
            except OSError as e:
                error(f"Failed to remove {hook_name}: {e}")
        else:
            not_found += 1

    print()
    bold("=" * 60)

    if removed > 0:
        success(f"Uninstallation complete: {removed} hook(s) removed")
    else:
        info("No hooks were installed")

    return 0


def list_hooks() -> int:
    """
    List installed hooks and their status.

    Returns:
        Exit code (0 = success)
    """
    git_hooks_dir = get_git_hooks_directory()

    bold("\n" + "=" * 60)
    bold("  Git Hooks Status")
    bold("=" * 60 + "\n")

    if not git_hooks_dir.exists():
        warning("Not in a git repository")
        return 0

    hooks_dir = get_hooks_directory()

    for hook_name in HOOKS:
        source = hooks_dir / hook_name
        destination = git_hooks_dir / hook_name

        # Status
        if destination.exists() or destination.is_symlink():
            # Check if it's our hook
            try:
                is_our_hook = destination.resolve() == source.resolve()
                if is_our_hook:
                    status = colorize("✓ Installed", Colors.GREEN)
                else:
                    status = colorize("⚠ Custom hook", Colors.YELLOW)
            except OSError:
                status = colorize("⚠ Unknown", Colors.YELLOW)
        else:
            status = colorize("✗ Not installed", Colors.RED)

        print(f"  {hook_name:20s} {status}")

    print()
    bold("=" * 60)

    return 0


def main() -> int:
    """
    Main entry point.

    Returns:
        Exit code (0 = success, 1 = error)
    """
    parser = argparse.ArgumentParser(
        description="Install/uninstall git hooks for the Evolution of Todo project",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python install.py              Install all hooks
  python install.py --uninstall  Remove all hooks
  python install.py --list       Show hook status
  python install.py --force      Force reinstall

Environment variables:
  GIT_HOOKS_VERBOSE    Enable verbose logging
        """
    )

    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="Uninstall hooks instead of installing"
    )

    parser.add_argument(
        "--list",
        action="store_true",
        help="List installed hooks and exit"
    )

    parser.add_argument(
        "--force",
        "-f",
        action="store_true",
        help="Force reinstall even if hooks exist"
    )

    args = parser.parse_args()

    if args.list:
        return list_hooks()
    elif args.uninstall:
        return uninstall_hooks()
    else:
        return install_hooks(force=args.force)


if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print()
        warning("Installation interrupted by user")
        sys.exit(130)
    except Exception as e:
        error(f"Installation failed: {e}")
        sys.exit(1)
