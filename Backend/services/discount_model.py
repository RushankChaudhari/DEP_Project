from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression

from config import MODEL_PATHS
from utils.helpers import ensure_parent_dir


def run_discount_regression(df: pd.DataFrame) -> dict[str, float]:
    if df.empty:
        return {"slope": 0.0, "intercept": 0.0, "r2": 0.0}

    work = df[["discount_percent", "revenue"]].copy()
    work["discount_percent"] = pd.to_numeric(work["discount_percent"], errors="coerce")
    work["revenue"] = pd.to_numeric(work["revenue"], errors="coerce")
    work = work.dropna()

    if len(work) < 10:
        return {"slope": 0.0, "intercept": 0.0, "r2": 0.0}

    X = work[["discount_percent"]]
    y = work["revenue"]

    model = LinearRegression()
    model.fit(X, y)
    r2 = model.score(X, y)

    model_path: Path = MODEL_PATHS["discount"]
    ensure_parent_dir(model_path)
    joblib.dump(model, model_path)

    return {
        "slope": float(model.coef_[0]),
        "intercept": float(model.intercept_),
        "r2": float(r2),
    }
