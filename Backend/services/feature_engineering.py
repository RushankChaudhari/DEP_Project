from __future__ import annotations

import pandas as pd

from utils.helpers import season_from_month


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["order_date"] = pd.to_datetime(out["order_date"], errors="coerce")
    out = out.dropna(subset=["order_date"])

    out["month"] = out["order_date"].dt.month
    out["year"] = out["order_date"].dt.year
    out["season"] = out["month"].apply(season_from_month)

    out["discount_percent"] = pd.to_numeric(out["discount_percent"], errors="coerce").fillna(0.0)
    out["units_sold"] = pd.to_numeric(out["units_sold"], errors="coerce").fillna(1.0)
    out["final_price"] = pd.to_numeric(out["final_price"], errors="coerce").fillna(0.0)
    out["revenue"] = pd.to_numeric(out["revenue"], errors="coerce").fillna(0.0)

    recalculated = out["final_price"] * out["units_sold"]
    out["revenue_recalculated"] = recalculated.where(recalculated > 0, out["revenue"])
    out["discount_flag"] = (out["discount_percent"] > 0).astype(int)

    return out
