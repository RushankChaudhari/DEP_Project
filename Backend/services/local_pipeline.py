from __future__ import annotations

from pathlib import Path

import pandas as pd

from services.anomaly_detection import run_anomaly_detection
from services.data_cleaner import clean_frame
from services.discount_model import run_discount_regression
from services.feature_engineering import build_features
from services.forecasting_model import run_forecast
from services.kpi_engine import compute_kpis
from services.segmentation_gmm import run_gmm_segmentation
from utils.helpers import apply_schema_mapping, detect_schema_mapping, normalize_columns

_LOCAL_RESULTS: dict[str, object] = {}


def process_local_upload(csv_path: str | Path) -> dict[str, object]:
    global _LOCAL_RESULTS

    df = pd.read_csv(csv_path, low_memory=False)
    df = normalize_columns(df)
    df = clean_frame(df)

    mapping = detect_schema_mapping(list(df.columns))
    
    missing = []
    if not mapping.get("order_date"):
        missing.append("order_date")
    
    has_revenue = mapping.get("revenue") is not None
    has_components = mapping.get("final_price") is not None and mapping.get("units_sold") is not None
    if not has_revenue and not has_components:
        missing.append("revenue (or final_price + units_sold)")
        
    if missing:
        raise ValueError(f"Missing required columns for analytics: {', '.join(missing)}")

    normalized = apply_schema_mapping(df, mapping)

    normalized["order_date"] = pd.to_datetime(normalized["order_date"], errors="coerce")
    fallback_order_ids = pd.Series(normalized.index.astype(str), index=normalized.index)

    normalized["order_id"] = normalized["order_id"].fillna(fallback_order_ids)
    fallback_customer_ids = normalized["order_id"].astype(str)
    normalized["customer_id"] = normalized["customer_id"].replace("", pd.NA).fillna(fallback_customer_ids)
    normalized["category"] = normalized["category"].fillna("Unknown")
    normalized["state"] = normalized["state"].fillna("Unknown")
    normalized["discount_percent"] = pd.to_numeric(normalized["discount_percent"], errors="coerce").fillna(0.0)
    normalized["final_price"] = pd.to_numeric(normalized["final_price"], errors="coerce").fillna(0.0)
    normalized["units_sold"] = pd.to_numeric(normalized["units_sold"], errors="coerce").fillna(1.0)
    normalized["revenue"] = pd.to_numeric(normalized["revenue"], errors="coerce")

    recalc_revenue = normalized["final_price"] * normalized["units_sold"]
    normalized["revenue"] = normalized["revenue"].fillna(recalc_revenue)
    normalized = normalized.dropna(subset=["order_date", "revenue"])

    featured = build_features(normalized)

    _LOCAL_RESULTS = {
        "df": featured,
        "mapping": mapping,
    }
    
    return get_local_results()


def get_local_results(
    start_date: str | None = None,
    end_date: str | None = None,
    category: str | None = None,
    state: str | None = None,
) -> dict[str, object] | None:
    if not _LOCAL_RESULTS:
        return None
        
    df: pd.DataFrame = _LOCAL_RESULTS["df"]
    mapping = _LOCAL_RESULTS["mapping"]
    
    from utils.helpers import filter_dataset
    filtered = filter_dataset(df, start_date=start_date, end_date=end_date, category=category, state=state)
    
    if filtered.empty:
        return {
            "kpis": compute_kpis(filtered),
            "segmentation": {"segments": [], "summary": []},
            "anomalies": [],
            "forecast": {"history": [], "forecast": [], "trend": "flat"},
            "discount_model": {"r2": 0.0, "coefficient": 0.0, "intercept": 0.0},
            "meta": {
                "records": 0,
                "mapping": mapping,
            },
        }

    return {
        "kpis": compute_kpis(filtered),
        "segmentation": run_gmm_segmentation(filtered),
        "anomalies": run_anomaly_detection(filtered),
        "forecast": run_forecast(filtered),
        "discount_model": run_discount_regression(filtered),
        "meta": {
            "records": int(len(filtered)),
            "mapping": mapping,
        },
    }
