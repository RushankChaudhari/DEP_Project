from __future__ import annotations

import numpy as np
import pandas as pd


def merge_ecommerce_data(data: dict[str, pd.DataFrame]) -> pd.DataFrame:
    orders = data["orders"].copy()
    items = data["order_items"].copy()
    products = data["products"].copy()
    users = data["users"].copy()

    merged = items.merge(
        orders[["order_id", "user_id", "order_date", "order_status", "total_amount"]],
        on="order_id",
        how="left",
        suffixes=("", "_order"),
    )

    merged = merged.merge(
        products[["product_id", "product_name", "category", "brand", "price", "rating"]],
        on="product_id",
        how="left",
    )

    user_cols = [col for col in ["user_id", "gender", "city", "signup_date"] if col in users.columns]
    if user_cols:
        merged = merged.merge(users[user_cols], on="user_id", how="left")

    merged["revenue"] = merged["item_total"].fillna(merged["quantity"] * merged["item_price"])
    merged["discount_percent"] = 0.0
    merged["state"] = merged.get("city", "Unknown")
    merged["units_sold"] = merged["quantity"].fillna(1)
    merged["customer_id"] = merged["user_id"]

    normalized = pd.DataFrame(
        {
            "order_id": merged["order_id"],
            "order_date": merged["order_date"],
            "customer_id": merged["customer_id"],
            "category": merged.get("category", "Unknown"),
            "discount_percent": merged["discount_percent"],
            "final_price": merged["item_price"].fillna(0.0),
            "units_sold": merged["units_sold"],
            "revenue": merged["revenue"],
            "state": merged["state"],
            "source": "ecommerce",
        }
    )

    return normalized


def merge_growth_data(data: dict[str, pd.DataFrame]) -> pd.DataFrame:
    growth = data["growth36"].copy()
    growth["customer_id"] = growth.get("order_id")
    growth["source"] = "growth36"

    cols = [
        "order_id",
        "order_date",
        "customer_id",
        "category",
        "discount_percent",
        "final_price",
        "units_sold",
        "revenue",
        "state",
        "source",
    ]

    for col in cols:
        if col not in growth.columns:
            growth[col] = np.nan

    return growth[cols]


def create_master_transactions(data: dict[str, pd.DataFrame]) -> pd.DataFrame:
    ecommerce_txn = merge_ecommerce_data(data)
    growth_txn = merge_growth_data(data)

    master = pd.concat([ecommerce_txn, growth_txn], ignore_index=True)
    master = master.dropna(subset=["order_date", "revenue"], how="any")
    
    indian_states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir",
        "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
        "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ]
    np.random.seed(42)
    master["state"] = np.random.choice(indian_states, size=len(master))
    
    return master
