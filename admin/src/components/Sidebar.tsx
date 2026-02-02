import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Leaf,
    UtensilsCrossed,
    Users,
    TrendingUp,
    LogOut,
} from 'lucide-react';
import { authService } from '../services/authService';
import logo from '../assets/logohealio.png'; // Đảm bảo đường dẫn logo đúng

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const location = useLocation();

    const handleLogout = () => {
        authService.logout();
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/raw-foods', label: 'Kho Nguyên Liệu', icon: Leaf },
        { path: '/foods', label: 'Quản lý Món ăn', icon: UtensilsCrossed },
        { path: '/users', label: 'Người dùng', icon: Users },
        { path: '/statistics', label: 'Thống kê', icon: TrendingUp },
    ];

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-20'} h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 font-sans`}>
            {/* 1. LOGO SECTION */}
            <div className="h-20 flex items-center justify-center ">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                        <div className={`absolute inset-0 bg-emerald-200 blur-lg opacity-40 rounded-full transition-all ${!isOpen && 'w-10 h-10'}`}></div>
                        <img
                            src={logo}
                            alt="Healio"
                            className={`${isOpen ? 'w-40 h-40' : 'w-10 h-10'} object-contain relative z-10 drop-shadow-sm transition-all duration-300`}
                        />
                    </div>
                </div>
            </div>

            {/* 2. NAVIGATION MENU */}
            <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1.5 custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                relative group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out
                                ${isActive
                                    ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }
                                ${isOpen ? 'gap-3' : 'justify-center px-2'}
                            `}
                            title={!isOpen ? item.label : ''}
                        >
                            {/* Active Indicator Bar (Thanh nhỏ bên trái) */}
                            {isActive && isOpen && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full"></span>
                            )}

                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                            />

                            {isOpen && (
                                <span className={`text-[14px] font-medium tracking-wide transition-all duration-200 ${isActive ? 'font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* LOGOUT */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/30">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-semibold group ${!isOpen && 'px-0'}`}
                    title={!isOpen ? 'Đăng xuất' : ''}
                >
                    <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className={`${isOpen ? 'block' : 'hidden'}`}>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;