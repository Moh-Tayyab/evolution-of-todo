# @spec: specs/002-fullstack-web-app/plan.md
# Route exports

from .tasks import router as tasks_router
from .tags import router as tags_router
from .health import router as health_router

__all__ = ["tasks_router", "tags_router", "health_router"]
