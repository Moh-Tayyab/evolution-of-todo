# @spec: Git Hooks System for Evolution of Todo Project
# Frontend utilities for git hooks operations
# Provides Next.js, TypeScript, and npm operations with cross-platform support

import os
import sys
import subprocess
from pathlib import Path
from typing import List, Optional, Tuple, Dict
import logging

logger = logging.getLogger(__name__)


class FrontendUtils:
    """
    Frontend utility functions for git hooks operations.

    Provides safe operations for:
    - Next.js project detection
    - npm/pnpm/yarn package management
    - ESLint operations
    - TypeScript compilation
    - Format checking
    - Console.log detection
    - Test execution

    All operations include proper timeout handling and cross-platform compatibility.
    """

    # Known package manager commands
    PACKAGE_MANAGERS = {
        "npm": {
            "install": "npm install",
            "ci": "npm ci",
            "lint": "npm run lint",
            "lint:fix": "npm run lint:fix",
            "format": "npm run format",
            "format:check": "npm run format:check",
            "format:fix": "npm run format:fix",
            "typecheck": "npx tsc --noEmit",
            "test": "npm test",
            "test:unit": "npm run test:unit",
            "test:e2e": "npm run test:e2e",
            "build": "npm run build",
        },
        "pnpm": {
            "install": "pnpm install",
            "ci": "pnpm install --frozen-lockfile",
            "lint": "pnpm run lint",
            "lint:fix": "pnpm run lint:fix",
            "format": "pnpm run format",
            "format:check": "pnpm run format:check",
            "format:fix": "pnpm run format:fix",
            "typecheck": "pnpm run typecheck",
            "test": "pnpm test",
            "test:unit": "pnpm run test:unit",
            "test:e2e": "pnpm run test:e2e",
            "build": "pnpm build",
        },
        "yarn": {
            "install": "yarn install",
            "ci": "yarn install --frozen-lockfile",
            "lint": "yarn lint",
            "lint:fix": "yarn lint --fix",
            "format": "yarn format",
            "format:check": "yarn format --check",
            "format:fix": "yarn format --fix",
            "typecheck": "yarn tsc --noEmit",
            "test": "yarn test",
            "test:unit": "yarn test:unit",
            "test:e2e": "yarn test:e2e",
            "build": "yarn build",
        },
    }

    @staticmethod
    def is_frontend_project(directory: Path) -> bool:
        """
        Detect if a directory is a Next.js/React frontend project.

        Detection criteria:
        - Contains package.json with Next.js dependencies
        - Contains src/ or app/ directory
        - Contains tsconfig.json or next.config file

        Args:
            directory: Directory path to check

        Returns:
            True if directory appears to be a frontend project
        """
        package_json = directory / "package.json"
        if not package_json.exists():
            return False

        # Check for Next.js indicators
        try:
            import json
            with open(package_json) as f:
                package_data = json.load(f)

            dependencies = package_data.get("dependencies", {})
            dev_dependencies = package_data.get("devDependencies", {})

            all_deps = {**dependencies, **dev_dependencies}

            # Check for Next.js
            if "next" in all_deps or "react" in all_deps:
                # Additional checks
                has_source = (directory / "src").exists() or (directory / "app").exists()
                has_config = (directory / "tsconfig.json").exists() or \
                           (directory / "next.config.js").exists() or \
                           (directory / "next.config.ts").exists() or \
                           (directory / "next.config.mjs").exists()

                return has_source or has_config

        except (json.JSONDecodeError, IOError):
            pass

        return False

    @staticmethod
    def detect_package_manager(directory: Path) -> str:
        """
        Detect which package manager the project uses.

        Detection priority:
        1. pnpm (lockfile presence)
        2. yarn (yarn.lock)
        3. npm (package-lock.json)

        Args:
            directory: Directory to check

        Returns:
            Package manager name ("npm", "pnpm", "yarn")
        """
        # Check for lock files in priority order
        if (directory / "pnpm-lock.yaml").exists():
            return "pnpm"
        elif (directory / "yarn.lock").exists():
            return "yarn"
        else:
            # Default to npm
            return "npm"

    @staticmethod
    def run_command(
        directory: Path,
        command: str,
        args: Optional[List[str]] = None,
        timeout: int = 30,
        capture_output: bool = True,
        check: bool = False
    ) -> subprocess.CompletedProcess:
        """
        Run a command in the frontend directory.

        Args:
            directory: Frontend directory path
            command: Command to run
            args: Optional command arguments
            timeout: Timeout in seconds
            capture_output: Whether to capture stdout/stderr
            check: Whether to raise exception on non-zero exit

        Returns:
            CompletedProcess object

        Raises:
            subprocess.TimeoutExpired: If command times out
            subprocess.CalledProcessError: If check=True and command fails
        """
        cmd = command.split() + (args or [])

        try:
            result = subprocess.run(
                cmd,
                cwd=directory,
                capture_output=capture_output,
                text=True,
                check=check,
                timeout=timeout,
                # Set environment to avoid user-specific config issues
                env={**os.environ, "NODE_ENV": "production"}
            )
            return result
        except subprocess.TimeoutExpired:
            logger.error(f"Frontend command timed out after {timeout}s: {command}")
            raise
        except FileNotFoundError:
            logger.error(f"Command not found: {command}")
            raise

    @staticmethod
    def check_dependencies(directory: Path, package_manager: str = None) -> bool:
        """
        Check if node_modules exists and dependencies are installed.

        Args:
            directory: Frontend directory path
            package_manager: Package manager being used

        Returns:
            True if dependencies are installed, False otherwise
        """
        node_modules = directory / "node_modules"

        # For pnpm, check .pnpm directory
        if package_manager == "pnpm":
            return (directory / ".pnpm").exists() and node_modules.exists()
        else:
            return node_modules.exists()

    @staticmethod
    def install_dependencies(
        directory: Path,
        package_manager: str = None,
        ci_mode: bool = False
    ) -> bool:
        """
        Install frontend dependencies.

        Args:
            directory: Frontend directory path
            package_manager: Package manager to use
            ci_mode: Use ci flag (frozen lockfile) for faster installs

        Returns:
            True if installation succeeded, False otherwise
        """
        if not package_manager:
            package_manager = FrontendUtils.detect_package_manager(directory)

        logger.info(f"Installing dependencies with {package_manager}...")

        install_cmd = FrontendUtils.PACKAGE_MANAGERS[package_manager]["ci" if ci_mode else "install"]

        try:
            result = FrontendUtils.run_command(
                directory,
                install_cmd,
                timeout=300,  # 5 minutes for dependency installation
                check=True
            )
            logger.info("Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install dependencies: {e.stderr}")
            return False
        except subprocess.TimeoutExpired:
            logger.error("Dependency installation timed out")
            return False

    @staticmethod
    def run_lint(directory: Path, package_manager: str = None, fix: bool = False) -> Tuple[bool, str]:
        """
        Run ESLint on the frontend code.

        Args:
            directory: Frontend directory path
            package_manager: Package manager being used
            fix: Whether to auto-fix issues

        Returns:
            Tuple of (success: bool, output: str)
        """
        if not package_manager:
            package_manager = FrontendUtils.detect_package_manager(directory)

        lint_cmd = FrontendUtils.PACKAGE_MANAGERS[package_manager]["lint:fix" if fix else "lint"]

        logger.info(f"Running lint{' --fix' if fix else ''}...")

        try:
            result = FrontendUtils.run_command(
                directory,
                lint_cmd,
                timeout=60,  # 1 minute
                check=False  # Don't fail, we want the output
            )
            success = result.returncode == 0
            return success, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, "Linting timed out"
        except subprocess.CalledProcessError as e:
            return False, e.stderr

    @staticmethod
    def run_type_check(directory: Path, package_manager: str = None) -> Tuple[bool, str]:
        """
        Run TypeScript type checking.

        Args:
            directory: Frontend directory path
            package_manager: Package manager being used

        Returns:
            Tuple of (success: bool, output: str)
        """
        if not package_manager:
            package_manager = FrontendUtils.detect_package_manager(directory)

        typecheck_cmd = FrontendUtils.PACKAGE_MANAGERS[package_manager]["typecheck"]

        logger.info("Running TypeScript type check...")

        try:
            result = FrontendUtils.run_command(
                directory,
                typecheck_cmd,
                timeout=120,  # 2 minutes
                check=False
            )
            success = result.returncode == 0
            return success, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, "Type check timed out"
        except subprocess.CalledProcessError as e:
            return False, e.stderr

    @staticmethod
    def check_format(directory: Path, package_manager: str = None) -> Tuple[bool, str]:
        """
        Check if code is properly formatted.

        Args:
            directory: Frontend directory path
            package_manager: Package manager being used

        Returns:
            Tuple of (success: bool, output: str)
        """
        if not package_manager:
            package_manager = FrontendUtils.detect_package_manager(directory)

        format_cmd = FrontendUtils.PACKAGE_MANAGERS[package_manager]["format:check"]

        logger.info("Checking code formatting...")

        try:
            result = FrontendUtils.run_command(
                directory,
                format_cmd,
                timeout=60,
                check=False
            )
            success = result.returncode == 0
            return success, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, "Format check timed out"
        except subprocess.CalledProcessError as e:
            return False, e.stderr

    @staticmethod
    def find_console_logs(
        directory: Path,
        patterns: List[str] = None,
        exclude_files: List[str] = None
    ) -> List[Path]:
        """
        Find console.log statements in TypeScript/JavaScript files.

        Args:
            directory: Directory to search
            patterns: Regex patterns to search for
            exclude_files: File patterns to exclude (e.g., "*.test.ts")

        Returns:
            List of files containing console.log statements
        """
        if patterns is None:
            patterns = [r"console\.log", r"console\.debug", r"console\.warn"]

        if exclude_files is None:
            exclude_files = ["*.test.ts", "*.spec.ts", "*.mock.ts"]

        import re

        # Find all TS/TSX/JS/JSX files
        source_files = []
        for ext in ["*.ts", "*.tsx", "*.js", "*.jsx"]:
            source_files.extend(directory.rglob(ext))

        # Filter out excluded files
        for exclude_pattern in exclude_files:
            source_files = [f for f in source_files if not f.match(exclude_pattern)]

        # Search for console statements
        files_with_logs = []
        for file_path in source_files:
            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                for pattern in patterns:
                    if re.search(pattern, content):
                        files_with_logs.append(file_path)
                        break
            except (IOError, UnicodeDecodeError):
                continue

        return files_with_logs

    @staticmethod
    def run_tests(
        directory: Path,
        test_type: str = "unit",
        package_manager: str = None,
        timeout: int = 60
    ) -> Tuple[bool, str]:
        """
        Run frontend tests.

        Args:
            directory: Frontend directory path
            test_type: Type of tests to run ("unit", "e2e", "all")
            package_manager: Package manager being used
            timeout: Maximum time to allow for tests

        Returns:
            Tuple of (success: bool, output: str)
        """
        if not package_manager:
            package_manager = FrontendUtils.detect_package_manager(directory)

        test_commands = {
            "unit": FrontendUtils.PACKAGE_MANAGERS[package_manager].get("test:unit"),
            "e2e": FrontendUtils.PACKAGE_MANAGERS[package_manager].get("test:e2e"),
            "all": FrontendUtils.PACKAGE_MANAGERS[package_manager].get("test"),
        }

        test_cmd = test_commands.get(test_type)
        if not test_cmd:
            return False, f"No test command configured for '{test_type}'"

        logger.info(f"Running {test_type} tests...")

        try:
            result = FrontendUtils.run_command(
                directory,
                test_cmd,
                timeout=timeout,
                check=False
            )
            success = result.returncode == 0
            return success, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, f"Tests timed out after {timeout}s"
        except subprocess.CalledProcessError as e:
            return False, e.stderr

    @staticmethod
    def build_project(
        directory: Path,
        package_manager: str = None,
        timeout: int = 300
    ) -> Tuple[bool, str]:
        """
        Build the frontend project to verify no build errors.

        Args:
            directory: Frontend directory path
            package_manager: Package manager being used
            timeout: Maximum time to allow for build

        Returns:
            Tuple of (success: bool, output: str)
        """
        if not package_manager:
            package_manager = FrontendUtils.detect_package_manager(directory)

        build_cmd = FrontendUtils.PACKAGE_MANAGERS[package_manager]["build"]

        logger.info("Building frontend project...")

        try:
            result = FrontendUtils.run_command(
                directory,
                build_cmd,
                timeout=timeout,
                check=False
            )
            success = result.returncode == 0
            return success, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return False, f"Build timed out after {timeout}s"
        except subprocess.CalledProcessError as e:
            return False, e.stderr

    @staticmethod
    def get_package_json(directory: Path) -> Optional[Dict]:
        """
        Load and parse package.json file.

        Args:
            directory: Directory containing package.json

        Returns:
            Parsed package.json data, or None if file doesn't exist
        """
        package_json = directory / "package.json"
        if not package_json.exists():
            return None

        try:
            import json
            with open(package_json) as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return None

    @staticmethod
    def get_project_version(directory: Path) -> Optional[str]:
        """
        Get the project version from package.json.

        Args:
            directory: Frontend directory path

        Returns:
            Version string, or None if not found
        """
        package_data = FrontendUtils.get_package_json(directory)
        if package_data:
            return package_data.get("version")
        return None

    @staticmethod
    def has_turbo_mode(directory: Path) -> bool:
        """
        Check if Next.js turbo mode is configured.

        Args:
            directory: Frontend directory path

        Returns:
            True if turbo mode is enabled, False otherwise
        """
        package_data = FrontendUtils.get_package_json(directory)
        if package_data:
            scripts = package_data.get("scripts", {})
            dev_script = scripts.get("dev", "")
            return "--turbo" in dev_script
        return False
