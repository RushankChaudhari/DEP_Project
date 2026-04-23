from __future__ import annotations

import pandas as pd


def _pct(part: float, whole: float) -> float:
    if whole == 0:
        return 0.0
    return (part / whole) * 100.0


def compute_kpis(df: pd.DataFrame) -> dict[str, object]:
    if df.empty:
        return {
            "total_revenue": 0.0,
            "avg_monthly_revenue": 0.0,
            "aov": 0.0,
            "discount_uplift_percent": 0.0,
            "loyal_customer_percent": 0.0,
            "category_share": [],
            "monthly_revenue": [],
        }

    total_revenue = float(df["revenue"].sum())
    order_count = max(int(df["order_id"].nunique()), 1)
    aov = total_revenue / order_count

    monthly = (
        df.assign(order_date=pd.to_datetime(df["order_date"], errors="coerce"))
        .dropna(subset=["order_date"])
        .set_index("order_date")
        .resample("M")["revenue"]
        .sum()
    )
    avg_monthly = float(monthly.mean()) if len(monthly) else 0.0

    discounted = df[df["discount_percent"] > 0]
    nondiscounted = df[df["discount_percent"] <= 0]
    discounted_avg = float(discounted["revenue"].mean()) if not discounted.empty else 0.0
    nondiscounted_avg = float(nondiscounted["revenue"].mean()) if not nondiscounted.empty else 0.0
    discount_uplift = _pct(discounted_avg - nondiscounted_avg, abs(nondiscounted_avg)) if nondiscounted_avg else 0.0

    customer_order_counts = df.groupby("customer_id")["order_id"].nunique()
    loyal_customers = int((customer_order_counts >= 2).sum())
    total_customers = max(int(customer_order_counts.shape[0]), 1)
    loyal_pct = _pct(loyal_customers, total_customers)

    category_share_df = (
        df.groupby("category", dropna=False)["revenue"].sum().sort_values(ascending=False).head(10).reset_index()
    )
    category_share = [
        {
            "category": str(row["category"]),
            "revenue": float(row["revenue"]),
            "share_percent": _pct(float(row["revenue"]), total_revenue),
        }
        for _, row in category_share_df.iterrows()
    ]

    monthly_revenue = [
        {"month": idx.strftime("%Y-%m"), "revenue": float(val)} for idx, val in monthly.items()
    ]

    return {
        "total_revenue": round(total_revenue, 2),
        "avg_monthly_revenue": round(avg_monthly, 2),
        "aov": round(aov, 2),
        "discount_uplift_percent": round(discount_uplift, 2),
        "loyal_customer_percent": round(loyal_pct, 2),
        "category_share": category_share,
        "monthly_revenue": monthly_revenue,
    }
