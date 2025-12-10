import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors } from '../constants/Colors';
import { HiOutlineSearch, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export const Users: React.FC = () => {
  const [users] = useState<User[]>([
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567', createdAt: '2024-01-15', status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0907654321', createdAt: '2024-02-20', status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', phone: '0912345678', createdAt: '2024-03-10', status: 'inactive' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as User['status'],
  });

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', status: 'active' });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    // TODO: Gọi API lưu người dùng
    console.log('Saving user:', formData);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      // TODO: Gọi API xóa
      console.log('Deleting user:', id);
    }
  };

  return (
    <Layout>
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: '8px',
            }}>
              Quản lý người dùng
            </h1>
            <p style={{
              fontSize: '16px',
              color: Colors.gray,
            }}>
              Quản lý thông tin người dùng hệ thống
            </p>
          </div>
          <Button onClick={handleAdd} variant="primary">
            + Thêm người dùng
          </Button>
        </div>

        <Card>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              value=""
              onChange={() => {}}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Button variant="outline">
              <HiOutlineSearch size={18} style={{ marginRight: '6px', display: 'inline' }} />
              Tìm kiếm
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  borderBottom: `2px solid ${Colors.lightGray}`,
                }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Tên</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Email</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Số điện thoại</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Ngày đăng ký</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Trạng thái</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: `1px solid ${Colors.lightGray}`,
                    }}
                  >
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      color: Colors.text,
                    }}>{user.name}</td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: Colors.text,
                    }}>{user.email}</td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: Colors.text,
                    }}>{user.phone}</td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: Colors.gray,
                    }}>{user.createdAt}</td>
                    <td style={{
                      padding: '16px 12px',
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: user.status === 'active' ? '#E8F5E9' : '#FFEBEE',
                        color: user.status === 'active' ? Colors.primary : Colors.error,
                      }}>
                        {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td style={{
                      padding: '16px 12px',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                      }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#E3F2FD',
                            color: '#2196F3',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <HiOutlinePencil size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FFEBEE',
                            color: Colors.error,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <HiOutlineTrash size={16} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <Card style={{
              width: '90%',
              maxWidth: '500px',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: Colors.text,
                marginBottom: '24px',
              }}>
                {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
              </h2>

              <Input
                label="Họ và tên"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: Colors.text,
                  marginBottom: '8px',
                }}>
                  Trạng thái <span style={{ color: Colors.error }}>*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '12px',
                    backgroundColor: Colors.lightGray,
                    outline: 'none',
                  }}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
              }}>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  fullWidth
                >
                  Lưu
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  fullWidth
                >
                  Hủy
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

