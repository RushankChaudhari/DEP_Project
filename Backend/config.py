from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


BASE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = BASE_DIR / "DataSets"
ECOMMERCE_DIR = DATASETS_DIR / "ecommerce"
MODELS_DIR = BASE_DIR / "models"
UPLOADS_DIR = BASE_DIR / "uploads"


@dataclass(frozen=True)
class AppConfig:
    flask_env: str = field(default_factory=lambda: os.getenv("FLASK_ENV", "development"))
    flask_debug: bool = field(default_factory=lambda: os.getenv("FLASK_DEBUG", "1").lower() in ("1", "true", "yes"))
    host: str = field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = field(default_factory=lambda: int(os.getenv("PORT", "5000")))
    cors_origins: tuple[str, ...] = field(
        default_factory=lambda: tuple(os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","))
    )


CSV_PATHS = {
    "amazon": DATASETS_DIR / "amazon_sales_2025_INR_cleaned.csv",
    "dmart": DATASETS_DIR / "DMart_sample_data.csv",
    "flipkart": DATASETS_DIR / "flipkart_com-ecommerce_sample.csv",
    "growth36": DATASETS_DIR / "indian_ecommerce_pricing_revenue_growth_36_months.csv",
    "events": ECOMMERCE_DIR / "events.csv",
    "order_items": ECOMMERCE_DIR / "order_items.csv",
    "orders": ECOMMERCE_DIR / "orders.csv",
    "products": ECOMMERCE_DIR / "products.csv",
    "reviews": ECOMMERCE_DIR / "reviews.csv",
    "users": ECOMMERCE_DIR / "users.csv",
}


MODEL_PATHS = {
    "gmm": MODELS_DIR / "gmm_model.pkl",
    "isolation": MODELS_DIR / "isolation_model.pkl",
    "arima": MODELS_DIR / "arima_model.pkl",
    "discount": MODELS_DIR / "discount_model.pkl",
}
