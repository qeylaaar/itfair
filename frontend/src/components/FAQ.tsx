import React, { useState } from 'react';

const faqs = [
  {
    id: 1,
    question: "Bagaimana akurasi prediksi gagal panen ini?",
    answer: "Sistem kami memiliki akurasi hingga 95% berdasarkan penggunaan algoritma machine learning canggih dan data historis panen selama 10 tahun. Semakin banyak data yang Anda masukkan, semakin akurat prediksinya."
  },
  {
    id: 2,
    question: "Apa saja faktor yang digunakan dalam prediksi?",
    answer: "Kami menganalisis berbagai faktor termasuk kondisi cuaca, kualitas tanah, jenis bibit, pola hama dan penyakit, histori panen, serta data satelit dan sensor IoT untuk memberikan prediksi yang komprehensif."
  },
  {
    id: 3,
    question: "Apakah saya bisa mencoba secara gratis?",
    answer: "Ya, kami menyediakan masa trial gratis selama 30 hari dengan akses penuh ke semua fitur. Anda bisa merasakan manfaatnya sebelum memutuskan berlangganan. Tidak perlu kartu kredit untuk trial."
  },
  {
    id: 4,
    question: "Bagaimana cara memulai penggunaannya?",
    answer: "Cukup daftar akun, masukkan informasi lahan sawah Anda (lokasi, luas, jenis tanah), pilih varietas padi yang ditanam, dan sistem akan mulai memantau dan memberikan prediksi secara otomatis."
  },
  {
    id: 5,
    question: "Apakah cocok untuk petani skala kecil?",
    answer: "Sangat cocok! Sistem ini dirancang untuk semua skala, dari petani kecil hingga besar. Bahkan petani kecil bisa mendapatkan manfaat besar dengan biaya yang sangat terjangkau, mulai dari Rp50.000 per bulan."
  }
];

const MinusIcon = () => (
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_9283_3094)">
      <path d="M5 11.9194V13.9194H19V11.9194H5Z" fill="currentColor"></path>
    </g>
    <defs>
      <clipPath id="clip0_9283_3094">
        <rect width="24" height="24" fill="currentColor" transform="translate(0 0.919434)"></rect>
      </clipPath>
    </defs>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_9283_3101)">
      <path d="M11 11.9194V5.91943H13V11.9194H19V13.9194H13V19.9194H11V13.9194H5V11.9194H11Z" fill="currentColor"></path>
    </g>
    <defs>
      <clipPath id="clip0_9283_3101">
        <rect width="24" height="24" fill="currentColor" transform="translate(0 0.919434)"></rect>
      </clipPath>
    </defs>
  </svg>
);

export default function FAQ() {
  const [activeItem, setActiveItem] = useState(1);

  const toggleFAQ = (id : any) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <section className="py-14 md:py-28 bg-gradient-to-br from-padi-gray-50 to-padi-green/5">
      <div className="wrapper">
        <div className="max-w-2xl mx-auto mb-12 text-center scroll-animate">
          <h2 className="mb-3 font-bold text-center text-padi-green-dark text-3xl md:text-title-lg">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="max-w-md mx-auto leading-6 text-earth-brown">
            Kami telah menjawab pertanyaan yang paling sering diajukan. 
            Masih bingung? Jangan ragu untuk menghubungi kami.
          </p>
        </div>
        <div className="max-w-[600px] mx-auto">
          {/* Parent component with shared state */}
          <div className="faq-container space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-item pb-5 border-b border-padi-green/20 scroll-animate">
                <button
                  type="button"
                  className="flex items-center justify-between w-full text-left group"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={activeItem === faq.id}
                >
                  <span className="text-lg font-medium text-padi-green-dark group-hover:text-padi-green transition-colors">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 ml-6">
                    {activeItem === faq.id ? (
                      <span className="text-xl text-padi-green">
                        <MinusIcon />
                      </span>
                    ) : (
                      <span className="text-xl text-earth-brown group-hover:text-padi-green transition-colors">
                        <PlusIcon />
                      </span>
                    )}
                  </span>
                </button>
                {activeItem === faq.id && (
                  <div className={faq.id === 1 ? "mt-5" : "mt-4"}>
                    <p className="text-base leading-7 text-earth-brown">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}