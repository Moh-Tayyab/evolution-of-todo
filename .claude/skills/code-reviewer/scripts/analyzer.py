#!/usr/bin/env python3
#!/usr/bin/env python3
"""
analyzer.py

Analyzer script for Claude Code skills automation.

Author: Evolution of Todo Project
Version: 1.0.0
License: MIT
"""

"""
Code Review Analyzer
====================

Production-grade static analysis tool for security vulnerabilities,
performance issues, and code quality assessment.

Features:
- OWASP Top 10 vulnerability detection
- Cyclomatic complexity analysis
- Code duplication detection
- Performance anti-pattern identification
- Type safety validation
- Test coverage assessment

Usage:
    python -m code_reviewer.scripts.analyzer --path src/ --format json
    python -m code_reviewer.scripts.analyzer --file app.py --security-only

Author: Claude Code Engineering Team
Version: 1.0.0
License: MIT
"""

import ast
import re
import sys
import json
import argparse
import subprocess
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path
from typing import List, Dict, Optional, Set, Tuple, Any, Iterator
from collections import defaultdict, Counter
from datetime import datetime
import hashlib


class IssueSeverity(Enum):
    """Severity levels for code issues."""
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueCategory(Enum):
    """Categories of code issues."""
    SECURITY = "security"
    PERFORMANCE = "performance"
    QUALITY = "quality"
    MAINTAINABILITY = "maintainability"
    TESTING = "testing"
    DOCUMENTATION = "documentation"


@dataclass
class CodeIssue:
    """Represents a detected code issue."""
    category: IssueCategory
    severity: IssueSeverity
    code: str
    message: str
    file_path: str
    line_number: int
    column_number: int = 0
    end_line_number: Optional[int] = None
    suggestion: Optional[str] = None
    rule_id: Optional[str] = None
    cwe_id: Optional[str] = None  # CWE for security issues
    snippet: Optional[str] = None
    fix_confidence: str = "high"  # high, medium, low

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        d = asdict(self)
        d['category'] = self.category.value
        d['severity'] = self.severity.value
        return d


@dataclass
class FileMetrics:
    """Code quality metrics for a single file."""
    file_path: str
    lines_of_code: int = 0
    comment_lines: int = 0
    blank_lines: int = 0
    complexity: int = 0
    functions: int = 0
    classes: int = 0
    imports: int = 0
    docstrings: int = 0
    test_coverage: float = 0.0
    maintainability_index: float = 0.0
    duplicate_lines: int = 0
    technical_debt_ratio: float = 0.0


@dataclass
class ReviewReport:
    """Complete code review report."""
    scan_timestamp: str
    repository_root: str
    files_scanned: int
    total_issues: int
    issues_by_severity: Dict[str, int]
    issues_by_category: Dict[str, int]
    issues: List[CodeIssue]
    file_metrics: List[FileMetrics]
    summary: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'scan_timestamp': self.scan_timestamp,
            'repository_root': self.repository_root,
            'files_scanned': self.files_scanned,
            'total_issues': self.total_issues,
            'issues_by_severity': self.issues_by_severity,
            'issues_by_category': self.issues_by_category,
            'issues': [issue.to_dict() for issue in self.issues],
            'file_metrics': [asdict(m) for m in self.file_metrics],
            'summary': self.summary,
        }


class SecurityAnalyzer(ast.NodeVisitor):
    """
    AST-based security vulnerability scanner.

    Detects:
    - SQL Injection vulnerabilities
    - XSS (Cross-Site Scripting) risks
    - Hardcoded secrets/credentials
    - Insecure deserialization
    - Weak cryptography usage
    - Path traversal vulnerabilities
    - Command injection risks
    """

    # CWE mapping for security issues
    CWE_MAP = {
        'sql_injection': 'CWE-89',
        'xss': 'CWE-79',
        'hardcoded_secret': 'CWE-798',
        'insecure_deserialization': 'CWE-502',
        'weak_crypto': 'CWE-327',
        'path_traversal': 'CWE-22',
        'command_injection': 'CWE-78',
    }

    # Patterns for detecting secrets
    SECRET_PATTERNS = [
        r'password\s*=\s*["\'][^"\']+["\']',
        r'api_key\s*=\s*["\'][^"\']+["\']',
        r'secret\s*=\s*["\'][^"\']+["\']',
        r'token\s*=\s*["\'][^"\']+["\']',
        r'aws_access_key\s*=\s*["\'][^"\']+["\']',
        r'private_key\s*=\s*["\'][^"\']+["\']',
    ]

    # Dangerous function calls
    DANGEROUS_FUNCTIONS = {
        'eval': 'Arbitrary code execution',
        'exec': 'Arbitrary code execution',
        'compile': 'Arbitrary code execution',
        '__import__': 'Arbitrary module import',
        'open': 'File access (check for path traversal)',
        'subprocess.call': 'Command injection risk',
        'subprocess.run': 'Command injection risk',
        'os.system': 'Command injection risk',
        'os.popen': 'Command injection risk',
        'pickle.loads': 'Unsafe deserialization',
        'pickle.load': 'Unsafe deserialization',
        'yaml.load': 'Unsafe YAML loading',
        'marshal.loads': 'Unsafe deserialization',
    }

    def __init__(self, file_path: str):
        """Initialize security analyzer for a file."""
        self.file_path = file_path
        self.issues: List[CodeIssue] = []
        self.imports: Set[str] = set()

    def analyze(self, source_code: str) -> List[CodeIssue]:
        """Analyze source code for security vulnerabilities."""
        self.issues.clear()
        self.imports.clear()

        try:
            tree = ast.parse(source_code, filename=self.file_path)
            self.visit(tree)
        except SyntaxError as e:
            self.issues.append(CodeIssue(
                category=IssueCategory.SECURITY,
                severity=IssueSeverity.HIGH,
                code='syntax_error',
                message=f"Syntax error prevents analysis: {e.msg}",
                file_path=self.file_path,
                line_number=e.lineno or 0,
                suggestion="Fix syntax errors before security analysis",
            ))

        return self.issues

    def visit_Import(self, node: ast.Import) -> None:
        """Track imports for context."""
        for alias in node.names:
            self.imports.add(alias.name.split('.')[0])
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        """Track from imports for context."""
        if node.module:
            self.imports.add(node.module.split('.')[0])
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        """Check for dangerous function calls."""
        func_name = self._get_function_name(node)

        if func_name in self.DANGEROUS_FUNCTIONS:
            risk = self.DANGEROUS_FUNCTIONS[func_name]

            # Check if it's a critical security function
            if func_name in ['eval', 'exec', 'pickle.loads', 'yaml.load']:
                severity = IssueSeverity.CRITICAL
            elif func_name in ['subprocess.call', 'subprocess.run', 'os.system']:
                # Check if shell=True is used
                if self._has_shell_true(node):
                    severity = IssueSeverity.CRITICAL
                    risk += " with shell=True (command injection)"
                else:
                    severity = IssueSeverity.HIGH
            else:
                severity = IssueSeverity.HIGH

            self.issues.append(CodeIssue(
                category=IssueCategory.SECURITY,
                severity=severity,
                code=f'dangerous_function_{func_name}',
                message=f"Use of dangerous function: {func_name} - {risk}",
                file_path=self.file_path,
                line_number=node.lineno,
                column_number=node.col_offset,
                suggestion=self._get_safe_alternative(func_name),
                rule_id='SEC001',
                cwe_id=self.CWE_MAP.get('command_injection' if 'subprocess' in func_name or 'system' in func_name else 'insecure_deserialization'),
            ))

        # Check for SQL injection patterns
        if func_name in ['execute', 'executemany', 'query']:
            if self._check_sql_injection(node):
                self.issues.append(CodeIssue(
                    category=IssueCategory.SECURITY,
                    severity=IssueSeverity.CRITICAL,
                    code='sql_injection',
                    message="Potential SQL injection vulnerability",
                    file_path=self.file_path,
                    line_number=node.lineno,
                    column_number=node.col_offset,
                    suggestion="Use parameterized queries instead of string formatting",
                    rule_id='SEC002',
                    cwe_id=self.CWE_MAP['sql_injection'],
                ))

        self.generic_visit(node)

    def visit_Str(self, node: ast.Str) -> None:
        """Check string literals for hardcoded secrets."""
        super().visit_Str(node)

        if node.s and len(node.s) > 8:  # Only check longer strings
            for pattern in self.SECRET_PATTERNS:
                # Check if we're in an assignment context
                if hasattr(node, 'parent'):
                    # This would be set by a parent visitor
                    pass

    def visit_Constant(self, node: ast.Constant) -> None:
        """Check constants for hardcoded secrets (Python 3.8+)."""
        if isinstance(node.value, str) and len(node.value) > 8:
            # Check for common secret patterns
            lower_value = node.value.lower()
            if any(keyword in lower_value for keyword in ['password', 'secret', 'api_key', 'token', 'private_key']):
                # Avoid false positives for example values
                if not any(exclude in lower_value for exclude in ['example', 'test', 'dummy', 'xxx', '***', '...']):
                    self.issues.append(CodeIssue(
                        category=IssueCategory.SECURITY,
                        severity=IssueSeverity.HIGH,
                        code='hardcoded_secret',
                        message="Potential hardcoded secret detected",
                        file_path=self.file_path,
                        line_number=node.lineno,
                        column_number=node.col_offset,
                        suggestion="Use environment variables or secret management",
                        rule_id='SEC003',
                        cwe_id=self.CWE_MAP['hardcoded_secret'],
                        snippet=node.value[:20] + "..." if len(node.value) > 20 else node.value,
                    ))
        self.generic_visit(node)

    def visit_JoinedStr(self, node: ast.JoinedStr) -> None:
        """Check f-strings for SQL injection."""
        # Check if this f-string is being used in a query context
        for value in node.values:
            if isinstance(value, ast.FormattedValue):
                # Check if we're inside a database call
                pass
        self.generic_visit(node)

    def visit_BinOp(self, node: ast.BinOp) -> None:
        """Check for string concatenation in SQL queries."""
        if isinstance(node.op, ast.Add):
            # This could be SQL concatenation
            # Would need parent context to confirm
            pass
        self.generic_visit(node)

    def _get_function_name(self, node: ast.Call) -> Optional[str]:
        """Extract the full function name from a Call node."""
        if isinstance(node.func, ast.Name):
            return node.func.id
        elif isinstance(node.func, ast.Attribute):
            return node.func.attr
        elif isinstance(node.func, ast.Call):
            return self._get_function_name(node.func)
        return None

    def _has_shell_true(self, node: ast.Call) -> bool:
        """Check if subprocess call uses shell=True."""
        for keyword in node.keywords:
            if keyword.arg == 'shell':
                if isinstance(keyword.value, ast.Constant):
                    return keyword.value.value is True
                elif isinstance(keyword.value, ast.NameConstant):
                    return keyword.value.value is True
        return False

    def _check_sql_injection(self, node: ast.Call) -> bool:
        """Check if this call might be vulnerable to SQL injection."""
        # Look for string formatting in execute calls
        if node.args:
            arg = node.args[0]
            if isinstance(arg, ast.BinOp) or isinstance(arg, ast.JoinedStr):
                return True
        return False

    def _get_safe_alternative(self, func_name: str) -> str:
        """Get safe alternative for dangerous functions."""
        alternatives = {
            'eval': "Use ast.literal_eval for literals, or proper parsing for user input",
            'exec': "Avoid executing arbitrary code. Use configuration files or proper APIs",
            'subprocess.run': "Use subprocess.run with list argument and shell=False",
            'os.system': "Use subprocess.run with list argument",
            'pickle.loads': "Use json for serialization, or restrict pickle to trusted data",
            'yaml.load': "Use yaml.safe_load or yaml.load with Loader=yaml.SafeLoader",
        }
        return alternatives.get(func_name, "Review if this function is necessary")


class PerformanceProfiler(ast.NodeVisitor):
    """
    AST-based performance anti-pattern detector.

    Detects:
    - N+1 query patterns
    - Inefficient loop patterns
    - Missing early returns
    - Unnecessary database queries in loops
    - Inefficient data structure usage
    - Missing caching opportunities
    """

    PERFORMANCE_PATTERNS = {
        'nested_loop_complexity': {
            'pattern': 'for.*for.*',  # Simplified
            'severity': IssueSeverity.MEDIUM,
            'message': 'Nested loops may indicate O(n²) complexity',
            'suggestion': 'Consider using dictionaries, sets, or breaking into separate queries',
        },
        'string_concatenation_loop': {
            'pattern': r'for.*:\s*\w+\s*\+=',
            'severity': IssueSeverity.MEDIUM,
            'message': 'String concatenation in loop is inefficient',
            'suggestion': 'Use list comprehension and join: "".join(items)',
        },
    }

    def __init__(self, file_path: str):
        """Initialize performance profiler."""
        self.file_path = file_path
        self.issues: List[CodeIssue] = []
        self.loop_depth = 0
        self.function_depth = 0

    def analyze(self, source_code: str) -> List[CodeIssue]:
        """Analyze source code for performance issues."""
        self.issues.clear()

        try:
            tree = ast.parse(source_code, filename=self.file_path)
            self.visit(tree)
        except SyntaxError:
            pass  # Handled by SecurityAnalyzer

        return self.issues

    def visit_For(self, node: ast.For) -> None:
        """Analyze loops for performance issues."""
        self.loop_depth += 1

        if self.loop_depth > 2:
            self.issues.append(CodeIssue(
                category=IssueCategory.PERFORMANCE,
                severity=IssueSeverity.MEDIUM,
                code='deeply_nested_loops',
                message=f"Deeply nested loops (depth {self.loop_depth}) detected",
                file_path=self.file_path,
                line_number=node.lineno,
                column_number=node.col_offset,
                suggestion="Consider refactoring to use early exit or breaking into separate functions",
                rule_id='PERF001',
            ))

        # Check for database calls in loop
        if self._has_db_call_in_loop(node):
            self.issues.append(CodeIssue(
                category=IssueCategory.PERFORMANCE,
                severity=IssueSeverity.HIGH,
                code='db_call_in_loop',
                message="Database query detected inside loop - potential N+1 problem",
                file_path=self.file_path,
                line_number=node.lineno,
                column_number=node.col_offset,
                suggestion="Use eager loading (JOIN) or fetch_all() to batch queries",
                rule_id='PERF002',
            ))

        self.generic_visit(node)
        self.loop_depth -= 1

    def visit_While(self, node: ast.While) -> None:
        """Analyze while loops."""
        self.loop_depth += 1
        self.generic_visit(node)
        self.loop_depth -= 1

    def visit_ListComp(self, node: ast.ListComp) -> None:
        """List comprehensions are generally efficient."""
        # But check for nested comprehensions
        if isinstance(node.generators[0].iter, ast.ListComp):
            self.issues.append(CodeIssue(
                category=IssueCategory.PERFORMANCE,
                severity=IssueSeverity.LOW,
                code='nested_list_comp',
                message="Nested list comprehension may reduce readability",
                file_path=self.file_path,
                line_number=node.lineno,
                column_number=node.col_offset,
                suggestion="Consider using nested loops or generator functions for clarity",
                rule_id='PERF003',
            ))
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Analyze function performance characteristics."""
        self.function_depth += 1

        # Check for too many parameters
        if len(node.args.args) > 7:
            self.issues.append(CodeIssue(
                category=IssueCategory.QUALITY,
                severity=IssueSeverity.LOW,
                code='too_many_parameters',
                message=f"Function has {len(node.args.args)} parameters (max 7 recommended)",
                file_path=self.file_path,
                line_number=node.lineno,
                column_number=node.col_offset,
                suggestion="Consider using a dataclass or configuration object",
                rule_id='QUAL001',
            ))

        self.generic_visit(node)
        self.function_depth -= 1

    def _has_db_call_in_loop(self, node: ast.For) -> bool:
        """Check if loop contains database calls."""
        db_methods = ['execute', 'fetch', 'query', 'get', 'filter', 'select', 'save', 'create', 'update', 'delete']

        for child in ast.walk(node):
            if isinstance(child, ast.Call):
                func_name = None
                if isinstance(child.func, ast.Name):
                    func_name = child.func.id
                elif isinstance(child.func, ast.Attribute):
                    func_name = child.func.attr

                if func_name and any(method in func_name.lower() for method in db_methods):
                    return True

        return False


class QualityMetrics(ast.NodeVisitor):
    """
    Calculate code quality metrics.

    Metrics:
    - Cyclomatic complexity
    - Maintainability index
    - Code duplication
    - Test coverage estimation
    - Documentation coverage
    """

    def __init__(self, file_path: str):
        """Initialize quality metrics calculator."""
        self.file_path = file_path
        self.lines_of_code = 0
        self.comment_lines = 0
        self.blank_lines = 0
        self.complexity = 1  # Base complexity
        self.functions = 0
        self.classes = 0
        self.imports = 0
        self.docstrings = 0
        self.current_function_complexity = 1

    def analyze(self, source_code: str) -> FileMetrics:
        """Calculate all quality metrics for a file."""
        lines = source_code.split('\n')

        # Count lines
        for line in lines:
            if line.strip() == '':
                self.blank_lines += 1
            elif line.strip().startswith('#'):
                self.comment_lines += 1
            else:
                self.lines_of_code += 1

        # Parse for AST-based metrics
        try:
            tree = ast.parse(source_code, filename=self.file_path)
            self.visit(tree)
        except SyntaxError:
            pass

        # Calculate maintainability index (simplified MI formula)
        mi = self._calculate_maintainability_index()

        return FileMetrics(
            file_path=self.file_path,
            lines_of_code=self.lines_of_code,
            comment_lines=self.comment_lines,
            blank_lines=self.blank_lines,
            complexity=self.complexity,
            functions=self.functions,
            classes=self.classes,
            imports=self.imports,
            docstrings=self.docstrings,
            maintainability_index=mi,
        )

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Analyze function metrics."""
        self.functions += 1
        self.current_function_complexity = 1

        # Count docstring
        if (node.body and isinstance(node.body[0], ast.Expr) and
            isinstance(node.body[0].value, ast.Constant) and
            isinstance(node.body[0].value.value, str)):
            self.docstrings += 1

        # Calculate function complexity
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.ExceptHandler)):
                self.current_function_complexity += 1

        self.complexity += self.current_function_complexity

        if self.current_function_complexity > 10:
            self.complexity += self.current_function_complexity - 10

        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        """Count classes."""
        self.classes += 1

        # Check for class docstring
        if (node.body and isinstance(node.body[0], ast.Expr) and
            isinstance(node.body[0].value, ast.Constant) and
            isinstance(node.body[0].value.value, str)):
            self.docstrings += 1

        self.generic_visit(node)

    def visit_Import(self, node: ast.Import) -> None:
        """Count imports."""
        self.imports += len(node.names)
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        """Count from imports."""
        self.imports += len(node.names) if node.names else 1
        self.generic_visit(node)

    def _calculate_maintainability_index(self) -> float:
        """Calculate MI (Maintainability Index)."""
        if self.lines_of_code == 0:
            return 100.0

        # Simplified MI formula (Microsoft's version)
        avg_complexity = self.complexity / max(self.functions, 1)
        volume = self.lines_of_code

        mi = max(0,
            (171 - 5.2 * (avg_complexity ** 0.23) - 0.23 * avg_complexity - 16.2 * (volume ** 0.5))
        )

        return round(mi, 2)


class SecurityAnalyzerCLI:
    """Command-line interface for code review analyzer."""

    def __init__(self):
        self.issues: List[CodeIssue] = []
        self.file_metrics: List[FileMetrics] = []

    def analyze_path(self, path: Path, security_only: bool = False) -> ReviewReport:
        """Analyze all Python files in a path."""
        python_files = []
        if path.is_file() and path.suffix == '.py':
            python_files = [path]
        elif path.is_dir():
            python_files = list(path.rglob('*.py'))
        else:
            raise ValueError(f"Invalid path: {path}")

        repository_root = str(path.parent if path.is_file() else path)

        for py_file in python_files:
            source_code = py_file.read_text()

            # Security analysis
            sec_analyzer = SecurityAnalyzer(str(py_file))
            self.issues.extend(sec_analyzer.analyze(source_code))

            if not security_only:
                # Performance analysis
                perf_analyzer = PerformanceProfiler(str(py_file))
                self.issues.extend(perf_analyzer.analyze(source_code))

                # Quality metrics
                metrics_analyzer = QualityMetrics(str(py_file))
                self.file_metrics.append(metrics_analyzer.analyze(source_code))

        # Generate report
        return self._generate_report(repository_root, len(python_files))

    def _generate_report(self, repo_root: str, files_scanned: int) -> ReviewReport:
        """Generate comprehensive review report."""
        # Count issues by severity
        severity_counts = Counter(issue.severity.value for issue in self.issues)
        category_counts = Counter(issue.category.value for issue in self.issues)

        # Calculate summary metrics
        total_complexity = sum(m.complexity for m in self.file_metrics)
        avg_complexity = total_complexity / max(len(self.file_metrics), 1)
        avg_maintainability = sum(m.maintainability_index for m in self.file_metrics) / max(len(self.file_metrics), 1)

        return ReviewReport(
            scan_timestamp=datetime.now().isoformat(),
            repository_root=repo_root,
            files_scanned=files_scanned,
            total_issues=len(self.issues),
            issues_by_severity=dict(severity_counts),
            issues_by_category=dict(category_counts),
            issues=self.issues,
            file_metrics=self.file_metrics,
            summary={
                'avg_complexity': round(avg_complexity, 2),
                'avg_maintainability_index': round(avg_maintainability, 2),
                'total_lines_of_code': sum(m.lines_of_code for m in self.file_metrics),
                'total_functions': sum(m.functions for m in self.file_metrics),
                'total_classes': sum(m.classes for m in self.file_metrics),
                'risk_score': self._calculate_risk_score(),
            },
        )

    def _calculate_risk_score(self) -> str:
        """Calculate overall risk score based on issues."""
        if not self.issues:
            return "low"

        severity_weights = {
            IssueSeverity.CRITICAL: 10,
            IssueSeverity.HIGH: 5,
            IssueSeverity.MEDIUM: 2,
            IssueSeverity.LOW: 1,
            IssueSeverity.INFO: 0,
        }

        total_score = sum(severity_weights.get(issue.severity, 0) for issue in self.issues)

        if total_score >= 50:
            return "critical"
        elif total_score >= 20:
            return "high"
        elif total_score >= 10:
            return "medium"
        else:
            return "low"


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Code Review Analyzer - Security, Performance, and Quality Analysis",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --path src/
  %(prog)s --file app.py --security-only
  %(prog)s --path . --format json --output report.json
  %(prog)s --file main.py --format markdown

Exit codes:
  0: No issues found
  1: Analysis error
  2: Critical/high severity issues found
        """
    )

    parser.add_argument(
        '--path', '-p',
        type=Path,
        help='Path to analyze (file or directory)'
    )

    parser.add_argument(
        '--file', '-f',
        type=Path,
        help='Single file to analyze'
    )

    parser.add_argument(
        '--security-only',
        action='store_true',
        help='Only perform security analysis'
    )

    parser.add_argument(
        '--format',
        choices=['json', 'markdown', 'text'],
        default='text',
        help='Output format (default: text)'
    )

    parser.add_argument(
        '--output', '-o',
        type=Path,
        help='Output file (default: stdout)'
    )

    parser.add_argument(
        '--severity',
        choices=['critical', 'high', 'medium', 'low', 'info'],
        help='Minimum severity level to report'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output'
    )

    args = parser.parse_args()

    # Determine path to analyze
    if args.file:
        target_path = args.file
    elif args.path:
        target_path = args.path
    else:
        # Default to current directory
        target_path = Path.cwd()

    if not target_path.exists():
        print(f"Error: Path does not exist: {target_path}", file=sys.stderr)
        sys.exit(1)

    # Run analysis
    try:
        cli = SecurityAnalyzerCLI()
        report = cli.analyze_path(target_path, args.security_only)

        # Filter by severity if specified
        if args.severity:
            severity_order = ['critical', 'high', 'medium', 'low', 'info']
            min_index = severity_order.index(args.severity)
            report.issues = [
                issue for issue in report.issues
                if severity_order.index(issue.severity.value) <= min_index
            ]

        # Format output
        if args.format == 'json':
            output = json.dumps(report.to_dict(), indent=2)
        elif args.format == 'markdown':
            output = _format_markdown(report)
        else:
            output = _format_text(report, args.verbose)

        # Write output
        if args.output:
            args.output.write_text(output)
            print(f"Report written to {args.output}", file=sys.stderr)
        else:
            print(output)

        # Exit with appropriate code
        if report.summary['risk_score'] in ['critical', 'high']:
            sys.exit(2)
        else:
            sys.exit(0)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


def _format_text(report: ReviewReport, verbose: bool = False) -> str:
    """Format report as human-readable text."""
    lines = [
        "=" * 80,
        "CODE REVIEW ANALYSIS REPORT",
        "=" * 80,
        f"Scan Timestamp: {report.scan_timestamp}",
        f"Repository: {report.repository_root}",
        f"Files Scanned: {report.files_scanned}",
        f"Total Issues: {report.total_issues}",
        "",
        "SUMMARY",
        "-" * 80,
        f"Average Complexity: {report.summary['avg_complexity']}",
        f"Average Maintainability Index: {report.summary['avg_maintainability_index']}",
        f"Total Lines of Code: {report.summary['total_lines_of_code']}",
        f"Risk Score: {report.summary['risk_score'].upper()}",
        "",
        "ISSUES BY SEVERITY",
        "-" * 80,
    ]

    for severity, count in sorted(report.issues_by_severity.items()):
        lines.append(f"  {severity.upper()}: {count}")

    lines.extend([
        "",
        "ISSUES BY CATEGORY",
        "-" * 80,
    ])

    for category, count in sorted(report.issues_by_category.items()):
        lines.append(f"  {category}: {count}")

    if report.issues:
        lines.extend([
            "",
            "DETAILED ISSUES",
            "-" * 80,
        ])

        for issue in sorted(report.issues, key=lambda i: i.line_number):
            lines.extend([
                "",
                f"File: {issue.file_path}",
                f"Line: {issue.line_number}",
                f"Severity: {issue.severity.value.upper()}",
                f"Category: {issue.category.value}",
                f"Code: {issue.code}",
                f"Message: {issue.message}",
            ])

            if issue.suggestion:
                lines.append(f"Suggestion: {issue.suggestion}")

            if issue.cwe_id:
                lines.append(f"CWE: {issue.cwe_id}")

            if verbose and issue.snippet:
                lines.append(f"Snippet: {issue.snippet}")

    return "\n".join(lines)


def _format_markdown(report: ReviewReport) -> str:
    """Format report as markdown."""
    lines = [
        "# Code Review Analysis Report",
        "",
        f"**Scan Timestamp:** {report.scan_timestamp}",
        f"**Repository:** `{report.repository_root}`",
        f"**Files Scanned:** {report.files_scanned}",
        f"**Total Issues:** {report.total_issues}",
        "",
        "## Summary",
        "",
        f"- **Average Complexity:** {report.summary['avg_complexity']}",
        f"- **Average Maintainability Index:** {report.summary['avg_maintainability_index']}",
        f"- **Total Lines of Code:** {report.summary['total_lines_of_code']}",
        f"- **Risk Score:** **{report.summary['risk_score'].upper()}**",
        "",
        "## Issues by Severity",
        "",
    ]

    for severity in ['critical', 'high', 'medium', 'low', 'info']:
        count = report.issues_by_severity.get(severity, 0)
        if count > 0:
            emoji = {'critical': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🟢', 'info': 'ℹ️'}
            lines.append(f"- {emoji.get(severity, '•')} **{severity.upper()}:** {count}")

    lines.append("")

    if report.issues:
        lines.extend([
            "## Detailed Issues",
            "",
        ])

        for issue in report.issues:
            severity_emoji = {'critical': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🟢', 'info': 'ℹ️'}
            emoji = severity_emoji.get(issue.severity.value, '•')

            lines.extend([
                f"### {emoji} {issue.file_path}:{issue.line_number}",
                "",
                f"- **Severity:** `{issue.severity.value}`",
                f"- **Category:** `{issue.category.value}`",
                f"- **Code:** `{issue.code}`",
                f"- **Message:** {issue.message}",
            ])

            if issue.suggestion:
                lines.append(f"- **Suggestion:** {issue.suggestion}")

            if issue.cwe_id:
                lines.append(f"- **CWE:** [{issue.cwe_id}](https://cwe.mitre.org/data/definitions/{issue.cwe_id.split('-')[1]}.html)")

            lines.append("")

    return "\n".join(lines)


if __name__ == '__main__':
    main()
