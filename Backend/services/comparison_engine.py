from __future__ import annotations


KPI_KEYS = [
    "total_revenue",
    "avg_monthly_revenue",
    "aov",
    "discount_uplift_percent",
    "loyal_customer_percent",
]


def compare_kpis(global_kpis: dict[str, object], local_kpis: dict[str, object]) -> list[dict[str, float | str]]:
    comparisons: list[dict[str, float | str]] = []
    for key in KPI_KEYS:
        g_val = float(global_kpis.get(key, 0.0) or 0.0)
        l_val = float(local_kpis.get(key, 0.0) or 0.0)
        gap = l_val - g_val
        comparisons.append(
            {
                "metric": key,
                "global": round(g_val, 2),
                "local": round(l_val, 2),
                "gap": round(gap, 2),
                "gap_percent": round((gap / g_val) * 100.0, 2) if g_val else 0.0,
            }
        )
    return comparisons
