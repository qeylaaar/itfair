import React from 'react';
import { NavLink } from 'react-router-dom';

// Reusable SVG for the lock icon
const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);


const Unauthorized: React.FC = () => {
    return (
        <div className="bg-gray-100 text-gray-900 flex min-h-screen flex-col items-center pt-16 sm:justify-center sm:pt-0">
            <div className="relative w-full max-w-lg">
                {/* Gradient separator line - changed to green */}
                <div className="relative -mb-px h-px w-full bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>

                <div className="mx-5 border border-gray-200 shadow-lg sm:shadow-lg rounded-lg lg:rounded-xl bg-white">
                    <div className="flex flex-col items-center p-6 text-center">
                        {/* Adjusted red colors for light mode */}
                        <div className="p-3 bg-red-100 rounded-full mb-4">
                            <LockIcon className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-semibold leading-6 tracking-tighter text-red-600">
                            Akses Ditolak (401)
                        </h3>
                        <p className="mt-2 text-sm font-medium text-gray-500">
                            Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
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

export default Unauthorized;