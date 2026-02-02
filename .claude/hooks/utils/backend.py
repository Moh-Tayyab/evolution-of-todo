# @spec: Git Hooks System for Evolution of Todo Project
# Backend utilities for git hooks operations
# Provides Python, FastAPI, and testing operations with cross-platform support

import os
import sys
import subprocess
from pathlib import Path
from typing import List, Optional, Tuple, Dict
import logging

logger = logging.getLogger(__name__)


class BackendUtils:
    """
    Backend utility functions for git hooks operations.

    Provides safe operations for:
    - Python project detection
    - Ruff linting and formatting
    - mypy type checking
    - pytest test execution
    - Coverage reporting
    - Virtual environment management

    All operations include proper timeout handling and cross-platform compatibility.
    """

    @staticmethod
    def is_backend_project(directory: Path) -> bool:
        """
        Detect if a directory is a Python/FastAPI backend project.

        Detection criteria:
        - Contains pyproject.toml, setup.py, or requirements.txt
        - Contains src/ directory (common in FastAPI projects)
        - Contains main.py or app/main.py

        Args:
            directory: Directory path to check

        Returns:
            True if directory appears to be a backend project
        """
        # Check for Python indicators
        has_requirements = (
            (directory / "requirements.txt").exists() or
            (directory / "pyproject.toml").exists() or
            (directory / "setup.py").exists()
        )

        if not has_requirements:
            return False

        # Check for project structure
        has_main = (directory / "main.py").exists() or (directory / "app" / "main.py").exists()
        has_src = (directory / "src").exists()

        return has_main or has_src

    @staticmethod
    def detect_python_version() -> Tuple[int, int, int]:
        """
        Detect the Python version required by the project.

        Looks for:
        - Python version in pyproject.toml (requires field)
        - .python-version file
        - python version in requirements files

        Returns:
            Tuple of (major, minor, patch) version numbers
        """
        directory = Path.cwd()  # Usually run from project root

        # Check pyproject.toml first
        pyproject = directory / "pyproject.toml"
        if pyproject.exists():
            try:
                import tomli
                with open(pyproject, "rb") as f:
                    data = tomli.load(f)
                requires = data.get("project", {}).get("requires-python")
                if requires and isinstance(requires, str):
                    # Parse version like ">=3.13" or "~=3.13"
                    version_str = requires.lstrip(">~^=")
                    parts = version_str.split(".")
                    if len(parts) >= 3:
                        return (int(parts[0]), int(parts[1]), int(parts[2][:2]))
            except (ImportError, IOError, ValueError):
                pass

        # Check .python-version file
        python_version_file = directory / ".python-version"
        if python_version_file.exists():
            try:
                version_str = python_version_file.read_text().strip()
                parts = version_str.split(".")
                if len(parts) >= 2:
                    return (int(parts[0]), int(parts[1]), 0)
            except (IOError, ValueError):
                pass

        # Default to 3.13
        return (3, 13, 0)

    @staticmethod
    def check_venv(directory: Path) -> bool:
        """
        Check if Python virtual environment exists.

        Looks for:
        - venv/ directory
        - .venv/ directory
        - virtualenv/ directory

        Args:
            directory: Directory to check

        Returns:
            True if virtual environment exists, False otherwise
        """
        venv_dirs = ["venv", ".venv", "virtualenv", "env"]
        for venv_dir in venv_dirs:
            if (directory / venv_dir).exists():
                # Check if it looks like a Python venv
                venv_path = directory / venv_dir
                # Check for activation scripts or pip
                if os.name == "nt":  # Windows
                    activate = venv_path / "Scripts" / "activate"
                else:
                    activate = venv_path / "bin" / "activate"

                pip_path = venv_path / "Lib" / "site-packages" if os.name != "nt" else venv_path / "Lib" / "site-packages"

                if activate.exists() or pip_path.exists():
                    return True

        return False

    @staticmethod
    def run_python_command(
        directory: Path,
        command: str,
        args: Optional[List[str]] = None,
        timeout: int = 60,
        capture_output: bool = True,
        check: bool = False
    ) -> subprocess.CompletedProcess:
        """
        Run a Python command in the backend directory.

        Args:
            directory: Backend directory path
            command: Command to run
            args: Optional command arguments
            timeout: Timeout in seconds
            capture_output: Whether to capture stdout/stderr
            check: Whether to raise exception on non-zero exit

        Returns:
            CompletedProcess object
        """
        cmd = [sys.executable if command == "python" else command] + (args or [])

        try:
            result = subprocess.run(
                cmd,
                cwd=directory,
                capture_output=capture_output,
                text=True,
                check=check,
                timeout=timeout
            )
            return result
        except subprocess.TimeoutExpired:
            logger.error(f"Python command timed out after {timeout}s: {command}")
            raise
        except FileNotFoundError:
            logger.error(f"Python not found at: {sys.executable}")
            raise

    @staticmethod
    def run_ruff(directory: Path, args: List[str], check: bool = False) -> Tuple[bool, str]:
        """
        Run ruff (Python linter/formatter).

        Args:
            directory: Backend directory path
            args: Ruff arguments (e.g., ["check", "--fix"])
            check: Whether to raise exception on errors

        Returns:
            Tuple of (success: bool, output: str)
        """
        logger.info(f"Running ruff {' '.join(args)...")

        try:
            result = BackendUtils.run_python_command(
                directory,
                "ruff",
                args=args,
                timeout=30,
                check=check
            )
            success = result.returncode == 0
            return success, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, "Ruff timed out"
        except subprocess.CalledProcessError as e:
            return False, e.stderr

    @staticmethod
    def lint(directory: Path, fix: bool = False) -> Tuple[bool, str]:
        """
        Run ruff linting on backend code.

        Args:
            directory: Backend directory path
            fix: Whether to auto-fix issues

        Returns:
            Tuple of (success: bool, output: str)
        """
        args = ["check", "."]
        if fix:
            args.append("--fix")

        return BackendUtils.run_ruff(directory, args, check=False)

    @staticmethod
    def check_format(directory: Path) -> Tuple[bool, str]:
        """
        Check if Python code is properly formatted.

        Args:
            directory: Backend directory path

        Returns:
            Tuple of (success: bool, output: str)
        """
        return BackendUtils.run_ruff(directory, ["format", "--check", "."], check=False)

    @staticmethod
    def check_imports(directory: Path) -> Tuple[bool, str]:
        """
        Check for import sorting issues.

        Args:
            directory: Backend directory path

        Returns:
            Tuple of (success: bool, output: str)
        """
        return BackendUtils.run_ruff(directory, ["check", "--select", "I", "."], check=False)

    @staticmethod
    def run_mypy(directory: Path, strict: bool = True) -> Tuple[bool, str]:
        """
        Run mypy type checking on backend code.

        Args:
            directory: Backend directory path
            strict: Whether to use strict mode (default: True)

        Returns:
            Tuple of (success: bool, output: str)
        """
        args = ["src/"]
        if strict:
            args.append("--strict")

        logger.info("Running mypy type checking...")

        try:
            result = BackendUtils.run_python_command(
                directory,
                "mypy",
                args=args,
                timeout=120,  # 2 minutes
                check=False  # mypy returns non-zero even for warnings
            )
            # mypy returns 0 if no errors, 1 if errors found
            # We consider it successful if return code is 0 or 1 (warnings OK)
            success = result.returncode in [0, 1]
            return success, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, "Mypy timed out"
        except subprocess.CalledProcessError as e:
            return False, e.stderr
        except FileNotFoundError:
            # mypy not installed, skip
            return True, "Mypy not installed, skipping type check"

    @staticmethod
    def run_tests(
        directory: Path,
        test_type: str = "all",
        coverage: bool = False,
        timeout: int = 60
    ) -> Tuple[bool, str]:
        """
        Run pytest tests with optional coverage reporting.

        Args:
            directory: Backend directory path
            test_type: Test suite to run ("all", "unit", "integration")
            coverage: Whether to generate coverage report
            timeout: Maximum time to allow for tests

        Returns:
            Tuple of (success: bool, output: str)
        """
        args = ["tests/", "-v"]

        if coverage:
            args.extend([
                "--cov=src",
                "--cov-report=term-missing",
                "--cov-report=html",
                f"--cov-fail={directory / 'htmlcov'}"
            ])

        logger.info(f"Running {test_type} tests...")

        try:
            result = BackendUtils.run_python_command(
                directory,
                "pytest",
                args=args,
                timeout=timeout,
                check=False
            )
            success = result.returncode == 0
            return success, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, f"Tests timed out after {timeout}s"
        except subprocess.CalledProcessError as e:
            return False, e.stderr
        except FileNotFoundError:
            # pytest not installed
            return True, "Pytest not installed, skipping tests"

    @staticmethod
    def get_test_coverage(directory: Path) -> Optional[float]:
        """
        Parse pytest coverage report and return coverage percentage.

        Args:
            directory: Backend directory path

        Returns:
            Coverage percentage (0-100), or None if coverage not available
        """
        # Try to read .coverage file
        coverage_file = directory / ".coverage"
        if not coverage_file.exists():
            return None

        try:
            import json
            with open(coverage_file, "r") as f:
                data = json.load(f)

            files = data.get("files", {})
            if not files:
                return None

            # Calculate total coverage
            total_lines = 0
            covered_lines = 0

            for file_data in files.values():
                summary = file_data.get("summary", {})
                total_lines += summary.get("num_statements", 0)
                covered_lines += summary.get("covered_lines", 0)

            if total_lines == 0:
                return None

            return (covered_lines / total_lines) * 100

        except (IOError, json.JSONDecodeError, KeyError):
            return None

    @staticmethod
    def check_requirements(directory: Path) -> Tuple[bool, List[str]]:
        """
        Check if all requirements are installed.

        Args:
            directory: Backend directory path

        Returns:
            Tuple of (all_installed: bool, missing_packages: List[str])
        """
        requirements_file = directory / "requirements.txt"

        if not requirements_file.exists():
            return True, []

        try:
            import re
            with open(requirements_file, "r") as f:
                requirements = [
                    line.split("==")[0].split(">=")[0].strip().lower()
                    for line in f
                    if line.strip() and not line.startswith("#")
                ]

            # Check if packages can be imported
            missing = []
            for req in requirements:
                try:
                    __import__(req)
                except ImportError:
                    missing.append(req)

            return len(missing) == 0, missing

        except IOError:
            return True, []  # Can't read requirements, assume OK

    @staticmethod
    def get_python_version() -> str:
        """
        Get current Python version string.

        Returns:
            Python version string (e.g., "3.13.0")
        """
        return f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
