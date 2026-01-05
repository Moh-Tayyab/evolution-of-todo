# Code Review Checklist

class CodeReviewChecklist:
    """Automated code review checklist"""

    def __init__(self):
        self.issues = []
        self.suggestions = []

    def check_function_length(self, file_path: str, max_lines: int = 50):
        """Check if functions are too long"""

        with open(file_path) as f:
            lines = f.readlines()

        in_function = False
        function_lines = 0
        function_start = 0

        for i, line in enumerate(lines, 1):
            if line.strip().startswith("def "):
                in_function = True
                function_start = i
                function_lines = 0
            elif in_function:
                function_lines += 1
                if line.strip() and not line.startswith(" "):
                    in_function = False
                    if function_lines > max_lines:
                        self.issues.append({
                            "file": file_path,
                            "line": function_start,
                            "type": "function_length",
                            "message": f"Function is {function_lines} lines (max: {max_lines})"
                        })

    def check_hardcoded_secrets(self, file_path: str):
        """Check for hardcoded secrets"""

        secret_patterns = [
            "password = ",
            "api_key = ",
            "secret = ",
            "token = "
        ]

        with open(file_path) as f:
            content = f.read()

        for i, line in enumerate(content.split("\n"), 1):
            for pattern in secret_patterns:
                if pattern in line.lower():
                    self.issues.append({
                        "file": file_path,
                        "line": i,
                        "type": "security",
                        "message": f"Possible hardcoded secret: {pattern.strip()}"
                    })

    def check_missing_docstrings(self, file_path: str):
        """Check for missing docstrings"""

        with open(file_path) as f:
            content = f.read()

        # Find function definitions
        import re
        functions = re.findall(r"def\s+(\w+)", content)

        for func in functions:
            pattern = f'def {func}\\([^)]*\\):\\s+"""'
            if not re.search(pattern, content):
                self.suggestions.append({
                    "file": file_path,
                    "type": "documentation",
                    "message": f"Function {func}() missing docstring"
                })

    def generate_report(self):
        """Generate review report"""

        print("\n" + "=" * 50)
        print("CODE REVIEW REPORT")
        print("=" * 50)

        if self.issues:
            print(f"\n⚠️  Issues Found: {len(self.issues)}")
            for issue in self.issues:
                print(f"\n  [{issue['type'].upper()}] {issue['file']}:{issue['line']}")
                print(f"    {issue['message']}")

        if self.suggestions:
            print(f"\n💡 Suggestions: {len(self.suggestions)}")
            for suggestion in self.suggestions:
                print(f"\n  [{suggestion['type'].upper()}] {suggestion['file']}")
                print(f"    {suggestion['message']}")

        if not self.issues and not self.suggestions:
            print("\n✓ No issues or suggestions found")


# Usage
if __name__ == "__main__":
    import sys

    reviewer = CodeReviewChecklist()

    for file_path in sys.argv[1:]:
        print(f"\nReviewing: {file_path}")
        reviewer.check_function_length(file_path)
        reviewer.check_hardcoded_secrets(file_path)
        reviewer.check_missing_docstrings(file_path)

    reviewer.generate_report()
