import React, { useEffect } from 'react';

/**
 * Benefits Section Component
 * 
 * Assumptions:
 * - Tailwind CSS is configured in your project
 * - `wrapper` class is defined globally (e.g., max-w-7xl mx-auto px-4)
 * - Custom keyframe animation for floating elements is included below
 * 
 * Image placeholders are from placehold.co - replace with your actual assets
 */
const BenefitSection: React.FC = () => {

  return (
    <section className="benefit-section py-14 md:py-28 bg-gradient-to-br from-padi-gray-50 to-padi-green/5 dark:from-padi-gray-900 dark:to-padi-green/10">
      <div className="wrapper">
        {/* Section Header (Sudah OK) */}
        <div className="max-w-2xl mx-auto mb-12 text-center scroll-animate">
          <h2 className="max-w-lg mx-auto mb-3 font-bold text-center text-padi-green-dark dark:text-padi-green-light text-3xl md:text-5xl">
            Manfaat Utama Prediksi Gagal Panen
          </h2>
          <p className="max-w-2xl mx-auto text-base font-normal leading-6 text-earth-brown dark:text-earth-brown-light">
            Optimalkan hasil panen padi Anda dengan teknologi AI canggih. Dapatkan prediksi akurat, 
            deteksi dini, dan rekomendasi tepat untuk mengurangi risiko gagal panen.
          </p>
        </div>
        
        {/* Benefits Grid */}
        <div className="max-w-[1008px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Card 1: Prediksi Akurat */}
            <div className="lg:col-span-6">
              {/* DIUBAH: min-h-[500px] -> md:min-h-[500px] dan p-9 md:p-12 */}
              <div className="benefit-card relative flex flex-col justify-between bg-gradient-to-br from-padi-green to-padi-green-dark rounded-[20px] p-9 md:p-12 md:min-h-[500px] scroll-animate">
                <div className="max-w-sm">
                  <h3 className="font-bold text-black text-2xl md:text-3xl mb-4">
                    Prediksi Akurat dengan AI Canggih
                  </h3>
                  <p className="text-base text-black/80">
                    Dapatkan prediksi gagal panen hingga 95% akurat dengan 
                    algoritma machine learning terkini untuk melindungi hasil panen Anda.
                  </p>
                </div>
                
                {/* Images container */}
                <div className="relative mt-10">
                  {/* DIUBAH: Ditambahkan 'hidden md:block' untuk menyembunyikan di mobile */}
                  <img 
                    src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=95%25%20accuracy%20icon%20with%20padi%20harvest%20theme%2C%20green%20and%20yellow%20colors%2C%20minimalist%20design" 
                    className="absolute left-8 top-[61%] floating-1 w-15 h-15 rounded-full bg-padi-yellow/20 p-2 hidden md:block" 
                    alt="95% akurasi" 
                  />
                  {/* DIUBAH: Ditambahkan 'hidden md:block' */}
                  <img 
                    src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20machine%20learning%20icon%20with%20padi%20leaves%2C%20green%20theme%2C%20modern%20design" 
                    className="absolute right-28 top-[55%] floating-2 w-15 h-15 rounded-full bg-padi-green/20 p-2 hidden md:block" 
                    alt="AI ML" 
                  />
                  {/* DIUBAH: Ditambahkan 'hidden md:block' */}
                  <img 
                    src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=shield%20protection%20icon%20for%20harvest%20protection%2C%20green%20and%20brown%20colors" 
                    className="absolute right-8 bottom-[15%] floating-3 w-15 h-15 rounded-full bg-earth-brown/20 p-2 hidden md:block" 
                    alt="Perlindungan panen" 
                  />
                  
                  {/* Main illustration (Sudah OK) */}
                  <img 
                    src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=padi%20harvest%20prediction%20dashboard%20interface%2C%20modern%20UI%2C%20green%20theme%2C%20data%20visualization%2C%20professional" 
                    className="w-full h-auto -mb-8 md:-mb-11 rounded-lg shadow-lg" 
                    alt="Dashboard prediksi panen" 
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Hemat Biaya */}
            <div className="lg:col-span-6">
              {/* DIUBAH: p-12 -> p-9 md:p-12 */}
              <div className="benefit-card bg-gradient-to-br from-earth-brown to-earth-brown-dark rounded-[20px] p-9 md:p-12 overflow-hidden h-full flex flex-col justify-between scroll-animate">
                <div className="mb-6">
                  <img 
                    src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cost%20savings%20icon%20with%20padi%20harvest%20theme%2C%20money%20and%20rice%20plants%2C%20green%20and%20gold%20colors%2C%20professional%20design" 
                    className="w-full h-auto rounded-lg shadow-lg" 
                    alt="Ilustrasi hemat biaya" 
                  />
                </div>
                
                <div>
                  <h3 className="font-bold max-w-xs text-black text-2xl md:text-3xl mb-4">
                    Hemat Biaya Hingga 40% dengan Prediksi Tepat
                  </h3>
                  <p className="text-base max-w-sm text-black/80">
                    Kurangi kerugian akibat gagal panen dengan perencanaan 
                    yang lebih baik berbasis data prediksi AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Atasi Blokir Panen - Full width */}
            <div className="lg:col-span-12">
              {/* DIUBAH: Padding disederhanakan menjadi p-9 md:p-12 lg:pb-0 */}
              <div className="benefit-card relative p-9 md:p-12 lg:pb-0 bg-gradient-to-r from-padi-green-dark to-padi-green rounded-[20px] h-full lg:flex lg:flex-row justify-between items-center flex-col gap-5 overflow-hidden scroll-animate">
               {/* Text content (Sudah OK) */}
                <div className="max-w-sm relative z-10 lg:mb-0 mb-8">
                  <h3 className="font-bold text-black text-2xl md:text-3xl mb-4">
                    Atasi Risiko Gagal Panen Hari Ini
                  </h3>
                  <p className="text-base text-black/80 mb-8">
                    Temukan alat AI mutakhir yang membawa ketenangan pikiran 
                    dengan prediksi akurat dan rekomendasi tepat waktu.
                </p>
                  <a 
                    href="#prediksi" 
                    className="bg-green-600 transition h-12 inline-flex items-center justify-center hover:bg-green-700 px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg shadow-green-500/30"
                  >
                    Coba Sekarang
                  </a>
                </div>
                
                {/* Image */}
                <div className="lg:w-1/2 flex justify-center items-end">
                  {/* DIUBAH: 'hidden lg:block' -> 'block w-full ...' agar tampil di mobile */}
                  <img 
                    src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=rice%20farmer%20using%20smartphone%20with%20harvest%20prediction%20app%2C%20green%20padi%20field%20background%2C%20modern%20agriculture%20technology%2C%20professional%20illustration" 
                    className="block w-full max-w-md mx-auto lg:w-auto lg:max-w-md relative z-10 rounded-lg shadow-lg" 
                    alt="Petani menggunakan teknologi prediksi" 
                  />
                </div>
                
                {/* Background decorative gradient (Sudah OK) */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-padi-green/20 to-padi-green-dark/30 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for floating animations (Sudah OK) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .floating-1 {
          animation: float 3s ease-in-out infinite;
        }
        .floating-2 {
          animation: float 3s ease-in-out infinite 0.5s;
        }
        .floating-3 {
          animation: float 3s ease-in-out infinite 1s;
        }
      `}</style>
    </section>
  );
};

export default BenefitSection;