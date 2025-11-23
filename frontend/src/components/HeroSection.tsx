import React from 'react';

const HeroSection = ({ className = '' }) => {
  return (
    <section className={`pt-16 pb-16 relative overflow-hidden ${className}`}>
      <div className="wrapper px-4">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center pb-16">
            {/* Badge - Tema Pertanian */}
            <div className="rounded-full mb-6 h-10 inline-flex items-center border-2 border-green-200 bg-gradient-to-r from-green-50 to-yellow-50">
              <div className="bg-white py-2 text-sm items-center gap-2 px-5 inline-flex rounded-full z-10 relative">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C12 2 9 4 9 8C9 10 10 11 10 13C10 15 9 16 9 18C9 20 10 22 12 22C14 22 15 20 15 18C15 16 14 15 14 13C14 11 15 10 15 8C15 4 12 2 12 2Z" fill="url(#paint0_linear_rice)" stroke="url(#paint1_linear_rice)" strokeWidth="1.5"/>
                  <defs>
                    <linearGradient id="paint0_linear_rice" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#86efac"/>
                      <stop offset="1" stopColor="#22c55e"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_rice" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#16a34a"/>
                      <stop offset="1" stopColor="#15803d"/>
                    </linearGradient>
                  </defs>
                </svg>
                <p className="text-green-700 font-medium">Sistem Prediksi Berbasis AI untuk Pertanian</p>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-gray-700 mx-auto font-bold mb-4 text-4xl sm:text-[50px] sm:leading-[64px] max-w-[700px]">
              Prediksi Gagal Panen Padi dengan Kecerdasan Buatan
            </h1>

            {/* Description */}
            <p className="max-w-[580px] text-center mx-auto text-gray-600 text-base leading-relaxed">
              Deteksi dini risiko gagal panen menggunakan AI. Analisis kondisi tanaman, cuaca, dan faktor lingkungan untuk melindungi hasil panen Anda dan meningkatkan produktivitas pertanian.
            </p>

            {/* CTA Buttons */}
            <div className="mt-9 flex sm:flex-row flex-col gap-3 relative z-30 items-center justify-center">
              <a 
                href="#prediksi" 
                className="bg-green-600 transition h-12 inline-flex items-center justify-center hover:bg-green-700 px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg shadow-green-500/30"
              >
                Mulai Prediksi
              </a>
              <a 
                href="#demo" 
                className="rounded-full flex h-12 gap-3 items-center text-sm border bg-white border-gray-200 p-1.5 pr-6 hover:shadow-lg transition-shadow"
              >
                <span className="w-9 h-9 rounded-full bg-gradient-to-r from-green-500 to-yellow-500 inline-flex items-center justify-center text-sm font-medium">
                  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 3.71077L3.5 12.3482C3.5 13.5211 4.78545 14.2402 5.78489 13.6265L12.8183 9.30776C13.7717 8.7223 13.7717 7.33672 12.8183 6.75125L5.7849 2.43251C4.78545 1.81882 3.5 2.53795 3.5 3.71077Z" fill="white"></path>
                  </svg>
                </span>
                Lihat Demo
              </a>
            </div>
          </div>
        </div>

        {/* Hero Image - Sawah Padi */}
        <div className="max-w-[1000px] mx-auto relative">
          <div className="p-3 sm:p-[18px] relative z-30 rounded-[32px] border border-green-200/50 bg-gradient-to-br from-green-50/80 to-yellow-50/80 backdrop-blur-sm shadow-2xl">
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop" 
                alt="Sawah Padi" 
                className="w-full rounded-2xl block object-cover h-[400px] sm:h-[500px]"
              />
              <img 
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop&brightness=0.7" 
                alt="Sawah Padi Dark" 
                className="w-full rounded-2xl hidden object-cover h-[400px] sm:h-[500px]"
              />
            </div>
          </div>
          
          {/* Glow Effect SVG - Warna Hijau & Kuning */}
          <div className="absolute hidden lg:block z-10 -top-20 -translate-y-20 left-1/2 -translate-x-1/2">
            <svg width="1300" height="1001" viewBox="0 0 1300 1001" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.5" filter="url(#filter0_f_rice)">
                <circle cx="800" cy="500.03" r="300" fill="#22c55e"></circle>
              </g>
              <g opacity="0.3" filter="url(#filter1_f_rice)">
                <circle cx="500" cy="500.03" r="300" fill="#eab308"></circle>
              </g>
              <defs>
                <filter id="filter0_f_rice" x="300" y="0.029541" width="1000" height="1000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                  <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_rice"></feGaussianBlur>
                </filter>
                <filter id="filter1_f_rice" x="0" y="0.029541" width="1000" height="1000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                  <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_rice"></feGaussianBlur>
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Glow Background - Hijau */}
      <div className="hero-glow-bg w-full h-[670px] absolute z-10 bottom-0 bg-gradient-to-t from-green-500/15 via-yellow-500/10 to-transparent"></div>

      
      {/* Decorative Rice Plants - Animasi Mengapung */}
      <div className="hidden lg:block">
        <div className="absolute top-14 left-16 w-20 h-20 animate-bounce" style={{animationDuration: '3s'}}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 Q45 30 50 50 Q55 30 50 10" fill="#86efac" opacity="0.6"/>
            <path d="M50 50 Q45 70 50 90" stroke="#22c55e" strokeWidth="3" fill="none"/>
            <ellipse cx="48" cy="25" rx="3" ry="5" fill="#fde047"/>
            <ellipse cx="52" cy="30" rx="3" ry="5" fill="#fde04gof"/>
            <ellipse cx="48" cy="35" rx="3" ry="5" fill="#fde047"/>
          </svg>
        </div>
        
        <div className="absolute left-[145px] top-[298px] w-16 h-16 animate-pulse" style={{animationDuration: '2.5s'}}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="30" fill="#22c55e" opacity="0.3"/>
            <circle cx="50" cy="50" r="20" fill="#16a34a" opacity="0.5"/>
            <circle cx="50" cy="50" r="10" fill="#15803d" opacity="0.7"/>
          </svg>
        </div>
        
        <div className="absolute right-16 top-[108px] w-20 h-20 animate-bounce" style={{animationDuration: '3.5s'}}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 Q40 30 50 50 Q60 30 50 10" fill="#bbf7d0" opacity="0.6"/>
            <path d="M50 50 Q40 70 50 90" stroke="#16a34a" strokeWidth="3" fill="none"/>
            <ellipse cx="46" cy="20" rx="3" ry="5" fill="#fef08a"/>
            <ellipse cx="54" cy="25" rx="3" ry="5" fill="#fef08a"/>
            <ellipse cx="50" cy="32" rx="3" ry="5" fill="#fef08a"/>
          </svg>
        </div>
        
        <div className="absolute top-[316px] right-[298px] w-16 h-16 animate-pulse" style={{animationDuration: '2s'}}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="25" fill="#eab308" opacity="0.4"/>
            <circle cx="50" cy="50" r="15" fill="#ca8a04" opacity="0.6"/>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;