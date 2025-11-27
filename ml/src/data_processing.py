import os
import re
import joblib
import json
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.utils import timeseries_dataset_from_array
from supabase import create_client, Client
from dotenv import load_dotenv

import config

# Muat variabel.env
load_dotenv()

def _clean_numeric_string(s: str) -> float:
    """Membersihkan format angka '54 987,79'  menjadi 54987.79"""
    if not isinstance(s, str):
        return s
    s = re.sub(r'\s', '', s)  # Hapus spasi
    s = s.replace(',', '.')   # Ganti koma dengan titik
    try:
        return float(s)
    except (ValueError, TypeError):
        return np.nan

def _get_db_engine():
    """Membuat koneksi DB langsung (SQLAlchemy) untuk data besar (pelatihan)."""
    db_url = os.environ.get("SUPABASE_DB_URL_POOLER")
    if not db_url:
        raise ValueError("SUPABASE_DB_URL_POOLER tidak diatur di.env")
    # Gunakan NullPool saat terhubung ke pooler mode transaksi (Port 6543) [2, 3, 4, 5, 71, 72]
    engine = create_engine(db_url, poolclass=NullPool)
    return engine

def _get_api_client() -> Client:
    """Membuat klien API Supabase (supabase-py) untuk kueri kecil (prediksi)."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL atau SUPABASE_KEY tidak diatur di.env")
    return create_client(url, key) [12, 63, 73, 2, 74, 10, 75, 11, 76, 77]

def load_training_data() -> (pd.DataFrame, pd.DataFrame):
    """Menarik data panen dan cuaca untuk pelatihan model (10 tahun terakhir)."""
    from datetime import datetime
    import config
    
    current_year = datetime.now().year
    min_year = current_year - config.HISTORICAL_YEARS_FOR_PREDICTION
    
    print(f"Menarik data pelatihan dari Supabase (10 tahun terakhir: {min_year}-{current_year})...")
    engine = _get_db_engine()
    # Ganti 'harvest_data' dan 'weather_events' dengan nama tabel Anda di Supabase
    try:
        # Filter data hanya dari 10 tahun terakhir
        df_harvest = pd.read_sql_query("SELECT * FROM harvest_data", con=engine)
        df_weather = pd.read_sql_query("SELECT * FROM weather_events", con=engine)
        
        # Filter berdasarkan tahun
        if 'Tahun' in df_harvest.columns:
            before_count = len(df_harvest)
            df_harvest = df_harvest[df_harvest['Tahun'] >= min_year].copy()
            print(f"Data panen: {before_count} -> {len(df_harvest)} baris (setelah filter 10 tahun)")
        elif 'Tanggal' in df_harvest.columns:
            df_harvest['Tanggal'] = pd.to_datetime(df_harvest['Tanggal'], errors='coerce')
            df_harvest['Tahun'] = df_harvest['Tanggal'].dt.year
            before_count = len(df_harvest)
            df_harvest = df_harvest[df_harvest['Tahun'] >= min_year].copy()
            df_harvest = df_harvest.drop(columns=['Tahun'])
            print(f"Data panen: {before_count} -> {len(df_harvest)} baris (setelah filter 10 tahun)")
        
        if 'Tanggal' in df_weather.columns:
            df_weather['Tanggal'] = pd.to_datetime(df_weather['Tanggal'], errors='coerce')
            df_weather['Tahun'] = df_weather['Tanggal'].dt.year
            before_count = len(df_weather)
            df_weather = df_weather[df_weather['Tahun'] >= min_year].copy()
            df_weather = df_weather.drop(columns=['Tahun'])
            print(f"Data cuaca: {before_count} -> {len(df_weather)} baris (setelah filter 10 tahun)")
        
        print(f"Data panen dimuat: {df_harvest.shape} baris")
        print(f"Data cuaca dimuat: {df_weather.shape} baris")
        return df_harvest, df_weather
    except Exception as e:
        print(f"Gagal menarik data: {e}")
        return pd.DataFrame(), pd.DataFrame()

def load_prediction_data(region_name: str, start_date: str) -> (pd.DataFrame, pd.DataFrame):
    """Menarik data terbaru untuk satu wilayah guna membuat prediksi."""
    print(f"Menarik data prediksi untuk {region_name} dari Supabase (via API)...")
    client = _get_api_client()
    
    # Ganti nama tabel dan kolom jika berbeda
    harvest_response = client.table("harvest_data").select("*").eq("Kabupaten/Kota", region_name).execute() [85]
    weather_response = client.table("weather_events").select("*").eq("Kabupaten/Kota", region_name).gte("Tanggal", start_date).execute() [85]
    
    return pd.DataFrame(harvest_response.data), pd.DataFrame(weather_response.data)

def load_data_from_csv():
    """Memuat data dari file CSV lokal untuk pengembangan/testing (10 tahun terakhir)."""
    from datetime import datetime
    
    print("Memuat data dari file CSV lokal...")
    
    # Gunakan path absolut berdasarkan lokasi file ini
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)  # Naik satu level dari src/ ke root
    PANEN_DATA_PATH = os.path.join(project_root, 'data', 'sample_data_panen.csv')
    CUACA_DATA_PATH = os.path.join(project_root, 'data', 'sample_data_cuaca.csv')
    
    df_harvest = pd.read_csv(PANEN_DATA_PATH, sep=';')
    df_weather = pd.read_csv(CUACA_DATA_PATH, sep=';')
    df_weather[config.DATE_COLUMN] = pd.to_datetime(df_weather[config.DATE_COLUMN])
    
    # Filter data hanya dari 10 tahun terakhir
    current_year = datetime.now().year
    min_year = current_year - config.HISTORICAL_YEARS_FOR_PREDICTION
    
    # Filter data cuaca
    df_weather['Tahun'] = df_weather[config.DATE_COLUMN].dt.year
    before_count_weather = len(df_weather)
    df_weather = df_weather[df_weather['Tahun'] >= min_year].copy()
    df_weather = df_weather.drop(columns=['Tahun'])
    print(f"Data cuaca: {before_count_weather} -> {len(df_weather)} baris (setelah filter 10 tahun: {min_year}-{current_year})")
    
    # Filter data panen
    if 'Tahun' in df_harvest.columns:
        before_count_harvest = len(df_harvest)
        df_harvest = df_harvest[df_harvest['Tahun'] >= min_year].copy()
        print(f"Data panen: {before_count_harvest} -> {len(df_harvest)} baris (setelah filter 10 tahun: {min_year}-{current_year})")
    elif config.DATE_COLUMN in df_harvest.columns:
        df_harvest[config.DATE_COLUMN] = pd.to_datetime(df_harvest[config.DATE_COLUMN], errors='coerce')
        df_harvest['Tahun'] = df_harvest[config.DATE_COLUMN].dt.year
        before_count_harvest = len(df_harvest)
        df_harvest = df_harvest[df_harvest['Tahun'] >= min_year].copy()
        df_harvest = df_harvest.drop(columns=['Tahun'])
        print(f"Data panen: {before_count_harvest} -> {len(df_harvest)} baris (setelah filter 10 tahun: {min_year}-{current_year})")
    
    print(f"Data panen dimuat: {df_harvest.shape} baris")
    print(f"Data cuaca dimuat: {df_weather.shape} baris")
    return df_harvest, df_weather

def preprocess_features(df_harvest: pd.DataFrame, df_weather: pd.DataFrame, scaler=None, is_training=True):
    """
    Inti dari pipeline ML. Mengubah data mentah menjadi sekuens yang siap untuk GRU.
    """
    print("Memulai pra-pemrosesan fitur...")
    
    # === 1. Pra-pemrosesan Data Panen (Y dan Fitur X) ===
    
    # Ganti nama kolom agar lebih mudah digunakan
    # Cek kolom yang ada terlebih dahulu
    rename_dict = {}
    if config.TARGET_COLUMN in df_harvest.columns:
        rename_dict[config.TARGET_COLUMN] = "Produktivitas"
    if config.REGION_COLUMN in df_harvest.columns:
        rename_dict[config.REGION_COLUMN] = "Wilayah"
    if "Luas Panen Tanaman Padi (ha) (Ha)" in df_harvest.columns:
        rename_dict["Luas Panen Tanaman Padi (ha) (Ha)"] = "LuasPanen"
    
    if rename_dict:
        df_harvest = df_harvest.rename(columns=rename_dict)
    
    # Jika kolom belum ada setelah rename, coba cari dengan nama yang mirip
    if "Produktivitas" not in df_harvest.columns:
        # Cari kolom yang mengandung "Produktivitas"
        prod_cols = [col for col in df_harvest.columns if "Produktivitas" in col or "produktivitas" in col.lower()]
        if prod_cols:
            df_harvest = df_harvest.rename(columns={prod_cols[0]: "Produktivitas"})
    
    if "LuasPanen" not in df_harvest.columns:
        # Cari kolom yang mengandung "Luas"
        luas_cols = [col for col in df_harvest.columns if "Luas" in col or "luas" in col.lower()]
        if luas_cols:
            df_harvest = df_harvest.rename(columns={luas_cols[0]: "LuasPanen"})

    # Bersihkan angka (misal, "54 987,79" -> 54987.79) 
    for col in ["Produktivitas", "LuasPanen"]:
        if col in df_harvest.columns:
            df_harvest[col] = df_harvest[col].apply(_clean_numeric_string)
    df_harvest = df_harvest.dropna(subset=["Produktivitas", "LuasPanen"])
    
    # Buat label (Y) hanya jika pelatihan
    if is_training:
        # Hitung Z-score produktivitas PER WILAYAH untuk menemukan anomali [86, 87, 88, 89, 90, 91]
        df_harvest['z_score'] = df_harvest.groupby('Wilayah')['Produktivitas'].transform(
            lambda x: (x - x.mean()) / x.std(ddof=0)
        )
        # Label 1 (Gagal Panen) jika Z-score di bawah ambang batas [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 2, 42]
        df_harvest['GagalPanen'] = (df_harvest['z_score'] < config.Z_SCORE_THRESHOLD).astype(int)
        
    df_harvest_proc = df_harvest.copy()

    # === 2. Pra-pemrosesan Data Cuaca (Fitur X) ===
    df_weather_proc = df_weather.rename(columns={config.REGION_COLUMN: "Wilayah"})
    df_weather_proc[config.DATE_COLUMN] = pd.to_datetime(df_weather_proc[config.DATE_COLUMN])
    
    # Normalisasi nama wilayah untuk matching dengan data panen
    def normalize_region_name(name):
        if pd.isna(name):
            return ""
        name = str(name).strip()
        # Hapus prefix umum (dengan spasi setelahnya)
        prefixes = ["Kab. ", "Kabupaten ", "Kota ", "Kotamadya "]
        for prefix in prefixes:
            if name.startswith(prefix):
                name = name[len(prefix):].strip()
        # Juga coba tanpa spasi
        prefixes_no_space = ["Kab.", "Kabupaten", "Kota", "Kotamadya"]
        for prefix in prefixes_no_space:
            if name.startswith(prefix) and len(name) > len(prefix):
                name = name[len(prefix):].strip()
        return name
    
    # Normalisasi nama wilayah di data cuaca
    df_weather_proc['Wilayah'] = df_weather_proc['Wilayah'].apply(normalize_region_name)
    
    # One-Hot Encoding untuk 'Cuaca Ekstrem' dan 'Dampak' 
    # Kita menggunakan str.get_dummies untuk menangani string gabungan (misal, "Hujan Lebat, Petir")
    df_weather_events = df_weather_proc[config.WEATHER_EVENT_COLUMN].str.get_dummies(sep=', ')
    df_weather_impacts = df_weather_proc[config.WEATHER_IMPACT_COLUMN].str.get_dummies(sep=' / ')
    
    df_weather_proc = pd.concat([df_weather_proc[['Wilayah', config.DATE_COLUMN]], df_weather_events, df_weather_impacts], axis=1)

    # Agregasi Harian ke Mingguan: Hitung JUMLAH kejadian per minggu
    # Set index ke Tanggal, lalu groupby Wilayah dan resample
    # Simpan Wilayah sebagai kolom terpisah sebelum set_index
    
    # PENTING: Pastikan data diurutkan berdasarkan Wilayah dan Tanggal sebelum resample
    df_weather_proc = df_weather_proc.sort_values(by=['Wilayah', config.DATE_COLUMN]).reset_index(drop=True)
    
    df_weather_proc_indexed = df_weather_proc.set_index(config.DATE_COLUMN)
    
    # Groupby dan resample, pastikan Wilayah tetap ada
    # Gunakan include_groups=False untuk menghindari warning
    df_weather_weekly = (df_weather_proc_indexed
                        .groupby('Wilayah', group_keys=True)
                        .resample(config.TIME_AGGREGATION_RULE, include_groups=False)
                        .sum(numeric_only=True)
                        .reset_index(level=0, drop=False))  # Reset hanya level 0 (Tanggal), keep Wilayah
    
    # Reset index untuk mendapatkan Tanggal sebagai kolom
    df_weather_weekly = df_weather_weekly.reset_index()
    
    # Pastikan urutan tetap konsisten: Wilayah, lalu Tanggal
    df_weather_weekly = df_weather_weekly.sort_values(by=['Wilayah', config.DATE_COLUMN]).reset_index(drop=True)
    
    df_weather_weekly['Tahun'] = df_weather_weekly[config.DATE_COLUMN].dt.year

    # === 3. Gabungkan Data Panen dan Cuaca ===
    # Gabungkan fitur cuaca mingguan dengan data panen tahunan
    df_merged = pd.merge(
        df_weather_weekly,
        df_harvest_proc,
        on=['Wilayah', 'Tahun'],
        how='left' # Jaga semua data cuaca, cocokkan data panen jika ada
    )
    
    # Pastikan data merged juga diurutkan berdasarkan Wilayah dan Tanggal
    df_merged = df_merged.sort_values(by=['Wilayah', config.DATE_COLUMN]).reset_index(drop=True)
    
    # Isi data panen (LuasPanen, GagalPanen) ke semua minggu dalam tahun itu
    cols_to_fill = ['LuasPanen']
    if is_training and 'GagalPanen' in df_merged.columns:
        cols_to_fill.append('GagalPanen')
    
    # Hanya fill kolom yang ada
    existing_cols_to_fill = [col for col in cols_to_fill if col in df_merged.columns]
    if existing_cols_to_fill:
        df_merged[existing_cols_to_fill] = df_merged.groupby('Wilayah')[existing_cols_to_fill].ffill().bfill()
        df_merged = df_merged.dropna(subset=existing_cols_to_fill) # Hapus minggu tanpa data panen
    
    # === 4. Normalisasi Fitur (X) ===
    # Tentukan fitur (X) dan label (y)
    
    # PENTING: Untuk prediksi, pastikan data diurutkan berdasarkan tanggal per wilayah
    # agar sequence dibuat dengan benar untuk setiap wilayah
    if not is_training:
        df_merged = df_merged.sort_values(by=['Wilayah', config.DATE_COLUMN]).reset_index(drop=True)
    
    # Hapus kolom non-fitur
    cols_to_drop = ['Wilayah', config.DATE_COLUMN, 'Tahun', 'Produktivitas', 'Rekap Produksi Padi (ton)']
    if is_training:
        cols_to_drop.append('z_score')
    features_df = df_merged.drop(columns=cols_to_drop, errors='ignore')
    
    # Pastikan semua kolom fitur ada, meskipun tidak ada di data baru
    if scaler and is_training is False:
        # Untuk prediksi: pastikan kolom cocok dengan saat pelatihan
        if hasattr(scaler, 'feature_names_in_'):
            known_features = scaler.feature_names_in_
            features_df = features_df.reindex(columns=known_features, fill_value=0)
    
    if is_training:
        # Buat dan 'fit' scaler HANYA pada data pelatihan
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_features = scaler.fit_transform(features_df)
    else:
        # 'Transform' data prediksi menggunakan scaler yang sudah ada
        scaled_features = scaler.transform(features_df)
        
    labels = df_merged['GagalPanen'].values if (is_training and 'GagalPanen' in df_merged.columns) else None

    # === 5. Buat Sekuens (Windowing) ===
    print(f"Membuat sekuens (windowing) dengan panjang {config.SEQUENCE_LENGTH}...")
    
    if is_training:
        # Untuk training: buat sequence dari semua data (sudah di-shuffle nanti)
        dataset = timeseries_dataset_from_array(
            data=scaled_features,
            targets=labels,
            sequence_length=config.SEQUENCE_LENGTH,
            sequence_stride=config.SEQUENCE_STRIDE,
            batch_size=config.BATCH_SIZE,
            shuffle=True
        )
    else:
        # Untuk prediksi: buat sequence per wilayah
        # Simpan informasi wilayah sebelum di-drop
        wilayah_info = df_merged['Wilayah'].values if 'Wilayah' in df_merged.columns else None
        
        # Buat sequence hanya dari data wilayah yang diminta (harusnya sudah di-filter di predict.py)
        # Tapi untuk memastikan, kita buat sequence dari semua data yang ada
        # dan ambil yang terakhir (paling recent)
        dataset = timeseries_dataset_from_array(
            data=scaled_features,
            targets=None,
            sequence_length=config.SEQUENCE_LENGTH,
            sequence_stride=config.SEQUENCE_STRIDE,
            batch_size=1,
            shuffle=False  # Jangan shuffle untuk prediksi, ambil urutan temporal
        )
    
    return dataset, scaler, labels if is_training else None

def load_kesimpulan_sequences(kesimpulan_path: str = None, is_training: bool = True, scaler=None, region_filter: str = None, desired_seq_len: int = None):
    """Memuat data dari data_kesimpulan_processed.csv dan membentuk sekuens tahunan per wilayah.

    Struktur kolom yang diharapkan (contoh):
      - 'kabupaten_kota' (region), 'tahun' (int), 'label_gagal' (0/1)
      - Fitur numerik lain: 'hasil_panen', 'delta_ton', 'cuaca_total_event', 'impact_*', 'event_*', dll.

    Mengembalikan: (dataset_tf, scaler, labels or None)
    """
    import pandas as pd
    from sklearn.preprocessing import MinMaxScaler
    from tensorflow.keras.utils import timeseries_dataset_from_array
    import tensorflow as tf

    # Tentukan path default
    if kesimpulan_path is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)  # ml/
        kesimpulan_path = os.path.join(project_root, 'data', 'data_kesimpulan_processed.csv')

    print(f"Memuat data kesimpulan dari: {kesimpulan_path}")
    if not os.path.exists(kesimpulan_path):
        print("ERROR: File data_kesimpulan_processed.csv tidak ditemukan.")
        return tf.data.Dataset.from_tensor_slices(([])), None, None

    df = pd.read_csv(kesimpulan_path)

    # Normalisasi nama kolom sesuai pipeline
    rename_map = {
        'kabupaten_kota': 'Wilayah',
        'tahun': 'Tahun',
        'label_gagal': 'GagalPanen'
    }
    df = df.rename(columns=rename_map)

    # Pastikan kolom kunci ada
    required_cols = ['Wilayah', 'Tahun']
    for col in required_cols:
        if col not in df.columns:
            print(f"ERROR: Kolom wajib '{col}' tidak ada pada data kesimpulan.")
            return tf.data.Dataset.from_tensor_slices(([])), None, None

    # Optional: filter wilayah spesifik
    if region_filter:
        df = df[df['Wilayah'].astype(str).str.strip().str.lower() == str(region_filter).strip().lower()]
        if df.empty:
            print(f"Peringatan: Tidak ada data untuk wilayah '{region_filter}' pada CSV kesimpulan.")
    # Sortir data per wilayah dan tahun
    df = df.sort_values(['Wilayah', 'Tahun']).reset_index(drop=True)

    # Tentukan kolom fitur: ambil semua numerik kecuali label dan tahun
    drop_non_features = ['Wilayah', 'Tahun']
    if 'status_panen' in df.columns:
        drop_non_features.append('status_panen')
    label_series = df['GagalPanen'] if (is_training and 'GagalPanen' in df.columns) else None

    feature_df = df.drop(columns=drop_non_features + (['GagalPanen'] if 'GagalPanen' in df.columns else []), errors='ignore')

    # Pilih hanya kolom numerik
    numeric_cols = feature_df.select_dtypes(include=[np.number]).columns.tolist()
    feature_df = feature_df[numeric_cols]

    # Fit/transform scaler
    if is_training:
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_all = scaler.fit_transform(feature_df)
    else:
        # Saat prediksi, scaler wajib diberikan dari luar oleh pemanggil (train menyimpan & load)
        # Untuk kompatibilitas, jika tidak ada scaler maka gagal dengan jelas
        if scaler is None:
            raise ValueError("Scaler harus disediakan saat is_training=False")
        scaled_all = scaler.transform(feature_df)

    # Sisipkan kembali untuk mempermudah slicing per wilayah
    df_scaled = pd.DataFrame(scaled_all, columns=numeric_cols)
    df_scaled['Wilayah'] = df['Wilayah'].values
    df_scaled['Tahun'] = df['Tahun'].values
    if label_series is not None:
        df_scaled['GagalPanen'] = label_series.values

    # Tentukan panjang sekuens
    if not is_training and desired_seq_len is not None and desired_seq_len > 1:
        seq_len = int(desired_seq_len)
    else:
        # Hitung panjang minimal deret per wilayah untuk menentukan sequence_length yang aman
        min_len = df_scaled.groupby('Wilayah').size().min()
        seq_len = min(config.SEQUENCE_LENGTH, max(2, int(min_len) - 1))  # butuh minimal 2 titik agar ada target
    if seq_len < 2:
        print("ERROR: Data per wilayah terlalu pendek untuk membentuk sekuens.")
        return tf.data.Dataset.from_tensor_slices(([])), None, None

    print(f"Membuat sekuens tahunan per wilayah dengan panjang {seq_len}...")

    # Bangun dataset per wilayah lalu gabungkan
    dataset_all = None
    for wilayah, g in df_scaled.groupby('Wilayah'):
        g = g.sort_values('Tahun').reset_index(drop=True)
        X_g = g[numeric_cols].values
        y_g = g['GagalPanen'].values if (is_training and 'GagalPanen' in g.columns) else None

        # Lewati wilayah yang terlalu pendek
        if len(X_g) <= seq_len:
            continue

        ds = timeseries_dataset_from_array(
            data=X_g,
            targets=y_g if is_training else None,
            sequence_length=seq_len,
            sequence_stride=1,
            batch_size=(config.BATCH_SIZE if is_training else 1),
            shuffle=is_training
        )

        if dataset_all is None:
            dataset_all = ds
        else:
            dataset_all = dataset_all.concatenate(ds)

    if dataset_all is None:
        print("ERROR: Tidak ada wilayah yang memiliki panjang deret memadai untuk sekuens.")
        return tf.data.Dataset.from_tensor_slices(([])), None, None

    return dataset_all, scaler, (label_series.values if is_training and label_series is not None else None)