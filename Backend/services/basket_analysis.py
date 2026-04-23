from __future__ import annotations

import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder


def _generate_rules(transactions: list[list[str]], min_support: float, min_threshold: float) -> list[dict[str, object]]:
    if not transactions:
        return []

    te = TransactionEncoder()
    te_array = te.fit(transactions).transform(transactions)
    basket_df = pd.DataFrame(te_array, columns=te.columns_)

    itemsets = apriori(basket_df, min_support=min_support, use_colnames=True)
    if itemsets.empty:
        return []

    rules = association_rules(itemsets, metric="confidence", min_threshold=min_threshold)
    if rules.empty:
        return []

    rules = rules.sort_values(["confidence", "lift"], ascending=False)
    records: list[dict[str, object]] = []
    for _, row in rules.head(20).iterrows():
        records.append(
            {
                "antecedents": sorted(list(row["antecedents"])),
                "consequents": sorted(list(row["consequents"])),
                "support": round(float(row["support"]), 4),
                "confidence": round(float(row["confidence"]), 4),
                "lift": round(float(row["lift"]), 4),
            }
        )
    return records


def run_basket_analysis(order_items: pd.DataFrame, products: pd.DataFrame) -> list[dict[str, object]]:
    if order_items.empty:
        return []

    merged = order_items.copy()
    if not products.empty:
        merge_cols = [col for col in ["product_id", "product_name", "category"] if col in products.columns]
        if merge_cols:
            merged = merged.merge(products[merge_cols].drop_duplicates(subset=["product_id"]), on="product_id", how="left")

    product_item_col = "product_name" if "product_name" in merged.columns else "product_id"
    merged[product_item_col] = merged[product_item_col].fillna(merged["product_id"])
    product_transactions = (
        merged.groupby("order_id")[product_item_col]
        .apply(lambda items: sorted(set(str(item) for item in items if pd.notna(item))))
        .tolist()
    )

    rules = _generate_rules(product_transactions, min_support=0.003, min_threshold=0.2)
    if rules:
        return rules

    if "category" not in merged.columns:
        return []

    merged["category"] = merged["category"].fillna("Unknown")
    category_transactions = (
        merged.groupby("order_id")["category"]
        .apply(lambda items: sorted(set(str(item) for item in items if pd.notna(item))))
        .tolist()
    )

    return _generate_rules(category_transactions, min_support=0.01, min_threshold=0.15)
