# Healio - Ứng dụng Cá nhân hóa Dinh dưỡng & Cân bằng Năng lượng

> **Đồ án Tốt nghiệp - Ngành Công nghệ Thông tin**
>
> Ứng dụng hỗ trợ người dùng Việt Nam xây dựng lộ trình dinh dưỡng khoa học, theo dõi calo và quản lý cân nặng hiệu quả.

---

## Sinh viên Thực hiện

| MSSV | Họ và Tên | Vai trò |
| :--- | :--- | :--- |
| **2274802010983** | **Kim Đặng Tùng Uy** | Mobile App & Backend |
| **2274802010996** | **Đại Hoàng Việt** | Admin Web & Database |

**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung

---

## Giới thiệu

**Healio** là giải pháp công nghệ giúp giải quyết bài toán "Hôm nay ăn gì?" và "Ăn bao nhiêu là đủ?" cho người Việt. Ứng dụng sử dụng các công thức khoa học (Mifflin-St Jeor) để tính toán nhu cầu năng lượng (TDEE) và đề xuất thực đơn phù hợp với khẩu vị và thói quen ăn uống địa phương.

### Tính năng nổi bật

* **Thiết lập lộ trình thông minh:** Tự động tính BMI, BMR, TDEE dựa trên chỉ số cơ thể và mức độ vận động.
* **Theo dõi Calo & Macro:** Dashboard trực quan với vòng tròn năng lượng Real-time.
* **Gợi ý thực đơn (Smart Plan):** Tạo thực đơn 3 bữa tự động dựa trên ngân sách calo.
* **Cơ sở dữ liệu món Việt:** Tích hợp Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng Quốc gia) với đơn vị đo lường thân thiện (bát, đĩa, cái).
* **Quản lý tiến độ:** Biểu đồ theo dõi cân nặng và lịch sử dinh dưỡng.

---

## Công nghệ Sử dụng

Dự án được xây dựng theo mô hình **Client-Server** với kiến trúc hiện đại:

### Mobile App (Người dùng)
* **Framework:** React Native (Expo SDK 50+)
* **Language:** TypeScript
* **Routing:** Expo Router (File-based routing)
* **UI/UX:** Stylesheet, React Native Heroicons, React Native SVG
* **State Management:** React Context API

### Admin Panel (Quản trị viên)
* **Framework:** ReactJS (Vite)
* **Language:** TypeScript
* **Styling:** CSS Modules / Tailwind CSS (tùy chọn)
* **Chức năng:** Quản lý User, CRUD Món ăn, Import dữ liệu dinh dưỡng.

### Server (Backend)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL
* **Authentication:** JWT (JSON Web Token)

---

## Cấu trúc Dự án

```text
KLTN-Healio/
├── mobile/         # Mã nguồn ứng dụng di động (React Native)
├── admin/          # Mã nguồn trang quản trị (React Vite)
├── server/         # Mã nguồn Backend API (Node.js)
└── README.md       # Tài liệu dự án

Hướng dẫn Cài đặt & Chạy dự án
Yêu cầu: Đã cài đặt Node.js (v18+) và npm/yarn.

1. Khởi chạy Server (Backend)
```Bash

cd server
npm install
# Tạo file .env và cấu hình DB_URL
npm run dev
# Server sẽ chạy tại http://localhost:3000 (hoặc port cấu hình)
2. Khởi chạy Admin Panel (Web)
```Bash

cd admin
npm install
npm run dev
# Truy cập tại http://localhost:5173
3. Khởi chạy Mobile App
Bạn cần cài ứng dụng Expo Go trên điện thoại để quét mã QR.

Bash

cd mobile
npm install
npx expo start
# Quét mã QR hiện ra để chạy trên điện thoại thật hoặc máy ảo

## License
Dự án thuộc bản quyền của nhóm sinh viên thực hiện và Trường Đại học Văn Lang.