import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors } from '../constants/Colors';
import { HiOutlineSearch, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
}

export const Foods: React.FC = () => {
  const [foods] = useState<Food[]>([
    { id: 1, name: 'Cơm trắng', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: '1 bát' },
    { id: 2, name: 'Thịt heo nạc', calories: 143, protein: 20, carbs: 0, fat: 6, unit: '100g' },
    { id: 3, name: 'Rau muống luộc', calories: 23, protein: 2.6, carbs: 3.1, fat: 0.2, unit: '100g' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    unit: '',
  });

  const handleAdd = () => {
    setEditingFood(null);
    setFormData({ name: '', calories: '', protein: '', carbs: '', fat: '', unit: '' });
    setShowModal(true);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
      unit: food.unit,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    // TODO: Gọi API lưu thực phẩm
    console.log('Saving food:', formData);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa thực phẩm này?')) {
      // TODO: Gọi API xóa
      console.log('Deleting food:', id);
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
              Quản lý thực phẩm
            </h1>
            <p style={{
              fontSize: '16px',
              color: Colors.gray,
            }}>
              Thêm, sửa, xóa thông tin thực phẩm
            </p>
          </div>
          <Button onClick={handleAdd} variant="primary">
            + Thêm thực phẩm
          </Button>
        </div>

        <Card>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <Input
              placeholder="Tìm kiếm thực phẩm..."
              value=""
              onChange={() => {}}
              style={{ flex: 1 }}
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
                  }}>Tên thực phẩm</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Calo</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Đạm</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Tinh bột</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Chất béo</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: Colors.text,
                  }}>Đơn vị</th>
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
                {foods.map((food) => (
                  <tr
                    key={food.id}
                    style={{
                      borderBottom: `1px solid ${Colors.lightGray}`,
                    }}
                  >
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      color: Colors.text,
                    }}>{food.name}</td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: Colors.text,
                    }}>{food.calories} kcal</td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: Colors.text,
                    }}>{food.protein}g</td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: Colors.text,
                    }}>{food.carbs}g</td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: Colors.text,
                    }}>{food.fat}g</td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: Colors.gray,
                    }}>{food.unit}</td>
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
                          onClick={() => handleEdit(food)}
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
                          onClick={() => handleDelete(food.id)}
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
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: Colors.text,
                marginBottom: '24px',
              }}>
                {editingFood ? 'Sửa thực phẩm' : 'Thêm thực phẩm mới'}
              </h2>

              <Input
                label="Tên thực phẩm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}>
                <Input
                  label="Calories (kcal)"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  required
                />
                <Input
                  label="Protein (g)"
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  required
                />
                <Input
                  label="Carbs (g)"
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  required
                />
                <Input
                  label="Fat (g)"
                  type="number"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Đơn vị"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="VD: 1 bát, 100g, 1 cái"
                required
              />

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

