# Script to list harvest failure probabilities for each region
import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, "src")
sys.path.insert(0, SRC_DIR)

import data_processing as dp  # noqa: E402
import predict  # noqa: E402
import config  # noqa: E402


def main():
    print("Menghitung probabilitas per wilayah...")
    df_harvest, _ = dp.load_data_from_csv()
    regions = (
        df_harvest[config.REGION_COLUMN]
        .astype(str)
        .dropna()
        .unique()
        .tolist()
    )
    regions.sort()

    results = []
    for region in regions:
        try:
            result = predict.predict_harvest_failure(
                region_name=region,
                use_csv=True,
                planting_month=10,
            )
            if isinstance(result, dict) and "error" not in result:
                results.append(
                    {
                        "region": region,
                        "probability": float(result.get("probability", 0.0)),
                        "risk_level": result.get("risk_level", "N/A"),
                    }
                )
        except Exception as exc:  # pragma: no cover
            print(f"error processing {region}: {exc}")

    results.sort(key=lambda item: item["probability"], reverse=True)
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

