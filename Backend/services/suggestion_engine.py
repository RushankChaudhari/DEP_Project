from __future__ import annotations

def generate_suggestions(
    global_kpis: dict[str, object],
    local_kpis: dict[str, object],
    comparison: list[dict[str, object]],
    basket_rules: list[dict[str, object]],
    anomalies: list[dict[str, object]],
    forecast: dict[str, object],
) -> list[dict[str, str]]:
    suggestions: list[dict[str, str]] = []

    if not local_kpis:
        # Return empty if there's no local data to generate tailored suggestions
        return []

    for row in comparison:
        metric = str(row["metric"])
        gap_percent = float(row.get("gap_percent", 0.0))
        
        if gap_percent < -5.0:
            if metric == "aov":
                suggestions.append({
                    "priority": "High",
                    "title": "Aggressive Cross-Selling Required",
                    "description": f"Local Average Order Value is trailing the benchmark by {abs(gap_percent):.1f}%. Implement 'frequently bought together' UI prompts at checkout."
                })
            elif metric == "discount_uplift_percent":
                suggestions.append({
                    "priority": "Medium",
                    "title": "Optimize Promo Efficiency",
                    "description": f"Discount uplift is {abs(gap_percent):.1f}% below target. Shift from blanket flash sales to targeted loyalty tier discounts to protect margins."
                })
            elif metric == "loyal_customer_percent":
                suggestions.append({
                    "priority": "High",
                    "title": "Launch Churn-Prevention Campaign",
                    "description": f"Customer retention is lagging by {abs(gap_percent):.1f}%. Immediately activate an email reactivation sequence for dormant users offering free shipping."
                })
            else:
                suggestions.append({
                    "priority": "High",
                    "title": f"Address {metric.replace('_', ' ').title()} Deficit",
                    "description": f"Performance is under-indexing global standards by {abs(gap_percent):.1f}%. Localized marketing efforts require an immediate audit."
                })
        elif gap_percent > 10.0:
            if metric == "aov":
                suggestions.append({
                    "priority": "Low",
                    "title": "Exploit High AOV",
                    "description": f"AOV exceeds the baseline by {gap_percent:.1f}%. Consider testing a slightly higher free-shipping threshold to maximize this pricing power."
                })
            elif metric == "total_revenue":
                suggestions.append({
                    "priority": "Medium",
                    "title": "Scale Revenue Tactics Globally",
                    "description": f"Local revenue significantly outperforms average by {gap_percent:.1f}%. Extract the specific operational traits here and replicate them to weaker regions."
                })

    if basket_rules:
        top_rule = basket_rules[0]
        left = ", ".join(top_rule.get("antecedents", []))
        right = ", ".join(top_rule.get("consequents", []))
        suggestions.append(
            {
                "priority": "High",
                "title": "Monetize Strong Affinities",
                "description": f"Customers buying [{left}] have high intent for [{right}]. Deploy hyper-targeted combination bundles to increase cart volume effortlessly.",
            }
        )

    anomaly_count = sum(1 for row in anomalies if bool(row.get("is_anomaly")))
    if anomaly_count > 0:
        suggestions.append(
            {
                "priority": "Medium",
                "title": f"Audit {anomaly_count} Irregular Transactions",
                "description": "Unusual spikes or drops in order behavior detected. Review payment gateways and fraud filters to ensure data integrity.",
            }
        )

    trend = str(forecast.get("trend", "flat"))
    if trend == "down":
        suggestions.append(
            {
                "priority": "High",
                "title": "Pre-empt Revenue Softening",
                "description": "ARIMA forecasting predicts a short-term downward trend. Liquidate slow-moving inventory and double down on high-LTV customer retention.",
            }
        )
    elif trend == "up":
        suggestions.append(
            {
                "priority": "Low",
                "title": "Prepare For Demand Surge",
                "description": "Trajectory is overwhelmingly positive. Lock in supply chain logistics for top-selling SKUs immediately to avoid stockouts during the peak.",
            }
        )

    if not suggestions:
        suggestions.append(
            {
                "priority": "Low",
                "title": "Maintain Baseline Velocity",
                "description": "Store metrics are stable with robust variance alignment. Continue monitoring KPIs weekly without heavy fundamental shifts.",
            }
        )

    return suggestions
