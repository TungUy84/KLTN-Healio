import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors } from '../constants/Colors';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

interface Meal {
  id: number;
  name: string;
  description: string;
  calories: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string[];
}

export const Meals: React.FC = () => {
  const [meals] = useState<Meal[]>([
    {
      id: 1,
      name: 'Thực đơn giảm cân',
      description: 'Thực đơn ít calo, giàu protein',
      calories: 1200,
      type: 'breakfast',
      foods: ['Cơm gạo lứt', 'Ức gà', 'Rau xanh'],
    },
    {
      id: 2,
      name: 'Thực đơn tăng cân',
      description: 'Thực đơn giàu calo và dinh dưỡng',
      calories: 2500,
      type: 'lunch',
      foods: ['Cơm trắng', 'Thịt heo', 'Trứng', 'Sữa'],
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    type: 'breakfast' as Meal['type'],
  });

  const mealTypeLabels = {
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Ăn vặt',
  };

  const handleAdd = () => {
    setEditingMeal(null);
    setFormData({ name: '', description: '', calories: '', type: 'breakfast' });
    setShowModal(true);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      description: meal.description,
      calories: meal.calories.toString(),
      type: meal.type,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    // TODO: Gọi API lưu thực đơn
    console.log('Saving meal:', formData);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa thực đơn này?')) {
      // TODO: Gọi API xóa
      console.log('Deleting meal:', id);
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
              Quản lý thực đơn
            </h1>
            <p style={{
              fontSize: '16px',
              color: Colors.gray,
            }}>
              Thêm, sửa, xóa thực đơn gợi ý
            </p>
          </div>
          <Button onClick={handleAdd} variant="primary">
            + Thêm thực đơn
          </Button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px',
        }}>
          {meals.map((meal) => (
            <Card key={meal.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '16px',
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: Colors.text,
                    margin: '0 0 8px 0',
                  }}>
                    {meal.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: Colors.gray,
                    margin: '0 0 12px 0',
                  }}>
                    {meal.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '12px',
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: '#E8F5E9',
                      color: Colors.primary,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {mealTypeLabels[meal.type]}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: Colors.text,
                      fontWeight: '500',
                    }}>
                      {meal.calories} kcal
                    </span>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '13px',
                      color: Colors.gray,
                      margin: '0 0 4px 0',
                    }}>
                      Thực phẩm:
                    </p>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}>
                      {meal.foods.map((food, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: Colors.lightGray,
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: Colors.text,
                          }}
                        >
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: `1px solid ${Colors.lightGray}`,
              }}>
                <Button
                  onClick={() => handleEdit(meal)}
                  variant="outline"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <HiOutlinePencil size={16} />
                  Sửa
                </Button>
                <Button
                  onClick={() => handleDelete(meal.id)}
                  variant="danger"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <HiOutlineTrash size={16} />
                  Xóa
                </Button>
              </div>
            </Card>
          ))}
        </div>

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
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: Colors.text,
                marginBottom: '24px',
              }}>
                {editingMeal ? 'Sửa thực đơn' : 'Thêm thực đơn mới'}
              </h2>

              <Input
                label="Tên thực đơn"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Loại bữa ăn <span style={{ color: Colors.error }}>*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Meal['type'] })}
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
                  {Object.entries(mealTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Tổng calories (kcal)"
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
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

