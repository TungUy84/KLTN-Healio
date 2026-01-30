import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { authService } from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import { FaChevronDown, FaSun, FaMoon } from 'react-icons/fa';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
            <Sidebar />
            <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-6 gap-3 shrink-0 sticky top-0 z-40 transition-colors">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                    >
                        {theme === 'dark' ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
                    </button>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className="flex items-center gap-2 pl-3 py-2 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                                A
                            </div>
                            <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">Administrator</span>
                            <FaChevronDown className={`text-gray-500 dark:text-gray-400 text-xs transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {userDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Administrator</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                                    </div>
                                    <a href="/" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Hồ sơ</a>
                                    <a href="/" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cài đặt</a>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserDropdownOpen(false);
                                            authService.logout();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto transition-colors">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
