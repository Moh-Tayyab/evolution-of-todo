# @spec: Git Hooks System
# Professional logging utility for all git hooks operations
# Supports console output with timestamps and colored messages

import sys
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

# ANSI color codes for terminal output
class Colors:
    """ANSI color codes for terminal output."""
    RESET = "\033[0m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    DIM = "\033[2m"

    # Check if terminal supports colors
    @staticmethod
    def supports_color() -> bool:
        """Check if the terminal supports color output."""
        # Check if we're in a terminal that supports colors
        if hasattr(sys.stdout, 'isatty') and sys.stdout.isatty():
            return True
        # Check CI environment variables
        if sys.getenv("CI") or sys.getenv("GITHUB_ACTIONS") or sys.getenv("GITLAB_CI"):
            return True
        return False


class HookLogger:
    """
    Professional logger for git hooks operations.

    Features:
    - Timestamped log entries
    - Color-coded output (when supported)
    - Multiple log levels (info, warning, error, success)
    - File and console output
    - Performance timing

    Usage:
        logger = HookLogger("pre-commit")
        logger.info("Starting validation...")
        logger.success("All checks passed!")
        logger.error("Linting failed", exit_code=1)
    """

    def __init__(self, hook_name: str, log_file: Optional[Path] = None, verbose: bool = False):
        """
        Initialize the logger.

        Args:
            hook_name: Name of the git hook (e.g., "pre-commit")
            log_file: Optional file to write logs to
            verbose: Enable verbose logging
        """
        self.hook_name = hook_name
        self.log_file = log_file
        self.verbose = verbose
        self.use_color = Colors.supports_color()

        # Performance tracking
        self.start_time = datetime.now()
        self.timings = {}

        # Setup logging
        self._setup_logging()

    def _setup_logging(self):
        """Setup Python logging configuration."""
        # Create logger
        self.logger = logging.getLogger(f"hooks.{self.hook_name}")
        self.logger.setLevel(logging.DEBUG if self.verbose else logging.INFO)

        # Remove existing handlers
        self.logger.handlers = []

        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG if self.verbose else logging.INFO)
        console_formatter = logging.Formatter(
            '%(message)s'  # Simple format for console
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)

        # File handler (if log file specified)
        if self.log_file:
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
            file_handler = logging.FileHandler(self.log_file)
            file_handler.setLevel(logging.DEBUG)
            file_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            file_handler.setFormatter(file_formatter)
            self.logger.addHandler(file_handler)

    def _colorize(self, message: str, color: str) -> str:
        """
        Add color to message if terminal supports it.

        Args:
            message: The message to colorize
            color: ANSI color code

        Returns:
            Colorized message or original message
        """
        if self.use_color:
            return f"{color}{message}{Colors.RESET}"
        return message

    def _format(self, level: str, message: str) -> str:
        """
        Format a log message with timestamp and level.

        Args:
            level: Log level (INFO, WARNING, ERROR, SUCCESS)
            message: The message to format

        Returns:
            Formatted message string
        """
        timestamp = datetime.now().strftime("%H:%M:%S")
        level_map = {
            "INFO": (Colors.BLUE, "ℹ️"),
            "WARN": (Colors.YELLOW, "⚠️"),
            "ERROR": (Colors.RED, "❌"),
            "SUCCESS": (Colors.GREEN, "✅"),
        }

        color, icon = level_map.get(level, (Colors.WHITE, "•"))
        formatted_msg = f"{timestamp} {icon} {message}"

        return self._colorize(formatted_msg, color)

    def info(self, message: str):
        """Log an informational message."""
        self.logger.info(self._format("INFO", message))
        self._log_to_file("INFO", message)

    def warning(self, message: str):
        """Log a warning message."""
        self.logger.warning(self._format("WARN", message))
        self._log_to_file("WARN", message)

    def error(self, message: str, exit_code: int = 1):
        """
        Log an error message and optionally exit.

        Args:
            message: Error message to display
            exit_code: Exit code (default: 1). Use None to not exit
        """
        self.logger.error(self._format("ERROR", message))
        self._log_to_file("ERROR", message)
        if exit_code is not None:
            self._log_timing()
            sys.exit(exit_code)

    def success(self, message: str):
        """Log a success message."""
        self.logger.info(self._format("SUCCESS", message))
        self._log_to_file("SUCCESS", message)

    def debug(self, message: str):
        """Log a debug message (only in verbose mode)."""
        if self.verbose:
            self.logger.debug(self._format("DEBUG", message))
            self._log_to_file("DEBUG", message)

    def section(self, title: str):
        """Log a section header."""
        separator = "=" * 60
        self.logger.info("")
        self.logger.info(self._colorize(separator, Colors.BOLD))
        self.logger.info(self._colorize(f"  {title}", Colors.BOLD))
        self.logger.info(self._colorize(separator, Colors.BOLD))
        self.logger.info("")
        self._log_to_file("SECTION", title)

    def sub_section(self, title: str):
        """Log a sub-section header."""
        self.logger.info("")
        self.logger.info(self._colorize(f"▶ {title}", Colors.CYAN))
        self.logger.info("")
        self._log_to_file("SUBSECTION", title)

    # Performance tracking methods
    def start_timing(self, key: str):
        """Start timing an operation."""
        self.timings[key] = {
            "start": datetime.now(),
            "description": key
        }
        self.debug(f"⏱ Timing started: {key}")

    def end_timing(self, key: str) -> float:
        """
        End timing an operation and return duration.

        Args:
            key: The timing key to end

        Returns:
            Duration in seconds
        """
        if key in self.timings:
            elapsed = (datetime.now() - self.timings[key]["start"]).total_seconds()
            self.debug(f"⏱ Timing ended: {key} - {elapsed:.2f}s")
            del self.timings[key]
            return elapsed
        return 0.0

    def time_operation(self, key: str):
        """
        Context manager for timing operations.

        Usage:
            with logger.time_operation("linting"):
                # do linting
        """
        class TimingContext:
            def __init__(self, logger_instance, key):
                self.logger = logger_instance
                self.key = key

            def __enter__(self):
                self.logger.start_timing(self.key)
                return self

            def __exit__(self, exc_type, exc_val, exc_tb):
                self.logger.end_timing(self.key)
                return False

        return TimingContext(self, key)

    def _log_timing(self):
        """Log all operation timings."""
        if self.timings:
            self.warning("Incomplete timings:")
            for key, data in self.timings.items():
                elapsed = (datetime.now() - data["start"]).total_seconds()
                self.warning(f"  • {key}: {elapsed:.2f}s (incomplete)")

    def _log_to_file(self, level: str, message: str):
        """Log message to file if configured."""
        if self.log_file:
            try:
                timestamp = datetime.now().isoformat()
                with open(self.log_file, "a") as f:
                    f.write(f"{timestamp} | {level} | {message}\n")
            except Exception as e:
                # Don't fail if we can't write to log file
                pass

    def get_elapsed_time(self) -> float:
        """
        Get total elapsed time since logger creation.

        Returns:
            Elapsed time in seconds
        """
        return (datetime.now() - self.start_time).total_seconds()

    def log_summary(self):
        """Log a summary of the hook execution."""
        elapsed = self.get_elapsed_time()
        self.success(f"{self.hook_name} completed in {elapsed:.2f}s")
        self._log_timing()
