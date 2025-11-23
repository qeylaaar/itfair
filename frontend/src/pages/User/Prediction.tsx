import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { 
    Plus, X, Calendar, MapPin, Trash2, BrainCircuit, AlertTriangle 
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Komponen Placeholder Peta ---
// Ganti ini dengan implementasi react-leaflet Anda
const MapInputComponent = () => {

  // Placeholder JSX:
  return (
    <div className="w-full h-[250px] bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
      <div className="text-center text-gray-500">
        <MapPin className="w-12 h-12 mx-auto" />
        <p className="mt-2 font-medium">Placeholder Peta Leaflet</p>
        <p className="text-sm">Implementasikan `react-leaflet` di sini.</p>
      </div>
    </div>
  );
};
// --- Akhir Komponen Placeholder Peta ---

// Data awal untuk riwayat prediksi (fallback jika localStorage kosong)
const mockPredictionsData = [
  { id: '1', name: 'Prediksi Sawah - Blok A1', date: '2024-10-15' },
  { id: '2', name: 'Prediksi Sawah - Blok B2', date: '2024-09-30' },
  { id: '3', name: 'Prediksi Tegal - Blok C1', date: '2024-09-01' },
];

type StoredPrediction = {
  id: string;
  name: string;
  date: string;
  region: string;
  month: string;
  plantingDate: string;
  landArea: string;
  mlResult: any;
};

const PredictionPage: React.FC = () => {
  const navigate = useNavigate();

  const [isModalOpen, setModalOpen] = useState(false);
  // State untuk daftar prediksi
  const [predictions, setPredictions] = useState<StoredPrediction[]>([]);

  // State untuk modal konfirmasi hapus
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // State untuk form
  const [plantingDate, setPlantingDate] = useState('');
  const [landArea, setLandArea] = useState('');
  // Anda perlu state untuk lokasi dari Leaflet

  // State tambahan untuk integrasi ML (region + bulan)
  const [regions, setRegions] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [month, setMonth] = useState(''); // format: YYYY-MM
  const [isSubmittingApi, setIsSubmittingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Ambil daftar region dari backend (proxy ke FastAPI)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const resp = await fetch('http://localhost:4000/api/ml/regions');

        if (!resp.ok) {
          return;
        }
        const data = await resp.json();
        if (Array.isArray(data?.regions)) {
          setRegions(data.regions);
        }
      } catch {
        // Biarkan silent untuk sekarang; bisa ditangani di UI jika perlu
      }
    };

    fetchRegions();
  }, []);

  // Inisialisasi daftar prediksi dari localStorage (jika ada)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('predictions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPredictions(parsed);
          return;
        }
      }
      // Jika tidak ada di localStorage, isi dengan mock agar UI tidak kosong
      const fallback: StoredPrediction[] = mockPredictionsData.map((p) => ({
        id: p.id,
        name: p.name,
        date: p.date,
        region: '',
        month: '',
        plantingDate: p.date,
        landArea: '',
        mlResult: null,
      }));
      setPredictions(fallback);
    } catch {
      // Abaikan error parsing localStorage
    }
  }, []);

  const handleCreatePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsSubmittingApi(true);

    try {
      // Panggil backend yang kemudian meneruskan ke layanan ML FastAPI
      const resp = await fetch('http://localhost:4000/api/ml/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region,
          month,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.detail || err?.error || 'Gagal memanggil API prediksi');
      }

      const result = await resp.json();
      console.log('Hasil prediksi dari ML:', result);

      // Menambahkan prediksi baru ke state & localStorage
      const newPrediction: StoredPrediction = {
        id: `${Date.now()}`,
        name: `Prediksi ${result.region} - ${month}`,
        date: plantingDate || new Date().toISOString().slice(0, 10),
        region,
        month,
        plantingDate,
        landArea,
        mlResult: result,
      };
      const updated = [newPrediction, ...predictions];
      setPredictions(updated);
      try {
        localStorage.setItem('predictions', JSON.stringify(updated));
      } catch {
        // Abaikan jika localStorage tidak tersedia
      }

      setModalOpen(false); // Tutup modal setelah submit

      // Tampilkan notifikasi sukses dengan opsi untuk melihat detail
      Swal.fire({
        title: 'Prediksi berhasil dibuat',
        text: 'Ingin melihat detail hasil prediksi sekarang?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Lihat Hasil Prediksi',
        cancelButtonText: 'Nanti saja',
      }).then((resultSwal) => {
        if (resultSwal.isConfirmed) {
          navigate(`/prediction/${newPrediction.id}`);
        }
      });

      // Reset form
      setPlantingDate('');
      setLandArea('');
      setRegion('');
      setMonth('');
    } catch (err: any) {
      setApiError(err?.message || 'Terjadi kesalahan saat prediksi');
    } finally {
      setIsSubmittingApi(false);
    }
  };

  // Menampilkan modal konfirmasi
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(id);
  };

  // Logika untuk menghapus prediksi
  const confirmDelete = () => {
    if (showDeleteConfirm) {
      console.log("Menghapus prediksi:", showDeleteConfirm);
      setPredictions(prev => prev.filter(p => p.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-20">
          {/* Header Halaman */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Prediksi
              </h1>
              <p className="mt-1 text-gray-600">
                Kelola dan buat prediksi baru untuk lahan Anda.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              Buat Prediksi Baru
            </button>
          </div>
  
          {/* BARU: Kartu Informasi AI */}
          <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-4">
              <div className="flex-shrink-0">
                  <BrainCircuit className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                  <h2 className="text-lg font-semibold text-blue-900">
                      Didukung oleh PadiPredict AI
                  </h2>
                  <p className="text-sm text-blue-800 mt-1">
                      Model AI kami menganalisis data historis, data input Anda, dan prakiraan cuaca BMKG untuk memberikan Anda prediksi akurat tentang potensi keberhasilan atau kegagalan panen. Buat prediksi baru untuk mendapatkan wawasan dan rekomendasi mitigasi yang dapat ditindaklanjuti.
                  </p>
              </div>
          </div>
  
          {/* Grid Kartu Prediksi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions.map((pred) => (
              <div
                key={pred.id}
                className="relative p-6 bg-white border border-gray-200 rounded-lg shadow-md transition-all group"
              >
                {/* BARU: Tombol Hapus */}
                <button 
                  onClick={(e) => handleDeleteClick(e, pred.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Hapus prediksi"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <Link
                  to={`/prediction/${pred.id}`} // Arahkan ke halaman detail
                  className="block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-500">
                      {new Date(pred.date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {pred.name}
                  </h2>
                </Link>
              </div>
            ))}
          </div>
        </div>
  
        {/* Modal Buat Prediksi */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Buat Prediksi Baru
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <hr className='border-t border-gray-300' />
              
              <form onSubmit={handleCreatePrediction}>
                <div className="p-6 space-y-6">
                  <div>
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Pilih Kabupaten/Kota (Jawa Barat)
                    </label>
                    <select
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">-- Pilih wilayah --</option>
                      {regions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="month"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Bulan Prediksi (Tahun-Bulan)
                    </label>
                    <input
                      type="month"
                      id="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="plantingDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tanggal Penanaman
                    </label>
                    <input
                      type="date"
                      id="plantingDate"
                      value={plantingDate}
                      onChange={(e) => setPlantingDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="landArea"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Luas Lahan (dalam hektar)
                    </label>
                    <input
                      type="number"
                      id="landArea"
                      step="0.1"
                      min="0"
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      placeholder="Contoh: 1.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentukan Lokasi Lahan
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Klik pada peta untuk menentukan koordinat lahan Anda. Anda dapat menggeser peta.
                    </p>
                    <MapInputComponent />
                  </div>
                </div>
                <hr className='border-t border-gray-300' />
                
                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                  {apiError && (
                    <p className="mr-4 text-sm text-red-600">
                      {apiError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
                    disabled={isSubmittingApi}
                  >
                    {isSubmittingApi ? 'Memproses...' : 'Simpan & Prediksi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* BARU: Modal Konfirmasi Hapus */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 border border-gray-200">
              <div className="p-6">
                  <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-red-100 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                              Hapus Prediksi?
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                              Apakah Anda yakin ingin menghapus prediksi ini? Tindakan ini tidak dapat dibatalkan.
                          </p>
                      </div>
                  </div>
              </div>
              <hr className='border-t border-gray-300' />

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 border border-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default PredictionPage;