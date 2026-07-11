"""Celery worker for asynchronous task processing."""

from celery import Celery

from app.config.settings import settings

celery_app = Celery("erp", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.task_routes = {"app.tasks.*": {"queue": "default"}}
