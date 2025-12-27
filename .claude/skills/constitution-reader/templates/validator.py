# Constitution Validator - Check code against constitution

from pathlib import Path
from typing import List


class ConstitutionValidator:
    """Validate code and configuration against project constitution"""

    def __init__(self, constitution_path: Path = Path(".specify/memory/constitution.md")):
        self.constitution_path = constitution_path
        self.violations: List[dict] = []

    def load_constitution(self) -> str:
        """Load constitution content"""

        if not self.constitution_path.exists():
            raise FileNotFoundError(f"Constitution not found at {self.constitution_path}")

        with open(self.constitution_path) as f:
            return f.read()

    def check_python_version(self, pyproject_path: Path) -> bool:
        """Check Python version matches constitution"""

        import toml
        import re
        import sys

        # Get required version from constitution
        constitution = self.load_constitution()
        match = re.search(r"Python\s+(\d+\.\d+)", constitution)

        if not match:
            return True  # No requirement specified

        required_version = match.group(1)

        # Get current version from pyproject.toml
        if not pyproject_path.exists():
            self.violations.append({
                "type": "missing_file",
                "file": str(pyproject_path),
                "message": "pyproject.toml not found"
            })
            return False

        data = toml.load(pyproject_path)
        deps = data.get("dependencies", {})

        for name, version in deps.items():
            if name.lower() == "python":
                if not self._version_compatible(version, required_version):
                    self.violations.append({
                        "type": "version_mismatch",
                        "file": str(pyproject_path),
                        "message": f"Python version {version} doesn't meet requirement {required_version}"
                    })
                    return False

        # Check actual Python version
        current_version = f"{sys.version_info.major}.{sys.version_info.minor}"
        if not self._version_compatible(current_version, required_version):
            self.violations.append({
                "type": "version_mismatch",
                "message": f"Running Python {current_version}, required {required_version}"
            })
            return False

        return True

    def check_file_extensions(self, src_dir: Path) -> bool:
        """Check file extensions match constitution"""

        constitution = self.load_constitution()

        # Define allowed extensions (customize based on constitution)
        allowed_extensions = {".py", ".ts", ".tsx", ".js", ".jsx", ".md"}
        forbidden_extensions = []

        # Find all files
        all_files = list(src_dir.rglob("*"))

        for file_path in all_files:
            if file_path.suffix in forbidden_extensions:
                self.violations.append({
                    "type": "forbidden_extension",
                    "file": str(file_path),
                    "message": f"File extension {file_path.suffix} is not allowed"
                })

        return len(self.violations) == 0

    def check_dependencies(self, pyproject_path: Path) -> bool:
        """Check dependencies match constitution"""

        import toml

        if not pyproject_path.exists():
            return True

        data = toml.load(pyproject_path)
        deps = data.get("dependencies", {})

        constitution = self.load_constitution()

        # Example: Check for forbidden frameworks
        forbidden_deps = []

        for name in deps:
            for forbidden in forbidden_deps:
                if forbidden.lower() in name.lower():
                    self.violations.append({
                        "type": "forbidden_dependency",
                        "dependency": name,
                        "message": f"Dependency {name} is not in constitution's tech stack"
                    })

        return len([v for v in self.violations if v["type"] == "forbidden_dependency"]) == 0

    def _version_compatible(self, current: str, required: str) -> bool:
        """Simple version comparison"""

        try:
            current_parts = current.replace(">", "<", "=", "~", "^", "").split(".")[:2]
            required_parts = required.split("+")[0].split(".")[:2]

            return tuple(map(int, current_parts)) >= tuple(map(int, required_parts))
        except:
            return False

    def generate_report(self) -> str:
        """Generate validation report"""

        if not self.violations:
            return "✓ Constitution validation passed - no violations found"

        report = ["Constitution Validation Report", "=" * 50]

        for violation in self.violations:
            report.append(f"\n✗ {violation['type'].upper()}")
            if "file" in violation:
                report.append(f"  File: {violation['file']}")
            if "message" in violation:
                report.append(f"  {violation['message']}")

        return "\n".join(report)


# Usage
def main():
    validator = ConstitutionValidator()

    print("Validating against constitution...")
    print()

    # Check Python version
    validator.check_python_version(Path("pyproject.toml"))

    # Check dependencies
    validator.check_dependencies(Path("pyproject.toml"))

    # Check file extensions
    validator.check_file_extensions(Path("src"))

    # Generate report
    print(validator.generate_report())


if __name__ == "__main__":
    main()
