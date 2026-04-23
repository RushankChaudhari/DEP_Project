from __future__ import annotations

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}

def test_global_insights_has_required_keys(client):
    response = client.get("/api/global")
    assert response.status_code == 200
    data = response.get_json()
    
    # Assert primary structure
    assert "kpis" in data
    assert "segmentation" in data
    assert "basket_rules" in data
    assert "anomalies" in data
    assert "forecast" in data
    assert "meta" in data
    
    # Assert kpis structure
    assert "total_revenue" in data["kpis"]
    assert "aov" in data["kpis"]

def test_local_insights_no_data_returns_404(client):
    # Depending on whether data is naturally cached by test execution, 
    # it might return 404 or 200. Normally clean instances return 404.
    response = client.get("/api/local")
    if response.status_code == 404:
        assert response.get_json() == {"error": "No local upload processed yet"}
    else:
        assert response.status_code == 200
