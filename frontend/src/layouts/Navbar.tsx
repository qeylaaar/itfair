// 1. 'use client' tidak diperlukan di React Router
import React, { useState, useEffect } from 'react';
// 2. Import dari react-router-dom
import { useLocation, NavLink } from 'react-router-dom';
import Logo from "../assets/images/logo.png";


interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  // 3. Gunakan useLocation untuk mendapatkan 'pathname'
  const location = useLocation();
  const pathname = location.pathname;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) setActiveDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // 4. Tutup menu mobile saat navigasi (path berubah)
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);


  // Daftar link di dalam dropdown "Pages" untuk mengecek state aktif
  const pageLinks = [
    '/dashboard', '/pricing', '/blog-grid', '/blog-details', '/privacy', '/404'
  ];
  const isPagesActive = pageLinks.some(link => pathname === link);

  return (
    <header className={`bg-white border-b border-gray-100 sticky top-0 z-50 py-4 lg:py-0 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-7">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/">
              <img 
                src={Logo} 
                className="block h-10 w-auto" 
                alt="Logo"
              />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center">
            {/* 6. Gunakan NavLink dan prop 'className' sebagai fungsi */}
            <NavLink 
              to="/" 
              // 'isActive' disediakan otomatis oleh NavLink
              className={({ isActive }) => `text-sm px-4 py-6 font-medium ${
                isActive 
                ? 'text-green-500' 
                : 'text-gray-800 hover:text-green-500'
              }`}
            >
              Home
            </NavLink>

            {/* Pages Dropdown */}
            <div className="relative">
              {/* <button 
                onClick={() => toggleDropdown('pages')}
                className={`group text-sm inline-flex items-center px-4 py-6 font-medium rounded-full ${
                  isPagesActive 
                  ? 'text-green-600' // Tetap gunakan 'isPagesActive' untuk tombol dropdown
                  : 'text-gray-500 hover:text-green-600'
                }`}
              >
                Pages
                <svg className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === 'pages' ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                  <path d="M4.33301 5.91666L8.49967 10.0833L12.6663 5.91666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button> */}

              <div className={`absolute left-0 w-[266px] bg-white rounded-2xl shadow-lg border border-gray-100 p-3 z-50 ${activeDropdown === 'pages' ? 'block' : 'hidden'}`}>
                <div className="space-y-1">
                  {/* Ganti semua <a> dengan <NavLink> */}
                  <NavLink to="/dashboard" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-800 ${isActive ? 'text-gray-800 bg-gray-100' : 'text-gray-500'}`}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/pricing" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-800 ${isActive ? 'text-gray-800 bg-gray-100' : 'text-gray-500'}`}>
                    Pricing
                  </NavLink>
                  <NavLink to="/blog-grid" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-800 ${isActive ? 'text-gray-800 bg-gray-100' : 'text-gray-500'}`}>
                    Blog Grid
                  </NavLink>
                  <NavLink to="/blog-details" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-800 ${isActive ? 'text-gray-800 bg-gray-100' : 'text-gray-500'}`}>
                    Blog Details
                  </NavLink>
                  <NavLink to="/signin" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-800 ${isActive ? 'text-gray-800 bg-gray-100' : 'text-gray-500'}`}>
                    Sign In
                  </NavLink>
                  <NavLink to="/signup" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-800 ${isActive ? 'text-gray-800 bg-gray-100' : 'text-gray-500'}`}>
                    Sign Up
                  </NavLink>
                  <NavLink to="/forgot-password" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-800 ${isActive ? 'text-gray-800 bg-gray-100' : 'text-gray-500'}`}>
                    Reset Password
                  </NavLink>
                  <NavLink to="/privacy" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-800 ${isActive ? 'text-gray-800 bg-gray-100' : 'text-gray-500'}`}>
                    Privacy Policy
                  </NavLink>
                  <NavLink to="/404" className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-800 ${isActive ? 'text-gray-800 bg-gray-100' : 'text-gray-500'}`}>
                    404 Error
                  </NavLink>
                </div>
              </div>
            </div>

            <NavLink 
              to="/prediction" 
              className={({ isActive }) => `text-sm px-4 py-6 font-medium ${
                isActive 
                ? 'text-green-600' 
                : 'text-gray-500 hover:text-green-600'
              }`}
            >
              Prediction
            </NavLink>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            
            {/* Mobile menu button */}
            <button

              onClick={toggleMobileMenu}

              type="button"

              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 lg:hidden"

            >

              <span className="sr-only">Open main menu</span>

              {mobileMenuOpen ? (

                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>

                </svg>

              ) : (

                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>

                </svg>

              )}

            </button>

            {/* Desktop buttons
            <NavLink to="/login" className="text-sm hidden lg:block font-medium text-gray-700 hover:text-green-600">
              Sign In
            </NavLink>
            <NavLink to="/register" className="hidden lg:inline-flex bg-green-600 transition h-12 items-center justify-center hover:bg-green-700 px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg shadow-green-500/30">
              Get Started Free
            </NavLink> */}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute bg-white w-full border-b border-gray-200">
          <div className="pt-2 pb-3 space-y-1 px-4 sm:px-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive 
                ? 'text-green-600 bg-gray-100' 
                : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              Home
            </NavLink>

            {/* Pages Dropdown (Mobile) */}
            <div>
              {/* <button 
                onClick={() => toggleDropdown('pages-mobile')}
                className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-sm font-medium ${
                  isPagesActive 
                  ? 'text-green-600 bg-gray-100' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span>Pages</span>
              </button> */}

              {activeDropdown === 'pages-mobile' && (
                <div className="mt-2 space-y-1 pl-4">
                  {/* Ganti semua <a> dengan <NavLink> */}
                  <NavLink to="/dashboard" className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-green-600 bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Dashboard
                  </NavLink>
                  {/* ... Lakukan untuk sisa link mobile ... */}
                  <NavLink to="/pricing" className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-green-600 bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Pricing
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink 
              to="/prediction" 
              className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive 
                ? 'text-green-600 bg-gray-100' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Prediction
            </NavLink>

            {/* Mobile-only buttons
            <div className="px-3 pt-4 space-y-3 border-t border-gray-100">
              <NavLink to="/login" className="text-sm block py-3 font-medium text-gray-500 hover:text-gray-800">
                Login
              </NavLink>
              <NavLink to="/register" className="inline-flex w-full bg-green-600 transition h-12 items-center justify-center hover:bg-green-700 px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg shadow-green-500/30">
                Get Started Free
              </NavLink>
            </div> */}
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;