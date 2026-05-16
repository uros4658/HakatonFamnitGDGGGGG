from fastapi.testclient import TestClient

from api.app import app


def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_sample_demo_endpoint():
    client = TestClient(app)
    response = client.get("/sample-demo")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["analysis"]["detected_groups"]


def test_analyze_rejects_non_wav_filename():
    client = TestClient(app)
    response = client.post(
        "/analyze",
        content=b"not wav",
        headers={"x-filename": "bad.txt", "content-type": "application/octet-stream"},
    )
    assert response.status_code == 400
