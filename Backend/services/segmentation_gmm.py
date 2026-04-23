from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler

from config import MODEL_PATHS
from utils.helpers import ensure_parent_dir


def _build_rfm(df: pd.DataFrame) -> pd.DataFrame:
    reference_date = pd.to_datetime(df["order_date"].max()) + pd.Timedelta(days=1)
    grouped = (
        df.groupby("customer_id")
        .agg(
            recency=("order_date", lambda x: (reference_date - pd.to_datetime(x).max()).days),
            frequency=("order_id", "nunique"),
            monetary=("revenue", "sum"),
        )
        .reset_index()
    )
    return grouped.dropna()


def run_gmm_segmentation(df: pd.DataFrame, n_components: int = 4) -> dict[str, object]:
    if df.empty or "customer_id" not in df.columns:
        return {"segments": [], "summary": []}

    rfm = _build_rfm(df)
    if rfm.empty or len(rfm) < n_components:
        return {"segments": [], "summary": []}

    features = rfm[["recency", "frequency", "monetary"]]
    scaler = StandardScaler()
    X = scaler.fit_transform(features)

    model = GaussianMixture(n_components=n_components, random_state=42)
    labels = model.fit_predict(X)
    rfm["cluster"] = labels.astype(int)

    model_path: Path = MODEL_PATHS["gmm"]
    ensure_parent_dir(model_path)
    joblib.dump({"model": model, "scaler": scaler}, model_path)

    summary = (
        rfm.groupby("cluster")[["recency", "frequency", "monetary"]]
        .mean()
        .round(2)
        .reset_index()
        .to_dict(orient="records")
    )

    segments = rfm.to_dict(orient="records")
    return {"segments": segments, "summary": summary}
