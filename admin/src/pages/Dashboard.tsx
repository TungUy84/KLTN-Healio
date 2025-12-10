import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Colors } from '../constants/Colors';
import {
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineCollection,
  HiOutlineChatAlt,
  HiOutlineUser,
} from 'react-icons/hi';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Tổng người dùng', value: '1,234', icon: <HiOutlineUsers size={28} />, color: Colors.primary },
    { label: 'Thực phẩm', value: '456', icon: <HiOutlineCube size={28} />, color: Colors.secondary },
    { label: 'Thực đơn', value: '89', icon: <HiOutlineCollection size={28} />, color: '#2196F3' },
    { label: 'Phản hồi mới', value: '12', icon: <HiOutlineChatAlt size={28} />, color: Colors.warning },
  ];

  return (
    <Layout>
      <div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: Colors.text,
          marginBottom: '8px',
        }}>
          Dashboard
        </h1>
        <p style={{
          fontSize: '16px',
          color: Colors.gray,
          marginBottom: '32px',
        }}>
          Tổng quan hệ thống Healio
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {stats.map((stat, index) => (
            <Card key={index}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{
                    fontSize: '14px',
                    color: Colors.gray,
                    margin: '0 0 8px 0',
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: stat.color,
                    margin: 0,
                  }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: `${stat.color}20`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
        }}>
          <Card>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: '20px',
            }}>
              Hoạt động gần đây
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {[
                { action: 'Người dùng mới đăng ký', time: '5 phút trước', icon: <HiOutlineUser size={24} color={Colors.primary} /> },
                { action: 'Thực phẩm mới được thêm', time: '15 phút trước', icon: <HiOutlineCube size={24} color={Colors.secondary} /> },
                { action: 'Phản hồi mới từ người dùng', time: '1 giờ trước', icon: <HiOutlineChatAlt size={24} color={Colors.warning} /> },
                { action: 'Thực đơn được cập nhật', time: '2 giờ trước', icon: <HiOutlineCollection size={24} color="#2196F3" /> },
              ].map((activity, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#F8F9FA',
                    borderRadius: '12px',
                  }}
                >
                  <span>{activity.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: Colors.text,
                      margin: 0,
                    }}>
                      {activity.action}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: Colors.gray,
                      margin: '4px 0 0 0',
                    }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: '20px',
            }}>
              Thống kê nhanh
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: Colors.gray,
                  margin: '0 0 4px 0',
                }}>
                  Người dùng hoạt động hôm nay
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: Colors.primary,
                  margin: 0,
                }}>
                  234
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: Colors.gray,
                  margin: '0 0 4px 0',
                }}>
                  Thực đơn phổ biến nhất
                </p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: Colors.text,
                  margin: 0,
                }}>
                  Thực đơn giảm cân
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

