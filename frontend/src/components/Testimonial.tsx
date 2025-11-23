import React from 'react';

// Digabungkan menjadi satu array untuk scrolling
const allTestimonials = [
  { id: 1, name: "Ralph Edwards", company: "Big Kahuna Burger Ltd", image: "https://i.pravatar.cc/150?img=1", alt: "Ralph Edwards" },
  { id: 2, name: "Albert Flores", company: "Biffco Enterprises Ltd.", image: "https://i.pravatar.cc/150?img=2", alt: "Albert Flores" },
  { id: 3, name: "Jenny Wilson", company: "Acme Co.", image: "https://i.pravatar.cc/150?img=3", alt: "Jenny Wilson" },
  { id: 4, name: "Esther Howard", company: "Barone LLC.", image: "https://i.pravatar.cc/150?img=4", alt: "Esther Howard" },
  { id: 5, name: "Darlene Robertson", company: "Abstergo Ltd.", image: "https://i.pravatar.cc/150?img=5", alt: "Darlene Robertson" },
  { id: 6, name: "Devon Lane", company: "Binford Ltd.", image: "https://i.pravatar.cc/150?img=6", alt: "Devon Lane" },
];


export default function Testimonials() {
  // state showAll tidak lagi diperlukan
  // const [showAll, setShowAll] = useState(false);

  return (
    <section className="md:py-28 py-14 relative">
      {/* Catatan: Class 'wrapper' kustom Anda mungkin perlu 'overflow-hidden' 
        jika padding-nya mengganggu scrollbar di mobile.
      */}
      <div className="wrapper">
        <div>
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h2 className="mb-3 font-bold text-center text-gray-800 text-3xl md:text-title-lg">
              What our users says
            </h2>
            <p className="max-w-xl mx-auto leading-6 text-gray-500">
              Unlock the Potential of Innovation. Discover the Advanced AI
              Tools Transforming Your Ideas into Reality with Unmatched
              Precision and Intelligence.
            </p>
          </div>

          {/* PERUBAHAN: 
            - 'flex overflow-x-auto' untuk scroll horizontal di mobile.
            - 'p-4' untuk memberi ruang padding di area scroll.
            - 'md:grid' untuk mengembalikan layout grid di desktop.
            - 'scrollbar-hide' (opsional) jika Anda ingin menyembunyikan scrollbar visual.
              (Memerlukan plugin: npm i tailwind-scrollbar-hide)
          */}
          <div className="flex overflow-x-auto gap-4 p-4 -mx-4 md:mx-0 md:p-0 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-8">
            {allTestimonials.map((t) => (
              <div 
                key={t.id} 
                /*
                  PERUBAHAN:
                  - 'flex-shrink-0' agar item tidak menyusut.
                  - 'w-[85%]' lebar kartu di mobile (agar terlihat kartu berikutnya).
                  - 'sm:w-3/4' lebar di layar sedikit lebih besar.
                  - 'md:w-auto' reset lebar untuk layout grid desktop.
                */
                className="flex-shrink-0 w-[85%] sm:w-3/4 md:w-auto p-2 bg-gray-50 border rounded-[20px] border-gray-100 hover:border-primary-200 transition"
              >
                <div className="flex items-center p-3 mb-3 bg-white/90 rounded-2xl">
                  <img 
                    src={t.image} 
                    alt={t.alt} 
                    className="w-[52px] h-[52px] ring-2 ring-white mr-4 rounded-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                  />
                  <div>
                    <h3 className="text-gray-800 font-base">{t.name}</h3>
                    <p className="text-sm text-gray-500">{t.company}</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white/90">
                  <p className="text-base leading-6 text-gray-700">
                    As a Senior Software Developer I found TailAdmin perfect
                    write code that easy can be used in my projects, which
                    some are production already.
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tombol "Show More" dan gradient tidak lagi diperlukan untuk layout scroll horizontal */}
        </div>
      </div>
    </section>
  );
}