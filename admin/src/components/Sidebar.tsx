import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

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
        <div className="w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50">
            <div className="h-[70px] flex items-center px-6 border-b border-gray-100">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold mr-3 text-lg">
                    H
                </div>
                <h2 className="text-xl font-bold text-gray-900 m-0">Healio Admin</h2>
            </div>

            <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center px-4 py-3 text-gray-600 no-underline rounded-lg text-[15px] font-medium transition-all
                            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 hover:text-gray-900'}
                        `}
                    >
                        <span className="flex items-center mr-3 text-lg">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center justify-center p-2.5 bg-red-50 text-red-500 border-none rounded-lg cursor-pointer text-sm font-semibold transition-colors hover:bg-red-100"
                >
                    <FaSignOutAlt className="mr-2" />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
