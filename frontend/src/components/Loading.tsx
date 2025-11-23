import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="bg-gray-100 text-gray-900 flex min-h-screen flex-col items-center justify-center   fixed inset-0 z-50">
            <div className="flex flex-col items-center justify-center gap-4">
                {/* Spinner - diubah ke hijau */}
                <svg 
                    className="animate-spin h-12 w-12 text-green-500" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                >
                    <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                    ></circle>
                    <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                {/* Loading Text - diubah ke abu-abu */}
                <p className="text-lg font-medium text-gray-600 tracking-wide">
                    Sedang Memuat...
                </p>
            </div>
        </div>
    );
};

export default Loading;