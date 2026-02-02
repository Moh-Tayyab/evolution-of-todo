# Professional Git Hooks System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Cross-platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-lightgrey.svg)](https://github.com/)

A professional, cross-platform git hooks system for the Evolution of Todo project. Provides automated code quality checks, testing, and environment synchronization.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Hooks](#available-hooks)
- [Usage](#usage)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Features

- **Pre-commit Hook** (< 10s): Fast validation with ESLint, TypeScript, Ruff, format checks
- **Pre-push Hook** (< 30s): Comprehensive testing with coverage thresholds, build verification
- **Post-checkout Hook**: Auto-install dependencies, show branch info on switch
- **Post-merge Hook**: Environment sync, cache cleanup, migration notifications
- **Cross-platform**: Works on Linux, macOS, and Windows
- **Configurable**: YAML-based configuration with environment variable overrides
- **Professional Logging**: Colored output, timestamps, performance tracking
- **Modular Design**: Reusable utility modules for easy extension

## Installation

### Quick Install

```bash
# From project root
cd .claude/hooks
python install.py
```

### Install Options

```bash
# List current hook status
python install.py --list

# Force reinstall (overwrite existing hooks)
python install.py --force

# Uninstall all hooks
python install.py --uninstall
```

### Manual Install

If the installer doesn't work, create symlinks manually:

```bash
# Linux/macOS
ln -s ../../.claude/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Repeat for other hooks: pre-push, post-checkout, post-merge
```

## Configuration

### Config File Location

`.claude/hooks/config.yaml`

### Environment Variables

Override config with environment variables (prefix: `GIT_HOOKS_`):

```bash
# Enable verbose logging
export GIT_HOOKS_VERBOSE=true

# Disable pre-commit hook
export GIT_HOOKS_PRE_COMMIT_ENABLED=false

# Set coverage threshold to 80%
export GIT_HOOKS_COVERAGE_THRESHOLD=80

# Increase pre-push timeout to 45 seconds
export GIT_HOOKS_PRE_PUSH_TIMEOUT=45
```

### Key Configuration Options

```yaml
# Pre-commit: Fast validation (< 10s)
pre_commit:
  enabled: true
  timeout_seconds: 10

# Pre-push: Comprehensive checks (< 30s)
pre_push:
  enabled: true
  timeout_seconds: 30
  test_coverage_threshold: 70

# Frontend settings
frontend:
  lint:
    enabled: true
    fix_on_error: false
  typecheck:
    enabled: true
  no_console_log:
    enabled: true

# Backend settings
backend:
  lint:
    enabled: true
  mypy:
    enabled: true
    strict_mode: true
```

## Available Hooks

### Pre-commit Hook

Runs before every commit. Fast validation to ensure code quality.

**What it checks:**
- Frontend: ESLint, TypeScript syntax, console.log detection, Prettier format
- Backend: Ruff lint, import sorting, format validation
- Secrets: Basic detection of API keys, passwords, tokens

**Performance:** Target < 10 seconds

**Bypass:** `git commit --no-verify`

### Pre-push Hook

Runs before pushing to remote. Comprehensive validation.

**What it checks:**
- Frontend: Full TypeScript check, unit tests, production build
- Backend: mypy strict type check, pytest with coverage
- Coverage: Enforces minimum coverage threshold (default: 70%)
- Security: Dependency vulnerability checks

**Performance:** Target < 30 seconds

**Bypass:** `git push --no-verify`

### Post-checkout Hook

Runs after `git checkout` (branch switch).

**What it does:**
- Displays current branch information
- Auto-installs dependencies if package files changed
- Clears build caches
- Shows recent commits

**No bypass needed** (non-blocking)

### Post-merge Hook

Runs after `git merge` completes.

**What it does:**
- Shows merge summary
- Checks for package/dependency changes
- Notifies of environment config changes
- Clears caches
- Alerts about deployment-related commits

**No bypass needed** (non-blocking)

### Pre-execute Hook (Custom)

Runs custom commands before operations.

**Configuration:**

```yaml
pre_execute:
  enabled: true
  commands:
    - echo "Starting build..."
    - npm run pre-build
```

### Post-execute Hook (Custom)

Runs custom commands after operations.

**Configuration:**

```yaml
post_execute:
  enabled: true
  commands:
    - echo "Build complete!"
    - npm run notify-build
```

## Usage

### Daily Workflow

```bash
# 1. Make changes to code
vim src/app.ts

# 2. Stage changes
git add .

# 3. Commit (pre-commit hook runs automatically)
git commit -m "feat: add new feature"

# 4. Push (pre-push hook runs automatically)
git push origin main
```

### Branch Switching

```bash
# Post-checkout hook runs automatically
git checkout develop

# Output:
# ✓ Branch: develop
# ✓ Latest commit: abc1234 Add new feature
# ✓ Working directory: clean
```

### Merging Changes

```bash
# Post-merge hook runs automatically
git merge feature-branch

# Output:
# ✓ Merge Summary
# ✓ Merged 5 commit(s)
# ⚠ Package files changed during merge
```

## Development

### Project Structure

```
.claude/hooks/
├── config.yaml           # Configuration file
├── install.py            # Installation script
├── README.md             # This file
├── pre-commit            # Pre-commit hook (executable)
├── pre-push              # Pre-push hook (executable)
├── post-checkout         # Post-checkout hook (executable)
├── post-merge            # Post-merge hook (executable)
├── pre-execute           # Pre-execute hook (executable)
├── post-execute          # Post-execute hook (executable)
└── utils/
    ├── logger.py         # Professional logging with colors
    ├── config.py         # Configuration management
    ├── git.py            # Git operations
    ├── frontend.py       # Frontend (Next.js/npm) utilities
    └── backend.py        # Backend (Python/FastAPI) utilities
```

### Adding a New Hook

1. Create hook file in `.claude/hooks/`:

```python
#!/usr/bin/env python3
# @spec: Git Hooks System for Evolution of Todo Project
# My custom hook

from utils.logger import HookLogger
from utils.config import HookConfig

def main():
    logger = HookLogger("my-hook")
    config = HookConfig()

    # Your hook logic here
    logger.info("Running my custom hook...")
    return 0

if __name__ == "__main__":
    exit(main())
```

2. Make it executable:

```bash
chmod +x .claude/hooks/my-hook
```

3. Add to `install.py` HOOKS list:

```python
HOOKS = [
    "pre-commit",
    "pre-push",
    # ...
    "my-hook",  # Add here
]
```

4. Install:

```bash
python .claude/hooks/install.py
```

### Utility Modules

#### Logger (`utils/logger.py`)

Professional logging with colors, timestamps, and performance tracking.

```python
from utils.logger import HookLogger

logger = HookLogger("my-hook", verbose=True)

logger.section("My Section")
logger.info("Informational message")
logger.success("Operation succeeded")
logger.warning("Warning message")
logger.error("Error occurred", exit_code=1)

# Performance tracking
with logger.time_operation("my_operation"):
    # Do something
    pass

# Summary
logger.log_summary()
```

#### Config (`utils/config.py`)

Configuration management with YAML and environment variable support.

```python
from utils.config import HookConfig

config = HookConfig()

# Check if hook is enabled
if config.is_hook_enabled("pre_commit"):
    # Run pre-commit logic
    pass

# Get timeout
timeout = config.get_hook_timeout("pre_push")

# Access nested config
frontend_lint = config.frontend["lint"]
```

#### Git (`utils/git.py`)

Cross-platform git operations.

```python
from utils.git import GitUtils

# Get staged files
staged = GitUtils.get_staged_files()

# Get current branch
branch = GitUtils.get_current_branch()

# Get git root
root = GitUtils.get_git_root()

# Run git command
result = GitUtils.run_git_command(["status", "--short"])
```

#### Frontend (`utils/frontend.py`)

Frontend (Next.js/npm) operations.

```python
from utils.frontend import FrontendUtils

# Detect package manager
pm = FrontendUtils.detect_package_manager(frontend_dir)

# Run lint
success, output = FrontendUtils.run_lint(frontend_dir, package_manager=pm)

# Run type check
success, output = FrontendUtils.run_type_check(frontend_dir)

# Build project
success, output = FrontendUtils.build_project(frontend_dir)

# Find console.logs
files = FrontendUtils.find_console_logs(frontend_dir)
```

#### Backend (`utils/backend.py`)

Backend (Python/FastAPI) operations.

```python
from utils.backend import BackendUtils

# Run ruff
success, output = BackendUtils.lint(backend_dir)

# Run mypy
success, output = BackendUtils.run_mypy(backend_dir, strict=True)

# Run tests
success, output = BackendUtils.run_tests(backend_dir, coverage=True)

# Get coverage
coverage = BackendUtils.get_test_coverage(backend_dir)
```

## Troubleshooting

### Hook not running

```bash
# Check if hook is executable
ls -la .git/hooks/pre-commit

# Should show: -rwxr-xr-x (executable)
# If not: chmod +x .git/hooks/pre-commit

# Check hook status
python .claude/hooks/install.py --list
```

### Hook failing silently

```bash
# Enable verbose logging
export GIT_HOOKS_VERBOSE=true

# Run hook manually
./.claude/hooks/pre-commit
```

### Python not found

```bash
# Check Python version
python --version  # Should be 3.13+

# Update shebang if needed
# Change: #!/usr/bin/env python3
# To: #!/usr/bin/env python3.13
```

### Permissions denied (Windows)

```bash
# Run PowerShell as Administrator
# Or install hooks via copy instead of symlink
python .claude/hooks/install.py --force
```

### Configuration not loading

```bash
# Check config file exists
ls -la .claude/hooks/config.yaml

# Validate YAML syntax
python -c "import yaml; yaml.safe_load(open('.claude/hooks/config.yaml'))"

# Check environment variable overrides
env | grep GIT_HOOKS
```

## Performance Tips

### Pre-commit (< 10s target)

- Disable slow checks in config (tests disabled by default)
- Use `--fix` flags for auto-fixing lint issues
- Run on changed files only (automatic)

### Pre-push (< 30s target)

- Increase timeout in config if needed
- Disable E2E tests if not required
- Adjust coverage threshold appropriately

### General

- Use `GIT_HOOKS_VERBOSE=false` for faster output
- Keep dependencies installed to avoid reinstall on hooks
- Use `--no-verify` only when necessary (bypasses quality checks!)

## Contributing

When modifying hooks:

1. **Add tests** for new functionality
2. **Update documentation** (README.md, inline comments)
3. **Follow code style** (ruff format, mypy strict)
4. **Test on all platforms** (Linux, macOS, Windows)
5. **Update config.yaml** if adding new options

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:

1. Check this README first
2. Review inline comments in hook files
3. Enable verbose logging: `GIT_HOOKS_VERBOSE=true`
4. Run hooks manually for debugging

---

**Built with ❤️ for the Evolution of Todo project**
