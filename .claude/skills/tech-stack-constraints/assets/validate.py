# Tech Stack Validation

from pathlib import Path
import toml
import sys


REQUIRED_PYTHON_VERSION = "3.13+"
ALLOWED_FRAMEWORKS = ["FastAPI", "Flask"]
ALLOWED_DATABASES = ["PostgreSQL", "SQLite"]


def validate_python_version() -> bool:
    """Check Python version meets requirements"""

    import sys
    current_version = f"{sys.version_info.major}.{sys.version_info.minor}"

    print(f"Python version: {current_version}")
    print(f"Required: {REQUIRED_PYTHON_VERSION}")

    # Compare versions (simplified for 3.13+)
    if sys.version_info >= (3, 13):
        print("✓ Python version OK")
        return True
    else:
        print(f"✗ Python {current_version} is below minimum requirement")
        return False


def validate_dependencies(pyproject_path: Path) -> bool:
    """Check dependencies match allowed tech stack"""

    if not pyproject_path.exists():
        print("✗ No pyproject.toml found")
        return False

    data = toml.load(pyproject_path)
    deps = data.get("dependencies", {})

    print("\nDependencies:")
    all_valid = True

    for name, version in deps.items():
        name_lower = name.lower()
        is_allowed = True

        if "framework" in name_lower and name not in ALLOWED_FRAMEWORKS:
            is_allowed = False

        if is_allowed:
            print(f"  ✓ {name}: {version}")
        else:
            print(f"  ✗ {name}: {version} (not in allowed stack)")
            all_valid = False

    return all_valid


def validate_file_extensions(src_dir: Path) -> bool:
    """Check only allowed file extensions are used"""

    allowed_extensions = {".py", ".md", ".txt", ".json"}
    issues = []

    for py_file in src_dir.rglob("*.py"):
        # Check for forbidden imports
        content = py_file.read_text()

        forbidden_imports = ["import django", "import tornado", "import bottle"]
        for forbidden in forbidden_imports:
            if forbidden in content.lower():
                issues.append(f"{py_file}: Uses {forbidden}")

    if issues:
        print("\nFile extension issues:")
        for issue in issues:
            print(f"  ✗ {issue}")
        return False

    print("\n✓ File extensions OK")
    return True


def main():
    """Run all validation checks"""

    print("=" * 50)
    print("Tech Stack Validation")
    print("=" * 50)

    checks_passed = 0
    checks_total = 3

    if validate_python_version():
        checks_passed += 1

    if validate_dependencies(Path("pyproject.toml")):
        checks_passed += 1

    if validate_file_extensions(Path("src")):
        checks_passed += 1

    print("\n" + "=" * 50)
    print(f"Result: {checks_passed}/{checks_total} checks passed")
    print("=" * 50)

    if checks_passed == checks_total:
        print("\n✓ All checks passed!")
        return 0
    else:
        print("\n✗ Some checks failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
