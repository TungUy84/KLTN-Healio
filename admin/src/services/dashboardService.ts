// Mock data/service for Dashboard
// In production, this would call axios.get('/dashboard/stats')

export const dashboardService = {
  getStats: async () => {
    // Return fake data for AC1 (PB_40)
    return {
        users: 1250,
        admins: 5,
        ingredients: 342,
        foods: 128
    };
  },

  getRecentActivities: async () => {
      // Fake data for PB_41
      return [
          { id: 1, user: 'Nguyễn Văn A', action: 'vừa đăng ký tài khoản', time: '2 phút trước', avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random' },
          { id: 2, user: 'QTV Hoàng Việt', action: 'đã thêm món "Salad Ức Gà"', time: '15 phút trước', avatar: 'https://ui-avatars.com/api/?name=Dai+Hoang+Viet&background=0D8ABC&color=fff' },
          { id: 3, user: 'Trần Thị B', action: 'cập nhật chỉ số cơ thể', time: '1 giờ trước', avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random' },
          { id: 4, user: 'Lê Văn C', action: 'đăng ký gói Premium', time: '3 giờ trước', avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=random' },
          { id: 5, user: 'Hệ thống', action: 'Sao lưu dữ liệu định kỳ thành công', time: '5 giờ trước', avatar: null },
      ];
  },

  getTopDishes: async () => {
      // Fake data for PB_43
      return [
          { name: 'Cơm tấm sườn', count: 120 },
          { name: 'Phở bò', count: 98 },
          { name: 'Bánh mì', count: 86 },
          { name: 'Gỏi cuốn', count: 75 },
          { name: 'Bún chả', count: 62 },
      ];
  }
};
