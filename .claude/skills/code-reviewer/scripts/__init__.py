"""
Code Reviewer Scripts Package
=============================

Production-grade tools for automated code review, security analysis,
and quality assessment.

Author: Claude Code Engineering Team
Version: 1.0.0
License: MIT
"""

__version__ = "1.0.0"
__all__ = [
    "SecurityAnalyzer",
    "PerformanceProfiler",
    "QualityMetrics",
    "OWASPChecker",
]

from .analyzer import SecurityAnalyzer, PerformanceProfiler, QualityMetrics
from .owasp import OWASPChecker

# Package metadata
PACKAGE_INFO = {
    "name": "code-reviewer-scripts",
    "version": __version__,
    "description": "Automated code review and analysis tools",
    "author": "Claude Code Engineering",
    "license": "MIT",
    "requires_python": ">=3.10",
    "dependencies": [
        "ast>=3.10",
        "radon>=6.0",
        "bandit>=1.7",
        "pylint>=2.17",
        "mypy>=1.5",
    ],
}
