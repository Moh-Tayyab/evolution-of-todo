# @spec: Git Hooks System for Evolution of Todo Project
# Git utility functions for hooks operations
# Provides cross-platform git operations with proper error handling

import os
import sys
import subprocess
from pathlib import Path
from typing import Optional, List, Tuple, Dict
import logging

logger = logging.getLogger(__name__)


class GitUtils:
    """
    Cross-platform git utility functions for hooks.

    Provides safe git operations with proper error handling,
    timeout support, and cross-platform compatibility.

    All methods are static and can be called without instantiation.

    Usage:
        if not GitUtils.is_git_repository():
            print("Not a git repository")
            sys.exit(1)

        branch = GitUtils.get_current_branch()
        files = GitUtils.get_changed_files()
    """

    # Git command timeout for hooks (in seconds)
    DEFAULT_TIMEOUT = 30

    @staticmethod
    def is_git_repository(path: Path = None) -> bool:
        """
        Check if the current directory (or specified path) is a git repository.

        Args:
            path: Path to check (defaults to current directory)

        Returns:
            True if the directory is a git repository, False otherwise
        """
        check_path = path or Path.cwd()
        git_dir = check_path / ".git"

        # Check for .git directory or git file (worktree)
        return git_dir.exists() or (check_path / ".git").exists()

    @staticmethod
    def get_git_root(path: Path = None) -> Optional[Path]:
        """
        Find the git repository root directory.

        Args:
            path: Starting directory to search from (defaults to current directory)

        Returns:
            Path to git repository root, or None if not found
        """
        current_path = path or Path.cwd()

        # Search up for .git directory
        for parent in [current_path, *current_path.parents]:
            if (parent / ".git").exists():
                return parent
            if (parent / ".git").is_dir():
                return parent

        return None

    @staticmethod
    def run_git_command(
        args: List[str],
        cwd: Optional[Path] = None,
        capture_output: bool = True,
        check: bool = False,
        timeout: int = None
    ) -> subprocess.CompletedProcess:
        """
        Run a git command with proper error handling.

        Args:
            args: Git command arguments (e.g., ["status", "--porcelain"])
            cwd: Working directory (defaults to git root)
            capture_output: Whether to capture stdout/stderr
            check: Whether to raise exception on non-zero exit
            timeout: Command timeout in seconds

        Returns:
            CompletedProcess object with command results

        Raises:
            subprocess.TimeoutExpired: If command times out
            subprocess.CalledProcessError: If check=True and command fails
        """
        # Determine working directory
        work_dir = cwd or GitUtils.get_git_root()
        if not work_dir:
            raise RuntimeError("Not in a git repository")

        # Build command
        command = ["git"] + args

        # Run command
        try:
            result = subprocess.run(
                command,
                cwd=work_dir,
                capture_output=capture_output,
                text=True,
                check=check,
                timeout=timeout or GitUtils.DEFAULT_TIMEOUT
            )
            return result
        except subprocess.TimeoutExpired as e:
            logger.error(f"Git command timed out after {timeout or GitUtils.DEFAULT_TIMEOUT}s: {' '.join(args)}")
            raise
        except FileNotFoundError:
            logger.error("Git command not found. Is git installed?")
            raise

    @staticmethod
    def get_current_branch() -> Optional[str]:
        """
        Get the current git branch name.

        Returns:
            Current branch name, or None if not in a git repo
        """
        try:
            result = GitUtils.run_git_command(["rev-parse", "--abbrev-ref", "HEAD"])
            branch = result.stdout.strip()

            # HEAD indicates detached head state
            if branch == "HEAD":
                return None

            return branch if branch else None
        except (subprocess.CalledProcessError, RuntimeError):
            return None

    @staticmethod
    def get_repository_name() -> Optional[str]:
        """
        Get the repository name from git config.

        Returns:
            Repository name, or None if not configured
        """
        try:
            result = GitUtils.run_git_command(["config", "get", "remote.origin.url"])
            url = result.stdout.strip()

            # Extract repository name from URL
            # Format: https://github.com/username/repo.git or git@github.com:username/repo.git
            if "github.com" in url:
                name = url.split("/")[-1]
                return name.replace(".git", "")
            return None
        except (subprocess.CalledProcessError, RuntimeError):
            return None

    @staticmethod
    def get_changed_files(
        cached: bool = False,
        staged_only: bool = False
    ) -> List[Path]:
        """
        Get list of changed files in the repository.

        Args:
            cached: Get cached files (files in index)
            staged_only: Only get staged files (not unstaged)

        Returns:
            List of changed file paths
        """
        try:
            args = ["diff", "--name-only", "-z"]
            if cached:
                args.append("--cached")
            if not staged_only:
                args.append("diff")

            result = GitUtils.run_git_command(args)

            # Parse null-delimited output
            files = []
            if result.stdout:
                files = [Path(f) for f in result.stdout.strip("\0").split("\0") if f]

            return files
        except (subprocess.CalledProcessError, RuntimeError):
            return []

    @staticmethod
    def get_staged_files() -> List[Path]:
        """
        Get list of staged files (about to be committed).

        Returns:
            List of staged file paths
        """
        return GitUtils.get_changed_files(cached=True, staged_only=True)

    @staticmethod
    def get_unstaged_files() -> List[Path]:
        """
        Get list of unstaged changed files.

        Returns:
            List of unstaged file paths
        """
        return GitUtils.get_changed_files(cached=True, staged_only=False)

    @staticmethod
    def get_committed_files(branch: str = "HEAD", ref: str = "HEAD~1") -> List[Path]:
        """
        Get list of files changed in a commit.

        Args:
            branch: Branch to compare (default: "HEAD")
            ref: Reference point (default: "HEAD~1")

        Returns:
            List of changed file paths
        """
        try:
            result = GitUtils.run_git_command(["diff", "--name-only", "-z", f"{ref}..{branch}"])

            files = []
            if result.stdout:
                files = [Path(f) for f in result.stdout.strip("\0").split("\0") if f]

            return files
        except (subprocess.CalledProcessError, RuntimeError):
            return []

    @staticmethod
    def file_is_staged(filepath: Path) -> bool:
        """
        Check if a specific file is staged for commit.

        Args:
            filepath: Path to the file to check

        Returns:
            True if file is staged, False otherwise
        """
        try:
            # Check if file is in staged changes
            staged_files = GitUtils.get_staged_files()
            return filepath in staged_files
        except RuntimeError:
            return False

    @staticmethod
    def file_is_changed(filepath: Path) -> bool:
        """
        Check if a file has any changes (staged or unstaged).

        Args:
            filepath: Path to the file to check

        Returns:
            True if file has changes, False otherwise
        """
        try:
            changed_files = GitUtils.get_changed_files(cached=True)
            return filepath in changed_files
        except RuntimeError:
            return False

    @staticmethod
    def get_hook_path(hook_name: str) -> Optional[Path]:
        """
        Get the path to a git hook script.

        Args:
            hook_name: Name of the hook (e.g., "pre-commit", "pre-push")

        Returns:
            Path to the hook file, or None if not found
        """
        git_root = GitUtils.get_git_root()
        if not git_root:
            return None

        hook_file = git_root / ".git" / "hooks" / hook_name
        return hook_file if hook_file.exists() else None

    @staticmethod
    def set_hook_path(hook_name: str, hook_path: Path) -> None:
        """
        Install a git hook by creating a symbolic link or copying the file.

        Args:
            hook_name: Name of the hook (e.g., "pre-commit", "pre-push")
            hook_path: Path to the hook script to install
        """
        git_root = GitUtils.get_git_root()
        if not git_root:
            raise RuntimeError("Not in a git repository")

        hooks_dir = git_root / ".git" / "hooks"
        hooks_dir.mkdir(parents=True, exist_ok=True)

        hook_file = hooks_dir / hook_name

        # Remove existing hook
        if hook_file.exists() or hook_file.is_symlink():
            hook_file.unlink()

        # Create symbolic link (preferred for development)
        # On Windows, symlinks require admin rights, so copy as fallback
        try:
            hook_file.symlink_to(hook_path)
        except (OSError, NotImplementedError):
            # Symlink not supported, copy file instead
            import shutil
            shutil.copy2(hook_path, hook_file, follow_symlinks=True)

        # Make hook executable
        hook_file.chmod(0o755)

    @staticmethod
    def is_merge_commit() -> bool:
        """
        Check if the current commit is a merge commit.

        Returns:
            True if current commit is a merge commit, False otherwise
        """
        try:
            # Merge commits have 2+ parents
            result = GitUtils.run_git_command(["rev-parse", "--verify", "-q", "HEAD^{2}"])
            return True
        except (subprocess.CalledProcessError, RuntimeError):
            return False

    @staticmethod
    def get_commit_message() -> Optional[str]:
        """
        Get the current commit message.

        Returns:
            Commit message, or None if not available
        """
        try:
            result = GitUtils.run_git_command(["log", "-1", "--pretty=%B"])
            return result.stdout.strip() if result.stdout.strip() else None
        except (subprocess.CalledProcessError, RuntimeError):
            return None

    @staticmethod
    def get_author_info() -> Tuple[str, str]:
        """
        Get the current git author information.

        Returns:
            Tuple of (name, email) for current git author
        """
        try:
            name_result = GitUtils.run_git_command(["config", "user.name"])
            email_result = GitUtils.run_git_command(["config", "user.email"])
            name = name_result.stdout.strip()
            email = email_result.stdout.strip()
            return (name, email)
        except (subprocess.CalledProcessError, RuntimeError):
            return ("Unknown", "unknown@example.com")

    @staticmethod
    def get_origin_url() -> Optional[str]:
        """
        Get the git origin URL.

        Returns:
            Origin URL, or None if not configured
        """
        try:
            result = GitUtils.run_git_command(["config", "get", "remote.origin.url"])
            url = result.stdout.strip()
            return url if url else None
        except (subprocess.CalledProcessError, RuntimeError):
            return None

    @staticmethod
    def has_uncommitted_changes() -> bool:
        """
        Check if there are any uncommitted changes in the repository.

        Returns:
            True if there are uncommitted changes, False otherwise
        """
        try:
            result = GitUtils.run_git_command(["status", "--porcelain"])
            return bool(result.stdout.strip())
        except (subprocess.CalledProcessError, RuntimeError):
            return False

    @staticmethod
    def has_staged_changes() -> bool:
        """
        Check if there are any staged changes ready to commit.

        Returns:
            True if there are staged changes, False otherwise
        """
        try:
            result = GitUtils.run_git_command(["diff", "--cached", "--quiet"])
            return result.returncode == 1
        except (subprocess.CalledProcessError, RuntimeError):
            return False

    @staticmethod
    def is_detached_head() -> bool:
        """
        Check if repository is in detached HEAD state.

        Returns:
            True if in detached HEAD state, False otherwise
        """
        try:
            result = GitUtils.run_git_command(["symbolic-ref", "--quiet", "HEAD"])
            return result.returncode == 1
        except (subprocess.CalledProcessError, RuntimeError):
            return False

    @staticmethod
    def get_file_history(filepath: Path, limit: int = 10) -> List[str]:
        """
        Get commit history for a specific file.

        Args:
            filepath: Path to the file
            limit: Maximum number of commits to return

        Returns:
            List of commit hashes affecting this file (most recent first)
        """
        try:
            result = GitUtils.run_git_command([
                "log",
                "--pretty=%H",
                f"--max-count={limit}",
                "--",
                str(filepath)
            ])

            commits = result.stdout.strip().split("\n") if result.stdout.strip() else []
            return [c for c in commits if c]
        except (subprocess.CalledProcessError, RuntimeError):
            return []

    @staticmethod
    def get_branches() -> List[str]:
        """
        Get list of all local branches.

        Returns:
            List of branch names
        """
        try:
            result = GitUtils.run_git_command(["branch", "--format=%(refname:short)"])
            branches = result.stdout.strip().split("\n") if result.stdout.strip() else []
            return [b for b in branches if b]
        except (subprocess.CalledProcessError, RuntimeError):
            return []

    @staticmethod
    def get_remote_branches() -> List[str]:
        """
        Get list of all remote branches.

        Returns:
            List of remote branch names
        """
        try:
            result = GitUtils.run_git_command(["branch", "-r", "--format=%(refname:short)"])
            branches = result.stdout.strip().split("\n") if result.stdout.strip() else []
            # Remove "origin/" prefix
            return [b.split("/")[-1] for b in branches if "origin/" in b]
        except (subprocess.CalledProcessError, RuntimeError):
            return []
