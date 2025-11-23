import React from 'react';
import { NavLink } from 'react-router-dom';

// Reusable SVG for the search/magnifying glass icon
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);


const NotFound: React.FC = () => {
    return (
        <div className="bg-gray-100 text-gray-900 flex min-h-screen flex-col items-center pt-16 sm:justify-center sm:pt-0  ">
            <div className="relative w-full max-w-lg">
                {/* Gradient separator line - changed to green */}
                <div className="relative -mb-px h-px w-full bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>

                <div className="mx-5 border border-gray-200 shadow-lg sm:shadow-lg rounded-lg lg:rounded-xl bg-white">
                    <div className="flex flex-col items-center p-6 text-center">
                        {/* Adjusted yellow colors for light mode */}
                        <div className="p-3 bg-yellow-100 rounded-full mb-4">
                            <SearchIcon className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-semibold leading-6 tracking-tighter text-yellow-600">
                            Halaman Tidak Ditemukan (404)
                        </h3>
                        <p className="mt-2 text-sm font-medium text-gray-500">
                            Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman tersebut telah dihapus atau URL-nya salah.
                        </p>
                    </div>

                    <div className="p-6 pt-0">
                        {/* Action Button - changed to green */}
                        <div className="mt-2 flex items-center justify-center">
                            <NavLink
                                className="font-semibold transition duration-300 inline-flex items-center justify-center rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 bg-green-500 text-white h-10 px-6 py-2 hover:bg-green-600"
                                to="/"
                            >
                                Kembali ke Halaman Utama
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;