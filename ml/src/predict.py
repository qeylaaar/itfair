"""
Skrip untuk melakukan prediksi gagal panen menggunakan model yang sudah dilatih.
"""
import os
import json
import joblib
import numpy as np
import tensorflow as tf
import pandas as pd
import data_processing as dp
import config

def load_model_and_artifacts():
    """Memuat model, scaler, dan config yang sudah dilatih."""
    if not os.path.exists(config.MODEL_PATH):
        raise FileNotFoundError(f"Model tidak ditemukan di {config.MODEL_PATH}. Jalankan train.py terlebih dahulu.")
    
    model = tf.keras.models.load_model(config.MODEL_PATH)
    scaler = joblib.load(config.SCALER_PATH)
    
    with open(config.CONFIG_PATH, 'r') as f:
        model_config = json.load(f)
    
    return model, scaler, model_config

def predict_harvest_failure(region_name: str, start_date: str = None, use_csv: bool = True, planting_month: int = None):
    """
    Memprediksi kemungkinan gagal panen untuk suatu wilayah.
    
    Args:
        region_name: Nama kabupaten/kota
        start_date: Tanggal mulai untuk data cuaca (format: 'YYYY-MM-DD')
        use_csv: Jika True, gunakan data CSV lokal. Jika False, gunakan Supabase API
        planting_month: Bulan penanaman (1-12). Jika diberikan, akan memprediksi 3 bulan ke depan dari bulan penanaman
    
    Returns:
        dict: Hasil prediksi dengan probabilitas dan klasifikasi
    """
    print(f"Memuat model dan artefak...")
    model, scaler, model_config = load_model_and_artifacts()
    threshold = model_config.get('optimal_threshold', 0.5)
    
    # Hitung batas tahun untuk data historis (10 tahun terakhir)
    from datetime import datetime
    current_year = datetime.now().year
    min_year = current_year - config.HISTORICAL_YEARS_FOR_PREDICTION
    print(f"Menggunakan data historis dari {min_year} hingga {current_year} ({config.HISTORICAL_YEARS_FOR_PREDICTION} tahun terakhir)")
    
    # Jika planting_month diberikan, hitung periode prediksi 3 bulan ke depan
    prediction_period = None
    if planting_month is not None:
        from datetime import datetime, timedelta
        current_year = datetime.now().year
        current_month = datetime.now().month
        
        # Jika bulan penanaman sudah lewat tahun ini, gunakan tahun depan
        if planting_month < current_month:
            planting_year = current_year + 1
        else:
            planting_year = current_year
        
        # Tanggal mulai penanaman
        planting_start = datetime(planting_year, planting_month, 1)
        # Tanggal akhir (3 bulan setelah penanaman)
        planting_end = planting_start + timedelta(days=90)  # ~3 bulan
        
        # Untuk training data, ambil data historis dari bulan yang sama di tahun-tahun sebelumnya
        # Misalnya jika penanaman di bulan 10, ambil data Oktober dari tahun-tahun sebelumnya
        prediction_period = {
            'planting_month': planting_month,
            'planting_year': planting_year,
            'planting_start': planting_start,
            'planting_end': planting_end,
            'start_date': planting_start.strftime('%Y-%m-%d'),
            'end_date': planting_end.strftime('%Y-%m-%d')
        }
        
        print(f"Memprediksi untuk wilayah: {region_name}")
        print(f"Bulan penanaman: {planting_month} ({planting_start.strftime('%B %Y')})")
        print(f"Periode prediksi: {prediction_period['start_date']} hingga {prediction_period['end_date']}")
    else:
        print(f"Memprediksi untuk wilayah: {region_name}")
    
    # Muat data prediksi
    if use_csv:
        # Gunakan dataset kesimpulan yang sudah teragregasi per tahun
        desired_seq_len = int(model_config.get('sequence_length', config.SEQUENCE_LENGTH))
        dataset, _, _ = dp.load_kesimpulan_sequences(
            is_training=False,
            scaler=scaler,
            region_filter=region_name,
            desired_seq_len=desired_seq_len
        )
        
        # Muat data cuaca dari file CSV untuk kebutuhan ringkasan web/rekomendasi
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)  # ml/
        weather_csv_path = os.path.join(project_root, 'data', 'sample_data_cuaca.csv')
        
        if os.path.exists(weather_csv_path):
            df_weather = pd.read_csv(weather_csv_path, sep=';')  # Gunakan separator titik koma
            print(f"Data cuaca loaded: {len(df_weather)} baris")
            print(f"Kolom: {df_weather.columns.tolist()}")
            # Filter berdasarkan wilayah dan tahun terakhir
            if config.REGION_COLUMN in df_weather.columns:
                before_filter = len(df_weather)
                # Normalisasi nama wilayah: hilangkan spasi dan bandingkan substring
                region_normalized = region_name.replace(' ', '').lower()
                df_weather['region_normalized'] = df_weather[config.REGION_COLUMN].str.replace(' ', '').str.lower()
                df_weather = df_weather[df_weather['region_normalized'].str.contains(region_normalized, na=False)]
                print(f"Filter wilayah '{region_name}': {before_filter} -> {len(df_weather)} baris")
                df_weather = df_weather.drop(columns=['region_normalized'], errors='ignore')
            
            # Filter untuk 10 tahun terakhir
            if config.DATE_COLUMN in df_weather.columns:
                df_weather[config.DATE_COLUMN] = pd.to_datetime(df_weather[config.DATE_COLUMN], errors='coerce')
                df_weather['Tahun'] = df_weather[config.DATE_COLUMN].dt.year
                before_filter = len(df_weather)
                df_weather = df_weather[df_weather['Tahun'] >= min_year].copy()
                print(f"Filter tahun >= {min_year}: {before_filter} -> {len(df_weather)} baris")
                df_weather = df_weather.drop(columns=['Tahun'], errors='ignore')
        else:
            print(f"File cuaca tidak ditemukan: {weather_csv_path}")
            df_weather = pd.DataFrame()
            
        # Untuk data panen, gunakan DataFrame kosong (karena kesimpulan tidak memuat data harian)
        df_harvest = pd.DataFrame()
    
    else:
        # Untuk production: ambil dari Supabase
        # Pastikan menggunakan data 10 tahun terakhir
        if not start_date:
            # Default: mulai dari 10 tahun yang lalu
            from datetime import datetime, timedelta
            start_date = datetime(min_year, 1, 1).strftime('%Y-%m-%d')
            print(f"Menggunakan data dari Supabase mulai dari {start_date} (10 tahun terakhir)")
        
        df_harvest, df_weather = dp.load_prediction_data(region_name, start_date)
        
        # Filter tambahan untuk memastikan hanya data 10 tahun terakhir
        if not df_weather.empty and config.DATE_COLUMN in df_weather.columns:
            df_weather[config.DATE_COLUMN] = pd.to_datetime(df_weather[config.DATE_COLUMN])
            df_weather['Tahun'] = df_weather[config.DATE_COLUMN].dt.year
            before_count = len(df_weather)
            df_weather = df_weather[df_weather['Tahun'] >= min_year].copy()
            df_weather = df_weather.drop(columns=['Tahun'])
            print(f"Data cuaca Supabase setelah filter 10 tahun: {before_count} -> {len(df_weather)} baris")
        
        if not df_harvest.empty:
            if 'Tahun' in df_harvest.columns:
                before_count = len(df_harvest)
                df_harvest = df_harvest[df_harvest['Tahun'] >= min_year].copy()
                print(f"Data panen Supabase setelah filter 10 tahun: {before_count} -> {len(df_harvest)} baris")
            elif config.DATE_COLUMN in df_harvest.columns:
                df_harvest[config.DATE_COLUMN] = pd.to_datetime(df_harvest[config.DATE_COLUMN], errors='coerce')
                df_harvest['Tahun'] = df_harvest[config.DATE_COLUMN].dt.year
                before_count = len(df_harvest)
                df_harvest = df_harvest[df_harvest['Tahun'] >= min_year].copy()
                df_harvest = df_harvest.drop(columns=['Tahun'])
                print(f"Data panen Supabase setelah filter 10 tahun: {before_count} -> {len(df_harvest)} baris")
    
    if not use_csv:
        if df_harvest.empty or df_weather.empty:
            return {
                'error': f'Data tidak ditemukan untuk wilayah {region_name}. Panen: {len(df_harvest)} baris, Cuaca: {len(df_weather)} baris',
                'region': region_name
            }
    
    # Filter ulang data cuaca untuk memastikan hanya 10 tahun terakhir
    if config.DATE_COLUMN in df_weather.columns:
        df_weather[config.DATE_COLUMN] = pd.to_datetime(df_weather[config.DATE_COLUMN], errors='coerce')
        df_weather['Tahun'] = df_weather[config.DATE_COLUMN].dt.year
        before_count = len(df_weather)
        df_weather = df_weather[df_weather['Tahun'] >= min_year].copy()
        df_weather = df_weather.drop(columns=['Tahun'])
        print(f"Data cuaca final setelah filter 10 tahun terakhir: {before_count} -> {len(df_weather)} baris")
    
    # Filter ulang data panen untuk memastikan hanya 10 tahun terakhir
    if 'Tahun' in df_harvest.columns:
        before_count = len(df_harvest)
        df_harvest = df_harvest[df_harvest['Tahun'] >= min_year].copy()
        print(f"Data panen final setelah filter 10 tahun terakhir: {before_count} -> {len(df_harvest)} baris")
    elif config.DATE_COLUMN in df_harvest.columns:
        df_harvest[config.DATE_COLUMN] = pd.to_datetime(df_harvest[config.DATE_COLUMN], errors='coerce')
        df_harvest['Tahun'] = df_harvest[config.DATE_COLUMN].dt.year
        before_count = len(df_harvest)
        df_harvest = df_harvest[df_harvest['Tahun'] >= min_year].copy()
        df_harvest = df_harvest.drop(columns=['Tahun'])
        print(f"Data panen final setelah filter 10 tahun terakhir: {before_count} -> {len(df_harvest)} baris")
    
    # Pastikan data hanya untuk wilayah yang diminta (double check setelah filter awal)
    # Normalisasi nama untuk matching
    def normalize_region_name_check(name):
        if pd.isna(name):
            return ""
        name = str(name).strip()
        prefixes = ["Kab. ", "Kabupaten ", "Kota ", "Kotamadya "]
        for prefix in prefixes:
            if name.startswith(prefix):
                name = name[len(prefix):].strip()
        prefixes_no_space = ["Kab.", "Kabupaten", "Kota", "Kotamadya"]
        for prefix in prefixes_no_space:
            if name.startswith(prefix) and len(name) > len(prefix):
                name = name[len(prefix):].strip()
        return name
    
    region_normalized_check = normalize_region_name_check(region_name)
    
    # Filter ulang untuk memastikan hanya data wilayah yang diminta
    if config.REGION_COLUMN in df_harvest.columns:
        df_harvest['_normalized_check'] = df_harvest[config.REGION_COLUMN].apply(normalize_region_name_check)
        before_count = len(df_harvest)
        df_harvest = df_harvest[df_harvest['_normalized_check'] == region_normalized_check].drop(columns=['_normalized_check'])
        print(f"Filter panen: {before_count} -> {len(df_harvest)} baris untuk {region_name}")
    
    if config.REGION_COLUMN in df_weather.columns:
        df_weather['_normalized_check'] = df_weather[config.REGION_COLUMN].apply(normalize_region_name_check)
        before_count = len(df_weather)
        df_weather = df_weather[df_weather['_normalized_check'] == region_normalized_check].drop(columns=['_normalized_check'])
        print(f"Filter cuaca: {before_count} -> {len(df_weather)} baris untuk {region_name}")
    
    # Pastikan data diurutkan berdasarkan tanggal untuk sequence yang konsisten
    if config.DATE_COLUMN in df_weather.columns:
        df_weather = df_weather.sort_values(by=config.DATE_COLUMN).reset_index(drop=True)
    
    # Debug: cek unique wilayah yang masih ada
    if config.REGION_COLUMN in df_harvest.columns:
        unique_regions_harvest = df_harvest[config.REGION_COLUMN].unique()
        print(f"Wilayah unik di data panen setelah filter: {unique_regions_harvest}")
    if config.REGION_COLUMN in df_weather.columns:
        unique_regions_weather = df_weather[config.REGION_COLUMN].unique()
        print(f"Wilayah unik di data cuaca setelah filter: {unique_regions_weather}")
    
    if not use_csv:
        # Preprocess data (jalur lama menggunakan panen + cuaca harian)
        print("Memproses data...")
        dataset, _, _ = dp.preprocess_features(
            df_harvest,
            df_weather,
            scaler=scaler,
            is_training=False
        )

    # Jika setelah preprocessing tidak ada sampel (misalnya karena windowing / filter),
    # jangan lanjut ke scaler/model agar tidak error "Found array with 0 sample(s)".
    if dataset is None or len(dataset) == 0:
        return {
            'error': (
                f'Data tidak cukup untuk membuat fitur prediksi pada wilayah {region_name}. '
                f'Panen: {len(df_harvest)} baris, Cuaca: {len(df_weather)} baris.'
            ),
            'region': region_name
        }

    # Prediksi
    print("Menjalankan prediksi...")
    predictions = model.predict(dataset, verbose=0)
    
    # Debug: print info tentang predictions
    print(f"Jumlah sequence yang diprediksi: {len(predictions)}")
    if len(predictions) > 0:
        print(f"Contoh prediksi (3 pertama): {predictions[:3].flatten()}")
        print(f"Contoh prediksi (3 terakhir): {predictions[-3:].flatten()}")
    
    # Ambil prediksi terakhir (paling recent) - ini adalah prediksi untuk data terbaru
    # Jika ada multiple sequences, ambil yang terakhir karena data sudah diurutkan berdasarkan tanggal
    latest_prediction = float(predictions[-1][0])
    print(f"Prediksi untuk {region_name}: {latest_prediction:.4f}")
    is_failure = latest_prediction >= threshold
    
    # Interpretasi
    risk_level = "Tinggi" if latest_prediction >= 0.7 else "Sedang" if latest_prediction >= threshold else "Rendah"
    
    # Import modul rekomendasi
    import recommendations as rec
    
    # Dapatkan alasan dan rekomendasi
    if is_failure:
        reasons = rec.get_failure_reasons(latest_prediction, df_weather, df_harvest)
    else:
        reasons = rec.get_success_reasons(latest_prediction, df_weather, df_harvest)
    
    mitigation = rec.get_mitigation_recommendations(latest_prediction, risk_level, df_weather, region_name)
    
    # Jika ada bulan penanaman, buat forecast untuk 3 bulan ke depan dari bulan penanaman
    if prediction_period:
        weather_forecast = rec.get_weather_forecast_from_planting_month(
            df_weather, 
            planting_month=prediction_period['planting_month'],
            planting_year=prediction_period['planting_year']
        )
    else:
        weather_forecast = rec.get_weather_forecast(df_weather, months=3)
    
    result = {
        'region': region_name,
        'probability': round(latest_prediction, 4),
        'threshold': threshold,
        'prediction': 'Gagal Panen' if is_failure else 'Normal',
        'risk_level': risk_level,
        'confidence': 'Tinggi' if abs(latest_prediction - threshold) > 0.2 else 'Sedang',
        'reasons': reasons,
        'mitigation_recommendations': mitigation,
        'weather_forecast': weather_forecast,
        'web_summary': build_web_summary(
            prediction_label='Gagal Panen' if is_failure else 'Normal',
            probability=latest_prediction,
            risk_level=risk_level,
            df_weather=df_weather,
            df_harvest=df_harvest,
            reasons=reasons,
            mitigation=mitigation,
            weather_forecast=weather_forecast
        )
    }
    
    return result

def predict_batch(regions: list, use_csv: bool = True, planting_month: int = None):
    """
    Memprediksi untuk beberapa wilayah sekaligus.
    
    Args:
        regions: List nama kabupaten/kota
        use_csv: Jika True, gunakan data CSV lokal
        planting_month: Bulan penanaman (1-12) untuk prediksi 3 bulan ke depan
    
    Returns:
        list: List hasil prediksi untuk setiap wilayah
    """
    results = []
    for region in regions:
        try:
            result = predict_harvest_failure(region, use_csv=use_csv, planting_month=planting_month)
            results.append(result)
        except Exception as e:
            results.append({
                'region': region,
                'error': str(e)
            })
    return results

def build_web_summary(
    prediction_label: str,
    probability: float,
    risk_level: str,
    df_weather: pd.DataFrame,
    df_harvest: pd.DataFrame,
    reasons: list,
    mitigation: list,
    weather_forecast: dict
) -> dict:
    """
    Membentuk ringkasan deskriptif berbasis data aktual untuk ditampilkan di UI.
    """
    period_label = _get_weather_period_label(df_weather)
    weather_stats = _build_weather_stats(df_weather)
    analysis_content = _build_analysis_content(reasons, df_harvest)
    weather_summary = _build_weather_summary(df_weather)
    conclusion_text = (
        f"Prediksi akhir: {prediction_label} dengan probabilitas "
        f"{probability * 100:.1f}% dan level risiko {risk_level}."
    )
    mitigation_sections = _build_mitigation_sections(mitigation)
    forecast_lines = _build_forecast_lines(weather_forecast)

    return {
        "sections": [
            {
                "title": "Hasil Prediksi AI",
                "content": [
                    f"{prediction_label} (Probabilitas {probability * 100:.1f}%, Risiko {risk_level})"
                ]
            },
            {
                "title": "Analisis & Alasan Prediksi",
                "content": analysis_content
            },
            {
                "title": f"Data Cuaca Historis ({period_label})",
                "content": weather_stats
            },
            {
                "title": "Ringkasan Cuaca",
                "content": [weather_summary]
            },
            {
                "title": "Kesimpulan Detail",
                "content": [conclusion_text]
            },
            {
                "title": "Rekomendasi Mitigasi Penanganan",
                "subsections": mitigation_sections
            },
            {
                "title": "Prakiraan Cuaca BMKG (3 Bulan Kedepan)",
                "content": forecast_lines
            }
        ]
    }

def _get_weather_period_label(df_weather: pd.DataFrame) -> str:
    if df_weather.empty or config.DATE_COLUMN not in df_weather.columns:
        return "Data tidak tersedia"
    start_date = df_weather[config.DATE_COLUMN].min()
    end_date = df_weather[config.DATE_COLUMN].max()
    if pd.isna(start_date) or pd.isna(end_date):
        return "Data tidak tersedia"
    start_label = start_date.strftime("%d %B %Y")
    end_label = end_date.strftime("%d %B %Y")
    if start_label == end_label:
        return start_label
    return f"{start_label} - {end_label}"

def _build_weather_stats(df_weather: pd.DataFrame) -> list:
    stats = []
    
    if df_weather.empty:
        return ["Suhu Rata-rata: Data tidak tersedia", "Kelembapan: Data tidak tersedia", 
                "Curah Hujan: Data tidak tersedia", "Angin: Data tidak tersedia"]
    
    # Coba cari kolom numerik (suhu, kelembapan, dll)
    has_numeric = False
    stats.append(_format_numeric_metric(df_weather, ["suhu", "temperature"], "Suhu Rata-rata", "°C"))
    if "Data tidak tersedia" not in stats[-1]:
        has_numeric = True
    
    stats.append(_format_numeric_metric(df_weather, ["lembap", "humidity"], "Kelembapan", "%"))
    if "Data tidak tersedia" not in stats[-1]:
        has_numeric = True
    
    stats.append(_format_numeric_metric(df_weather, ["hujan", "precip"], "Curah Hujan", "mm"))
    if "Data tidak tersedia" not in stats[-1]:
        has_numeric = True
    
    stats.append(_format_numeric_metric(df_weather, ["angin", "wind"], "Angin", " km/jam"))
    if "Data tidak tersedia" not in stats[-1]:
        has_numeric = True
    
    # Jika tidak ada data numerik, tampilkan statistik kejadian ekstrem
    if not has_numeric and config.WEATHER_EVENT_COLUMN in df_weather.columns:
        event_counts = df_weather[config.WEATHER_EVENT_COLUMN].value_counts()
        total_events = len(df_weather)
        unique_dates = df_weather[config.DATE_COLUMN].nunique() if config.DATE_COLUMN in df_weather.columns else 0
        
        stats = [
            f"Total Kejadian Ekstrem: {total_events} kali",
            f"Jumlah Hari Terjadi: {unique_dates} hari",
            f"Jenis Kejadian Terbanyak: {event_counts.index[0] if len(event_counts) > 0 else 'N/A'} ({event_counts.iloc[0] if len(event_counts) > 0 else 0} kali)"
        ]
        
        if config.WEATHER_IMPACT_COLUMN in df_weather.columns:
            impact_counts = df_weather[config.WEATHER_IMPACT_COLUMN].value_counts()
            stats.append(f"Dampak Terbanyak: {impact_counts.index[0] if len(impact_counts) > 0 else 'N/A'} ({impact_counts.iloc[0] if len(impact_counts) > 0 else 0} kali)")
    
    return stats

def _format_numeric_metric(df: pd.DataFrame, keywords: list, label: str, unit: str) -> str:
    if df.empty:
        return f"{label}: Data tidak tersedia"
    column = _find_column_by_keywords(df.columns, keywords)
    if column:
        series = pd.to_numeric(df[column], errors='coerce').dropna()
        if not series.empty:
            value = series.mean()
            return f"{label}: {value:.1f}{unit}".rstrip()
    return f"{label}: Data tidak tersedia"

def _find_column_by_keywords(columns, keywords):
    for col in columns:
        col_lower = col.lower()
        for key in keywords:
            if key in col_lower:
                return col
    return None

def _build_analysis_content(reasons: list, df_harvest: pd.DataFrame) -> list:
    analysis = reasons.copy() if reasons else []
    if not df_harvest.empty and 'Produktivitas' in df_harvest.columns:
        prod_mean = df_harvest['Produktivitas'].dropna().mean()
        if pd.notna(prod_mean):
            analysis.append(f"Rata-rata produktivitas historis: {prod_mean:.2f} ku/ha.")
    if not analysis:
        analysis.append("Tidak ada analisis tambahan yang tersedia.")
    return analysis

def _build_weather_summary(df_weather: pd.DataFrame) -> str:
    if df_weather.empty or config.WEATHER_EVENT_COLUMN not in df_weather.columns:
        return "Data cuaca ekstrem tidak tersedia."
    events = (
        df_weather[config.WEATHER_EVENT_COLUMN]
        .dropna()
        .str.split(', ', expand=True)
        .stack()
    )
    if events.empty:
        return "Tidak ada catatan cuaca ekstrem pada periode ini."
    counts = events.value_counts()
    top_event = counts.index[0]
    top_count = counts.iloc[0]
    return f"Kejadian paling sering: {top_event} ({top_count} kali) selama periode historis."

def _build_mitigation_sections(mitigation: list) -> list:
    if not mitigation:
        return [{"subtitle": "Umum", "content": ["Tidak ada rekomendasi yang tersedia."]}]
    return [{"subtitle": "Mitigasi Prioritas", "content": mitigation}]

def _build_forecast_lines(weather_forecast: dict) -> list:
    if not weather_forecast or 'forecast' not in weather_forecast:
        return ["Data prakiraan belum tersedia."]
    lines = []
    for item in weather_forecast.get('forecast', []):
        name = item.get('nama_bulan', 'Periode')
        events = item.get('prediksi_kejadian', 0)
        notes = item.get('catatan', '')
        extreme = item.get('cuaca_ekstrem', {})
        if extreme:
            dominant = ', '.join(list(extreme.keys())[:2])
            lines.append(f"{name}: {events} potensi kejadian ekstrem (Dominan: {dominant}). {notes}")
        else:
            lines.append(f"{name}: {events} potensi kejadian ekstrem. {notes}")
    if not lines:
        lines.append(weather_forecast.get('note', 'Data prakiraan belum tersedia.'))
    return lines

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Predict harvest failure')
    parser.add_argument('--region', type=str, required=True, help='Nama kabupaten/kota')
    parser.add_argument('--start-date', type=str, help='Tanggal mulai (YYYY-MM-DD)')
    parser.add_argument('--csv', action='store_true', help='Gunakan data CSV lokal')
    parser.add_argument('--planting-month', type=int, help='Bulan penanaman (1-12) untuk prediksi 3 bulan ke depan')
    
    args = parser.parse_args()
    
    result = predict_harvest_failure(
        args.region,
        start_date=args.start_date,
        use_csv=args.csv,
        planting_month=args.planting_month
    )
    
    print("\n" + "=" * 60)
    print("HASIL PREDIKSI")
    print("=" * 60)
    print(json.dumps(result, indent=2, ensure_ascii=False))

