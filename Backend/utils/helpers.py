from __future__ import annotations

import math
import re
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


SEASON_MAP = {
    12: "Winter",
    1: "Winter",
    2: "Winter",
    3: "Spring",
    4: "Spring",
    5: "Summer",
    6: "Summer",
    7: "Monsoon",
    8: "Monsoon",
    9: "Autumn",
    10: "Autumn",
    11: "Winter",
}


COLUMN_ALIASES = {
    "order_id": ["order_id", "order", "id", "transaction_id", "invoice_id"],
    "order_date": ["order_date", "date", "transaction_date", "created_at", "timestamp"],
    "customer_id": ["customer_id", "user_id", "customer", "client_id"],
    "category": ["category", "product_category", "segment"],
    "discount_percent": ["discount_percent", "discount", "discount_pct", "discount_percentage"],
    "final_price": ["final_price", "price", "selling_price", "amount"],
    "units_sold": ["units_sold", "qty", "quantity", "units"],
    "revenue": ["revenue", "sales", "net_revenue", "total_amount", "item_total"],
    "state": ["state", "region", "location", "city"],
}


def normalize_column_name(name: str) -> str:
    sanitized = re.sub(r"[^0-9a-zA-Z]+", "_", name.strip().lower())
    return re.sub(r"_+", "_", sanitized).strip("_")


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    renamed = {col: normalize_column_name(str(col)) for col in df.columns}
    return df.rename(columns=renamed)


def parse_datetime_column(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce", utc=False)


def detect_schema_mapping(columns: list[str]) -> dict[str, str | None]:
    normalized = [normalize_column_name(c) for c in columns]
    mapping: dict[str, str | None] = {}
    for target, aliases in COLUMN_ALIASES.items():
        mapping[target] = None
        for candidate in aliases:
            if candidate in normalized:
                idx = normalized.index(candidate)
                mapping[target] = columns[idx]
                break
    return mapping


def apply_schema_mapping(df: pd.DataFrame, mapping: dict[str, str | None]) -> pd.DataFrame:
    output = pd.DataFrame(index=df.index)
    for target, source in mapping.items():
        if source is not None and source in df.columns:
            output[target] = df[source]
        else:
            output[target] = np.nan
    return output


def ensure_parent_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def season_from_month(month: int | float | None) -> str:
    if month is None or pd.isna(month):
        return "Unknown"
    return SEASON_MAP.get(int(month), "Unknown")


def _sanitize_float(value: float) -> float | None:
    if math.isnan(value) or math.isinf(value):
        return None
    return float(value)


def safe_jsonify(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(k): safe_jsonify(v) for k, v in value.items()}
    if isinstance(value, list):
        return [safe_jsonify(v) for v in value]
    if isinstance(value, tuple):
        return [safe_jsonify(v) for v in value]
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.isoformat()
    if isinstance(value, np.generic):
        scalar = value.item()
        return safe_jsonify(scalar)
    if isinstance(value, float):
        return _sanitize_float(value)
    if value is None:
        return None
    return value


def filter_dataset(
    df: pd.DataFrame,
    start_date: str | None = None,
    end_date: str | None = None,
    category: str | None = None,
    state: str | None = None,
) -> pd.DataFrame:
    filtered = df.copy()

    if start_date and "order_date" in filtered.columns:
        try:
            sd = pd.to_datetime(start_date)
            filtered = filtered[filtered["order_date"] >= sd]
        except (ValueError, TypeError):
            pass

    if end_date and "order_date" in filtered.columns:
        try:
            ed = pd.to_datetime(end_date)
            filtered = filtered[filtered["order_date"] <= ed]
        except (ValueError, TypeError):
            pass

    if category and category.lower() != "all" and "category" in filtered.columns:
        filtered = filtered[filtered["category"].str.lower() == category.lower()]

    if state and state.lower() != "all" and "state" in filtered.columns:
        filtered = filtered[filtered["state"].str.lower() == state.lower()]

    return filtered
