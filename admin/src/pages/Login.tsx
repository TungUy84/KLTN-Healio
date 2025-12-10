import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors } from '../constants/Colors';
import { HiOutlineHeart } from 'react-icons/hi';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // TODO: Gọi API đăng nhập
    // Tạm thời cho phép đăng nhập với bất kỳ email/password nào
    if (email && password) {
      localStorage.setItem('adminToken', 'demo-token');
      localStorage.setItem('adminEmail', email);
      navigate('/dashboard');
    } else {
      setError('Vui lòng nhập đầy đủ thông tin');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8F9FA',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#E8F5E9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: Colors.primary,
          }}>
            <HiOutlineHeart size={40} />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: Colors.text,
            margin: '0 0 8px 0',
          }}>
            Healio Admin
          </h1>
          <p style={{
            fontSize: '16px',
            color: Colors.gray,
            margin: 0,
          }}>
            Đăng nhập vào hệ thống quản trị
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <Input
            label="Email"
            type="email"
            placeholder="admin@healio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#FFEBEE',
              borderRadius: '8px',
              color: Colors.error,
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            variant="primary"
          >
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
};

