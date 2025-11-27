"""
Modul untuk memberikan rekomendasi dan analisis berdasarkan prediksi gagal panen.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import data_processing as dp
import config

def get_failure_reasons(probability: float, df_weather: pd.DataFrame, df_harvest: pd.DataFrame) -> list:
    """
    Mendapatkan alasan-alasan potensial gagal panen berdasarkan probabilitas dan data cuaca.
    
    Args:
        probability: Probabilitas gagal panen (0-1)
        df_weather: DataFrame data cuaca
        df_harvest: DataFrame data panen
    
    Returns:
        list: Daftar alasan potensial
    """
    reasons = []
    
    if probability >= 0.7:
        reasons.append("Probabilitas gagal panen sangat tinggi (>70%)")
    elif probability >= 0.5:
        reasons.append("Probabilitas gagal panen tinggi (>50%)")
    
    # Analisis data cuaca ekstrem
    if not df_weather.empty:
        # Hitung frekuensi cuaca ekstrem
        if config.WEATHER_EVENT_COLUMN in df_weather.columns:
            weather_events = df_weather[config.WEATHER_EVENT_COLUMN].str.split(', ', expand=True).stack()
            event_counts = weather_events.value_counts()
            
            if 'Hujan Lebat' in event_counts.index and event_counts['Hujan Lebat'] > 10:
                reasons.append(f"Frekuesi hujan lebat tinggi ({event_counts['Hujan Lebat']} kejadian)")
            
            if 'Angin Kencang' in event_counts.index and event_counts['Angin Kencang'] > 5:
                reasons.append(f"Frekuesi angin kencang tinggi ({event_counts['Angin Kencang']} kejadian)")
            
            if 'Puting Beliung' in event_counts.index and event_counts['Puting Beliung'] > 3:
                reasons.append(f"Frekuesi puting beliung tinggi ({event_counts['Puting Beliung']} kejadian)")
        
        # Analisis dampak
        if config.WEATHER_IMPACT_COLUMN in df_weather.columns:
            impacts = df_weather[config.WEATHER_IMPACT_COLUMN].str.split(' / ', expand=True).stack()
            impact_counts = impacts.value_counts()
            
            if 'Banjir / Genangan' in impact_counts.index and impact_counts['Banjir / Genangan'] > 5:
                reasons.append(f"Frekuesi banjir/genangan tinggi ({impact_counts['Banjir / Genangan']} kejadian)")
            
            if 'Tanah Longsor' in impact_counts.index and impact_counts['Tanah Longsor'] > 2:
                reasons.append(f"Frekuesi tanah longsor ({impact_counts['Tanah Longsor']} kejadian)")
    
    # Analisis produktivitas historis
    if not df_harvest.empty and 'Produktivitas' in df_harvest.columns:
        avg_productivity = df_harvest['Produktivitas'].mean()
        if avg_productivity < 50:
            reasons.append(f"Produktivitas historis rendah (rata-rata {avg_productivity:.2f} ku/ha)")
    
    if not reasons:
        reasons.append("Tidak ada indikasi masalah signifikan berdasarkan data yang tersedia")
    
    return reasons

def get_success_reasons(probability: float, df_weather: pd.DataFrame, df_harvest: pd.DataFrame) -> list:
    """
    Mendapatkan alasan-alasan keberhasilan panen.
    
    Args:
        probability: Probabilitas gagal panen (0-1)
        df_weather: DataFrame data cuaca
        df_harvest: DataFrame data panen
    
    Returns:
        list: Daftar alasan keberhasilan
    """
    reasons = []
    
    if probability < 0.3:
        reasons.append("Probabilitas gagal panen sangat rendah (<30%)")
    
    # Analisis kondisi cuaca
    if not df_weather.empty:
        if config.WEATHER_EVENT_COLUMN in df_weather.columns:
            weather_events = df_weather[config.WEATHER_EVENT_COLUMN].str.split(', ', expand=True).stack()
            event_counts = weather_events.value_counts()
            
            if 'Hujan Lebat' in event_counts.index and event_counts['Hujan Lebat'] < 5:
                reasons.append("Frekuesi cuaca ekstrem rendah")
    
    # Analisis produktivitas
    if not df_harvest.empty and 'Produktivitas' in df_harvest.columns:
        avg_productivity = df_harvest['Produktivitas'].mean()
        if avg_productivity >= 55:
            reasons.append(f"Produktivitas historis baik (rata-rata {avg_productivity:.2f} ku/ha)")
    
    if not reasons:
        reasons.append("Kondisi normal berdasarkan data yang tersedia")
    
    return reasons

def _extract_weather_metrics(df_weather: pd.DataFrame) -> dict:
    """Ekstrak metrik cuaca dari DataFrame."""
    metrics = {
        'avg_temperature': None,
        'min_temperature': None,
        'max_temperature': None,
        'avg_humidity': None,
        'avg_rainfall': None,
        'total_rainfall': None,
        'avg_wind_speed': None,
        'max_wind_speed': None,
        'high_humidity_days': 0,
        'extreme_rain_days': 0
    }
    
    if df_weather.empty:
        return metrics
    
    # Cari kolom suhu
    temp_cols = [col for col in df_weather.columns if any(kw in col.lower() for kw in ['suhu', 'temperature', 'temp'])]
    if temp_cols:
        temp_series = pd.to_numeric(df_weather[temp_cols[0]], errors='coerce').dropna()
        if not temp_series.empty:
            metrics['avg_temperature'] = temp_series.mean()
            metrics['min_temperature'] = temp_series.min()
            metrics['max_temperature'] = temp_series.max()
    
    # Cari kolom kelembapan
    humidity_cols = [col for col in df_weather.columns if any(kw in col.lower() for kw in ['lembap', 'humidity', 'kelembaban'])]
    if humidity_cols:
        humidity_series = pd.to_numeric(df_weather[humidity_cols[0]], errors='coerce').dropna()
        if not humidity_series.empty:
            metrics['avg_humidity'] = humidity_series.mean()
            metrics['high_humidity_days'] = len(humidity_series[humidity_series > 80])
    
    # Cari kolom curah hujan
    rain_cols = [col for col in df_weather.columns if any(kw in col.lower() for kw in ['hujan', 'rain', 'precip', 'curah'])]
    if rain_cols:
        rain_series = pd.to_numeric(df_weather[rain_cols[0]], errors='coerce').dropna()
        if not rain_series.empty:
            metrics['avg_rainfall'] = rain_series.mean()
            metrics['total_rainfall'] = rain_series.sum()
            metrics['extreme_rain_days'] = len(rain_series[rain_series > 50])  # >50mm per hari
    
    # Cari kolom angin
    wind_cols = [col for col in df_weather.columns if any(kw in col.lower() for kw in ['angin', 'wind', 'kecepatan'])]
    if wind_cols:
        wind_series = pd.to_numeric(df_weather[wind_cols[0]], errors='coerce').dropna()
        if not wind_series.empty:
            metrics['avg_wind_speed'] = wind_series.mean()
            metrics['max_wind_speed'] = wind_series.max()
    
    return metrics

def get_mitigation_recommendations(probability: float, risk_level: str, df_weather: pd.DataFrame, region_name: str = None) -> list:
    """
    Mendapatkan rekomendasi mitigasi berdasarkan risiko gagal panen dan kondisi cuaca spesifik wilayah.
    
    Args:
        probability: Probabilitas gagal panen
        risk_level: Level risiko (Tinggi/Sedang/Rendah)
        df_weather: DataFrame data cuaca
        region_name: Nama wilayah untuk personalisasi rekomendasi
    
    Returns:
        list: Daftar rekomendasi mitigasi yang disesuaikan dengan kondisi cuaca wilayah
    """
    recommendations = []
    
    # Ekstrak metrik cuaca spesifik wilayah
    weather_metrics = _extract_weather_metrics(df_weather)
    
    # Header berdasarkan risk level
    if risk_level == "Tinggi" or probability >= 0.7:
        recommendations.append("[ALERT] TINDAKAN SEGERA DIPERLUKAN")
        recommendations.append("- Tingkatkan monitoring lahan secara intensif (setiap 2-3 hari)")
        recommendations.append("- Siapkan sistem drainase darurat untuk mengatasi genangan air")
        recommendations.append("- Pertimbangkan memanen lebih awal jika tanaman sudah cukup matang")
        recommendations.append("- Hubungi dinas pertanian setempat untuk bantuan teknis")
        recommendations.append("- Pertimbangkan asuransi pertanian untuk melindungi kerugian")
    
    elif risk_level == "Sedang" or (probability >= 0.5 and probability < 0.7):
        recommendations.append("[NOTICE] PERHATIAN KHUSUS DIPERLUKAN")
        recommendations.append("- Monitor kondisi lahan secara rutin (setiap minggu)")
        recommendations.append("- Pastikan sistem irigasi dan drainase berfungsi dengan baik")
        recommendations.append("- Lakukan pemupukan sesuai jadwal dan dosis yang tepat")
        recommendations.append("- Waspada terhadap hama dan penyakit tanaman")
        recommendations.append("- Siapkan rencana cadangan jika kondisi memburuk")
    else:
        recommendations.append("[INFO] KONDISI NORMAL - PERAWATAN RUTIN")
    
    # Rekomendasi berdasarkan SUHU wilayah
    if weather_metrics['avg_temperature'] is not None:
        avg_temp = weather_metrics['avg_temperature']
        if avg_temp > 32:
            recommendations.append(f"\n🌡️ REKOMENDASI BERDASARKAN SUHU TINGGI ({avg_temp:.1f}°C):")
            recommendations.append("- Lakukan penyiraman lebih sering pada pagi dan sore hari")
            recommendations.append("- Gunakan mulsa untuk mengurangi penguapan air")
            recommendations.append("- Pertimbangkan naungan sementara untuk mengurangi stress panas")
            recommendations.append("- Hindari pemupukan pada siang hari, lakukan pagi atau sore")
            recommendations.append("- Pantau kelembapan tanah lebih intensif")
        elif avg_temp < 22:
            recommendations.append(f"\n🌡️ REKOMENDASI BERDASARKAN SUHU RENDAH ({avg_temp:.1f}°C):")
            recommendations.append("- Lakukan pemupukan dengan Nitrogen untuk meningkatkan ketahanan dingin")
            recommendations.append("- Gunakan varietas padi yang tahan suhu rendah")
            recommendations.append("- Pertimbangkan penanaman lebih dalam untuk melindungi akar")
            recommendations.append("- Pantau perkembangan tanaman lebih ketat karena pertumbuhan lebih lambat")
        else:
            recommendations.append(f"\n🌡️ SUHU OPTIMAL ({avg_temp:.1f}°C):")
            recommendations.append("- Suhu dalam kisaran optimal untuk pertumbuhan padi")
            recommendations.append("- Lanjutkan perawatan rutin sesuai jadwal")
    
    # Rekomendasi berdasarkan KELEMBAPAN wilayah
    if weather_metrics['avg_humidity'] is not None:
        avg_humidity = weather_metrics['avg_humidity']
        high_humidity_days = weather_metrics['high_humidity_days']
        
        if avg_humidity > 85 or high_humidity_days > len(df_weather) * 0.3:
            recommendations.append(f"\n💧 REKOMENDASI BERDASARKAN KELEMBAPAN TINGGI ({avg_humidity:.1f}%):")
            recommendations.append("- Waspada terhadap penyakit jamur (Blast, Brown Spot)")
            recommendations.append("- Gunakan fungisida preventif dengan bahan aktif Tricyclazole atau Isoprothiolane")
            recommendations.append("- Pastikan jarak tanam tidak terlalu rapat (gunakan sistem Jajar Legowo 2:1)")
            recommendations.append("- Lakukan pemangkasan daun yang terlalu rimbun untuk sirkulasi udara")
            recommendations.append("- Hindari pemupukan Nitrogen berlebihan yang meningkatkan kelembapan")
            recommendations.append("- Monitor gejala penyakit setiap 3-5 hari")
        elif avg_humidity < 60:
            recommendations.append(f"\n💧 REKOMENDASI BERDASARKAN KELEMBAPAN RENDAH ({avg_humidity:.1f}%):")
            recommendations.append("- Tingkatkan frekuensi penyiraman untuk menjaga kelembapan tanah")
            recommendations.append("- Gunakan mulsa untuk mempertahankan kelembapan")
            recommendations.append("- Waspada terhadap hama seperti Wereng Batang Coklat (WBC) yang menyukai kondisi kering")
            recommendations.append("- Pertimbangkan irigasi tetes untuk efisiensi air")
        else:
            recommendations.append(f"\n💧 KELEMBAPAN NORMAL ({avg_humidity:.1f}%):")
            recommendations.append("- Kelembapan dalam kisaran optimal")
    
    # Rekomendasi berdasarkan CURAH HUJAN wilayah
    if weather_metrics['avg_rainfall'] is not None:
        avg_rain = weather_metrics['avg_rainfall']
        total_rain = weather_metrics['total_rainfall']
        extreme_rain_days = weather_metrics['extreme_rain_days']
        
        if avg_rain > 20 or extreme_rain_days > 5:
            recommendations.append(f"\n🌧️ REKOMENDASI BERDASARKAN CURAH HUJAN TINGGI (Rata-rata: {avg_rain:.1f}mm/hari, Total: {total_rain:.0f}mm):")
            recommendations.append("- Perbaiki dan perlebar saluran drainase di sekitar lahan")
            recommendations.append("- Gunakan varietas padi yang tahan genangan (contoh: Inpari, Ciherang)")
            recommendations.append("- Buat bedengan lebih tinggi untuk menghindari genangan")
            recommendations.append("- Siapkan pompa air untuk mengatasi genangan jika terjadi banjir")
            recommendations.append("- Hindari pemupukan saat hujan lebat, tunggu kondisi lebih kering")
            recommendations.append("- Waspada terhadap penyakit busuk batang akibat genangan")
        elif avg_rain < 5 and total_rain < 100:
            recommendations.append(f"\n🌧️ REKOMENDASI BERDASARKAN CURAH HUJAN RENDAH (Rata-rata: {avg_rain:.1f}mm/hari, Total: {total_rain:.0f}mm):")
            recommendations.append("- Pastikan sistem irigasi berfungsi optimal")
            recommendations.append("- Lakukan penghematan air dengan irigasi berselang (intermittent)")
            recommendations.append("- Gunakan varietas padi yang tahan kekeringan")
            recommendations.append("- Pertimbangkan penanaman lebih awal untuk menghindari puncak musim kering")
            recommendations.append("- Waspada terhadap hama yang menyukai kondisi kering")
        else:
            recommendations.append(f"\n🌧️ CURAH HUJAN NORMAL (Rata-rata: {avg_rain:.1f}mm/hari):")
            recommendations.append("- Curah hujan dalam kisaran normal untuk pertumbuhan padi")
    
    # Rekomendasi berdasarkan ANGIN wilayah
    if weather_metrics['avg_wind_speed'] is not None:
        avg_wind = weather_metrics['avg_wind_speed']
        max_wind = weather_metrics['max_wind_speed']
        
        if avg_wind > 20 or max_wind > 40:
            recommendations.append(f"\n💨 REKOMENDASI BERDASARKAN ANGIN KENCANG (Rata-rata: {avg_wind:.1f} km/jam, Maks: {max_wind:.1f} km/jam):")
            recommendations.append("- Tanam tanaman pelindung (windbreak) di sekeliling lahan")
            recommendations.append("- Perkuat struktur penopang tanaman jika diperlukan")
            recommendations.append("- Waspada terhadap risiko rebah (lodging) tanaman")
            recommendations.append("- Pertimbangkan varietas padi yang tahan rebah")
            recommendations.append("- Hindari pemupukan Nitrogen berlebihan yang membuat tanaman lebih rentan rebah")
        else:
            recommendations.append(f"\n💨 KONDISI ANGIN NORMAL ({avg_wind:.1f} km/jam):")
            recommendations.append("- Kecepatan angin dalam kisaran normal")
    
    # Rekomendasi berdasarkan cuaca ekstrem
    if not df_weather.empty and config.WEATHER_EVENT_COLUMN in df_weather.columns:
        weather_events = df_weather[config.WEATHER_EVENT_COLUMN].str.split(', ', expand=True).stack()
        event_counts = weather_events.value_counts()
        
        if len(event_counts) > 0:
            recommendations.append(f"\n⚠️ REKOMENDASI BERDASARKAN CUACA EKSTREM:")
            
            if 'Hujan Lebat' in event_counts.index and event_counts['Hujan Lebat'] > 5:
                recommendations.append(f"- Hujan Lebat: {int(event_counts['Hujan Lebat'])} kejadian terdeteksi")
                recommendations.append("  • Perbaiki saluran drainase untuk mengatasi hujan lebat")
                recommendations.append("  • Hindari penanaman di area yang rawan banjir")
                recommendations.append("  • Gunakan varietas padi yang tahan genangan")
            
            if 'Angin Kencang' in event_counts.index and event_counts['Angin Kencang'] > 3:
                recommendations.append(f"- Angin Kencang: {int(event_counts['Angin Kencang'])} kejadian terdeteksi")
                recommendations.append("  • Tanam tanaman pelindung di sekeliling lahan")
                recommendations.append("  • Perkuat struktur penopang tanaman jika diperlukan")
            
            if 'Puting Beliung' in event_counts.index:
                recommendations.append(f"- Puting Beliung: {int(event_counts['Puting Beliung'])} kejadian terdeteksi")
                recommendations.append("  • Waspada terhadap puting beliung, siapkan rencana evakuasi")
                recommendations.append("  • Pastikan struktur bangunan pertanian cukup kuat")
    
    # Rekomendasi umum perawatan lahan (spesifik wilayah jika ada)
    recommendations.append(f"\n📋 PERAWATAN RUTIN LAHAN PADI{' - ' + region_name if region_name else ''}:")
    recommendations.append("- Lakukan penyiangan gulma secara berkala")
    recommendations.append("- Pantau ketersediaan air irigasi")
    recommendations.append("- Lakukan pemupukan berimbang (N, P, K) sesuai kondisi lahan")
    recommendations.append("- Kontrol hama dan penyakit dengan pestisida yang tepat")
    recommendations.append("- Gunakan benih berkualitas dan varietas yang sesuai dengan kondisi wilayah")
    recommendations.append("- Lakukan rotasi tanaman untuk menjaga kesuburan tanah")
    recommendations.append("- Terapkan sistem tanam jajar legowo untuk hasil optimal")
    
    return recommendations

def get_weather_forecast(df_weather: pd.DataFrame, months: int = 3) -> dict:
    """
    Membuat prediksi cuaca untuk 3 bulan ke depan berdasarkan pola historis.
    Hanya menggunakan data dari 10 tahun terakhir.
    
    Args:
        df_weather: DataFrame data cuaca historis
        months: Jumlah bulan ke depan untuk diprediksi (default: 3)
    
    Returns:
        dict: Prediksi cuaca per bulan
    """
    print(f"get_weather_forecast called. df_weather empty: {df_weather.empty}")
    print(f"DATE_COLUMN in df_weather.columns: {config.DATE_COLUMN in df_weather.columns}")
    if not df_weather.empty:
        print(f"df_weather columns: {df_weather.columns.tolist()}")
        print(f"df_weather shape: {df_weather.shape}")
    
    if df_weather.empty or config.DATE_COLUMN not in df_weather.columns:
        return {
            "forecast": [],
            "note": "Data cuaca tidak tersedia untuk prediksi"
        }
    
    df_weather_copy = df_weather.copy()
    df_weather_copy[config.DATE_COLUMN] = pd.to_datetime(df_weather_copy[config.DATE_COLUMN])
    df_weather_copy['Bulan'] = df_weather_copy[config.DATE_COLUMN].dt.month
    df_weather_copy['Tahun'] = df_weather_copy[config.DATE_COLUMN].dt.year
    
    # Filter hanya data dari 10 tahun terakhir
    current_year = datetime.now().year
    min_year = current_year - config.HISTORICAL_YEARS_FOR_PREDICTION
    df_weather_copy = df_weather_copy[df_weather_copy['Tahun'] >= min_year].copy()
    print(f"Forecast menggunakan data cuaca dari {min_year} hingga {current_year} ({config.HISTORICAL_YEARS_FOR_PREDICTION} tahun terakhir)")
    
    # Hitung rata-rata kejadian cuaca ekstrem per bulan
    monthly_stats = []
    current_date = datetime.now()
    
    for i in range(months):
        target_month = (current_date.month + i - 1) % 12 + 1
        target_year = current_date.year + ((current_date.month + i - 1) // 12)
        
        # Ambil data historis untuk bulan yang sama
        historical_data = df_weather_copy[df_weather_copy['Bulan'] == target_month]
        
        if not historical_data.empty:
            # Hitung statistik
            total_events = len(historical_data)
            
            # Hitung jenis cuaca ekstrem
            if config.WEATHER_EVENT_COLUMN in historical_data.columns:
                events = historical_data[config.WEATHER_EVENT_COLUMN].str.split(', ', expand=True).stack()
                event_counts = events.value_counts().to_dict()
            else:
                event_counts = {}
            
            monthly_stats.append({
                "bulan": target_month,
                "tahun": target_year,
                "nama_bulan": current_date.replace(month=target_month, year=target_year).strftime("%B %Y"),
                "prediksi_kejadian": total_events,
                "cuaca_ekstrem": event_counts,
                "catatan": f"Berdasarkan rata-rata {len(historical_data)} kejadian historis di bulan {target_month}"
            })
        else:
            monthly_stats.append({
                "bulan": target_month,
                "tahun": target_year,
                "nama_bulan": current_date.replace(month=target_month, year=target_year).strftime("%B %Y"),
                "prediksi_kejadian": 0,
                "cuaca_ekstrem": {},
                "catatan": "Tidak ada data historis untuk bulan ini"
            })
    
    return {
        "forecast": monthly_stats,
        "note": "Prediksi berdasarkan pola historis data cuaca ekstrem. Prediksi ini bersifat estimasi dan dapat berubah."
    }

def get_weather_forecast_from_planting_month(df_weather: pd.DataFrame, planting_month: int, planting_year: int) -> dict:
    """
    Membuat prediksi cuaca untuk 3 bulan ke depan dari bulan penanaman berdasarkan pola historis.
    Hanya menggunakan data dari 10 tahun terakhir.
    
    Args:
        df_weather: DataFrame data cuaca historis
        planting_month: Bulan penanaman (1-12)
        planting_year: Tahun penanaman
    
    Returns:
        dict: Prediksi cuaca per bulan untuk 3 bulan setelah penanaman
    """
    if df_weather.empty or config.DATE_COLUMN not in df_weather.columns:
        return {
            "forecast": [],
            "note": "Data cuaca tidak tersedia untuk prediksi"
        }
    
    df_weather_copy = df_weather.copy()
    df_weather_copy[config.DATE_COLUMN] = pd.to_datetime(df_weather_copy[config.DATE_COLUMN])
    df_weather_copy['Bulan'] = df_weather_copy[config.DATE_COLUMN].dt.month
    df_weather_copy['Tahun'] = df_weather_copy[config.DATE_COLUMN].dt.year
    
    # Filter hanya data dari 10 tahun terakhir
    current_year = datetime.now().year
    min_year = current_year - config.HISTORICAL_YEARS_FOR_PREDICTION
    df_weather_copy = df_weather_copy[df_weather_copy['Tahun'] >= min_year].copy()
    print(f"Forecast menggunakan data cuaca dari {min_year} hingga {current_year} ({config.HISTORICAL_YEARS_FOR_PREDICTION} tahun terakhir)")
    
    # Hitung prediksi untuk 3 bulan ke depan dari bulan penanaman
    monthly_stats = []
    
    for i in range(3):  # 3 bulan ke depan
        # Hitung bulan target (bulan penanaman + i)
        target_month = ((planting_month - 1 + i) % 12) + 1
        # Jika melewati Desember, tahun bertambah
        target_year = planting_year + ((planting_month - 1 + i) // 12)
        
        # Ambil data historis untuk bulan yang sama dari semua tahun
        historical_data = df_weather_copy[df_weather_copy['Bulan'] == target_month]
        
        if not historical_data.empty:
            # Hitung rata-rata kejadian per tahun untuk bulan ini
            events_per_year = len(historical_data) / len(historical_data['Tahun'].unique()) if len(historical_data['Tahun'].unique()) > 0 else len(historical_data)
            
            # Hitung jenis cuaca ekstrem
            if config.WEATHER_EVENT_COLUMN in historical_data.columns:
                events = historical_data[config.WEATHER_EVENT_COLUMN].str.split(', ', expand=True).stack()
                event_counts = events.value_counts().to_dict()
                # Normalisasi ke rata-rata per tahun
                num_years = len(historical_data['Tahun'].unique())
                if num_years > 0:
                    event_counts = {k: round(v / num_years, 1) for k, v in event_counts.items()}
            else:
                event_counts = {}
            
            # Format nama bulan
            month_name = datetime(planting_year, target_month, 1).strftime("%B")
            
            monthly_stats.append({
                "bulan": target_month,
                "tahun": target_year,
                "nama_bulan": f"{month_name} {target_year}",
                "prediksi_kejadian": round(events_per_year, 1),
                "cuaca_ekstrem": event_counts,
                "catatan": f"Berdasarkan rata-rata {round(events_per_year, 1)} kejadian historis per tahun di bulan {month_name}"
            })
        else:
            month_name = datetime(planting_year, target_month, 1).strftime("%B")
            monthly_stats.append({
                "bulan": target_month,
                "tahun": target_year,
                "nama_bulan": f"{month_name} {target_year}",
                "prediksi_kejadian": 0,
                "cuaca_ekstrem": {},
                "catatan": f"Tidak ada data historis untuk bulan {month_name}"
            })
    
    return {
        "forecast": monthly_stats,
        "planting_month": planting_month,
        "planting_year": planting_year,
        "note": f"Prediksi cuaca untuk 3 bulan setelah penanaman di {datetime(planting_year, planting_month, 1).strftime('%B %Y')}. Berdasarkan pola historis data cuaca ekstrem."
    }

