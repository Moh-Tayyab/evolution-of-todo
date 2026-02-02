# @spec: Git Hooks System for Evolution of Todo Project
# Professional logging utility for all git hooks operations
# Supports console output with timestamps and colored messages

import sys
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional


class Colors:
    """
    ANSI color codes for terminal output.

    Provides cross-platform color support with automatic fallback
    for terminals that don't support ANSI codes.
    """

    # ANSI color codes
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
    UNDERLINE = "\033[4m"

    @staticmethod
    def supports_color() -> bool:
        """
        Check if the terminal supports color output.

        Returns:
            True if terminal supports colors, False otherwise
        """
        # Check if we're in a terminal
        if hasattr(sys.stdout, 'isatty') and sys.stdout.isatty():
            return True

        # Check CI environment variables (most support colors)
        ci_envs = ["CI", "GITHUB_ACTIONS", "GITLAB_CI", "TRAVIS", "CIRCLECI"]
        if any(sys.getenv(env) for env in ci_envs):
            return True

        # Check NO_COLOR environment variable (standard for disabling colors)
        if sys.getenv("NO_COLOR"):
            return False

        return False


class HookLogger:
    """
    Professional logger for git hooks operations.

    This logger provides:
    - Timestamped log entries with millisecond precision
    - Color-coded output with automatic fallback for non-color terminals
    - Multiple log levels (debug, info, warning, error, success)
    - Optional file logging for audit trails
    - Performance timing for operation tracking
    - Cross-platform compatibility (Windows, macOS, Linux)

    Usage Example:
        >>> logger = HookLogger("pre-commit", verbose=True)
        >>> logger.section("Frontend Validation")
        >>> logger.info("Running ESLint...")
        >>> logger.success("No linting errors found!")
        >>> logger.error("TypeScript compilation failed", exit_code=1)
        >>> logger.log_summary()
    """

    def __init__(
        self,
        hook_name: str,
        log_file: Optional[Path] = None,
        verbose: bool = False,
        log_dir: Optional[Path] = None
    ):
        """
        Initialize the hook logger.

        Args:
            hook_name: Name of the git hook (e.g., "pre-commit", "pre-push")
            log_file: Optional specific file to write logs to
            verbose: Enable verbose debug logging
            log_dir: Optional directory for log files (defaults to .claude/logs/)
        """
        self.hook_name = hook_name
        self.verbose = verbose
        self.use_color = Colors.supports_color()

        # Performance tracking
        self.start_time = datetime.now()
        self.timings = {}

        # Determine log file path
        if log_file:
            self.log_file = log_file
        elif log_dir:
            log_dir = Path(log_dir)
            log_dir.mkdir(parents=True, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            self.log_file = log_dir / f"{hook_name}_{timestamp}.log"
        else:
            # Default to .claude/logs directory
            logs_dir = Path(".claude/logs")
            logs_dir.mkdir(parents=True, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            self.log_file = logs_dir / f"{hook_name}_{timestamp}.log"

        # Setup Python logging
        self._setup_logging()

    def _setup_logging(self):
        """Setup Python logging configuration with custom formatters."""
        # Create logger with unique name
        logger_name = f"claude_hooks.{self.hook_name}"
        self.logger = logging.getLogger(logger_name)
        self.logger.setLevel(logging.DEBUG)  # Capture all levels

        # Remove any existing handlers to avoid duplicates
        self.logger.handlers.clear()

        # Console handler with colored output
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG if self.verbose else logging.INFO)

        # Simple formatter for console (colors added separately)
        console_formatter = logging.Formatter('%(message)s')
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)

        # File handler with detailed format
        if self.log_file:
            # Ensure log directory exists
            self.log_file.parent.mkdir(parents=True, exist_ok=True)

            file_handler = logging.FileHandler(self.log_file, encoding='utf-8')
            file_handler.setLevel(logging.DEBUG)

            # Detailed format with timestamp, level, logger name
            file_formatter = logging.Formatter(
                '%(asctime)s.%(msecs)03d | %(name)-12s | %(levelname)-8s | %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            file_handler.setFormatter(file_formatter)
            self.logger.addHandler(file_handler)

    def _colorize(self, message: str, color: str) -> str:
        """
        Add ANSI color codes to a message.

        Args:
            message: The message to colorize
            color: ANSI color code from Colors class

        Returns:
            Colorized message with reset code, or original message if colors disabled
        """
        if self.use_color:
            return f"{color}{message}{Colors.RESET}"
        return message

    def _format(self, level: str, message: str, icon: str = "•") -> str:
        """
        Format a log message with timestamp, level indicator, and icon.

        Args:
            level: Log level (DEBUG, INFO, WARN, ERROR, SUCCESS)
            message: The message to format
            icon: Icon/emoji to display (default: bullet)

        Returns:
            Formatted message string with timestamp and color coding
        """
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]  # Include milliseconds

        # Color and icon mapping for each level
        level_config = {
            "DEBUG": (Colors.DIM, "🔍"),
            "INFO": (Colors.BLUE, "ℹ️"),
            "WARN": (Colors.YELLOW, "⚠️"),
            "ERROR": (Colors.RED, "❌"),
            "SUCCESS": (Colors.GREEN, "✅"),
            "SECTION": (Colors.BOLD, "▶"),
            "SUBSECTION": (Colors.CYAN, "▹"),
        }

        color, emoji = level_config.get(level, (Colors.WHITE, icon))

        # Format: timestamp | icon | message
        formatted = f"{timestamp} {emoji} {message}"

        return self._colorize(formatted, color)

    # ========== Public Logging Methods ==========

    def debug(self, message: str):
        """
        Log a debug message (only shown in verbose mode).

        Args:
            message: Debug message to log
        """
        if self.verbose:
            self.logger.debug(self._format("DEBUG", message))
        self._log_to_file("DEBUG", message)

    def info(self, message: str):
        """
        Log an informational message.

        Args:
            message: Info message to log
        """
        self.logger.info(self._format("INFO", message))
        self._log_to_file("INFO", message)

    def warning(self, message: str):
        """
        Log a warning message.

        Args:
            message: Warning message to log
        """
        self.logger.warning(self._format("WARN", message))
        self._log_to_file("WARN", message)

    def error(self, message: str, exit_code: int = 1, exception: Optional[Exception] = None):
        """
        Log an error message and optionally exit the program.

        Args:
            message: Error message to display
            exit_code: Exit code to use (1 = failure, 0 = success). Use None to not exit
            exception: Optional exception object for additional context
        """
        # Log the main error
        self.logger.error(self._format("ERROR", message))

        # Log exception details if provided
        if exception:
            self.debug(f"Exception type: {type(exception).__name__}")
            self.debug(f"Exception details: {str(exception)}")

        # Write to file
        self._log_to_file("ERROR", message)

        # Exit with specified code if provided
        if exit_code is not None:
            self._log_timing()
            sys.exit(exit_code)

    def success(self, message: str):
        """
        Log a success message.

        Args:
            message: Success message to log
        """
        self.logger.info(self._format("SUCCESS", message))
        self._log_to_file("SUCCESS", message)

    def section(self, title: str):
        """
        Log a major section header with visual separators.

        Args:
            title: Section title to display
        """
        separator = "=" * 70
        self.logger.info("")
        self.logger.info(self._colorize(separator, Colors.BOLD))
        self.logger.info(self._colorize(f"  {title}  ", Colors.BOLD))
        self.logger.info(self._colorize(separator, Colors.BOLD))
        self.logger.info("")
        self._log_to_file("SECTION", title)

    def sub_section(self, title: str):
        """
        Log a sub-section header.

        Args:
            title: Sub-section title to display
        """
        self.logger.info("")
        self.logger.info(self._format("SUBSECTION", title, "▶"))
        self.logger.info("")
        self._log_to_file("SUBSECTION", title)

    # ========== Performance Tracking ==========

    def start_timing(self, key: str):
        """
        Start timing an operation.

        Args:
            key: Unique identifier for this operation (e.g., "frontend_lint")
        """
        self.timings[key] = {
            "start": datetime.now(),
            "description": key
        }
        self.debug(f"⏱️  Started timing: {key}")

    def end_timing(self, key: str) -> float:
        """
        End timing an operation and return the duration.

        Args:
            key: The timing key to end

        Returns:
            Duration in seconds (float)
        """
        if key not in self.timings:
            self.warning(f"Timing key '{key}' not found (was start_timing called?)")
            return 0.0

        elapsed = (datetime.now() - self.timings[key]["start"]).total_seconds()
        self.debug(f"⏱️  Ended timing: {key} - {elapsed:.3f}s")
        del self.timings[key]
        return elapsed

    def get_timing(self, key: str) -> float:
        """
        Get the elapsed time for an in-progress operation.

        Args:
            key: The timing key to check

        Returns:
            Elapsed time in seconds since timing started
        """
        if key in self.timings:
            return (datetime.now() - self.timings[key]["start"]).total_seconds()
        return 0.0

    def time_operation(self, key: str):
        """
        Context manager for timing operations automatically.

        Usage:
            with logger.time_operation("eslint"):
                # Run eslint
                result = subprocess.run(["eslint", "."])

        Args:
            key: Name to use for timing this operation

        Yields:
            Context manager for use with 'with' statement
        """
        class TimingContext:
            def __init__(self, logger_instance, timing_key):
                self.logger = logger_instance
                self.key = timing_key

            def __enter__(self):
                self.logger.start_timing(self.key)
                return self

            def __exit__(self, exc_type, exc_val, exc_tb):
                self.logger.end_timing(self.key)
                return False  # Don't suppress exceptions

        return TimingContext(self, key)

    def _log_timing(self):
        """Log all operation timings for debugging."""
        if self.timings:
            self.warning("Incomplete timings (operations not properly ended):")
            for key, data in self.timings.items():
                elapsed = (datetime.now() - data["start"]).total_seconds()
                self.warning(f"  • {key}: {elapsed:.2f}s (incomplete)")

    # ========== Summary Reporting ==========

    def get_elapsed_time(self) -> float:
        """
        Get total elapsed time since logger creation.

        Returns:
            Total elapsed time in seconds
        """
        return (datetime.now() - self.start_time).total_seconds()

    def log_summary(self):
        """
        Log a comprehensive summary of hook execution.

        Includes:
        - Total execution time
        - All operation timings
        - Final status
        """
        elapsed = self.get_elapsed_time()

        self.logger.info("")
        self.logger.info(self._colorize("-" * 70, Colors.DIM))
        self.logger.info(self._colorize(
            f"  Hook: {self.hook_name} | Time: {elapsed:.2f}s | Status: Complete  ",
            Colors.BOLD
        ))
        self.logger.info(self._colorize("-" * 70, Colors.DIM))
        self.logger.info("")

        # Log timing summary if we have any
        if hasattr(self, '_timings_summary') and self._timings_summary:
            self.logger.info("Performance Summary:")
            for operation, duration in self._timings_summary.items():
                status_icon = "✓" if duration < 1.0 else "⚠️" if duration < 5.0 else "✗"
                self.logger.info(f"  {status_icon} {operation}: {duration:.3f}s")
            self.logger.info("")

    def _log_to_file(self, level: str, message: str):
        """
        Append a log message to the log file.

        Args:
            level: Log level (DEBUG, INFO, WARN, ERROR, SUCCESS, SECTION)
            message: The message content
        """
        if self.log_file:
            try:
                timestamp = datetime.now().isoformat(timespec='milliseconds')
                with open(self.log_file, "a", encoding="utf-8") as f:
                    f.write(f"{timestamp} | {level:8s} | {message}\n")
            except (IOError, OSError) as e:
                # Don't fail hooks if we can't write to log file
                # Just print a warning to stderr
                print(f"Warning: Could not write to log file: {e}", file=sys.stderr)
