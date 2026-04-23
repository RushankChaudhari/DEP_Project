from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest

from config import MODEL_PATHS
from utils.helpers import ensure_parent_dir


def run_anomaly_detection(df: pd.DataFrame) -> list[dict[str, object]]:
    if df.empty:
        return []

    features = pd.DataFrame(
        {
            "revenue": pd.to_numeric(df["revenue"], errors="coerce").fillna(0.0),
            "discount_percent": pd.to_numeric(df["discount_percent"], errors="coerce").fillna(0.0),
            "units_sold": pd.to_numeric(df["units_sold"], errors="coerce").fillna(1.0),
        }
    )

    model = IsolationForest(contamination=0.03, random_state=42)
    labels = model.fit_predict(features)

    model_path: Path = MODEL_PATHS["isolation"]
    ensure_parent_dir(model_path)
    joblib.dump(model, model_path)

    output = df[["order_id", "order_date", "revenue", "discount_percent", "units_sold"]].copy()
    output["anomaly_label"] = labels
    output["is_anomaly"] = output["anomaly_label"] == -1

    return output.sort_values("order_date", ascending=False).head(300).to_dict(orient="records")
