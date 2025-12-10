import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Colors } from '../constants/Colors';
import { HiOutlineUsers, HiOutlineCollection, HiOutlineChartBar } from 'react-icons/hi';

export const Statistics: React.FC = () => {
  const popularMeals = [
    { name: 'Thực đơn giảm cân', count: 234, percentage: 35 },
    { name: 'Thực đơn tăng cân', count: 189, percentage: 28 },
    { name: 'Thực đơn duy trì', count: 156, percentage: 23 },
    { name: 'Thực đơn thể thao', count: 89, percentage: 14 },
  ];

  const userGrowth = [
    { month: 'Tháng 1', users: 120 },
    { month: 'Tháng 2', users: 180 },
    { month: 'Tháng 3', users: 250 },
    { month: 'Tháng 4', users: 320 },
    { month: 'Tháng 5', users: 400 },
    { month: 'Tháng 6', users: 480 },
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
          Thống kê
        </h1>
        <p style={{
          fontSize: '16px',
          color: Colors.gray,
          marginBottom: '32px',
        }}>
          Thống kê và phân tích dữ liệu hệ thống
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          <Card>
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
                  Tổng người dùng
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: Colors.primary,
                  margin: 0,
                }}>
                  1,234
                </p>
                <p style={{
                  fontSize: '12px',
                  color: Colors.success,
                  margin: '8px 0 0 0',
                }}>
                  ↑ 12% so với tháng trước
                </p>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#E8F5E9',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: Colors.primary,
              }}>
                <HiOutlineUsers size={28} />
              </div>
            </div>
          </Card>

          <Card>
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
                  Thực đơn được chọn
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: Colors.secondary,
                  margin: 0,
                }}>
                  5,678
                </p>
                <p style={{
                  fontSize: '12px',
                  color: Colors.success,
                  margin: '8px 0 0 0',
                }}>
                  ↑ 8% so với tháng trước
                </p>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#FFF3E0',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: Colors.secondary,
              }}>
                <HiOutlineCollection size={28} />
              </div>
            </div>
          </Card>

          <Card>
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
                  Hoạt động hôm nay
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#2196F3',
                  margin: 0,
                }}>
                  234
                </p>
                <p style={{
                  fontSize: '12px',
                  color: Colors.gray,
                  margin: '8px 0 0 0',
                }}>
                  Người dùng đang hoạt động
                </p>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#E3F2FD',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2196F3',
              }}>
                <HiOutlineChartBar size={28} />
              </div>
            </div>
          </Card>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          marginBottom: '32px',
        }}>
          <Card>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: '24px',
            }}>
              Tăng trưởng người dùng
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '16px',
              height: '200px',
            }}>
              {userGrowth.map((item, index) => {
                const maxUsers = Math.max(...userGrowth.map(u => u.users));
                const height = (item.users / maxUsers) * 100;
                return (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${height}%`,
                        backgroundColor: Colors.primary,
                        borderRadius: '8px 8px 0 0',
                        minHeight: '20px',
                        marginBottom: '8px',
                      }}
                    />
                    <p style={{
                      fontSize: '12px',
                      color: Colors.gray,
                      margin: 0,
                      textAlign: 'center',
                    }}>
                      {item.month.split(' ')[1]}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: Colors.text,
                      fontWeight: '500',
                      margin: '4px 0 0 0',
                    }}>
                      {item.users}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: '24px',
            }}>
              Thực đơn phổ biến
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {popularMeals.map((meal, index) => (
                <div key={index}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: Colors.text,
                    }}>
                      {meal.name}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: Colors.primary,
                    }}>
                      {meal.count}
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: Colors.lightGray,
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        width: `${meal.percentage}%`,
                        height: '100%',
                        backgroundColor: Colors.primary,
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

