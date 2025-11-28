Sistem Peringatan Dini Gagal Panen berbasis AI yang mampu memprediksi risiko secara instan berdasarkan kumpulan data pada wilayah dan tahun sebelumnya. Sistem ini mampu memprediksi kegagalan panen pada padi dengan memperkirakan lingkungan kedepan dan history panen yang baik untuk produksi padi sehingga dapat mencegah kerugian yang dapat terjadi.

Model AI ini dilatih dengan menggunakan data historis 7 tahun sebelumnya dengan mencakup data iklim BMKG dan data hasil panen (luas panen, produktivitas dan produksi padi) BPS Indonesia. User dapat membuat prediksi baru dan memasukan data yang diperlukan seperti kabupaten/kota user, bulan untuk prediksi, tanggal penanaman bibit padi, luas lahan. Output yang dihasilkan yaitu Halaman Visual (Merah/Hijau) yang memberikan peringatan dini spesifik (misal: "Risiko gagal panen") serta memberikan informasi alasan gagal atau berhasil panen, cara mitigasi atau perawatan lahan padi serta data cuaca untuk 3 bulan kedepan.

cara menjalankan program diantaranya:
1. Pada frontend lakukan cd ke folder frontend
2. Ketik "bun dev"
3. Buka terminal baru dan lakukan cara berikutnya
4. Pada backend lakukan cd ke folder backend dan set PORT=4000 && node index.js
5. Buka terminal baru dan lakukan cara berikutnya
6. Pada ml cd ke folder ml
7. Ketik "unicorn api.main:app --reload --port 8001
