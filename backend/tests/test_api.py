"""Test suite for backend API."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "ok" in response.json()["status"]


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data


# Note: Additional tests would require mocking GitHub API and MongoDB
# Add pytest-asyncio and httpx[http2] for async test support
