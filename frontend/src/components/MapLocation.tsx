import React, { useState, useEffect } from 'react';
// Impor dari CDN unpkg sebagai alternatif
// @ts-ignore 
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'https://unpkg.com/react-leaflet@4.2.1/dist/react-leaflet.esm.js';
// @ts-ignore 
import L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';

// --- Perbaikan Ikon Default Leaflet ---
delete L.Icon.Default.prototype._getIconUrl; 

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https.unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- Akhir Perbaikan Ikon ---


/**
 * Komponen helper untuk memusatkan ulang peta secara dinamis
 */
const MapRecenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center]);
  return null;
}

/**
 * Komponen MapInputComponent
 * Menerima prop onLocationChange untuk mengirim data lat/lng ke parent.
 */
const MapInputComponent = ({ onLocationChange }: { onLocationChange: (location: L.LatLng) => void }) => {
  // State untuk melacak posisi marker
  const [position, setPosition] = useState<L.LatLng | null>(null);
  // State untuk pusat peta, default ke Bandung
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.9175, 107.6191]);

  // Efek untuk memuat CSS Leaflet secara dinamis
  useEffect(() => {
    const leafletCSS = document.getElementById('leaflet-css');
    if (!leafletCSS) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []); // Hanya dijalankan sekali saat komponen dimuat

  // Efek baru untuk mengambil lokasi terkini pengguna
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Berhasil mendapatkan lokasi
        const { latitude, longitude } = pos.coords;
        const newPos = L.latLng(latitude, longitude);
        
        // 1. Atur pusat peta ke lokasi pengguna
        setMapCenter([latitude, longitude]);
        // 2. Atur marker ke lokasi pengguna
        setPosition(newPos);
        
        // 3. Kirim lokasi ke form induk
        if (onLocationChange) {
          onLocationChange(newPos);
        }
      },
      (err) => {
        // Gagal mendapatkan lokasi (misal: pengguna menolak)
        console.warn(`ERROR(${err.code}): ${err.message}`);
        // Biarkan mapCenter tetap di default (Bandung)
      }
    );
  }, [onLocationChange]); // Dependency array diubah untuk menyertakan onLocationChange

  /**
   * Komponen internal untuk menangani klik pada peta.
   * Didefinisikan di dalam MapInputComponent agar bisa mengakses
   * setPosition dan onLocationChange.
   */
  const MapClickHandler = () => {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        // 1. Perbarui state internal untuk menampilkan marker
        setPosition(e.latlng);
        
        // 2. Panggil fungsi callback untuk memperbarui state di form utama
        if (onLocationChange) {
          onLocationChange(e.latlng);
        }
      },
    });

    // Tampilkan marker jika posisi sudah di-set
    return position === null ? null : (
      <Marker position={position}></Marker>
    );
  }

  // Render MapContainer
  return (
    <MapContainer 
      center={mapCenter} // Gunakan state mapCenter
      zoom={13} 
      style={{ height: '250px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Komponen handler klik dimasukkan ke dalam peta */}
      <MapClickHandler />
      {/* Komponen helper untuk memusatkan peta */}
      <MapRecenter center={mapCenter} />
    </MapContainer>
  );
};

export default MapInputComponent;