import React, { useState, useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';

// Reusable SVG for the checkmark icon in the input field
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
);

const Register: React.FC = () => {
    // State untuk mengelola input formulir registrasi
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Handler untuk memperbarui state input
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    // Validasi sederhana: apakah password cocok?
    const isPasswordMatch = useMemo(() => {
        return formData.password.length > 0 && formData.password === formData.confirmPassword;
    }, [formData.password, formData.confirmPassword]);

    // Validasi sederhana: apakah email/username valid?
    const isEmailValid = useMemo(() => {
        return formData.email.length > 5 && formData.email.includes('@');
    }, [formData.email]);

    // Validasi keseluruhan formulir
    const isFormValid = useMemo(() => {
        return isEmailValid && isPasswordMatch && formData.fullName.length > 2 && formData.password.length >= 6;
    }, [isEmailValid, isPasswordMatch, formData.fullName, formData.password]);

    // Handler untuk submit formulir
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!isFormValid) {
            console.error('Registration failed: Please check all fields.');
            return;
        }

        setIsSubmitting(true);
        console.log('Registration attempt:', formData);

        // Simulasi proses registrasi
        setTimeout(() => {
            setIsSubmitting(false);
            // Dalam aplikasi nyata, ini akan menjadi navigasi atau pembaruan UI sukses
            console.log('Registration successful! Redirecting to login...');
        }, 2000);
    };

    return (
        <div className=" text-gray-900 flex min-h-screen flex-col items-center pt-16 sm:justify-center sm:pt-0">
            <div className="relative w-full max-w-lg">
                {/* Gradient separator line */}
                <div className="relative -mb-px h-px w-full bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>

                <div className="mx-5 border border-gray-200 shadow-lg sm:shadow-lg rounded-lg lg:rounded-xl bg-white">
                    <div className="flex flex-col p-6">
                        <h3 className="text-xl font-semibold leading-6 tracking-tighter">Daftar Akun Baru</h3>
                        <p className="mt-1.5 text-sm font-medium text-gray-500">
                            Buat akun baru Anda untuk mendapatkan akses penuh.
                        </p>
                    </div>

                    <div className="p-6 pt-0">
                        <form onSubmit={handleSubmit}>
                            {/* Full Name Input Field */}
                            <div className="mb-4">
                                <div className="group relative rounded-lg border border-gray-300 focus-within:border-green-400 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-green-300/30">
                                    <div className="flex justify-between">
                                        <label
                                            htmlFor="fullName"
                                            className="text-xs font-medium text-gray-500 group-focus-within:text-gray-900"
                                        >
                                            Nama Lengkap
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        placeholder="Nama Lengkap Anda"
                                        autoComplete="name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:leading-7 text-gray-900"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            
                            {/* Email Input Field */}
                            <div className="mb-4">
                                <div className="group relative rounded-lg border border-gray-300 focus-within:border-green-400 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-green-300/30">
                                    <div className="flex justify-between">
                                        <label
                                            htmlFor="email"
                                            className="text-xs font-medium text-gray-500 group-focus-within:text-gray-900"
                                        >
                                            Email (atau Username)
                                        </label>
                                        {/* Dynamic Checkmark Icon for Email */}
                                        {isEmailValid && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 transition-opacity duration-300">
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="contoh@domain.com"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:leading-7 text-gray-900"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Password Input Field */}
                            <div className="mb-4">
                                <div className="group relative rounded-lg border border-gray-300 focus-within:border-green-400 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-green-300/30">
                                    <div className="flex justify-between">
                                        <label
                                            htmlFor="password"
                                            className="text-xs font-medium text-gray-500 group-focus-within:text-gray-900"
                                        >
                                            Kata Sandi (min. 6 karakter)
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:leading-7 text-gray-900"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Confirm Password Input Field */}
                            <div>
                                <div className="group relative rounded-lg border border-gray-300 focus-within:border-green-400 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-green-300/30">
                                    <div className="flex justify-between">
                                        <label
                                            htmlFor="confirmPassword"
                                            className="text-xs font-medium text-gray-500 group-focus-within:text-gray-900"
                                        >
                                            Konfirmasi Kata Sandi
                                        </label>
                                        {/* Dynamic Checkmark Icon for Password Match */}
                                        {isPasswordMatch && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 transition-opacity duration-300">
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:leading-7 text-gray-900"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                {!isPasswordMatch && formData.confirmPassword.length > 0 && (
                                    <p className="mt-1 text-xs text-red-500">Kata sandi tidak cocok.</p>
                                )}
                            </div>


                            {/* Action Buttons */}
                            <div className="mt-8 flex items-center justify-end gap-x-3">
                                <NavLink
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 text-gray-700 border border-gray-300 h-10 px-4 py-2 duration-200"
                                    to="/login"
                                >
                                    Kembali ke Login
                                </NavLink>
                                <button
                                    className="font-semibold transition duration-300 inline-flex items-center justify-center rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 bg-green-500 text-white h-10 px-4 py-2 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-500"
                                    type="submit"
                                    disabled={isSubmitting || !isFormValid}
                                >
                                    {isSubmitting ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        'Daftar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;