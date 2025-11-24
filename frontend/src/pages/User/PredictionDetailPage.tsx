import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { 
  MapPin, Calendar, Maximize2, Activity, Shield, AlertTriangle, 
  CloudRain, Thermometer, Wind, Droplets, CalendarDays, BrainCircuit, 
  ArrowLeft
} from 'lucide-react';

// --- Komponen Placeholder Peta Statis ---
// Ganti ini dengan implementasi react-leaflet Anda
const MapDisplayComponent = () => {
  

  // Placeholder JSX:
  return (
    <div className="w-full h-[250px] bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
      <div className="text-center text-gray-500">
        <MapPin className="w-12 h-12 mx-auto" />
        <p className="mt-2 font-medium">Placeholder Peta Statis</p>
      </div>
    </div>
  );
};
// --- Akhir Komponen Placeholder Peta ---

// --- Mock Data yang Telah Diperbarui dan Lebih Detail ---
const mockDetail = {
  id: '1',
  name: 'Prediksi Sawah - Blok A1 (Musim Tanam Gadu 2025)',
  date: '2025-05-15',
  area: 2.5,
  location: { lat: -7.0051, lng: 107.6338 },
  ai_result: {
    outcome: 'Gagal', // 'Gagal' atau 'Berhasil'
    reasoning: 'Prediksi Gagal didasarkan pada kombinasi curah hujan ekstrem yang akan datang (indikasi La Niña) yang meningkatkan risiko banjir, serta data historis kelembapan sangat tinggi di lokasi ini yang mendukung wabah jamur (Blast) dan Wereng Batang Coklat (WBC).',
    weather_data: {
      period: '1 Mei 2025 - 14 Mei 2025',
      avg_temp: '28.5°C',
      avg_humidity: '85%',
      total_rainfall: '150mm (Diatas normal untuk awal musim kemarau)',
      wind_speed: '15 km/jam (Arah Tenggara)',
      summary: 'Kondisi sangat lembap dan basah, ideal untuk perkembangan patogen.'
    }
  },
  conclusion: 'Potensi Gagal Panen Tinggi. Risiko utama adalah serangan WBC yang diperparah oleh kelembapan tinggi dan curah hujan di atas normal. Risiko sekunder adalah penyakit Blast (Pyricularia oryzae) dan potensi lodge (rebah) akibat angin kencang.',
  mitigation: [
    {
      title: 'Pengendalian Hama WBC (Wereng Batang Coklat)',
      steps: [
        'Segera lakukan pemantauan intensif setiap 3 hari sekali. Periksa pangkal batang padi untuk menemukan nimfa (wereng muda) dan wereng dewasa.',
        'Gunakan pestisida sistemik berbahan aktif Pymetrozine atau Imidacloprid. Hindari penggunaan pestisida golongan piretroid karena dapat menyebabkan resistensi dan kebangkitan hama.',
        'Terapkan sistem pengairan berselang (intermittent irrigation) untuk mengurangi kelembapan di area pangkal batang, sehingga tidak disukai wereng.'
      ]
    },
    {
      title: 'Pencegahan Penyakit Blast (Jamur)',
      steps: [
        'Gunakan fungisida preventif berbahan aktif Tricyclazole atau Isoprothiolane, terutama saat kelembapan udara > 80% secara konsisten.',
        'Atur jarak tanam agar tidak terlalu rapat (disarankan menggunakan sistem Jajar Legowo 2:1) untuk meningkatkan sirkulasi udara dan mengurangi kelembapan antar tanaman.',
        'Kendalikan pemberian pupuk Nitrogen (Urea) agar tidak berlebihan. Imbangi dengan pupuk Kalium (KCL) yang cukup untuk memperkuat dinding sel tanaman sehingga lebih tahan penyakit.'
      ]
    },
    {
      title: 'Manajemen Air dan Drainase',
      steps: [
        'Pastikan saluran drainase (got) di sekeliling dan di dalam petak sawah bersih dari gulma dan sampah agar air dapat mengalir lancar.',
        'Jika terjadi banjir ringan (tergenang > 24 jam), segera lakukan pemompaan air keluar dari petak sawah untuk mencegah busuk akar dan stres tanaman.'
      ]
    }
  ],
  future_weather_forecast: [
    { 
      month: 'Juni 2025', 
      prediction: 'Curah Hujan Tinggi (Awal Musim Kemarau Basah)', 
      details: 'Diperkirakan 300-400mm/bulan (Data BMKG). Waspada peningkatan kelembapan dan risiko banjir lokal. Fase vegetatif akhir.' 
    },
    { 
      month: 'Juli 2025', 
      prediction: 'Curah Hujan Menengah', 
      details: 'Curah hujan mulai normal (150-250mm/bulan). Suhu malam hari kemungkinan lebih dingin, waspada embun pagi yang memicu jamur. Fase generatif awal.' 
    },
    { 
      month: 'Agustus 2025', 
      prediction: 'Curah Hujan Rendah (Puncak Musim Kemarau)', 
      details: 'Curah hujan < 100mm/bulan. Fokus pada manajemen irigasi untuk mencegah kekeringan di fase pengisian bulir.' 
    },
  ]
};

type StoredPrediction = {
  id: string;
  name: string;
  date: string;
  region?: string;
  month?: string;
  plantingDate?: string;
  landArea?: string;
  mlResult?: any;
};

const PredictionDetailPage: React.FC = () => {
  const { id } = useParams();
  // Prediksi yang diambil dari localStorage berdasarkan id (jika ada)
  const [storedPrediction, setStoredPrediction] = useState<StoredPrediction | null>(null);

  useEffect(() => {
    if (!id) return;
    try {
      const raw = localStorage.getItem('predictions');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const found = parsed.find((p: StoredPrediction) => String(p.id) === String(id));
      if (found) {
        setStoredPrediction(found);
      }
    } catch {
      // Abaikan error parsing localStorage
    }
  }, [id]);

  // Data template bawaan (mock) untuk isi detail kompleks
  const prediction = mockDetail;

  // Ambil hasil dari ML (jika tersedia di localStorage)
  const mlResult = storedPrediction?.mlResult;
  const mlPredictionLabel: string | undefined = mlResult?.prediction; // "Gagal Panen" atau "Normal"
  const mlProbability: number | undefined = mlResult?.probability;    // 0-1
  const mlRiskLevel: string | undefined = mlResult?.risk_level;       // "Rendah/Sedang/Tinggi"

  // Ringkasan web dari backend (jika ada)
  const webSummary = mlResult?.web_summary;
  const webSections: any[] | undefined = webSummary?.sections;

  // Cari section berdasarkan prefix judul, karena beberapa judul (mis. Data Cuaca Historis)
  // mengandung label periode yang dinamis di belakangnya.
  const getSectionByTitle = (titlePrefix: string) => {
    if (!webSections) return undefined;
    return webSections.find((s) => {
      const t = typeof s.title === 'string' ? s.title : '';
      return t.startsWith(titlePrefix);
    });
  };

  const analysisSection = getSectionByTitle('Analisis & Alasan Prediksi');
  const weatherStatsSection = getSectionByTitle('Data Cuaca Historis');
  const conclusionSection = getSectionByTitle('Kesimpulan Detail');
  const mitigationSection = getSectionByTitle('Rekomendasi Mitigasi Penanganan');
  const forecastSection = getSectionByTitle('Prakiraan Cuaca BMKG (3 Bulan Kedepan)');

  // Penentuan gagal/berhasil utama mengikuti hasil ML jika ada
  const isFailure = mlPredictionLabel
    ? mlPredictionLabel === 'Gagal Panen'
    : prediction.ai_result.outcome === 'Gagal';

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* BARU: Tombol Kembali */}
        <div className="mb-6">
          <Link 
            to="/prediction"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Prediksi
          </Link>
        </div>

        {/* Header Halaman */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Detail Prediksi
          </h1>
          <p className="text-lg text-gray-600">
            {storedPrediction?.name || prediction.name}
          </p>
        </div>

        {/* Layout Grid Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kanan (Detail Input) - SEKARANG PERTAMA DI HTML */}
          {/* Ditambahkan 'lg:order-2' untuk mengirimnya ke kanan di desktop */}
          <div className="lg:col-span-1 lg:order-2">
            <div className="lg:sticky lg:top-24 bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Detail Data
                </h2>
                <div className="space-y-4">
                  {/* Tanggal Tanam */}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500">Tanggal Tanam</span>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(storedPrediction?.plantingDate || prediction.date).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {/* Luas Lahan */}
                  <div className="flex items-center gap-3">
                    <Maximize2 className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-xs text-gray-500">Luas Lahan</span>
                      <p className="text-sm font-medium text-gray-900">
                        {storedPrediction?.landArea || prediction.area} Hektar
                      </p>
                    </div>
                  </div>
                  {/* Lokasi */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <span className="text-xs text-gray-500">Lokasi Lahan</span>
                      <p className="text-sm font-medium text-gray-900">
                        {prediction.location.lat.toFixed(6)}, {prediction.location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  {/* Peta Statis */}
                  <div className="pt-2">
                     <MapDisplayComponent />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Kolom Kiri (Hasil & Mitigasi) - SEKARANG KEDUA DI HTML */}
          {/* Ditambahkan 'lg:order-1' untuk menariknya ke kiri di desktop */}
          <div className="lg:col-span-2 space-y-6 lg:order-1">
            
            {/* Kartu Hasil AI */}
            <div className={`bg-white border ${isFailure ? 'border-red-300' : 'border-green-300'} rounded-lg shadow-md overflow-hidden`}>
              <div className="p-5 flex items-start gap-4">
                <div className={`p-3 rounded-full ${isFailure ? 'bg-red-100' : 'bg-green-100'}`}>
                  {isFailure ? (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  ) : (
                    <Shield className="w-8 h-8 text-green-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-l font-semibold text-gray-900">
                    Hasil Prediksi AI
                  </h2>
                  <p className={`text-xl font-bold ${isFailure ? 'text-red-600' : 'text-green-600'}`}>
                    {isFailure ? 'Potensi Gagal Panen' : 'Potensi Berhasil Panen'}
                  </p>
                  {mlProbability !== undefined && (
                    <p className="mt-1 text-sm text-gray-700">
                      Probabilitas gagal panen: <span className="font-semibold">{(mlProbability * 100).toFixed(1)}%</span>
                      {mlRiskLevel && (
                        <span className="ml-1">(Level risiko: {mlRiskLevel})</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* BARU: Kartu Analisis Data Cuaca */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-5">
                <h2 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-gray-600" /> {/* Diperbarui: Warna netral */}
                  Analisis & Alasan Prediksi
                </h2>
                <p className="text-gray-700 mb-4 italic border-l-4 border-gray-300 pl-4 py-2 bg-gray-50">
                  {analysisSection && Array.isArray(analysisSection.content)
                    ? `"${analysisSection.content.join(' ')}` + '"'
                    : `"${prediction.ai_result.reasoning}"`}
                </p>
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  {weatherStatsSection
                    ? weatherStatsSection.title
                    : `Data Cuaca Historis (Periode: ${prediction.ai_result.weather_data.period})`}
                </h3>
                {weatherStatsSection && Array.isArray(weatherStatsSection.content) ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {weatherStatsSection.content.map((line: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <Thermometer className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-900">{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <li className="flex items-center gap-2 text-gray-700">
                      <Thermometer className="w-5 h-5 text-gray-500" />
                      Suhu Rata-rata: <span className="font-medium text-gray-900">{prediction.ai_result.weather_data.avg_temp}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Droplets className="w-5 h-5 text-gray-500" />
                      Kelembapan: <span className="font-medium text-gray-900">{prediction.ai_result.weather_data.avg_humidity}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CloudRain className="w-5 h-5 text-gray-500" />
                      Curah Hujan: <span className="font-medium text-gray-900">{prediction.ai_result.weather_data.total_rainfall}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Wind className="w-5 h-5 text-gray-500" />
                      Angin: <span className="font-medium text-gray-900">{prediction.ai_result.weather_data.wind_speed}</span>
                    </li>
                  </ul>
                )}
                <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-md">
                  <span className="font-semibold text-gray-800">Ringkasan Cuaca:</span>{' '}
                  {weatherStatsSection && Array.isArray(weatherStatsSection.content)
                    ? weatherStatsSection.content.join(' ')
                    : prediction.ai_result.weather_data.summary}
                </p>
              </div>
            </div>

            {/* Kartu Kesimpulan */}
         <div className="bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-5">
                <h2 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-gray-600" /> {/* Diperbarui: Warna netral */}
                  Kesimpulan Detail
                </h2>
                <p className="text-gray-700 leading-relaxed"> {/* Diperbarui: Teks lebih mudah dibaca */}
                  {conclusionSection && Array.isArray(conclusionSection.content)
                    ? conclusionSection.content.join(' ')
                    : prediction.conclusion}
                </p>
              </div>
            </div>

            {/* Kartu Mitigasi (Diperbarui) */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-500" />
                  Rekomendasi Mitigasi Penanganan
                </h2>
                <div className="space-y-5">
                  {/* Tampilkan rekomendasi dari ML jika ada */}
                  {mlResult?.mitigation_recommendations && Array.isArray(mlResult.mitigation_recommendations) ? (
                    <div className="space-y-4">
                      {mlResult.mitigation_recommendations.map((rec: string, index: number) => {
                        // Deteksi kategori rekomendasi berdasarkan emoji atau prefix
                        if (rec.startsWith('\n') || rec.startsWith('[') || rec.match(/^[🌡️💧🌧️💨⚠️📋]/)) {
                          // Ini adalah header/kategori
                          return (
                            <div key={index} className="mt-4">
                              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                {rec.replace(/^[\n\s]*/, '')}
                              </h3>
                            </div>
                          );
                        } else if (rec.startsWith('- ')) {
                          // Ini adalah item rekomendasi
                          return (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <p className="text-sm text-gray-700 leading-relaxed flex-1">
                                {rec.replace(/^-\s*/, '')}
                              </p>
                            </div>
                          );
                        } else if (rec.startsWith('  •')) {
                          // Sub-item rekomendasi
                          return (
                            <div key={index} className="flex items-start gap-2 ml-4">
                              <span className="text-gray-400 mt-1">-</span>
                              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                                {rec.replace(/^\s*•\s*/, '')}
                              </p>
                            </div>
                          );
                        } else {
                          // Teks biasa
                          return (
                            <p key={index} className="text-sm text-gray-700 leading-relaxed">
                              {rec}
                            </p>
                          );
                        }
                      })}
                    </div>
                  ) : mitigationSection && Array.isArray(mitigationSection.subsections) ? (
                    mitigationSection.subsections.map((sub: any, index: number) => (
                        <div key={index} className="relative pl-4 border-l-2 border-green-500">
                          <h3 className="text-sm font-semibold text-gray-800 mb-2">
                            {sub.subtitle || 'Mitigasi'}
                          </h3>
                          <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700 leading-relaxed">
                            {Array.isArray(sub.content) &&
                              sub.content.map((step: string, stepIndex: number) => (
                                <li key={stepIndex}>{step}</li>
                              ))}
                          </ul>
                        </div>
                      ))
                  ) : (
                    prediction.mitigation.map((item, index) => (
                        <div key={index} className="relative pl-4 border-l-2 border-green-500">
                          <h3 className="text-sm font-semibold text-gray-800 mb-2">
                            {item.title}
                          </h3>
                          <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700 leading-relaxed">
                            {item.steps.map((step, stepIndex) => (
                              <li key={stepIndex}>{step}</li>
                            ))}
                          </ul>
                        </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* BARU: Kartu Prakiraan Cuaca */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-5">
                <h2 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarDays className="w-6 h-6 text-gray-600" /> {/* Diperbarui: Warna netral */}
                 Prakiraan Cuaca BMKG (3 Bulan Kedepan)
                </h2>
                <div className="space-y-4">
                  {/* Tampilkan forecast dari ML jika ada */}
                  {mlResult?.weather_forecast?.forecast && Array.isArray(mlResult.weather_forecast.forecast) ? (
                    mlResult.weather_forecast.forecast.map((item: any, index: number) => (
                      <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                          {item.nama_bulan || `${item.bulan}/${item.tahun}`}
                        </h3>
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          Prediksi Kejadian: {item.prediksi_kejadian} kejadian
                        </p>
                        {item.cuaca_ekstrem && Object.keys(item.cuaca_ekstrem).length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Cuaca Ekstrem:</p>
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                              {Object.entries(item.cuaca_ekstrem).slice(0, 3).map(([event, count]: [string, any]) => (
                                <li key={event}>{event}: {count}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {item.catatan && (
                          <p className="text-xs text-gray-600 mt-2 italic">{item.catatan}</p>
                        )}
                      </div>
                    ))
                  ) : forecastSection && Array.isArray(forecastSection.content) ? (
                    forecastSection.content.map((line: string, index: number) => (
                        <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                          <p className="text-sm text-gray-700">{line}</p>
                        </div>
                      ))
                  ) : (
                    prediction.future_weather_forecast.map((forecast, index) => (
                        <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                          <h3 className="text-sm font-semibold text-gray-800">
                            {forecast.month}
                          </h3>
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            {forecast.prediction}
                          </p>
                          <p className="text-sm text-gray-600">{forecast.details}</p>
                        </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
};

export default PredictionDetailPage;