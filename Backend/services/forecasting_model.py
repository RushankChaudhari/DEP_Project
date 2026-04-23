from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

from config import MODEL_PATHS
from utils.helpers import ensure_parent_dir


def run_forecast(df: pd.DataFrame, periods: int = 6) -> dict[str, object]:
    if df.empty:
        return {"history": [], "forecast": [], "trend": "flat"}

    series = (
        df.assign(order_date=pd.to_datetime(df["order_date"], errors="coerce"))
        .dropna(subset=["order_date"])
        .set_index("order_date")
        .resample("M")["revenue"]
        .sum()
    )

    if len(series) < 6:
        history = [{"month": idx.strftime("%Y-%m"), "revenue": float(val)} for idx, val in series.items()]
        return {"history": history, "forecast": [], "trend": "insufficient_data"}

    model = ARIMA(series, order=(1, 1, 1))
    fit = model.fit()
    forecast_values = fit.forecast(steps=periods)

    model_path: Path = MODEL_PATHS["arima"]
    ensure_parent_dir(model_path)
    joblib.dump(fit, model_path)

    history = [{"month": idx.strftime("%Y-%m"), "revenue": float(val)} for idx, val in series.items()]

    future_index = pd.date_range(series.index.max() + pd.offsets.MonthEnd(1), periods=periods, freq="M")
    forecast = [
        {"month": idx.strftime("%Y-%m"), "predicted_revenue": float(val)}
        for idx, val in zip(future_index, forecast_values)
    ]

    trend = "up"
    if len(forecast) >= 2 and forecast[-1]["predicted_revenue"] < forecast[0]["predicted_revenue"]:
        trend = "down"

    return {"history": history, "forecast": forecast, "trend": trend}
