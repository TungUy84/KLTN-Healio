import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaHome,
    FaLeaf,
    FaUtensils,
    FaUsers,
    FaChartBar,
    FaSignOutAlt
} from 'react-icons/fa';
import { authService } from '../services/authService';

const Sidebar: React.FC = () => {
    const handleLogout = () => {
        authService.logout();
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
        { path: '/raw-foods', label: 'Quản lý Nguyên liệu', icon: <FaLeaf /> },
        { path: '/foods', label: 'Quản lý Món ăn', icon: <FaUtensils /> },
        { path: '/users', label: 'Quản lý Tài khoản', icon: <FaUsers /> },
        { path: '/statistics', label: 'Thống kê', icon: <FaChartBar /> },
    ];

    return (
        <div className="w-[260px] h-screen bg-slate-800 dark:bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 transition-colors">
            <div className="h-[70px] flex items-center gap-3 px-4 border-b border-slate-700 dark:border-slate-600">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                    H
                </div>
                <span className="text-white font-bold text-lg truncate">Admin Helio</span>
            </div>

            <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto [&_a]:text-white [&_a:hover]:text-white">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 no-underline rounded-lg text-[15px] font-medium transition-all ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-700 dark:hover:bg-slate-700'}`
                        }
                    >
                        <span className="flex items-center mr-3 text-lg text-inherit">{item.icon}</span>
                        <span className="text-inherit">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700 dark:border-slate-600">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center p-2.5 bg-slate-700 dark:bg-slate-800 text-white border-none rounded-lg cursor-pointer text-sm font-medium transition-colors hover:bg-red-900/30 hover:text-red-200"
                >
                    <FaSignOutAlt className="mr-2" />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
