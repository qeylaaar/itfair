import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
    Menu, 
    X, 
    LayoutDashboard, 
    BrainCircuit, 
    FileText, 
    DollarSign, 
    Newspaper, 
    Lock, 
    LogIn, 
    UserPlus, 
    Bell, 
    User, 
    Settings, 
    LogOut, 
    ChevronDown 
} from 'lucide-react';
import LogoUrl from "../assets/images/logo.png"
// Placeholder untuk avatar pengguna
const AvatarUrl = "https://i.pravatar.cc/150?img=3";

/**
 * Komponen NavLink Kustom untuk Sidebar
 * Menangani style 'active' secara otomatis
 */
// @ts-ignore
const SidebarLink = ({ to, icon, children }: { to: string, icon: React.FC<any>, children: React.ReactNode }) => {
    const IconComponent = icon;
    return (
        <NavLink 
            to={to} 
            end // 'end' memastikan ini hanya aktif jika path-nya sama persis
            className={({ isActive }) => `
                flex items-center p-3 my-1 rounded-lg text-gray-700 transition-colors
                ${isActive 
                    ? 'bg-green-100 text-green-700 font-medium' 
                    : 'hover:bg-gray-100 hover:text-gray-900'
                }
            `}
        >
            <IconComponent className="w-5 h-5 mr-3" />
            <span>{children}</span>
        </NavLink>
    );
};

/**
 * Komponen Dropdown Kustom untuk Sidebar
 */
// @ts-ignore
const SidebarDropdown = ({ title, icon, pathname, children, pageLinks = [] }: {
    title: string,
    icon: React.FC<any>,
    pathname: string,
    children: React.ReactNode,
    pageLinks?: string[]
}) => {
    const IconComponent = icon;
    // Tentukan apakah link di dalam dropdown ini sedang aktif
    const isActive = pageLinks.some(link => pathname.startsWith(link));
    const [isOpen, setIsOpen] = useState(isActive);

    // Buka dropdown jika salah satu anaknya aktif saat route berubah
    useEffect(() => {
        if (isActive) {
            setIsOpen(true);
        }
    }, [pathname, isActive]);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-between w-full p-3 my-1 rounded-lg text-gray-700 transition-colors
                    ${isActive 
                        ? 'bg-gray-100 text-green-700 font-medium' 
                        : 'hover:bg-gray-100 hover:text-gray-900'
                    }
                `}
            >
                <span className="flex items-center">
                    <IconComponent className="w-5 h-5 mr-3" />
                    <span>{title}</span>
                </span>
                <ChevronDown 
                    className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>
            {/* Konten Dropdown */}
            {isOpen && (
                <div className="ml-6 pl-4 border-l border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};


/**
 * Komponen Sidebar Utama
 */
// @ts-ignore
const Sidebar = ({ sidebarOpen, setSidebarOpen, pathname }: {
    sidebarOpen: boolean,
    setSidebarOpen: (open: boolean) => void,
    pathname: string
}) => {
    return (
        <>
            {/* --- Latar Belakang Overlay (Mobile) --- */}
            <div 
                className={`fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* --- Sidebar --- */}
            <aside 
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-200
                    transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Header Sidebar (Logo + Tombol Close Mobile) */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    <NavLink to="/dashboard">
                        <img 
                            src={LogoUrl} 
                            className="h-10 w-auto " 
                            alt="Logo"
                        />
                    </NavLink>
                    <button 
                        className="lg:hidden p-1 text-gray-500 rounded-md hover:bg-gray-100"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigasi Sidebar */}
                <nav className="flex-1 overflow-y-auto p-4">
                    {/* Mengadaptasi dari Navbar: Home -> Dashboard */}
                    <SidebarLink to="/dashboard" icon={LayoutDashboard}>
                        Dashboard
                    </SidebarLink>
                    
                    {/* Mengadaptasi dari Navbar: Prediction */}
                    <SidebarLink to="/prediction" icon={BrainCircuit}>
                        Prediction
                    </SidebarLink>

                    {/* Mengadaptasi dari Navbar: Pages Dropdown */}
                    <SidebarDropdown 
                        title="Pages" 
                        icon={FileText} 
                        pathname={pathname}
                        pageLinks={['/pricing', '/blog-grid']}
                    >
                        <SidebarLink to="/pricing" icon={DollarSign}>
                            Pricing
                        </SidebarLink>
                        <SidebarLink to="/blog-grid" icon={Newspaper}>
                            Blog
                        </SidebarLink>
                    </SidebarDropdown>

                    {/* Mengadaptasi dari Navbar: Auth Pages */}
                    <SidebarDropdown 
                        title="Authentication" 
                        icon={Lock} 
                        pathname={pathname}
                        pageLinks={['/signin', '/signup']}
                    >
                        <SidebarLink to="/signin" icon={LogIn}>
                            Sign In
                        </SidebarLink>
                        <SidebarLink to="/signup" icon={UserPlus}>
                            Sign Up
                        </SidebarLink>
                    </SidebarDropdown>
                </nav>
            </aside>
        </>
    );
};

/**
 * Komponen Topbar Utama
 */
// @ts-ignore
const Topbar = ({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) => {
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200 shadow-sm">
            {/* Tombol Hamburger (Mobile) */}
            <button 
                className="lg:hidden p-1 -ml-2 text-gray-600 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Placeholder untuk Search Bar (jika diperlukan) */}
            <div className="hidden lg:block">
                {/* <input type="text" placeholder="Search..." /> */}
            </div>

            {/* Ikon Kanan (Notifikasi & Profil) */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700">
                    <Bell className="w-5 h-5" />
                </button>

                {/* Dropdown Profil */}
                <div className="relative">
                    <button 
                        className="flex items-center gap-2"
                        onClick={() => setProfileOpen(!profileOpen)}
                    >
                        <img 
                            src={AvatarUrl} 
                            alt="User Avatar" 
                            className="w-9 h-9 rounded-full ring-2 ring-offset-1 ring-gray-200"
                        />
                        <span className="hidden md:block text-sm font-medium text-gray-700">
                            Admin User
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                    </button>

                    {/* Menu Dropdown Profil */}
                    {profileOpen && (
                        <div 
                            className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2"
                            onMouseLeave={() => setProfileOpen(false)} // Menutup saat mouse keluar
                        >
                            <NavLink to="#profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <User className="w-4 h-4 mr-3" />
                                My Profile
                            </NavLink>
                            <NavLink to="#settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Settings className="w-4 h-4 mr-3" />
                                Settings
                            </NavLink>
                            <hr className="my-1 border-gray-100" />
                            <NavLink to="/login" className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                <LogOut className="w-4 h-4 mr-3" />
                                Sign Out
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};


/**
 * Komponen Layout Admin Utama
 * Ini membungkus seluruh halaman admin
 */
// @ts-ignore
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { pathname } = useLocation();

    // Menutup sidebar di mobile saat berpindah halaman
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex h-screen bg-gray-100  ">
            {/* Sidebar */}
            <Sidebar 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                pathname={pathname} 
            />

            {/* Konten Utama (Topbar + Area Konten) */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <Topbar setSidebarOpen={setSidebarOpen} />

                {/* Area Konten Utama */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                    {/* Children adalah komponen halaman (misal: <DashboardPage />) */}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;