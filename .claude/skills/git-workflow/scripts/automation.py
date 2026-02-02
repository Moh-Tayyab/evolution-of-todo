#!/usr/bin/env python3
#!/usr/bin/env python3
"""
automation.py

Automation script for Claude Code skills automation.

Author: Evolution of Todo Project
Version: 1.0.0
License: MIT
"""

"""
Git Workflow Automation Tools
============================

Production-grade tools for automating Git workflows, branch management,
commit generation, and PR management.

Features:
- Branch creation with naming conventions
- Conventional commit generation
- Pull request title/description generation
- Git hook installation and management
- Release branch automation
- Changelog generation
- Git statistics and analysis

Usage:
    python -m git_automation create-branch --type feature --ticket PROJ-123
    python -m git_automation commit --type feat --message "Add user authentication"
    python -m git_automation create-pr --title "Fix login redirect issue"
    python -m git_automation install-hooks

Author: Claude Code Engineering Team
Version: 1.0.0
License: MIT
"""

import os
import re
import sys
import json
import shutil
import argparse
import subprocess
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from enum import Enum


class CommitType(Enum):
    """Conventional commit types."""
    FEAT = "feat"          # New feature
    FIX = "fix"            # Bug fix
    DOCS = "docs"          # Documentation
    STYLE = "style"        # Code style (formatting, etc.)
    REFACTOR = "refactor"  # Code refactoring
    PERF = "perf"          # Performance improvement
    TEST = "test"          # Adding tests
    CHORE = "chore"        # Maintenance
    CI = "ci"              # CI/CD changes
    BUILD = "build"        # Build system
    REVERT = "revert"      # Revert commit


class BranchType(Enum):
    """Branch types with naming conventions."""
    FEATURE = "feature"      # User stories
    BUGFIX = "bugfix"       # Bug fixes
    HOTFIX = "hotfix"       # Production hotfixes
    RELEASE = "release"     # Release branches
    EXPERIMENT = "experiment"  # Experimental features


@dataclass
class Commit:
    """Represents a Git commit."""
    type: CommitType
    scope: Optional[str]
    subject: str
    body: Optional[str] = None
    footer: Optional[str] = None
    breaking_change: bool = False

    def format(self) -> str:
        """Format as conventional commit message."""
        parts = [self.type.value]

        if self.scope:
            parts.append(f"({self.scope})")

        if self.breaking_change:
            parts.append("!")

        parts.append(f": {self.subject}")

        message = "".join(parts)

        if self.body:
            message += f"\n\n{self.body}"

        if self.breaking_change:
            message += "\n\nBREAKING CHANGE: The API has been changed"

        if self.footer:
            message += f"\n\n{self.footer}"

        return message


@dataclass
class PRInfo:
    """Pull Request information."""
    title: str
    body: str
    branch: str
    base: str = "main"
    labels: List[str] = field(default_factory=list)
    reviewers: List[str] = field(default_factory=list)
    draft: bool = False


class GitAutomation:
    """
    Automate Git workflows.

    Provides methods for:
    - Branch creation with conventions
    - Conventional commit generation
    - PR creation
    - Git hooks management
    """

    CONVENTIONAL_COMMIT_PATTERN = r"^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?!?: .+$"

    def __init__(self, repo_path: Path = Path.cwd()):
        """Initialize Git automation tool."""
        self.repo_path = repo_path
        self.git_dir = repo_path / ".git"

        if not self.git_dir.exists():
            raise ValueError(f"Not a Git repository: {repo_path}")

    def run_git(self, *args: str, check: bool = True, capture: bool = False) -> subprocess.CompletedProcess:
        """
        Run a Git command.

        Args:
            *args: Git command arguments
            check: Whether to raise exception on non-zero exit
            capture: Whether to capture output

        Returns:
            CompletedProcess with command result
        """
        cmd = ["git"] + list(args)
        cwd = self.repo_path

        if capture:
            result = subprocess.run(
                cmd,
                cwd=cwd,
                capture_output=True,
                text=True,
                check=check
            )
        else:
            result = subprocess.run(cmd, cwd=cwd, check=check, capture_output=capture)

        return result

    def create_branch(
        self,
        branch_type: BranchType,
        ticket_id: Optional[str] = None,
        description: str = "",
        from_branch: str = "develop"
    ) -> str:
        """
        Create a new branch with proper naming convention.

        Args:
            branch_type: Type of branch (feature, bugfix, etc.)
            ticket_id: Optional ticket ID (e.g., PROJ-123)
            description: Branch description
            from_branch: Base branch to branch from

        Returns:
            Created branch name
        """
        # Fetch latest changes
        print(f"Fetching latest changes from origin/{from_branch}...")
        self.run_git("fetch", "origin")

        # Checkout base branch
        print(f"Checking out {from_branch}...")
        self.run_git("checkout", from_branch)
        self.run_git("pull", "origin", from_branch)

        # Generate branch name
        if ticket_id:
            branch_name = f"{branch_type.value}/{ticket_id}-{self._slugify(description)}"
        else:
            branch_name = f"{branch_type.value}/{self._slugify(description)}"

        # Create and checkout branch
        print(f"Creating branch: {branch_name}")
        self.run_git("checkout", "-b", branch_name)

        # Push to origin
        print(f"Pushing branch to origin...")
        self.run_git("push", "-u", "origin", branch_name)

        return branch_name

    def create_commit(
        self,
        commit_type: CommitType,
        subject: str,
        scope: Optional[str] = None,
        body: Optional[str] = None,
        footer: Optional[str] = None,
        breaking_change: bool = False,
        stage_all: bool = True
    ) -> str:
        """
        Create a conventional commit.

        Args:
            commit_type: Type of commit
            subject: Commit subject (short description)
            scope: Optional scope (e.g., "auth", "database")
            body: Optional detailed body
            footer: Optional footer (e.g., "Closes #123")
            breaking_change: Whether this is a breaking change
            stage_all: Whether to stage all changes

        Returns:
            Formatted commit message
        """
        # Stage changes
        if stage_all:
            self.run_git("add", "-A")

        # Create commit object
        commit = Commit(
            type=commit_type,
            scope=scope,
            subject=subject,
            body=body,
            footer=footer,
            breaking_change=breaking_change
        )

        message = commit.format()

        # Execute commit
        self.run_git("commit", "-m", message)

        return message

    def create_pr(
        self,
        title: str,
        body: str,
        branch: str,
        base: str = "main",
        labels: List[str] = None,
        reviewers: List[str] = None,
        draft: bool = False
    ) -> str:
        """
        Create a pull request using gh CLI.

        Args:
            title: PR title
            body: PR body/description
            branch: Source branch
            base: Target branch
            labels: PR labels
            reviewers: PR reviewers
            draft: Whether to create as draft

        Returns:
            PR URL
        """
        # Check if gh CLI is installed
        try:
            subprocess.run(["gh", "--version"], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise RuntimeError(
                "GitHub CLI (gh) is not installed. "
                "Install it from: https://cli.github.com/"
            )

        # Build gh command
        cmd = [
            "gh", "pr", "create",
            "--title", title,
            "--body", body,
            "--base", base,
            "--head", branch,
        ]

        if labels:
            cmd.extend(["--label", ",".join(labels)])

        if reviewers:
            cmd.extend(["--reviewer", ",".join(reviewers)])

        if draft:
            cmd.append("--draft")

        # Execute pr creation
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)

        # Parse PR URL from output
        pr_url_match = re.search(r"https://github\.com/[^/]+/[^/]+/pull/\d+", result.stdout)
        if pr_url_match:
            return pr_url_match.group(0)

        # Try alternative pattern
        lines = result.stdout.split('\n')
        for line in lines:
            if "https://" in line:
                return line.strip()

        return ""

    def install_hooks(self, hook_type: str = "conventional-commits") -> None:
        """
        Install Git hooks.

        Args:
            hook_type: Type of hooks to install
                - "conventional-commits": Validate commit message format
                - "pre-commit": Run pre-commit checks
                - "all": Install all hooks
        """
        hooks_dir = self.git_dir / "hooks"
        hooks_dir.mkdir(exist_ok=True)

        if hook_type in ["conventional-commits", "all"]:
            self._install_commit_msg_hook(hooks_dir)

        if hook_type in ["pre-commit", "all"]:
            self._install_pre_commit_hook(hooks_dir)

        print(f"✅ Git hooks installed successfully")

    def _install_commit_msg_hook(self, hooks_dir: Path) -> None:
        """Install commit-msg hook for conventional commits."""
        hook_content = '''#!/bin/bash
# Conventional Commits commit-msg hook

COMMIT_MSG_FILE=$1

# Get the commit message
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check conventional commit pattern
if ! echo "$COMMIT_MSG" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?!?: .+$'; then
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Conventional commits format:"
    echo "  <type>(<scope>): <subject>"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert"
    echo ""
    echo "Examples:"
    echo "  feat: Add user authentication"
    echo "  fix(auth): Resolve login redirect issue"
    echo "  feat(api): Implement rate limiting"
    echo ""
    echo "Learn more: https://www.conventionalcommits.org/"
    exit 1
fi

# Check subject length (max 72 chars recommended for title)
SUBJECT=$(echo "$COMMIT_MSG" | head -n1)
if [ ${#SUBJECT} -gt 72 ]; then
    echo "⚠️  Warning: Subject line is too long (${#SUBJECT} characters, max 72 recommended)"
fi
'''

        hook_path = hooks_dir / "commit-msg"
        hook_path.write_text(hook_content)
        hook_path.chmod(0o755)

    def _install_pre_commit_hook(self, hooks_dir: Path) -> None:
        """Install pre-commit hook for code quality checks."""
        hook_content = '''#!/bin/bash
# Pre-commit hook for code quality

# Run linter
if command -v ruff &> /dev/null; then
    echo "🔍 Running linter..."
    ruff check .
    if [ $? -ne 0 ]; then
        echo "❌ Linter failed. Fix issues before committing."
        exit 1
    fi
fi

# Run type checker
if command -v mypy &> /dev/null; then
    echo "🔍 Running type checker..."
    mypy app/
    if [ $? -ne 0 ]; then
        echo "⚠️  Type checker failed. Consider fixing type issues."
    fi
fi

# Run tests
if command -v pytest &> /dev/null; then
    echo "🧪 Running tests..."
    pytest --cov=app --cov-fail-under=80 -q
    if [ $? -ne 0 ]; then
        echo "❌ Tests failed or coverage below 80%."
        exit 1
    fi
fi

echo "✅ All pre-commit checks passed!"
'''

        hook_path = hooks_dir / "pre-commit"
        hook_path.write_text(hook_content)
        hook_path.chmod(0o755)

    def generate_changelog(self, from_tag: Optional[str] = None) -> str:
        """
        Generate changelog from commit history.

        Args:
            from_tag: Starting tag (None for all commits)

        Returns:
            Generated changelog markdown
        """
        # Get commits since tag
        if from_tag:
            result = self.run_git(
                "log", f"{from_tag}..HEAD",
                "--pretty=format:%h|%s|%an|%ad",
                "--date=short",
                capture=True
            )
        else:
            result = self.run_git(
                "log",
                "--pretty=format:%h|%s|%an|%ad",
                "--date=short",
                "-20",
                capture=True
            )

        lines = result.stdout.strip().split('\n')

        # Parse commits
        commits = []
        for line in lines:
            parts = line.split('|')
            if len(parts) == 4:
                commits.append({
                    'hash': parts[0],
                    'subject': parts[1],
                    'author': parts[2],
                    'date': parts[3],
                })

        # Group by type
        sections = {
            'feat': [],
            'fix': [],
            'docs': [],
            'style': [],
            'refactor': [],
            'perf': [],
            'test': [],
            'chore': [],
        }

        for commit in commits:
            subject = commit['subject']
            for commit_type in sections.keys():
                if subject.startswith(f"{commit_type}:") or subject.startswith(f"{commit_type}("):
                    sections[commit_type].append(commit)
                    break
            else:
                sections['chore'].append(commit)

        # Generate markdown
        changelog = [f"# Changelog\n\nGenerated: {datetime.now().strftime('%Y-%m-%d')}\n"]

        for section, commits_list in sections.items():
            if commits_list:
                type_emoji = {
                    'feat': '✨',
                    'fix': '🐛',
                    'docs': '📝',
                    'style': '💄',
                    'refactor': '♻️',
                    'perf': '⚡',
                    'test': '✅',
                    'chore': '♻️',
                }

                changelog.append(f"## {section_emoji.get(section, '')} {section.capitalize()}\n")

                for commit in commits_list:
                    changelog.append(f"- {commit['subject']} ({commit['hash']})")

                changelog.append("")

        return "\n".join(changelog)

    def get_repo_stats(self) -> Dict[str, any]:
        """
        Get repository statistics.

        Returns:
            Dictionary with repo statistics
        """
        # Get commit count
        result = self.run_git("rev-list", "--count", "HEAD", capture=True)
        commit_count = int(result.stdout.strip())

        # Get contributor count
        result = self.run_git("shortlog", "-s", "-n", capture=True)
        contributors = len(result.stdout.strip().split('\n'))

        # Get branches
        result = self.run_git("branch", "-a", capture=True)
        branches = [b.strip() for b in result.stdout.strip().split('\n') if b.strip()]

        # Get latest tag
        result = self.run_git("describe", "--tags", "--abbrev=0", capture=True)
        latest_tag = result.stdout.strip() if result.stdout.strip() else None

        return {
            'commit_count': commit_count,
            'contributor_count': contributors,
            'branch_count': len(branches),
            'latest_tag': latest_tag,
            'branches': branches,
        }

    def _slugify(self, text: str) -> str:
        """Convert text to slug format."""
        # Convert to lowercase and replace spaces with hyphens
        slug = text.lower().strip()
        # Replace non-alphanumeric characters with hyphens
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        return slug


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Git Workflow Automation - Automate Git operations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s create-branch --type feature --ticket PROJ-123 --description "Add user auth"
  %(prog)s create-branch --type hotfix --description "Fix production bug"
  %(prog)s commit --type feat --message "Add user authentication"
  %(prog)s commit --type fix --scope auth --message "Fix login redirect"
  %(prog)s create-pr --title "Fix login bug" --body "Resolves #123"
  %(prog)s install-hooks --type conventional-commits
  %(prog)s changelog --from-tag v1.0.0
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # create-branch command
    branch_parser = subparsers.add_parser('create-branch', help='Create a new branch')
    branch_parser.add_argument('--type', '-t', choices=[e.value for e in BranchType],
                              default=BranchType.FEATURE.value, help='Branch type')
    branch_parser.add_argument('--ticket', help='Ticket ID (e.g., PROJ-123)')
    branch_parser.add_argument('--description', '-d', required=True, help='Branch description')
    branch_parser.add_argument('--from', '-f', default='develop', help='Base branch')

    # commit command
    commit_parser = subparsers.add_parser('commit', help='Create a commit')
    commit_parser.add_argument('--type', '-t', choices=[e.value for e in CommitType],
                              required=True, help='Commit type')
    commit_parser.add_argument('--message', '-m', required=True, help='Commit subject')
    commit_parser.add_argument('--scope', '-s', help='Commit scope')
    commit_parser.add_argument('--body', '-b', help='Commit body')
    commit_parser.add_argument('--footer', help='Commit footer (e.g., "Closes #123")')
    commit_parser.add_argument('--breaking', '-b', action='store_true',
                        help='Mark as breaking change')

    # create-pr command
    pr_parser = subparsers.add_parser('create-pr', help='Create a pull request')
    pr_parser.add_argument('--title', required=True, help='PR title')
    pr_parser.add_argument('--body', help='PR body/description')
    pr_parser.add_argument('--branch', help='Source branch (default: current)')
    pr_parser.add_argument('--base', default='main', help='Target branch')
    pr_parser.add_argument('--labels', help='Comma-separated labels')
    pr_parser.add_argument('--reviewers', help='Comma-separated reviewers')
    pr_parser.add_argument('--draft', action='store_true', help='Create as draft PR')

    # install-hooks command
    hooks_parser = subparsers.add_parser('install-hooks', help='Install Git hooks')
    hooks_parser.add_argument('--type', choices=['conventional-commits', 'pre-commit', 'all'],
                              default='conventional-commits', help='Type of hooks')

    # changelog command
    changelog_parser = subparsers.add_parser('changelog', help='Generate changelog')
    changelog_parser.add_argument('--from-tag', help='Starting tag')
    changelog_parser.add_argument('--output', '-o', type=Path, help='Output file')

    # stats command
    subparsers.add_parser('stats', help='Show repository statistics')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Initialize Git automation
    try:
        git_automation = GitAutomation()
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Execute command
    if args.command == 'create-branch':
        branch_type = BranchType(args.type)
        branch_name = git_automation.create_branch(
            branch_type=branch_type,
            ticket_id=args.ticket,
            description=args.description,
            from_branch=args.from
        )
        print(f"\n✅ Branch created: {branch_name}")

    elif args.command == 'commit':
        commit_type = CommitType(args.type)
        message = git_automation.create_commit(
            commit_type=commit_type,
            subject=args.message,
            scope=args.scope,
            body=args.body,
            footer=args.footer,
            breaking_change=args.breaking
        )
        print(f"\n✅ Commit created:\n{message}")

    elif args.command == 'create-pr':
        labels = args.labels.split(',') if args.labels else []
        reviewers = args.reviewers.split(',') if args.reviewers else []

        # Get current branch if not specified
        if not args.branch:
            result = git_automation.run_git('rev-parse', '--abbrev-ref', 'HEAD', capture=True)
            branch = result.stdout.strip()
        else:
            branch = args.branch

        pr_url = git_automation.create_pr(
            title=args.title,
            body=args.body or "",
            branch=branch,
            base=args.base,
            labels=labels,
            reviewers=reviewers,
            draft=args.draft
        )
        print(f"\n✅ Pull request created: {pr_url}")

    elif args.command == 'install-hooks':
        git_automation.install_hooks(args.type)

    elif args.command == 'changelog':
        changelog = git_automation.generate_changelog(args.from_tag)

        if args.output:
            args.output.write_text(changelog)
            print(f"\n✅ Changelog written to {args.output}")
        else:
            print("\n" + changelog)

    elif args.command == 'stats':
        stats = git_automation.get_repo_stats()
        print("\n📊 Repository Statistics")
        print("=" * 40)
        print(f"Total commits: {stats['commit_count']}")
        print(f"Contributors: {stats['contributor_count']}")
        print(f"Branches: {stats['branch_count']}")
        if stats['latest_tag']:
            print(f"Latest tag: {stats['latest_tag']}")


if __name__ == '__main__':
    main()
