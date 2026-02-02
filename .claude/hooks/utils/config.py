# @spec: Git Hooks System for Evolution of Todo Project
# Configuration management for git hooks
# Centralizes all hook settings and thresholds

import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
import json
import yaml


class HookConfig:
    """
    Configuration manager for git hooks.

    Loads settings from config.yaml and provides type-safe access
    to all configuration values. Supports environment variable overrides
    for CI/CD environments.

    Configuration priority (highest to lowest):
    1. Environment variables (GIT_HOOKS_*)
    2. User config file (~/.git-hooks-config.yaml)
    3. Project config file (.claude/hooks/config.yaml)
    4. Default values

    Usage:
        config = HookConfig()
        if config.frontend.enabled:
            lint_commands = config.frontend.lint_commands
    """

    # Default configuration values
    DEFAULTS = {
        # General settings
        "verbose": False,
        "log_level": "INFO",
        "log_dir": ".claude/logs",

        # Pre-commit hook settings
        "pre_commit": {
            "enabled": True,
            "timeout_seconds": 10,
            "require_tests": False,
            "fail_on_error": True,
        },

        # Pre-push hook settings
        "pre_push": {
            "enabled": True,
            "timeout_seconds": 30,
            "require_tests": True,
            "test_coverage_threshold": 70,  # Minimum 70% coverage
            "fail_on_coverage_below_threshold": True,
        },

        # Post-checkout hook settings
        "post_checkout": {
            "enabled": True,
            "run_install": True,  # Auto-install dependencies when switching branches
            "show_branch_info": True,
        },

        # Post-merge hook settings
        "post_merge": {
            "enabled": True,
            "run_migrations": False,  # Run DB migrations if needed
            "clear_caches": True,
            "notify_changes": True,
        },

        # Pre-execute hook settings
        "pre_execute": {
            "enabled": False,  # Disabled by default (custom hook)
            "commands": [],  # Commands to run before execute
        },

        # Post-execute hook settings
        "post_execute": {
            "enabled": False,  # Disabled by default (custom hook)
            "commands": [],  # Commands to run after execute
        },

        # Frontend settings
        "frontend": {
            "enabled": True,
            "directory": "frontend",
            "package_manager": "npm",  # npm, pnpm, yarn

            # Linting
            "lint": {
                "enabled": True,
                "command": "npm run lint",
                "fix_on_error": False,
                "max_issues": 0,  # Fail on any lint issues
            },

            # Type checking
            "typecheck": {
                "enabled": True,
                "command": "npx tsc --noEmit",
            },

            # Formatting check
            "format": {
                "enabled": True,
                "command": "npm run format:check",
                "fix_on_error": False,
            },

            # Console.log checks (prevent debug in production)
            "no_console_log": {
                "enabled": True,
                "patterns": [
                    "console\\.log",
                    "console\\.debug",
                    "console\\.warn",  # Usually should use logger instead
                ],
                "exclude_files": ["*.test.ts", "*.spec.ts", "*.mock.ts"],
            },

            # Unit tests
            "tests": {
                "enabled": False,  # Too slow for pre-commit, use pre-push instead
                "command": "npm run test:unit",
                "max_duration_seconds": 5,
            },
        },

        # Backend settings
        "backend": {
            "enabled": True,
            "directory": "backend",
            "python_version": "3.13",

            # Linting
            "lint": {
                "enabled": True,
                "command": "ruff check .",
                "fix_on_error": False,
                "max_issues": 0,
            },

            # Type checking
            "mypy": {
                "enabled": True,
                "command": "mypy src/",
                "strict_mode": True,
            },

            # Formatting check
            "format": {
                "enabled": True,
                "command": "ruff format --check .",
                "fix_on_error": False,
            },

            # Import sorting
            "imports": {
                "enabled": True,
                "command": "ruff check --select I .",
            },

            # Tests
            "tests": {
                "enabled": False,  # Too slow for pre-commit
                "command": "pytest tests/ -v",
                "max_duration_seconds": 10,
                "coverage_threshold": 70,
            },
        },

        # E2E tests
        "e2e": {
            "enabled": False,  # Disabled for pre-commit, use pre-push
            "directory": "frontend/e2e",
            "command": "npm run test:e2e",
            "max_duration_seconds": 60,
        },
    }

    def __init__(self, config_path: Optional[Path] = None):
        """
        Initialize the hook configuration.

        Args:
            config_path: Optional path to config.yaml file
        """
        self.config_path = config_path or Path(__file__).parent.parent / "config.yaml"
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """
        Load configuration from file and merge with defaults.

        Configuration loading priority:
        1. Environment variables
        2. User config file
        3. Project config file
        4. Defaults

        Returns:
            Merged configuration dictionary
        """
        config = self.DEFAULTS.copy()

        # Load from project config file if exists
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r') as f:
                    file_config = yaml.safe_load(f) or {}
                    config = self._deep_merge(config, file_config)
            except (yaml.YAMLError, IOError) as e:
                print(f"Warning: Could not load config from {self.config_path}: {e}", file=sys.stderr)

        # Apply environment variable overrides
        config = self._apply_env_overrides(config)

        return config

    def _deep_merge(self, base: Dict, override: Dict) -> Dict:
        """
        Deep merge two dictionaries.

        Args:
            base: Base dictionary
            override: Dictionary with override values

        Returns:
            Merged dictionary with nested dictionaries properly merged
        """
        result = base.copy()

        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._deep_merge(result[key], value)
            else:
                result[key] = value

        return result

    def _apply_env_overrides(self, config: Dict) -> Dict:
        """
        Apply environment variable overrides to configuration.

        Environment variables use GIT_HOOKS_ prefix:
        - GIT_HOOKS_VERBOSE=true
        - GIT_HOOKS_PRE_COMMIT_TIMEOUT=15
        - GIT_HOOKS_FRONTEND_ENABLED=false

        Args:
            config: Base configuration dictionary

        Returns:
            Configuration with environment overrides applied
        """
        # General overrides
        if os.getenv("GIT_HOOKS_VERBOSE"):
            config["verbose"] = os.getenv("GIT_HOOKS_VERBOSE").lower() == "true"
        if os.getenv("GIT_HOOKS_LOG_LEVEL"):
            config["log_level"] = os.getenv("GIT_HOOKS_LOG_LEVEL", "INFO")

        # Pre-commit overrides
        if os.getenv("GIT_HOOKS_PRE_COMMIT_TIMEOUT"):
            config["pre_commit"]["timeout_seconds"] = int(os.getenv("GIT_HOOKS_PRE_COMMIT_TIMEOUT"))
        config["pre_commit"]["enabled"] = os.getenv("GIT_HOOKS_PRE_COMMIT_ENABLED", "true").lower() == "true"

        # Pre-push overrides
        if os.getenv("GIT_HOOKS_PRE_PUSH_TIMEOUT"):
            config["pre_push"]["timeout_seconds"] = int(os.getenv("GIT_HOOKS_PRE_PUSH_TIMEOUT"))
        if os.getenv("GIT_HOOKS_PRE_PUSH_ENABLED"):
            config["pre_push"]["enabled"] = os.getenv("GIT_HOOKS_PRE_PUSH_ENABLED").lower() == "true"

        # Coverage threshold override
        if os.getenv("GIT_HOOKS_COVERAGE_THRESHOLD"):
            config["pre_push"]["test_coverage_threshold"] = int(os.getenv("GIT_HOOKS_COVERAGE_THRESHOLD"))

        # Frontend overrides
        if os.getenv("GIT_HOOKS_FRONTEND_ENABLED"):
            config["frontend"]["enabled"] = os.getenv("GIT_HOOKS_FRONTEND_ENABLED").lower() == "true"

        # Backend overrides
        if os.getenv("GIT_HOOKS_BACKEND_ENABLED"):
            config["backend"]["enabled"] = os.getenv("GIT_HOOKS_BACKEND_ENABLED").lower() == "true"

        return config

    # ========== Typed Property Accessors ==========

    @property
    def verbose(self) -> bool:
        """Get verbose logging setting."""
        return self.config["verbose"]

    @property
    def log_level(self) -> str:
        """Get log level setting."""
        return self.config["log_level"]

    @property
    def log_dir(self) -> Path:
        """Get log directory path."""
        return Path(self.config["log_dir"])

    @property
    def pre_commit(self) -> Dict[str, Any]:
        """Get pre-commit configuration."""
        return self.config["pre_commit"]

    @property
    def pre_push(self) -> Dict[str, Any]:
        """Get pre-push configuration."""
        return self.config["pre_push"]

    @property
    def post_checkout(self) -> Dict[str, Any]:
        """Get post-checkout configuration."""
        return self.config["post_checkout"]

    @property
    def post_merge(self) -> Dict[str, Any]:
        """Get post-merge configuration."""
        return self.config["post_merge"]

    @property
    def pre_execute(self) -> Dict[str, Any]:
        """Get pre-execute configuration."""
        return self.config["pre_execute"]

    @property
    def post_execute(self) -> Dict[str, Any]:
        """Get post-execute configuration."""
        return self.config["post_execute"]

    @property
    def frontend(self) -> Dict[str, Any]:
        """Get frontend configuration."""
        return self.config["frontend"]

    @property
    def backend(self) -> Dict[str, Any]:
        """Get backend configuration."""
        return self.config["backend"]

    @property
    def e2e(self) -> Dict[str, Any]:
        """Get E2E test configuration."""
        return self.config["e2e"]

    # ========== Convenience Methods ==========

    def is_hook_enabled(self, hook_name: str) -> bool:
        """
        Check if a specific hook is enabled.

        Args:
            hook_name: Name of the hook (e.g., "pre_commit", "pre_push")

        Returns:
            True if the hook is enabled, False otherwise
        """
        hook_config = self.config.get(hook_name, {})
        return hook_config.get("enabled", False)

    def get_hook_timeout(self, hook_name: str) -> int:
        """
        Get the timeout for a specific hook.

        Args:
            hook_name: Name of the hook

        Returns:
            Timeout in seconds
        """
        hook_config = self.config.get(hook_name, {})
        return hook_config.get("timeout_seconds", 30)

    def get_command(self, category: str, command_name: str) -> Optional[str]:
        """
        Get a specific command from configuration.

        Args:
            category: Category (e.g., "frontend", "backend")
            command_name: Command name (e.g., "lint", "format")

        Returns:
            Command string or None if not configured/enabled
        """
        category_config = self.config.get(category, {})
        if not category_config.get("enabled", False):
            return None

        command_config = category_config.get(command_name, {})
        if not command_config.get("enabled", False):
            return None

        return command_config.get("command")

    def should_fail_on_error(self, hook_name: str) -> bool:
        """
        Check if a hook should fail on error.

        Args:
            hook_name: Name of the hook

        Returns:
            True if hook should fail on error, False otherwise
        """
        hook_config = self.config.get(hook_name, {})
        return hook_config.get("fail_on_error", True)
    def save_config(self):
        """
        Save current configuration to file (for testing/debugging).

        Note: This should generally only be used for debugging, not in production.
        """
        try:
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_path, 'w') as f:
                yaml.dump(self.config, f, default_flow_style=False)
        except IOError as e:
            print(f"Warning: Could not save config to {self.config_path}: {e}", file=sys.stderr)
