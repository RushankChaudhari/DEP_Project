from __future__ import annotations

from services.anomaly_detection import run_anomaly_detection
from services.basket_analysis import run_basket_analysis
from services.data_cleaner import clean_datasets
from services.data_loader import load_all_datasets
from services.data_merger import create_master_transactions
from services.discount_model import run_discount_regression
from services.feature_engineering import build_features
from services.forecasting_model import run_forecast
from services.kpi_engine import compute_kpis
from services.segmentation_gmm import run_gmm_segmentation

from utils.helpers import filter_dataset

def run_global_pipeline(
    start_date: str | None = None,
    end_date: str | None = None,
    category: str | None = None,
    state: str | None = None,
) -> dict[str, object]:
    raw_data = load_all_datasets()
    clean_data = clean_datasets(raw_data)

    master = create_master_transactions(clean_data)
    
    # Apply dynamic filters
    filtered_master = filter_dataset(
        master, start_date=start_date, end_date=end_date, category=category, state=state
    )
    
    featured = build_features(filtered_master)

    kpis = compute_kpis(featured)
    segmentation = run_gmm_segmentation(featured)
    
    # Filter order items for basket analysis so it matches the filtered orders
    if len(filtered_master) < len(master):
        valid_orders = set(filtered_master["order_id"])
        db_items = clean_data["order_items"]
        filtered_items = db_items[db_items["order_id"].isin(valid_orders)]
    else:
        filtered_items = clean_data["order_items"]
        
    basket_rules = run_basket_analysis(filtered_items, clean_data["products"])
    
    anomalies = run_anomaly_detection(featured)
    forecast = run_forecast(featured)
    discount_model = run_discount_regression(featured)

    # Extract unique categories and states for frontend filter options
    available_categories = sorted([str(c) for c in master["category"].dropna().unique() if c != "Unknown"])
    available_states = sorted([str(s) for s in master["state"].dropna().unique() if s != "Unknown"])

    return {
        "kpis": kpis,
        "segmentation": segmentation,
        "basket_rules": basket_rules,
        "anomalies": anomalies,
        "forecast": forecast,
        "discount_model": discount_model,
        "meta": {
            "records": int(len(featured)),
            "sources": ["ecommerce", "growth36", "amazon", "flipkart", "dmart"],
            "filter_options": {
                "categories": available_categories,
                "states": available_states,
            }
        },
    }
