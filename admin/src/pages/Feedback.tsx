import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors } from '../constants/Colors';
import { HiOutlineClock, HiOutlineRefresh, HiOutlineCheckCircle } from 'react-icons/hi';

interface Feedback {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'resolved';
}

export const Feedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 1,
      userId: 1,
      userName: 'Nguyễn Văn A',
      content: 'Ứng dụng rất hay, nhưng tôi muốn thêm tính năng theo dõi nước uống.',
      createdAt: '2024-12-08 10:30',
      status: 'pending',
    },
    {
      id: 2,
      userId: 2,
      userName: 'Trần Thị B',
      content: 'Thực đơn gợi ý chưa phù hợp với khẩu vị của tôi.',
      createdAt: '2024-12-07 15:20',
      status: 'processing',
    },
    {
      id: 3,
      userId: 3,
      userName: 'Lê Văn C',
      content: 'Cảm ơn team đã hỗ trợ, vấn đề đã được giải quyết!',
      createdAt: '2024-12-06 09:15',
      status: 'resolved',
    },
  ]);

  const statusLabels = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    resolved: 'Đã xử lý',
  };

  const statusColors = {
    pending: { bg: '#FFF3E0', color: Colors.warning },
    processing: { bg: '#E3F2FD', color: '#2196F3' },
    resolved: { bg: '#E8F5E9', color: Colors.success },
  };

  const handleStatusChange = (id: number, newStatus: Feedback['status']) => {
    setFeedbacks(feedbacks.map(fb =>
      fb.id === id ? { ...fb, status: newStatus } : fb
    ));
    // TODO: Gọi API cập nhật trạng thái
  };

  return (
    <Layout>
      <div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: Colors.text,
          marginBottom: '8px',
        }}>
          Phản hồi người dùng
        </h1>
        <p style={{
          fontSize: '16px',
          color: Colors.gray,
          marginBottom: '32px',
        }}>
          Xem và quản lý phản hồi từ người dùng
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <Button
            variant={feedbacks.filter(f => f.status === 'pending').length > 0 ? 'primary' : 'outline'}
            onClick={() => {}}
          >
            Chờ xử lý ({feedbacks.filter(f => f.status === 'pending').length})
          </Button>
          <Button
            variant={feedbacks.filter(f => f.status === 'processing').length > 0 ? 'primary' : 'outline'}
            onClick={() => {}}
          >
            Đang xử lý ({feedbacks.filter(f => f.status === 'processing').length})
          </Button>
          <Button
            variant={feedbacks.filter(f => f.status === 'resolved').length > 0 ? 'primary' : 'outline'}
            onClick={() => {}}
          >
            Đã xử lý ({feedbacks.filter(f => f.status === 'resolved').length})
          </Button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {feedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: Colors.text,
                      margin: 0,
                    }}>
                      {feedback.userName}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: statusColors[feedback.status].bg,
                      color: statusColors[feedback.status].color,
                    }}>
                      {statusLabels[feedback.status]}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: Colors.text,
                    lineHeight: '1.6',
                    margin: '0 0 12px 0',
                  }}>
                    {feedback.content}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: Colors.gray,
                    margin: 0,
                  }}>
                    {feedback.createdAt}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                paddingTop: '16px',
                borderTop: `1px solid ${Colors.lightGray}`,
              }}>
                {feedback.status !== 'pending' && (
                  <Button
                    onClick={() => handleStatusChange(feedback.id, 'pending')}
                    variant="outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <HiOutlineClock size={16} />
                    Chờ xử lý
                  </Button>
                )}
                {feedback.status !== 'processing' && (
                  <Button
                    onClick={() => handleStatusChange(feedback.id, 'processing')}
                    variant="outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <HiOutlineRefresh size={16} />
                    Đang xử lý
                  </Button>
                )}
                {feedback.status !== 'resolved' && (
                  <Button
                    onClick={() => handleStatusChange(feedback.id, 'resolved')}
                    variant="primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <HiOutlineCheckCircle size={16} />
                    Đã xử lý
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

