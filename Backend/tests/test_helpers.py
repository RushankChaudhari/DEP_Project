from __future__ import annotations

import pandas as pd
from utils.helpers import filter_dataset

def test_filter_dataset_by_category():
    data = {"category": ["Electronics", "Clothing", "Electronics"], "revenue": [100, 50, 200]}
    df = pd.DataFrame(data)
    
    # Filter by existing category
    filtered_v1 = filter_dataset(df, category="Electronics")
    assert len(filtered_v1) == 2
    
    # Filter by non-existing category
    filtered_v2 = filter_dataset(df, category="Toys")
    assert len(filtered_v2) == 0
    
    # Filter by "all"
    filtered_all = filter_dataset(df, category="all")
    assert len(filtered_all) == 3

def test_filter_dataset_by_state():
    data = {"state": ["NY", "CA", "NY"], "revenue": [100, 50, 200]}
    df = pd.DataFrame(data)
    
    filtered = filter_dataset(df, state="ny")
    assert len(filtered) == 2

def test_filter_dataset_by_date():
    data = {"order_date": ["2023-01-01", "2023-06-01", "2023-12-01"], "revenue": [100, 50, 200]}
    df = pd.DataFrame(data)
    df["order_date"] = pd.to_datetime(df["order_date"])
    
    # Filter by start date
    filtered_start = filter_dataset(df, start_date="2023-05-01")
    assert len(filtered_start) == 2
    
    # Filter by end date
    filtered_end = filter_dataset(df, end_date="2023-05-01")
    assert len(filtered_end) == 1
    
    # Filter by date range
    filtered_range = filter_dataset(df, start_date="2023-02-01", end_date="2023-11-01")
    assert len(filtered_range) == 1
