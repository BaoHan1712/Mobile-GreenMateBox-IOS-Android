# 🌱 GreenMate Box - Mobile App

## Setup & Chạy Server

### 1. Cài đặt Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Chạy Server Flask
```bash
python server.py
```

Server sẽ chạy tại: `http://localhost:5000`

### 3. API Endpoints

#### Đăng Nhập
```
POST /api/auth/login
Body: { "email": "user@email.com", "password": "password" }
```

#### Đăng Ký
```
POST /api/auth/signup
Body: { "email": "user@email.com", "password": "password", "name": "Tên" }
```

#### Lấy Thống Kê
```
GET /api/user/stats
Header: Authorization: user@email.com
```

#### Quét QR
```
POST /api/user/scan
Header: Authorization: user@email.com
```

#### Đổi Quà
```
POST /api/user/redeem
Header: Authorization: user@email.com
Body: { "giftName": "Tên quà", "cost": 100 }
```

### 4. Sửa Config trong App.js

Nếu muốn kết nối với server thực, thêm vào đầu App.js:

```javascript
const API_URL = 'http://localhost:5000/api';
```

Sau đó sửa hàm login/signup để gọi API:

```javascript
const handleLogin = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    });
    const data = await response.json();
    if (data.success) {
      setIsAuthenticated(true);
    }
  } catch (error) {
    Alert.alert('Lỗi', 'Không kết nối được server');
  }
};
```

## 📁 Cấu Trúc Project

```
myapp/
├── App.js              # Main React Native App
├── app.json            # Config
├── package.json        # Dependencies
├── server.py           # Python Flask Server
├── requirements.txt    # Python dependencies
├── assets/
│   └── imgage/         # Images
└── README.md           # This file
```

## ✨ Tính năng

- ✅ Đăng nhập / Đăng ký
- ✅ Trang chủ với thống kê
- ✅ Quét QR rác thải
- ✅ Ví Eco với lịch sử
- ✅ Bảng xếp hạng
- ✅ Bản đồ máy gần nhất
- ✅ Huy hiệu/Thành tích

## 🚀 Chạy App

```bash
npm start
# hoặc
expo start
```

Sau đó chọn platform (iOS/Android)

---

**Made with 💚 for environment**
