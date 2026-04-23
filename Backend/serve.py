import logging
from waitress import serve
from app import create_app
from config import AppConfig

# Configure base logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    app = create_app()
    cfg = AppConfig()
    # Log startup details
    logger.info(f"Starting Waitress server on {cfg.host}:{cfg.port}")
    logger.info(f"CORS origins configured: {cfg.cors_origins}")
    
    # Run WSGI server
    serve(app, host=cfg.host, port=cfg.port)
