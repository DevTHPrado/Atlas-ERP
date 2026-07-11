from fastapi.testclient import TestClient

from app.main import app


def test_health() -> None:
    """Verify the health endpoint returns 200 OK."""
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
