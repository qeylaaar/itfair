"""
Utility script to convert `data_kesimpulan.csv` into a structured dataset
that can be consumed by the GRU pipeline.

Usage:
    C:\laragon\bin\python\python-3.10\python ml/scripts/prepare_kesimpulan_dataset.py
"""

from __future__ import annotations

import csv
import json
import os
import re
from dataclasses import dataclass, asdict
from typing import Dict, List, Tuple

import pandas as pd

# Path configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_CSV = os.path.join(DATA_DIR, "data_kesimpulan.csv")
OUTPUT_CSV = os.path.join(DATA_DIR, "data_kesimpulan_processed.csv")
SUMMARY_JSON = os.path.join(DATA_DIR, "data_kesimpulan_summary.json")


EVENT_KEYWORDS = {
    "hujan lebat": "event_hujan_lebat",
    "angin kencang": "event_angin_kencang",
    "puting beliung": "event_puting_beliung",
    "hujan es": "event_hujan_es",
    "petir": "event_petir",
    "suhu ekstrem": "event_suhu_ekstrem",
    "jarak pandang": "event_jarak_pandang",
}

IMPACT_KEYWORDS = {
    "banjir / genangan": "impact_banjir",
    "banjir": "impact_banjir",
    "genangan": "impact_banjir",
    "tanah longsor": "impact_tanah_longsor",
    "pohon tumbang": "impact_pohon_tumbang",
    "bangunan rusak": "impact_bangunan_rusak",
    "gangguan transportasi": "impact_gangguan_transport",
    "korban jiwa / luka": "impact_korban_jiwa",
    "tidak ada data": "impact_tidak_ada_data",
}


@dataclass
class ProcessedRow:
    kabupaten_kota: str
    tahun: int
    hasil_panen: float
    status_panen: str
    label_gagal: int
    delta_ton: float
    cuaca_total_event: int
    dampak_total_event: int
    event_hujan_lebat: int = 0
    event_angin_kencang: int = 0
    event_puting_beliung: int = 0
    event_hujan_es: int = 0
    event_petir: int = 0
    event_suhu_ekstrem: int = 0
    event_jarak_pandang: int = 0
    impact_banjir: int = 0
    impact_tanah_longsor: int = 0
    impact_pohon_tumbang: int = 0
    impact_bangunan_rusak: int = 0
    impact_gangguan_transport: int = 0
    impact_korban_jiwa: int = 0
    impact_tidak_ada_data: int = 0


def parse_decimal(value: str) -> float:
    if pd.isna(value):
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = str(value).replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def extract_label(status: str) -> Tuple[int, float]:
    """
    Return (label, delta_ton)
    label = 1 jika status diawali "TURUN", selain itu 0.
    delta_ton: angka di dalam tanda kurung jika ada.
    """
    if not isinstance(status, str):
        return 0, 0.0
    status_upper = status.strip().upper()
    label = 1 if status_upper.startswith("TURUN") else 0

    delta_match = re.search(r"([-+]?\d+[.,]?\d*)\s*TON", status_upper)
    if delta_match:
        delta = parse_decimal(delta_match.group(1))
        if "TURUN" in status_upper:
            delta = -abs(delta)
        elif "NAIK" in status_upper:
            delta = abs(delta)
        return label, delta
    return label, 0.0


def count_keywords(text: str, mapping: Dict[str, str]) -> Dict[str, int]:
    counts = {col: 0 for col in mapping.values()}
    if not isinstance(text, str):
        return counts
    lowered = text.lower()
    for keyword, column in mapping.items():
        counts[column] = len(re.findall(keyword, lowered))
    return counts


def count_event_tokens(text: str) -> int:
    if not isinstance(text, str):
        return 0
    matches = re.findall(r"\((\d+)x\)", text)
    return sum(int(m) for m in matches)


def process() -> List[ProcessedRow]:
    if not os.path.exists(RAW_CSV):
        raise FileNotFoundError(f"Tidak menemukan {RAW_CSV}")

    df = pd.read_csv(RAW_CSV, sep=";")
    rows: List[ProcessedRow] = []

    for _, row in df.iterrows():
        kabupaten = str(row.get("kabupaten/kota", "")).strip()
        tahun = int(row.get("tahun", 0))
        hasil = parse_decimal(row.get("hasil_panen", 0.0))
        status = str(row.get("status_panen", "")).strip()
        info_cuaca = row.get("info_cuaca", "")

        label, delta = extract_label(status)
        info_parts = {"cuaca": "", "dampak": ""}
        if isinstance(info_cuaca, str):
            segments = [seg.strip() for seg in info_cuaca.split("|")]
            if segments:
                info_parts["cuaca"] = segments[0]
                if len(segments) > 1:
                    info_parts["dampak"] = segments[1]

        cuaca_counts = count_keywords(info_parts["cuaca"], EVENT_KEYWORDS)
        dampak_counts = count_keywords(info_parts["dampak"], IMPACT_KEYWORDS)

        row_data = ProcessedRow(
            kabupaten_kota=kabupaten,
            tahun=tahun,
            hasil_panen=hasil,
            status_panen=status,
            label_gagal=label,
            delta_ton=delta,
            cuaca_total_event=count_event_tokens(info_parts["cuaca"]),
            dampak_total_event=count_event_tokens(info_parts["dampak"]),
            **cuaca_counts,
            **dampak_counts,
        )
        rows.append(row_data)

    return rows


def save_outputs(rows: List[ProcessedRow]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)

    # Save CSV
    df = pd.DataFrame([asdict(r) for r in rows])
    df.to_csv(OUTPUT_CSV, index=False, quoting=csv.QUOTE_MINIMAL)
    print(f"✅ Saved processed dataset to {OUTPUT_CSV}")

    # Save summary JSON
    summary = {
        "total_records": len(rows),
        "failed_percentage": float(df["label_gagal"].mean() * 100 if not df.empty else 0.0),
        "period": {"min_year": int(df["tahun"].min()) if not df.empty else None,
                   "max_year": int(df["tahun"].max()) if not df.empty else None},
        "columns": df.columns.tolist(),
    }
    with open(SUMMARY_JSON, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved summary to {SUMMARY_JSON}")


def main():
    rows = process()
    save_outputs(rows)


if __name__ == "__main__":
    main()

