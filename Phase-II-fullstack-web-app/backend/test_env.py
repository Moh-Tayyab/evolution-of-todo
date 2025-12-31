"""Test script to check environment variables"""
from src.config import get_settings

settings = get_settings()
print(f"DATABASE_URL: '{settings.database_url}'")
print(f"DATABASE_URL length: {len(settings.database_url)}")
print(f"DATABASE_URL repr: {repr(settings.database_url)}")
