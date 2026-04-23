from __future__ import annotations

import pytest

from app import create_app

@pytest.fixture
def app():
    # Setup test app
    app = create_app()
    app.config.update({
        "TESTING": True,
        # Ensure we don't accidentally write to real uploads during testing
        "UPLOAD_FOLDER": "/tmp/test_uploads"
    })
    
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()
