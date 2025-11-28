import React from 'react';

const FeatureSection = () => {
  return (
    <section className="py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="mb-3 font-bold text-gray-800 text-3xl md:text-4xl">
            Fitur Unggulan
          </h2>
          <p className="max-w-xl mx-auto text-base text-gray-500">
            Buka Potensi Inovasi. Manfaatkan AI untuk Membantu Anda agar Menjadi Efektif dan Presisi.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Feature 1: Harvest Prediction (Core Feature) */}
        <div className="bg-white p-9 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="mb-9">
            {/* Icon: Chart/Analytics representing Prediction */}
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-green-600">
              <path d="M25.902 5.41671H9.16675C7.09568 5.41671 5.41675 7.09564 5.41675 9.16671V30.8334C5.41675 32.9044 7.09568 34.5834 9.16675 34.5834H30.8334C32.9045 34.5834 34.5834 32.9044 34.5834 30.8334V14.0971L28.9827 19.6978C27.9748 20.7057 26.6527 21.3388 25.2356 21.4922L22.3241 21.8072C21.1953 21.9293 20.0719 21.5335 19.269 20.7306C18.4662 19.9277 18.0703 18.8044 18.1924 17.6755L18.5075 14.764C18.6608 13.3469 19.2939 12.0248 20.3018 11.0169L25.902 5.41671Z" fill="currentColor"/>
              <path d="M34.7914 4.18764C33.6524 3.04861 31.8056 3.04862 30.6666 4.18765L29.524 5.33025L34.6694 10.4756L35.812 9.33301C36.951 8.19399 36.951 6.34725 35.812 5.20822L34.7914 4.18764Z" fill="currentColor"/>
              <path d="M32.9016 12.2434L27.7562 7.09801L22.0695 12.7847C21.4648 13.3894 21.085 14.1827 20.993 15.0329L20.6779 17.9445C20.6372 18.3208 20.7692 18.6952 21.0368 18.9628C21.3044 19.2305 21.6789 19.3624 22.0551 19.3217L24.9667 19.0067C25.8169 18.9147 26.6102 18.5348 27.2149 17.9301L32.9016 12.2434Z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="mb-4 text-gray-800 font-bold text-xl md:text-2xl max-w-[514px]">
            Prediksi Persentase Panen
          </h3>
          <p className="text-gray-500 max-w-[514px]">
            AI kami menghitung probabilitas keberhasilan vs kegagalan panen dalam bentuk persentase akurat (misal: 85% Berhasil).
          </p>
        </div>

        {/* Feature 2: Mitigation Strategies */}
        <div className="bg-white p-9 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="mb-9">
            {/* Icon: Tools/Action representing Mitigation */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.2711 30.0755C14.1949 28.19 12.9483 26.4182 11.2671 24.7764C8.94449 22.508 7.50024 19.3382 7.50024 15.8332C7.50024 8.92972 13.0966 3.33337 20.0001 3.33337C26.9034 3.33337 32.4997 8.92972 32.4997 15.8332C32.4997 19.3379 31.0557 22.5077 28.7334 24.7759C26.9982 26.4707 25.7261 28.3037 25.7261 30.2574V32.9167C25.7261 34.9877 24.0472 36.6667 21.9761 36.6667H18.0211C15.9501 36.6667 14.2711 34.9877 14.2711 32.9167V30.0755ZM10.0002 15.8332C10.0002 10.3104 14.4773 5.83337 20.0001 5.83337C25.5227 5.83337 29.9997 10.3104 29.9997 15.8332C29.9997 18.6374 28.8472 21.1702 26.9866 22.9875C25.7512 24.194 24.4672 25.7095 23.7651 27.5H16.2356C15.5333 25.7097 14.2491 24.1942 13.0139 22.9879C11.153 21.1705 10.0002 18.6375 10.0002 15.8332ZM16.7711 30.3549C16.7736 30.323 16.7747 30.2907 16.7747 30.2582C16.7747 30.1814 16.7736 30.105 16.7711 30.0292V30H23.2261V32.9167C23.2261 33.607 22.6666 34.1667 21.9761 34.1667H18.0211C17.3307 34.1667 16.7711 33.607 16.7711 32.9167V30.3549Z" fill="currentColor"/>
              <path d="M10.0002 15.8332C10.0002 10.3104 14.4773 5.83337 20.0001 5.83337C25.5227 5.83337 29.9997 10.3104 29.9997 15.8332C29.9997 18.6374 28.8472 21.1702 26.9866 22.9875C25.7512 24.194 24.4672 25.7095 23.7651 27.5H16.2356C15.5333 25.7097 14.2491 24.1942 13.0139 22.9879C11.153 21.1705 10.0002 18.6375 10.0002 15.8332Z" fill="currentColor"/>
              <path d="M2.08325 15.8334C2.08325 15.143 2.6429 14.5834 3.33325 14.5834H4.99992C5.69027 14.5834 6.24992 15.143 6.24992 15.8334C6.24992 16.5237 5.69027 17.0834 4.99992 17.0834H3.33325C2.6429 17.0834 2.08325 16.5237 2.08325 15.8334Z" fill="currentColor"/>
              <path d="M6.19137 6.41744C5.5935 6.07225 4.82902 6.2771 4.48383 6.87497C4.13867 7.47283 4.3435 8.23732 4.94137 8.5825L6.38475 9.41583C6.98262 9.76102 7.7471 9.55617 8.09228 8.9583C8.43745 8.36043 8.23262 7.59595 7.63475 7.25077L6.19137 6.41744Z" fill="currentColor"/>
              <path d="M4.48383 24.7916C4.13867 24.1938 4.3435 23.4293 4.94137 23.0841L6.38475 22.2508C6.98262 21.9056 7.7471 22.1105 8.09228 22.7083C8.43745 23.3061 8.23262 24.0706 7.63475 24.4158L6.19137 25.2491C5.5935 25.5943 4.82902 25.3895 4.48383 24.7916Z" fill="currentColor"/>
              <path d="M35.0002 14.5834C34.3099 14.5834 33.7502 15.143 33.7502 15.8334C33.7502 16.5237 34.3099 17.0834 35.0002 17.0834H36.6669C37.3572 17.0834 37.9169 16.5237 37.9169 15.8334C37.9169 15.143 37.3572 14.5834 36.6669 14.5834H35.0002Z" fill="currentColor"/>
              <path d="M31.9091 22.7083C32.2543 22.1105 33.0188 21.9056 33.6166 22.2508L35.06 23.0841C35.658 23.4293 35.8628 24.1938 35.5176 24.7916C35.1725 25.3895 34.408 25.5943 33.81 25.2491L32.3666 24.4158C31.7688 24.0706 31.564 23.3061 31.9091 22.7083Z" fill="currentColor"/>
              <path d="M32.3666 7.25077C31.7688 7.59595 31.564 8.36043 31.9091 8.9583C32.2543 9.55617 33.0188 9.76102 33.81 9.41583L35.06 8.5825C35.658 8.23732 35.8628 7.47283 35.5176 6.87497C35.1725 6.2771 34.408 6.07225 33.81 6.41744L32.3666 7.25077Z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="mb-4 text-gray-800 font-bold text-xl md:text-2xl max-w-[514px]">
            Mitigasi Risiko Iklim
          </h3>
          <p className="text-gray-500 max-w-[514px]">
            Dapatkan rekomendasi tindakan konkret untuk menyelamatkan tanaman berdasarkan situasi iklim ekstrem yang terdeteksi.
          </p>
        </div>

        {/* Feature 3: 3-Month Weather Forecast */}
        <div className="bg-white p-9 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="mb-9">
            {/* Icon: Calendar/Weather */}
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-green-600">
              <path fillRule="evenodd" clipRule="evenodd" d="M19.9999 6.25C20.3604 6.25 20.7034 6.40565 20.9408 6.67702L27.8526 14.5787L34.6249 9.03498C35.0193 8.71218 35.5699 8.66108 36.0169 8.90583C36.4639 9.15058 36.7176 9.64218 36.6581 10.1483L34.4178 29.1882C34.1956 31.0767 32.5951 32.5 30.6936 32.5H9.30638C7.40483 32.5 5.80427 31.0767 5.58207 29.1882L3.34185 10.1483C3.2823 9.64218 3.53595 9.15058 3.98293 8.90583C4.42992 8.66108 4.98073 8.71218 5.37507 9.03498L12.1473 14.5787L19.0591 6.67702C19.2964 6.40565 19.6394 6.25 19.9999 6.25ZM19.9999 9.39857L13.2325 17.1352C12.7884 17.6428 12.0217 17.7067 11.4998 17.2795L6.18638 12.9299L7.4363 23.5532H32.5636L33.8136 12.9299L28.5001 17.2795C27.9783 17.7067 27.2114 17.6428 26.7674 17.1352L19.9999 9.39857ZM32.2694 26.0532H7.73045L8.06495 28.896C8.13902 29.5255 8.67253 30 9.30638 30H30.6936C31.3274 30 31.8609 29.5255 31.9349 28.896L32.2694 26.0532Z" fill="currentColor"/>
              <path d="M19.9999 9.39857L13.2325 17.1352C12.7884 17.6428 12.0217 17.7067 11.4998 17.2795L6.18638 12.9299L7.4363 23.5532H32.5636L33.8136 12.9299L28.5001 17.2795C27.9783 17.7067 27.2114 17.6428 26.7674 17.1352L19.9999 9.39857Z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="mb-4 text-gray-800 font-bold text-xl md:text-2xl max-w-[514px]">
            Prakiraan Cuaca 3 Bulan
          </h3>
          <p className="text-gray-500 max-w-[514px]">
            Rencanakan musim tanam dengan data prediksi cuaca jangka panjang hingga 3 bulan ke depan untuk hasil maksimal.
          </p>
        </div>

        {/* Feature 4: Historical Data (Supporting) */}
        <div className="bg-white p-9 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="mb-9">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-green-600">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.2711 30.0755C14.1949 28.19 12.9483 26.4182 11.2671 24.7764C8.94449 22.508 7.50024 19.3382 7.50024 15.8332C7.50024 8.92972 13.0966 3.33337 20.0001 3.33337C26.9034 3.33337 32.4997 8.92972 32.4997 15.8332C32.4997 19.3379 31.0557 22.5077 28.7334 24.7759C26.9982 26.4707 25.7261 28.3037 25.7261 30.2574V32.9167C25.7261 34.9877 24.0472 36.6667 21.9761 36.6667H18.0211C15.9501 36.6667 14.2711 34.9877 14.2711 32.9167V30.0755ZM10.0002 15.8332C10.0002 10.3104 14.4773 5.83337 20.0001 5.83337C25.5227 5.83337 29.9997 10.3104 29.9997 15.8332C29.9997 18.6374 28.8472 21.1702 26.9866 22.9875C25.7512 24.194 24.4672 25.7095 23.7651 27.5H16.2356C15.5333 25.7097 14.2491 24.1942 13.0139 22.9879C11.153 21.1705 10.0002 18.6375 10.0002 15.8332ZM16.7711 30.3549C16.7736 30.323 16.7747 30.2907 16.7747 30.2582C16.7747 30.1814 16.7736 30.105 16.7711 30.0292V30H23.2261V32.9167C23.2261 33.607 22.6666 34.1667 21.9761 34.1667H18.0211C17.3307 34.1667 16.7711 33.607 16.7711 32.9167V30.3549Z" fill="currentColor"/>
              <path d="M10.0002 15.8332C10.0002 10.3104 14.4773 5.83337 20.0001 5.83337C25.5227 5.83337 29.9997 10.3104 29.9997 15.8332C29.9997 18.6374 28.8472 21.1702 26.9866 22.9875C25.7512 24.194 24.4672 25.7095 23.7651 27.5H16.2356C15.5333 25.7097 14.2491 24.1942 13.0139 22.9879C11.153 21.1705 10.0002 18.6375 10.0002 15.8332Z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="mb-4 text-gray-800 font-bold text-xl md:text-2xl max-w-[514px]">
            Analisis Riwayat Lahan
          </h3>
          <p className="text-gray-500 max-w-[514px]">
            AI mempelajari data panen masa lalu untuk meningkatkan akurasi prediksi gagal atau berhasil di musim ini.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
};

export default FeatureSection;