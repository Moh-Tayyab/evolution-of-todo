# SQL Query Optimization Patterns

# Pattern 1: Use specific columns instead of SELECT *
def get_user_optimized(user_id: int):
    """Optimized: Select only needed columns"""
    return db.execute(
        "SELECT id, name, email FROM users WHERE id = ?",
        (user_id,)
    )


def get_user_unoptimized(user_id: int):
    """Unoptimized: Selects all columns"""
    return db.execute(
        "SELECT * FROM users WHERE id = ?",
        (user_id,)
    )


# Pattern 2: Use indexes in WHERE and JOIN
def get_todos_by_user_optimized(user_id: int):
    """Optimized: Uses index on user_id"""
    return db.execute(
        "SELECT id, title, completed FROM todos WHERE user_id = ?",
        (user_id,)
    )


# Pattern 3: Avoid N+1 queries with JOINs
def get_todos_with_users_optimized():
    """Optimized: Single query with JOIN"""
    return db.execute("""
        SELECT t.id, t.title, t.completed, u.name as user_name
        FROM todos t
        JOIN users u ON t.user_id = u.id
    """)


def get_todos_with_users_unoptimized():
    """Unoptimized: N+1 queries"""
    todos = db.execute("SELECT * FROM todos")
    results = []

    for todo in todos:
        user = db.execute("SELECT * FROM users WHERE id = ?", (todo.user_id,))
        results.append({**todo, user_name: user.name})

    return results


# Pattern 4: Use LIMIT for pagination
def get_todos_paginated(user_id: int, offset: int = 0, limit: int = 10):
    """Efficient pagination"""
    return db.execute(
        "SELECT id, title FROM todos WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (user_id, limit, offset)
    )


# Pattern 5: Use COUNT(*) for counting
def count_todos(user_id: int):
    """Optimized: COUNT(*) is efficient"""
    return db.execute(
        "SELECT COUNT(*) as total FROM todos WHERE user_id = ?",
        (user_id,)
    ).fetchone()[0]
