import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Colors } from '../constants/Colors';
import {
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineCollection,
  HiOutlineUsers,
  HiOutlineTrendingUp,
  HiOutlineChatAlt,
  HiOutlineHeart,
} from 'react-icons/hi';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <HiOutlineChartBar size={20} /> },
  { path: '/foods', label: 'Quản lý thực phẩm', icon: <HiOutlineCube size={20} /> },
  { path: '/meals', label: 'Quản lý thực đơn', icon: <HiOutlineCollection size={20} /> },
  { path: '/users', label: 'Quản lý người dùng', icon: <HiOutlineUsers size={20} /> },
  { path: '/statistics', label: 'Thống kê', icon: <HiOutlineTrendingUp size={20} /> },
  { path: '/feedback', label: 'Phản hồi', icon: <HiOutlineChatAlt size={20} /> },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      backgroundColor: '#fff',
      borderRight: '1px solid #F0F0F0',
      padding: '24px 0',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
    }}>
      <div style={{
        padding: '0 24px 24px',
        borderBottom: '1px solid #F0F0F0',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#E8F5E9',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: Colors.primary,
          }}>
            <HiOutlineHeart size={24} />
          </div>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: Colors.text,
              margin: 0,
            }}>
              Healio Admin
            </h2>
            <p style={{
              fontSize: '12px',
              color: Colors.gray,
              margin: 0,
            }}>
              Quản trị hệ thống
            </p>
          </div>
        </div>
      </div>

      <nav>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                color: isActive ? Colors.primary : Colors.text,
                backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: isActive ? '600' : '400',
                borderLeft: isActive ? `3px solid ${Colors.primary}` : '3px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#F5F5F5';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        right: '24px',
        padding: '16px',
        backgroundColor: '#F8F9FA',
        borderRadius: '12px',
      }}>
        <p style={{
          fontSize: '12px',
          color: Colors.gray,
          margin: '0 0 8px 0',
        }}>
          Đăng nhập bởi:
        </p>
        <p style={{
          fontSize: '14px',
          fontWeight: '600',
          color: Colors.text,
          margin: 0,
        }}>
          {localStorage.getItem('adminEmail') || 'Admin'}
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminEmail');
            window.location.href = '/';
          }}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '8px',
            backgroundColor: 'transparent',
            border: `1px solid ${Colors.error}`,
            borderRadius: '8px',
            color: Colors.error,
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

