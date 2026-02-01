import React, { useState } from 'react';
import {
    Search,
    Bell,
    Menu,
    Moon,
    Sun,
    LogOut,
    User,
    Settings
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';

interface NavbarProps {
    onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm transition-all duration-300">
            {/* 1. LEFT: Toggle & Title (Optional) */}
            <div className="flex items-center gap-4">
                <button onClick={onToggleSidebar} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <Menu size={20} />
                </button>
            </div>

            {/* 2. CENTER: Search Bar (Skydash Style) */}
            <div className={`
                flex items-center flex-1 max-w-xl bg-gray-50 rounded-full px-4 py-2 mx-6 transition-all duration-300 border
                ${isSearchFocused ? 'border-indigo-300 bg-white shadow-sm ring-2 ring-indigo-50' : 'border-transparent'}
            `}>
                <Search size={20} className={`mr-3 ${isSearchFocused ? 'text-indigo-500' : 'text-gray-400'}`} />
                <input
                    type="text"
                    placeholder="Search now"
                    className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 font-medium"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                />
            </div>

            {/* 3. RIGHT: Actions & Profile */}
            <div className="flex items-center gap-6">

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="text-gray-400 hover:text-indigo-500 transition-colors relative"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button className="text-gray-400 hover:text-indigo-500 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-200"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden md:block">
                            <span className="block text-sm font-bold text-gray-700">Administrator</span>
                            <span className="block text-[11px] text-gray-400 font-medium">Super Admin</span>
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                                A
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-40 transform origin-top-right transition-all">
                                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                    <p className="text-sm font-bold text-gray-800">Administrator</p>
                                    <p className="text-xs text-gray-500 truncate">admin@healio.com</p>
                                </div>
                                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                                    <User size={16} /> My Profile
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                                    <Settings size={16} /> Settings
                                </a>
                                <div className="my-1 border-t border-gray-50"></div>
                                <button
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        authService.logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
