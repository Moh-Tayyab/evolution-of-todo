#!/usr/bin/env python3
#!/usr/bin/env python3
"""
owasp.py

Owasp script for Claude Code skills automation.

Author: Evolution of Todo Project
Version: 1.0.0
License: MIT
"""

"""
OWASP Top 10 Security Checker
==============================

Automated detection of OWASP Top 10 (2021) security vulnerabilities:
- A01 Broken Access Control
- A02 Cryptographic Failures
- A03 Injection
- A04 Insecure Design
- A05 Security Misconfiguration
- A06 Vulnerable/Outdated Components
- A07 Identification & Authentication Failures
- A08 Software/Data Integrity Failures
- A09 Security Logging/Monitoring Failures
- A10 Server-Side Request Forgery (SSRF)

Usage:
    python -m code_reviewer.scripts.owasp --path src/
    python -m code_reviewer.scripts.owasp --file app.py --check A03,A06

Author: Claude Code Engineering Team
Version: 1.0.0
License: MIT
"""

import ast
import re
import sys
import json
import argparse
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
from typing import List, Dict, Optional, Set
from datetime import datetime


class OWASPRisk(Enum):
    """OWASP risk levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class OWASPFinding:
    """Represents an OWASP vulnerability finding."""
    category: str  # A01-A10
    title: str
    description: str
    risk: OWASPRisk
    file_path: str
    line_number: int
    cwe_id: str
    remediation: str
    references: List[str]
    code_snippet: Optional[str] = None
    confidence: str = "high"  # high, medium, low

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        d = asdict(self)
        d['risk'] = self.risk.value
        return d


class OWASPChecker(ast.NodeVisitor):
    """
    OWASP Top 10 vulnerability detector.

    Maps detected issues to CWE identifiers and provides remediation guidance.
    """

    # OWASP 2021 Categories with CWE mappings
    OWASP_CATEGORIES = {
        'A01': {
            'name': 'Broken Access Control',
            'cwe': 'CWE-284',
            'description': 'Users can act outside of their intended permissions',
        },
        'A02': {
            'name': 'Cryptographic Failures',
            'cwe': 'CWE-259',
            'description': 'Failure to encrypt sensitive data',
        },
        'A03': {
            'name': 'Injection',
            'cwe': 'CWE-77',
            'description': 'Injection vulnerabilities (SQL, NoSQL, OS, LDAP)',
        },
        'A04': {
            'name': 'Insecure Design',
            'cwe': 'CWE-251',
            'description': 'Missing or ineffective security controls',
        },
        'A05': {
            'name': 'Security Misconfiguration',
            'cwe': 'CWE-2',
            'description': 'Improperly configured security settings',
        },
        'A06': {
            'name': 'Vulnerable/Outdated Components',
            'cwe': 'CWE-937',
            'description': 'Using libraries with known vulnerabilities',
        },
        'A07': {
            'name': 'Identification & Authentication Failures',
            'cwe': 'CWE-287',
            'description': 'Authentication and session management failures',
        },
        'A08': {
            'name': 'Software/Data Integrity Failures',
            'cwe': 'CWE-345',
            'description': 'Code or infrastructure without integrity verification',
        },
        'A09': {
            'name': 'Security Logging/Monitoring Failures',
            'cwe': 'CWE-778',
            'description': 'Missing logging and monitoring of security events',
        },
        'A10': {
            'name': 'Server-Side Request Forgery (SSRF)',
            'cwe': 'CWE-918',
            'description': 'Server fetches remote resource without validation',
        },
    }

    # A01: Broken Access Control patterns
    ACCESS_CONTROL_PATTERNS = {
        'missing_authorization_check': {
            'pattern': r'(def|async\s+def)\s+\w+.*:\s*#.*/@(?:login_required|authenticate)',
            'category': 'A01',
            'risk': OWASPRisk.HIGH,
            'message': 'Public endpoint that may require authentication',
        },
        'id_manipulation': {
            'pattern': r'user_id\s*=\s*(?:request\.|kwargs\.get\([\'"]id)',
            'category': 'A01',
            'risk': OWASPRisk.HIGH,
            'message': 'User ID from request without authorization check',
        },
    }

    # A02: Cryptographic Failures patterns
    CRYPTO_PATTERNS = {
        'hardcoded_key': {
            'pattern': r'(?:SECRET|KEY|PASSWORD|TOKEN)\s*=\s*["\'][^"\']{8,}["\']',
            'category': 'A02',
            'risk': OWASPRisk.CRITICAL,
            'message': 'Hardcoded cryptographic secret detected',
        },
        'weak_hash': {
            'pattern': r'(?:hashlib\.md5|hashlib\.sha1)\(',
            'category': 'A02',
            'risk': OWASPRisk.HIGH,
            'message': 'Weak hash algorithm (MD5/SHA1) used',
        },
        'no_https': {
            'pattern': r'http://(?![^"\']*localhost)',
            'category': 'A02',
            'risk': OWASPRisk.HIGH,
            'message': 'Insecure HTTP URL (should use HTTPS)',
        },
    }

    # A03: Injection patterns
    INJECTION_PATTERNS = {
        'sql_injection_format': {
            'pattern': r'(?:execute|executemany|query)\s*\(\s*["\'].*?\%s',
            'category': 'A03',
            'risk': OWASPRisk.CRITICAL,
            'message': 'SQL injection via string formatting',
        },
        'sql_injection_fstring': {
            'pattern': r'(?:execute|executemany|query)\s*\(\s*f["\'].*?\{',
            'category': 'A03',
            'risk': OWASPRisk.CRITICAL,
            'message': 'SQL injection via f-string',
        },
        'command_injection': {
            'pattern': r'(?:subprocess\.|os\.)(?:system|popen)\s*\(',
            'category': 'A03',
            'risk': OWASPRisk.CRITICAL,
            'message': 'Command injection vulnerability',
        },
        'shell_true': {
            'pattern': r'shell\s*=\s*True',
            'category': 'A03',
            'risk': OWASPRisk.CRITICAL,
            'message': 'subprocess with shell=True enables command injection',
        },
    }

    # A05: Security Misconfiguration patterns
    MISCONFIGURATION_PATTERNS = {
        'debug_mode': {
            'pattern': r'dbg\s*=\s*True|DEBUG\s*=\s*True',
            'category': 'A05',
            'risk': OWASPRisk.HIGH,
            'message': 'Debug mode enabled in production',
        },
        'cors_all': {
            'pattern': r'allow_origins\s*=\s*["\']\*["\']',
            'category': 'A05',
            'risk': OWASPRisk.HIGH,
            'message': 'Overly permissive CORS configuration',
        },
        'default_credentials': {
            'pattern': r'(?:user|username|password)\s*=\s*["\'](?:admin|root|password|123456)["\']',
            'category': 'A05',
            'risk': OWASPRisk.CRITICAL,
            'message': 'Default or weak credentials detected',
        },
    }

    # A07: Authentication Failures patterns
    AUTH_PATTERNS = {
        'plaintext_password': {
            'pattern': r'password\s*==\s*["\'][^"\']+["\']',
            'category': 'A07',
            'risk': OWASPRisk.CRITICAL,
            'message': 'Plaintext password comparison',
        },
        'no_rate_limit': {
            'pattern': r'@.*\ndef\s+login',
            'category': 'A07',
            'risk': OWASPRisk.MEDIUM,
            'message': 'Login endpoint without visible rate limiting',
        },
    }

    # A09: Logging Failures patterns
    LOGGING_PATTERNS = {
        'logging_sensitive_data': {
            'pattern': r'logger?\.(?:info|debug)\s*\([^)]*password[^)]*\)',
            'category': 'A09',
            'risk': OWASPRisk.MEDIUM,
            'message': 'Sensitive data (password) in logs',
        },
        'no_security_logging': {
            'pattern': r'(def|async\s+def)\s+(?:login|authenticate)',
            'category': 'A09',
            'risk': OWASPRisk.LOW,
            'message': 'Authentication endpoint without security logging',
        },
    }

    # A10: SSRF patterns
    SSRF_PATTERNS = {
        'user_controlled_url': {
            'pattern': r'requests\.(?:get|post)\s*\([^)]*request\.',
            'category': 'A10',
            'risk': OWASPRisk.HIGH,
            'message': 'SSRF: User-controlled URL in server request',
        },
        'url_from_request': {
            'pattern': r'urlopen\s*\([^)]*request\.',
            'category': 'A10',
            'risk': OWASPRisk.HIGH,
            'message': 'SSRF: URL from user request',
        },
    }

    def __init__(self, file_path: str):
        """Initialize OWASP checker."""
        self.file_path = file_path
        self.findings: List[OWASPFinding] = []
        self.imports: Set[str] = set()
        self.current_function = None

    def check(self, source_code: str) -> List[OWASPFinding]:
        """Run OWASP Top 10 vulnerability check."""
        self.findings.clear()
        self.imports.clear()

        # First pass: regex-based pattern matching
        self._check_patterns(source_code)

        # Second pass: AST-based analysis
        try:
            tree = ast.parse(source_code, filename=self.file_path)
            self.visit(tree)
        except SyntaxError as e:
            self.findings.append(OWASPFinding(
                category='A00',
                title='Syntax Error',
                description=f'Cannot analyze due to syntax error: {e.msg}',
                risk=OWASPRisk.MEDIUM,
                file_path=self.file_path,
                line_number=e.lineno or 0,
                cwe_id='CWE-000',
                remediation='Fix syntax errors before security analysis',
                references=[],
            ))

        return self.findings

    def _check_patterns(self, source_code: str) -> None:
        """Check for vulnerability patterns using regex."""
        lines = source_code.split('\n')

        # Combine all pattern categories
        all_patterns = {}
        all_patterns.update(self.ACCESS_CONTROL_PATTERNS)
        all_patterns.update(self.CRYPTO_PATTERNS)
        all_patterns.update(self.INJECTION_PATTERNS)
        all_patterns.update(self.MISCONFIGURATION_PATTERNS)
        all_patterns.update(self.AUTH_PATTERNS)
        all_patterns.update(self.LOGGING_PATTERNS)
        all_patterns.update(self.SSRF_PATTERNS)

        for line_number, line in enumerate(lines, 1):
            for pattern_name, pattern_info in all_patterns.items():
                if re.search(pattern_info['pattern'], line, re.IGNORECASE):
                    category = pattern_info['category']
                    owasp_info = self.OWASP_CATEGORIES[category]

                    self.findings.append(OWASPFinding(
                        category=category,
                        title=f"{owasp_info['name']}: {pattern_info['message']}",
                        description=owasp_info['description'],
                        risk=pattern_info['risk'],
                        file_path=self.file_path,
                        line_number=line_number,
                        cwe_id=owasp_info['cwe'],
                        remediation=self._get_remediation(category, pattern_name),
                        references=self._get_references(category),
                        code_snippet=line.strip(),
                    ))

    def visit_Import(self, node: ast.Import) -> None:
        """Track imports for context."""
        for alias in node.names:
            self.imports.add(alias.name.split('.')[0])
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        """Track from imports."""
        if node.module:
            self.imports.add(node.module.split('.')[0])
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Check function-level security issues."""
        self.current_function = node.name

        # Check for missing authentication decorators
        if any(name in node.name.lower() for name in ['delete', 'update', 'create', 'admin']):
            # Check if it has authentication decorator
            has_auth = any(
                'auth' in str(dec) or 'login' in str(dec)
                for dec in node.decorator_list
            )

            if not has_auth:
                self.findings.append(OWASPFinding(
                    category='A01',
                    title='Missing Authentication Check',
                    description='Sensitive operation without authentication check',
                    risk=OWASPRisk.HIGH,
                    file_path=self.file_path,
                    line_number=node.lineno,
                    cwe_id=self.OWASP_CATEGORIES['A01']['cwe'],
                    remediation='Add @login_required or authentication check decorator',
                    references=[
                        'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
                    ],
                ))

        self.generic_visit(node)
        self.current_function = None

    def visit_Call(self, node: ast.Call) -> None:
        """Check function calls for security issues."""
        func_name = self._get_full_name(node.func)

        # Check for eval/exec
        if func_name in ['eval', 'exec', 'compile']:
            self.findings.append(OWASPFinding(
                category='A03',
                title='Arbitrary Code Execution',
                description=f'Use of {func_name}() allows arbitrary code execution',
                risk=OWASPRisk.CRITICAL,
                file_path=self.file_path,
                line_number=node.lineno,
                cwe_id='CWE-94',
                remediation='Never use eval/exec with user input. Use ast.literal_eval() for literals.',
                references=[
                    'https://owasp.org/Top10/A03_2021-Injection/',
                    'https://cwe.mitre.org/data/definitions/94.html',
                ],
            ))

        # Check for pickle unsafe deserialization
        if func_name in ['pickle.loads', 'pickle.load']:
            self.findings.append(OWASPFinding(
                category='A08',
                title='Unsafe Deserialization',
                description='pickle can execute arbitrary code during deserialization',
                risk=OWASPRisk.CRITICAL,
                file_path=self.file_path,
                line_number=node.lineno,
                cwe_id='CWE-502',
                remediation='Use json, yaml.safe_load, or restrict pickle to trusted data only',
                references=[
                    'https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/',
                ],
            ))

        # Check for subprocess with shell=True
        if func_name in ['subprocess.run', 'subprocess.call', 'subprocess.Popen']:
            for keyword in node.keywords:
                if keyword.arg == 'shell':
                    if isinstance(keyword.value, ast.Constant) and keyword.value.value is True:
                        self.findings.append(OWASPFinding(
                            category='A03',
                            title='Command Injection via shell=True',
                            description='subprocess with shell=True enables command injection',
                            risk=OWASPRisk.CRITICAL,
                            file_path=self.file_path,
                            line_number=node.lineno,
                            cwe_id='CWE-78',
                            remediation='Use shell=False (default) and pass command as list',
                            references=[
                                'https://owasp.org/Top10/A03_2021-Injection/',
                            ],
                        ))

        self.generic_visit(node)

    def _get_full_name(self, node) -> str:
        """Get full name of an AST node."""
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._get_full_name(node.value)}.{node.attr}"
        return ""

    def _get_remediation(self, category: str, pattern_name: str) -> str:
        """Get remediation advice for a finding."""
        remediations = {
            'A01': 'Implement proper authorization checks using decorators or middleware',
            'A02': 'Use strong encryption (AES-256), secure key management, and hash passwords with bcrypt/argon2',
            'A03': 'Use parameterized queries, prepared statements, or ORM with proper escaping',
            'A04': 'Implement security controls during design phase (threat modeling)',
            'A05': 'Review and harden all configuration settings for production',
            'A06': 'Update dependencies regularly and scan for known vulnerabilities',
            'A07': 'Implement proper authentication, MFA, and secure session management',
            'A08': 'Verify integrity of code, data, and dependencies (signatures, checksums)',
            'A09': 'Implement comprehensive security logging and monitoring',
            'A10': 'Validate and sanitize all user-supplied URLs and data',
        }
        return remediations.get(category, 'Review OWASP documentation for remediation guidance')

    def _get_references(self, category: str) -> List[str]:
        """Get reference links for an OWASP category."""
        return [
            f'https://owasp.org/Top10/{category}_2021-{self.OWASP_CATEGORIES[category]["name"].replace(" ", "_")}/',
        ]


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="OWASP Top 10 Security Vulnerability Scanner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --path src/
  %(prog)s --file app.py --check A03,A06
  %(prog)s --path . --format json --output owasp_report.json

OWASP Categories:
  A01 - Broken Access Control
  A02 - Cryptographic Failures
  A03 - Injection
  A04 - Insecure Design
  A05 - Security Misconfiguration
  A06 - Vulnerable/Outdated Components
  A07 - Identification & Authentication Failures
  A08 - Software/Data Integrity Failures
  A09 - Security Logging/Monitoring Failures
  A10 - Server-Side Request Forgery (SSRF)
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
        '--check',
        type=str,
        help='Comma-separated OWASP categories to check (e.g., A03,A06)'
    )

    parser.add_argument(
        '--min-risk',
        choices=['critical', 'high', 'medium', 'low'],
        default='low',
        help='Minimum risk level to report (default: low)'
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
        help='Output file'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output'
    )

    args = parser.parse_args()

    # Determine target path
    if args.file:
        target_path = args.file
    elif args.path:
        target_path = args.path
    else:
        target_path = Path.cwd()

    if not target_path.exists():
        print(f"Error: Path does not exist: {target_path}", file=sys.stderr)
        sys.exit(1)

    # Find Python files
    python_files = []
    if target_path.is_file() and target_path.suffix == '.py':
        python_files = [target_path]
    elif target_path.is_dir():
        python_files = list(target_path.rglob('*.py'))
    else:
        print(f"Error: Not a Python file or directory: {target_path}", file=sys.stderr)
        sys.exit(1)

    # Run OWASP checks
    all_findings = []

    for py_file in python_files:
        source_code = py_file.read_text()
        checker = OWASPChecker(str(py_file))
        findings = checker.check(source_code)
        all_findings.extend(findings)

    # Filter by category if specified
    if args.check:
        categories = args.check.upper().split(',')
        all_findings = [f for f in all_findings if f.category in categories]

    # Filter by risk level
    risk_order = ['critical', 'high', 'medium', 'low']
    min_index = risk_order.index(args.min_risk)
    all_findings = [
        f for f in all_findings
        if risk_order.index(f.risk.value) <= min_index
    ]

    # Format output
    if args.format == 'json':
        output = json.dumps({
            'scan_timestamp': datetime.now().isoformat(),
            'scan_path': str(target_path),
            'files_scanned': len(python_files),
            'total_findings': len(all_findings),
            'findings': [f.to_dict() for f in all_findings],
        }, indent=2)
    elif args.format == 'markdown':
        output = _format_markdown(all_findings, target_path, len(python_files))
    else:
        output = _format_text(all_findings, target_path, len(python_files), args.verbose)

    # Write output
    if args.output:
        args.output.write_text(output)
        print(f"OWASP report written to {args.output}", file=sys.stderr)
    else:
        print(output)

    # Exit with error if critical/high findings
    critical_count = sum(1 for f in all_findings if f.risk == OWASPRisk.CRITICAL)
    high_count = sum(1 for f in all_findings if f.risk == OWASPRisk.HIGH)

    if critical_count > 0 or high_count > 0:
        sys.exit(2)
    else:
        sys.exit(0)


def _format_text(findings: List[OWASPFinding], scan_path: Path, files_scanned: int, verbose: bool) -> str:
    """Format findings as text."""
    lines = [
        "=" * 80,
        "OWASP TOP 10 SECURITY VULNERABILITY REPORT",
        "=" * 80,
        f"Scan Path: {scan_path}",
        f"Files Scanned: {files_scanned}",
        f"Total Findings: {len(findings)}",
        "",
        "FINDINGS BY RISK LEVEL",
        "-" * 80,
    ]

    risk_counts = {}
    for finding in findings:
        risk_counts[finding.risk.value] = risk_counts.get(finding.risk.value, 0) + 1

    for risk in ['critical', 'high', 'medium', 'low']:
        count = risk_counts.get(risk, 0)
        if count > 0:
            lines.append(f"  {risk.upper()}: {count}")

    if findings:
        lines.extend([
            "",
            "DETAILED FINDINGS",
            "-" * 80,
        ])

        for finding in findings:
            lines.extend([
                "",
                f"Category: {finding.category} - {finding.title}",
                f"Risk: {finding.risk.value.upper()}",
                f"File: {finding.file_path}:{finding.line_number}",
                f"CWE: {finding.cwe_id}",
                f"Description: {finding.description}",
                f"Remediation: {finding.remediation}",
            ])

            if verbose and finding.code_snippet:
                lines.append(f"Code: {finding.code_snippet}")

            if finding.references:
                lines.append("References:")
                for ref in finding.references:
                    lines.append(f"  - {ref}")

    return "\n".join(lines)


def _format_markdown(findings: List[OWASPFinding], scan_path: Path, files_scanned: int) -> str:
    """Format findings as markdown."""
    lines = [
        "# OWASP Top 10 Security Vulnerability Report",
        "",
        f"**Scan Path:** `{scan_path}`",
        f"**Files Scanned:** {files_scanned}",
        f"**Total Findings:** {len(findings)}",
        "",
    ]

    risk_emojis = {'critical': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🟢'}

    # Group by category
    by_category = {}
    for finding in findings:
        if finding.category not in by_category:
            by_category[finding.category] = []
        by_category[finding.category].append(finding)

    for category in sorted(by_category.keys()):
        category_findings = by_category[category]
        lines.append(f"## {category} - {category_findings[0].title.split(':')[0]}")
        lines.append("")
        lines.append(f"**Findings:** {len(category_findings)}")
        lines.append("")

        for finding in category_findings:
            emoji = risk_emojis.get(finding.risk.value, '•')
            lines.extend([
                f"### {emoji} {finding.file_path}:{finding.line_number}",
                "",
                f"- **Risk:** `{finding.risk.value}`",
                f"- **CWE:** [`{finding.cwe_id}`](https://cwe.mitre.org/data/definitions/{finding.cwe_id.split('-')[1]}.html)",
                f"- **Description:** {finding.description}",
                f"- **Remediation:** {finding.remediation}",
                "",
            ])

            if finding.code_snippet:
                lines.append(f"```python")
                lines.append(finding.code_snippet)
                lines.append(f"```")
                lines.append("")

            if finding.references:
                lines.append("**References:**")
                for ref in finding.references:
                    lines.append(f"- {ref}")
                lines.append("")

    return "\n".join(lines)


if __name__ == '__main__':
    main()
