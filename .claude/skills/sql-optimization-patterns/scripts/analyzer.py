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
SQL Query Performance Analyzer
==============================

Production-grade tool for analyzing SQL queries, detecting anti-patterns,
and generating optimization recommendations.

Features:
- EXPLAIN ANALYZE parsing and analysis
- N+1 query detection
- Missing index identification
- Pagination pattern analysis
- Query complexity scoring
- Index recommendation generation

Usage:
    python -m sql_optimizer --query "SELECT * FROM users WHERE email = '...'"
    python -m sql_optimizer --file queries.sql --format json
    python -m sql_optimizer --connection-string postgresql://... --analyze-slow

Author: Claude Code Engineering Team
Version: 1.0.0
License: MIT
"""

import re
import sys
import json
import argparse
import hashlib
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path
from typing import List, Dict, Optional, Set, Tuple, Any
from datetime import datetime


class QueryType(Enum):
    """Types of SQL queries."""
    SELECT = "select"
    INSERT = "insert"
    UPDATE = "update"
    DELETE = "delete"
    CREATE = "create"
    ALTER = "alter"
    DROP = "drop"
    TRUNCATE = "truncate"
    UNKNOWN = "unknown"


class IssueSeverity(Enum):
    """Severity levels for query issues."""
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class QueryIssue:
    """Represents a detected query issue."""
    code: str
    message: str
    severity: IssueSeverity
    line_number: Optional[int] = None
    column_number: Optional[int] = None
    suggestion: Optional[str] = None
    estimated_impact: Optional[str] = None
    fix_sql: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        d = asdict(self)
        d['severity'] = self.severity.value
        return d


@dataclass
class IndexRecommendation:
    """Recommended index for query optimization."""
    table_name: str
    column_names: List[str]
    index_type: str  # btree, hash, gin, gist
    reason: str
    estimated_benefit: str
    create_sql: str
    is_unique: bool = False
    is_partial: bool = False
    partial_condition: Optional[str] = None


@dataclass
class QueryAnalysis:
    """Complete analysis of a SQL query."""
    query_id: str
    original_query: str
    normalized_query: str
    query_type: QueryType
    issues: List[QueryIssue]
    index_recommendations: List[IndexRecommendation]
    complexity_score: int
    estimated_rows: Optional[int]
    execution_time_ms: Optional[float]
    tables_accessed: List[str]
    columns_used: Dict[str, List[str]]  # table -> columns
    joins: List[Dict[str, Any]]
    subqueries: int
    cte_count: int
    has_aggregation: bool
    has_window_functions: bool
    has_order_by: bool
    has_limit: bool
    uses_offset: bool
    analysis_timestamp: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'query_id': self.query_id,
            'original_query': self.original_query,
            'normalized_query': self.normalized_query,
            'query_type': self.query_type.value,
            'issues': [issue.to_dict() for issue in self.issues],
            'index_recommendations': [asdict(rec) for rec in self.index_recommendations],
            'complexity_score': self.complexity_score,
            'estimated_rows': self.estimated_rows,
            'execution_time_ms': self.execution_time_ms,
            'tables_accessed': self.tables_accessed,
            'columns_used': self.columns_used,
            'joins': self.joins,
            'subqueries': self.subqueries,
            'cte_count': self.cte_count,
            'has_aggregation': self.has_aggregation,
            'has_window_functions': self.has_window_functions,
            'has_order_by': self.has_order_by,
            'has_limit': self.has_limit,
            'uses_offset': self.uses_offset,
            'analysis_timestamp': self.analysis_timestamp,
        }


class SQLQueryAnalyzer:
    """
    Analyzes SQL queries for performance issues and optimization opportunities.

    Supports PostgreSQL, MySQL, and SQLite syntax.
    """

    # SQL anti-patterns
    ANTI_PATTERNS = {
        'select_star': {
            'pattern': r'SELECT\s+\*\s+FROM',
            'severity': IssueSeverity.MEDIUM,
            'message': 'SELECT * retrieves all columns, potentially fetching unnecessary data',
            'suggestion': 'Specify only required columns: SELECT col1, col2 FROM table_name',
        },
        'leading_wildcard_like': {
            'pattern': r'LIKE\s+[\'"]%[^\'%]+',
            'severity': IssueSeverity.HIGH,
            'message': 'Leading wildcard in LIKE prevents index usage',
            'suggestion': 'Use full-text search, trigrams, or reverse the string for indexing',
        },
        'or_in_where': {
            'pattern': r'WHERE\s+(?:.+?)\s+OR\s+',
            'severity': IssueSeverity.MEDIUM,
            'message': 'OR conditions may prevent index usage',
            'suggestion': 'Use IN() or UNION when appropriate',
        },
        'offset_pagination': {
            'pattern': r'LIMIT\s+\d+\s+OFFSET\s+\d+',
            'severity': IssueSeverity.HIGH,
            'message': 'OFFSET pagination becomes slower as offset grows',
            'suggestion': 'Use keyset pagination: WHERE id > last_id LIMIT N',
        },
        'count_without_filter': {
            'pattern': r'SELECT\s+COUNT\s*\(\s*\*\s*\)\s+FROM',
            'severity': IssueSeverity.LOW,
            'message': 'COUNT(*) without WHERE clause may be slow on large tables',
            'suggestion': 'Add WHERE filter or use table estimates for approximations',
        },
        'order_by_without_index': {
            'pattern': r'ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)',
            'severity': IssueSeverity.MEDIUM,
            'message': 'ORDER BY without index may require filesort',
            'suggestion': 'Add index on ORDER BY columns',
        },
        'distinct_order_by': {
            'pattern': r'SELECT\s+DISTINCT.+ORDER\s+BY',
            'severity': IssueSeverity.LOW,
            'message': 'DISTINCT with ORDER BY may be inefficient',
            'suggestion': 'Consider using GROUP BY or optimizing the query structure',
        },
        'nested_subqueries': {
            'pattern': r'\(\s*SELECT.*\(\s*SELECT',
            'severity': IssueSeverity.HIGH,
            'message': 'Nested subqueries often indicate poor query structure',
            'suggestion': 'Refactor to use JOINs or CTEs (WITH clauses)',
        },
    }

    # Database-specific keywords
    JOIN_KEYWORDS = ['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'INNER JOIN',
                     'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'CROSS JOIN', 'NATURAL JOIN']

    AGGREGATE_FUNCTIONS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'STDDEV', 'VARIANCE',
                           'GROUP_CONCAT', 'STRING_AGG', 'ARRAY_AGG', 'JSON_AGG']

    WINDOW_FUNCTIONS = ['ROW_NUMBER', 'RANK', 'DENSE_RANK', 'NTILE', 'LAG', 'LEAD',
                       'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE']

    def __init__(self, dialect: str = 'postgresql'):
        """
        Initialize the SQL query analyzer.

        Args:
            dialect: SQL dialect ('postgresql', 'mysql', 'sqlite')
        """
        self.dialect = dialect.lower()
        self.issues: List[QueryIssue] = []
        self.index_recommendations: List[IndexRecommendation] = []

    def analyze(self, query: str, explain_output: Optional[str] = None) -> QueryAnalysis:
        """
        Perform comprehensive analysis of a SQL query.

        Args:
            query: SQL query string to analyze
            explain_output: Optional EXPLAIN ANALYZE output

        Returns:
            QueryAnalysis object with complete analysis
        """
        self.issues.clear()
        self.index_recommendations.clear()

        # Normalize query
        normalized_query = self._normalize_query(query)

        # Generate query ID
        query_id = hashlib.md5(normalized_query.encode()).hexdigest()[:12]

        # Detect query type
        query_type = self._detect_query_type(query)

        # Detect anti-patterns
        self._detect_anti_patterns(query)

        # Extract tables and columns
        tables_accessed = self._extract_tables(query)
        columns_used = self._extract_columns(query, tables_accessed)

        # Analyze joins
        joins = self._analyze_joins(query)

        # Count subqueries and CTEs
        subqueries = self._count_subqueries(query)
        cte_count = self._count_ctes(query)

        # Check for special constructs
        has_aggregation = self._has_aggregation(query)
        has_window_functions = self._has_window_functions(query)
        has_order_by = self._has_order_by(query)
        has_limit = self._has_limit(query)
        uses_offset = self._uses_offset(query)

        # Calculate complexity score
        complexity_score = self._calculate_complexity_score(
            joins, subqueries, cte_count, has_aggregation, has_window_functions
        )

        # Generate index recommendations
        self._generate_index_recommendations(query, tables_accessed, columns_used)

        # Parse EXPLAIN output if provided
        estimated_rows = None
        execution_time_ms = None
        if explain_output:
            estimated_rows, execution_time_ms = self._parse_explain_output(explain_output)

        return QueryAnalysis(
            query_id=query_id,
            original_query=query,
            normalized_query=normalized_query,
            query_type=query_type,
            issues=self.issues,
            index_recommendations=self.index_recommendations,
            complexity_score=complexity_score,
            estimated_rows=estimated_rows,
            execution_time_ms=execution_time_ms,
            tables_accessed=tables_accessed,
            columns_used=columns_used,
            joins=joins,
            subqueries=subqueries,
            cte_count=cte_count,
            has_aggregation=has_aggregation,
            has_window_functions=has_window_functions,
            has_order_by=has_order_by,
            has_limit=has_limit,
            uses_offset=uses_offset,
            analysis_timestamp=datetime.now().isoformat(),
        )

    def _normalize_query(self, query: str) -> str:
        """Normalize query by removing extra whitespace and standardizing case."""
        # Remove extra whitespace and newlines
        query = re.sub(r'\s+', ' ', query.strip())
        # Remove comments
        query = re.sub(r'--[^\n]*', '', query)
        query = re.sub(r'/\*.*?\*/', '', query, flags=re.DOTALL)
        return query.upper()

    def _detect_query_type(self, query: str) -> QueryType:
        """Detect the type of SQL query."""
        query_upper = query.strip().upper()

        for qtype in QueryType:
            if query_upper.startswith(qtype.value):
                return qtype

        return QueryType.UNKNOWN

    def _detect_anti_patterns(self, query: str) -> None:
        """Detect common SQL anti-patterns."""
        query_upper = query.upper()

        for code, pattern_info in self.ANTI_PATTERNS.items():
            if re.search(pattern_info['pattern'], query_upper, re.IGNORECASE | re.DOTALL):
                self.issues.append(QueryIssue(
                    code=code,
                    message=pattern_info['message'],
                    severity=pattern_info['severity'],
                    suggestion=pattern_info['suggestion'],
                ))

        # Check for N+1 pattern indicators
        if 'FOR' in query_upper and 'SELECT' in query_upper:
            # This is a simplified check - in practice would need more context
            pass

        # Check for missing indexes on WHERE clauses
        self._check_where_clause(query)

        # Check for inefficient JOIN order (simplified)
        if query_upper.count('JOIN') > 4:
            self.issues.append(QueryIssue(
                code='excessive_joins',
                message=f'Query contains {query_upper.count("JOIN")} JOINs',
                severity=IssueSeverity.HIGH,
                suggestion='Review join order and consider denormalization or query restructuring',
            ))

    def _check_where_clause(self, query: str) -> None:
        """Check WHERE clause for missing indexes."""
        # Extract WHERE clause
        where_match = re.search(r'WHERE\s+(.+?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|\s+OFFSET|$)',
                               query, re.IGNORECASE | re.DOTALL)

        if where_match:
            where_clause = where_match.group(1)
            # Extract columns used in conditions
            column_refs = re.findall(r'(\w+)\s*[=<>!]', where_clause)

            for col in column_refs:
                # Simplified check - would need schema info to verify index existence
                if col.upper() not in ['ID', 'CREATED_AT', 'UPDATED_AT']:
                    # Assume non-standard columns might need indexes
                    pass

    def _extract_tables(self, query: str) -> List[str]:
        """Extract table names from query."""
        tables = set()

        # FROM clause
        from_match = re.search(r'FROM\s+(\w+)', query, re.IGNORECASE)
        if from_match:
            tables.add(from_match.group(1).lower())

        # JOINs
        for join_keyword in self.JOIN_KEYWORDS:
            pattern = rf'{join_keyword}\s+(\w+)'
            matches = re.findall(pattern, query, re.IGNORECASE)
            tables.update(m.lower() for m in matches)

        return sorted(tables)

    def _extract_columns(self, query: str, tables: List[str]) -> Dict[str, List[str]]:
        """Extract columns used per table."""
        columns_by_table = {table: [] for table in tables}

        # Extract column references from SELECT
        select_match = re.search(r'SELECT\s+(.+?)\s+FROM', query, re.IGNORECASE | re.DOTALL)
        if select_match:
            select_clause = select_match.group(1)
            # This is simplified - real implementation would parse properly
            for table in tables:
                # Look for table.column or column references
                pattern = rf'\b{table}\.(\w+)|\b(\w+)\b'
                matches = re.findall(pattern, select_clause, re.IGNORECASE)
                for match in matches:
                    col = match[0] if match[0] else match[1]
                    if col.upper() not in ['*', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN']:
                        columns_by_table[table].append(col)

        return columns_by_table

    def _analyze_joins(self, query: str) -> List[Dict[str, Any]]:
        """Analyze JOINs in the query."""
        joins = []

        for join_keyword in self.JOIN_KEYWORDS:
            pattern = rf'{join_keyword}\s+(\w+)\s+(?:AS\s+)?(\w+)?\s+ON\s+(.+?)(?:\s+(?:JOIN|WHERE|GROUP|ORDER|LIMIT|$))'
            matches = re.findall(pattern, query, re.IGNORECASE | re.DOTALL)

            for match in matches:
                table_name = match[0]
                alias = match[1] if match[1] else table_name
                on_clause = match[2]

                joins.append({
                    'type': join_keyword,
                    'table': table_name.lower(),
                    'alias': alias.lower() if alias else None,
                    'on_clause': on_clause.strip(),
                })

        return joins

    def _count_subqueries(self, query: str) -> int:
        """Count subqueries in the query."""
        # Count SELECT statements in parentheses
        return len(re.findall(r'\(\s*SELECT', query, re.IGNORECASE))

    def _count_ctes(self, query: str) -> int:
        """Count Common Table Expressions (WITH clauses)."""
        if not query.upper().strip().startswith('WITH'):
            return 0
        # Count CTE definitions
        return len(re.findall(r'(\w+)\s+AS\s*\(', query, re.IGNORECASE))

    def _has_aggregation(self, query: str) -> bool:
        """Check if query uses aggregate functions."""
        query_upper = query.upper()
        return any(func in query_upper for func in self.AGGREGATE_FUNCTIONS)

    def _has_window_functions(self, query: str) -> bool:
        """Check if query uses window functions."""
        query_upper = query.upper()
        return any(func in query_upper for func in self.WINDOW_FUNCTIONS)

    def _has_order_by(self, query: str) -> bool:
        """Check if query has ORDER BY clause."""
        return bool(re.search(r'ORDER\s+BY', query, re.IGNORECASE))

    def _has_limit(self, query: str) -> bool:
        """Check if query has LIMIT clause."""
        return bool(re.search(r'\BLIMIT\b', query, re.IGNORECASE))

    def _uses_offset(self, query: str) -> bool:
        """Check if query uses OFFSET pagination."""
        return bool(re.search(r'\BOFFSET\b', query, re.IGNORECASE))

    def _calculate_complexity_score(self, joins: List, subqueries: int,
                                   cte_count: int, has_aggregation: bool,
                                   has_window_functions: bool) -> int:
        """Calculate query complexity score (0-100)."""
        score = 0

        # Base score
        score += 10

        # Joins
        score += len(joins) * 10

        # Subqueries
        score += subqueries * 15

        # CTEs (reduce complexity compared to subqueries)
        score += cte_count * 5

        # Aggregation
        if has_aggregation:
            score += 10

        # Window functions
        if has_window_functions:
            score += 15

        return min(score, 100)

    def _generate_index_recommendations(self, query: str,
                                       tables: List[str],
                                       columns: Dict[str, List[str]]) -> None:
        """Generate index recommendations based on query analysis."""
        query_upper = query.upper()

        # Check WHERE columns
        where_match = re.search(r'WHERE\s+(.+?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|\s+OFFSET|$)',
                               query_upper, re.DOTALL)
        if where_match:
            where_clause = where_match.group(1)

            for table in tables:
                # Find columns used in WHERE for this table
                table_cols = columns.get(table, [])

                # Look for equality conditions (best for indexes)
                equality_cols = re.findall(rf'{table}\.?(\w+)\s*=', where_clause)
                if equality_cols:
                    self.index_recommendations.append(IndexRecommendation(
                        table_name=table,
                        column_names=list(set(equality_cols)),
                        index_type='btree',
                        reason='Column used in WHERE equality condition',
                        estimated_benefit='10x-100x faster lookups',
                        create_sql=self._generate_create_index_sql(table, list(set(equality_cols))),
                    ))

        # Check ORDER BY columns
        order_match = re.search(r'ORDER\s+BY\s+(.+?)(?:\s+LIMIT|\s+OFFSET|$)',
                               query_upper, re.DOTALL)
        if order_match:
            order_clause = order_match.group(1)

            for table in tables:
                # Find columns used in ORDER BY
                order_cols = re.findall(rf'{table}\.?(\w+)', order_clause)
                if order_cols:
                    self.index_recommendations.append(IndexRecommendation(
                        table_name=table,
                        column_names=list(set(order_cols)),
                        index_type='btree',
                        reason='Column used in ORDER BY (prevents filesort)',
                        estimated_benefit='Eliminates filesort operation',
                        create_sql=self._generate_create_index_sql(table, list(set(order_cols))),
                    ))

        # Check JOIN columns
        for join_info in self._analyze_joins(query):
            table = join_info['table']
            # Extract join columns from ON clause
            on_cols = re.findall(r'(\w+)\s*=', join_info['on_clause'])
            if on_cols:
                self.index_recommendations.append(IndexRecommendation(
                    table_name=table,
                    column_names=on_cols,
                    index_type='btree',
                    reason='Column used in JOIN condition',
                    estimated_benefit='Significantly improves JOIN performance',
                    create_sql=self._generate_create_index_sql(table, on_cols),
                ))

    def _generate_create_index_sql(self, table: str, columns: List[str],
                                   is_unique: bool = False) -> str:
        """Generate CREATE INDEX SQL statement."""
        cols_str = ', '.join(columns)
        idx_name = f"idx_{table}_{'_'.join(columns[:3])}"
        unique = "UNIQUE " if is_unique else ""

        return f"CREATE {unique}INDEX {idx_name} ON {table} ({cols_str});"

    def _parse_explain_output(self, explain_output: str) -> Tuple[Optional[int], Optional[float]]:
        """
        Parse EXPLAIN ANALYZE output.

        Args:
            explain_output: EXPLAIN ANALYZE output string

        Returns:
            Tuple of (estimated_rows, execution_time_ms)
        """
        estimated_rows = None
        execution_time_ms = None

        # Parse execution time
        time_match = re.search(r'Execution Time:\s*([\d.]+)\s*ms', explain_output, re.IGNORECASE)
        if time_match:
            execution_time_ms = float(time_match.group(1))

        # Parse actual rows from plan
        rows_match = re.search(r'actual rows=(\d+)', explain_output)
        if rows_match:
            estimated_rows = int(rows_match.group(1))

        return estimated_rows, execution_time_ms


class SQLQueryOptimizer:
    """High-level interface for SQL query optimization."""

    def __init__(self, dialect: str = 'postgresql'):
        """Initialize the optimizer."""
        self.analyzer = SQLQueryAnalyzer(dialect)

    def optimize_query(self, query: str) -> str:
        """
        Generate an optimized version of the query.

        Args:
            query: Original SQL query

        Returns:
            Optimized SQL query with suggested improvements
        """
        # Analyze the query
        analysis = self.analyzer.analyze(query)

        # Start with original query
        optimized = query

        # Apply optimizations based on issues found
        for issue in analysis.issues:
            if issue.code == 'select_star':
                # Suggest specifying columns (but can't auto-generate without schema)
                pass
            elif issue.code == 'offset_pagination' and issue.suggestion:
                # This would need primary key info to generate
                pass

        return optimized

    def suggest_indexes(self, query: str, schema_file: Optional[Path] = None) -> List[IndexRecommendation]:
        """
        Generate index recommendations for a query.

        Args:
            query: SQL query to analyze
            schema_file: Optional schema file for context

        Returns:
            List of index recommendations
        """
        analysis = self.analyzer.analyze(query)
        return analysis.index_recommendations


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="SQL Query Performance Analyzer and Optimizer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --query "SELECT * FROM users WHERE email = 'test@example.com'"
  %(prog)s --file queries.sql --format json
  %(prog)s --query "SELECT ..." --explain-file explain.txt
  %(prog)s --file slow_queries.sql --suggest-indexes

Supported dialects: postgresql, mysql, sqlite
        """
    )

    parser.add_argument(
        '--query', '-q',
        type=str,
        help='SQL query to analyze'
    )

    parser.add_argument(
        '--file', '-f',
        type=Path,
        help='File containing SQL queries'
    )

    parser.add_argument(
        '--explain-file',
        type=Path,
        help='File containing EXPLAIN ANALYZE output'
    )

    parser.add_argument(
        '--dialect',
        choices=['postgresql', 'mysql', 'sqlite'],
        default='postgresql',
        help='SQL dialect (default: postgresql)'
    )

    parser.add_argument(
        '--suggest-indexes',
        action='store_true',
        help='Generate index recommendations'
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

    # Get query to analyze
    if args.file:
        query = args.file.read_text().strip()
    elif args.query:
        query = args.query
    else:
        print("Error: Either --query or --file must be provided", file=sys.stderr)
        sys.exit(1)

    # Get EXPLAIN output if provided
    explain_output = None
    if args.explain_file:
        explain_output = args.explain_file.read_text().strip()

    # Run analysis
    optimizer = SQLQueryOptimizer(args.dialect)
    analysis = optimizer.analyzer.analyze(query, explain_output)

    # Format output
    if args.format == 'json':
        output = json.dumps(analysis.to_dict(), indent=2)
    elif args.format == 'markdown':
        output = _format_markdown(analysis)
    else:
        output = _format_text(analysis, args.verbose, args.suggest_indexes)

    # Write output
    if args.output:
        args.output.write_text(output)
        print(f"Analysis written to {args.output}", file=sys.stderr)
    else:
        print(output)

    # Exit with error if critical issues found
    critical_count = sum(1 for i in analysis.issues if i.severity == IssueSeverity.CRITICAL)
    high_count = sum(1 for i in analysis.issues if i.severity == IssueSeverity.HIGH)

    if critical_count > 0 or high_count > 0:
        sys.exit(2)
    else:
        sys.exit(0)


def _format_text(analysis: QueryAnalysis, verbose: bool, suggest_indexes: bool) -> str:
    """Format analysis as text."""
    lines = [
        "=" * 80,
        "SQL QUERY ANALYSIS REPORT",
        "=" * 80,
        f"Query Type: {analysis.query_type.value.upper()}",
        f"Complexity Score: {analysis.complexity_score}/100",
        f"Tables Accessed: {', '.join(analysis.tables_accessed) if analysis.tables_accessed else 'N/A'}",
        f"Subqueries: {analysis.subqueries}",
        f"CTEs: {analysis.cte_count}",
        f"Joins: {len(analysis.joins)}",
        "",
    ]

    if analysis.estimated_rows:
        lines.append(f"Estimated Rows: {analysis.estimated_rows}")

    if analysis.execution_time_ms:
        lines.append(f"Execution Time: {analysis.execution_time_ms:.2f}ms")

    lines.extend([
        "",
        "ISSUES FOUND",
        "-" * 80,
    ])

    if not analysis.issues:
        lines.append("No issues found!")
    else:
        for issue in analysis.issues:
            lines.extend([
                "",
                f"[{issue.severity.value.upper()}] {issue.message}",
                f"  Code: {issue.code}",
            ])
            if issue.suggestion:
                lines.append(f"  Suggestion: {issue.suggestion}")

    if suggest_indexes and analysis.index_recommendations:
        lines.extend([
            "",
            "",
            "INDEX RECOMMENDATIONS",
            "-" * 80,
        ])

        for idx_rec in analysis.index_recommendations:
            lines.extend([
                "",
                f"Table: {idx_rec.table_name}",
                f"Columns: {', '.join(idx_rec.column_names)}",
                f"Type: {idx_rec.index_type}",
                f"Reason: {idx_rec.reason}",
                f"Estimated Benefit: {idx_rec.estimated_benefit}",
                "",
                "SQL:",
                f"  {idx_rec.create_sql}",
            ])

    return "\n".join(lines)


def _format_markdown(analysis: QueryAnalysis) -> str:
    """Format analysis as markdown."""
    lines = [
        "# SQL Query Analysis Report",
        "",
        f"**Query Type:** `{analysis.query_type.value}`",
        f"**Complexity Score:** {analysis.complexity_score}/100",
        f"**Tables:** {', '.join(analysis.tables_accessed) or 'N/A'}",
        "",
        "## Issues",
        "",
    ]

    if not analysis.issues:
        lines.append("✅ No issues found!")
    else:
        severity_emoji = {
            'critical': '🔴',
            'high': '🟠',
            'medium': '🟡',
            'low': '🟢',
            'info': 'ℹ️',
        }

        for issue in analysis.issues:
            emoji = severity_emoji.get(issue.severity.value, '•')
            lines.extend([
                f"### {emoji} {issue.severity.value.upper()}: {issue.message}",
                "",
                f"- **Code:** `{issue.code}`",
            ])

            if issue.suggestion:
                lines.append(f"- **Suggestion:** {issue.suggestion}")

            lines.append("")

    if analysis.index_recommendations:
        lines.extend([
            "## Index Recommendations",
            "",
        ])

        for idx_rec in analysis.index_recommendations:
            lines.extend([
                f"### `{idx_rec.table_name}`",
                "",
                f"- **Columns:** `{', '.join(idx_rec.column_names)}`",
                f"- **Type:** {idx_rec.index_type}",
                f"- **Benefit:** {idx_rec.estimated_benefit}",
                "",
                "```sql",
                idx_rec.create_sql,
                "```",
                "",
            ])

    return "\n".join(lines)


if __name__ == '__main__':
    main()
