from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import pandas as pd

from config import CSV_PATHS


def _read_csv(path: Path, max_rows: int | None = None) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    kwargs: dict[str, object] = {"low_memory": False}
    if max_rows is not None:
        kwargs["nrows"] = max_rows
    return pd.read_csv(path, **kwargs)


@lru_cache(maxsize=1)
def load_all_datasets() -> dict[str, pd.DataFrame]:
    data: dict[str, pd.DataFrame] = {}
    for key, path in CSV_PATHS.items():
        # DMart can be heavy on low-memory machines; sample rows for quick analytics.
        max_rows = 50000 if key == "dmart" else None
        data[key] = _read_csv(path, max_rows=max_rows)
    return data


def clear_cache() -> None:
    load_all_datasets.cache_clear()
