from __future__ import annotations

import pandas as pd

from utils.helpers import normalize_columns, parse_datetime_column


def clean_frame(df: pd.DataFrame) -> pd.DataFrame:
    out = normalize_columns(df.copy())

    # Common datetime parsing
    for date_col in ["order_date", "signup_date", "crawl_timestamp"]:
        if date_col in out.columns:
            out[date_col] = parse_datetime_column(out[date_col])

    # Coerce numeric columns where present.
    for col in [
        "total_amount",
        "quantity",
        "item_price",
        "item_total",
        "price",
        "rating",
        "base_price",
        "discount_percent",
        "final_price",
        "units_sold",
        "revenue",
        "customer_age",
        "retail_price",
        "discounted_price",
    ]:
        if col in out.columns:
            out[col] = pd.to_numeric(out[col], errors="coerce")

    return out


def clean_datasets(data: dict[str, pd.DataFrame]) -> dict[str, pd.DataFrame]:
    return {name: clean_frame(df) for name, df in data.items()}
