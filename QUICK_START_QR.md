# 🎯 Chức năng Quét QR Code - Hướng dẫn Nhanh

## ✅ Đã cài đặt xong

Ứng dụng GreenMate Box hiện đã có chức năng **quét mã QR** để nhận điểm từ các máy tái chế rác.

## 🚀 Cách sử dụng

### **Bước 1: Mở ứng dụng**
```
GreenMate Box → Tab "Scan" (biểu tượng camera)
```

### **Bước 2: Nhấn "Bắt đầu quét"**
```
Button "Bắt đầu quét" 
↓
Cho phép quyền truy cập camera
```

### **Bước 3: Hướng camera vào QR code**
```
Giữ máy ở khoảng 15-30cm từ mã QR
Đảm bảo mã QR nằm trong khung xanh
```

### **Bước 4: Kết quả**
```
✓ Quét thành công!

Hiển thị:
  +50 ĐIỂM THƯỞNG
  🍾 10 chai
  💨 0.8kg CO₂
```

### **Bước 5: Tiếp tục hoặc thoát**
```
Nhấn "Quét tiếp" → Quét QR khác
Hoặc ← Quay lại card kết quả
```

---

## 📝 Format QR Code

QR code phải chứa một trong hai định dạng:

### **Format 1: Số đơn giản** ✅
```
50
100
250
500
```

### **Format 2: JSON** ✅
```json
{"points":50,"machineId":"CS1"}
{"points":100,"machineId":"CS2"}
```

### **Lỗi Format** ❌
```
abc          → Không phải số
-50          → Số âm (invalid)
0            → Zero (invalid)
50.5         → Thập phân (sẽ được làm tròn)
```

---

## 🎨 Giao diện

```
┌─────────────────────────────────┐
│  ✕                       Scan   │
├─────────────────────────────────┤
│                                 │
│        📹 (CAMERA LIVE)         │
│        ┌───────────────┐        │
│        │   QR FRAME    │        │
│        │   (Green)     │        │
│        └───────────────┘        │
│                                 │
│   "Hướng vào mã QR..."          │
│                                 │
└─────────────────────────────────┘
```

**Sau khi quét:**
```
┌─────────────────────────────────┐
│      +50                        │
│   ĐIỂM THƯỞNG                   │
│                                 │
│   🍾 10    |    💨 0.8kg CO₂    │
│                                 │
│   [  Quét tiếp  ]               │
└─────────────────────────────────┘
```

---

## 🔧 Cài đặt Dependencies

### Bước 1: Cài expo-camera
```bash
npm install expo-camera
```

Hoặc nếu dùng expo:
```bash
expo install expo-camera
```

### Bước 2: Rebuild ứng dụng
```bash
npm start
# Android: a
# iOS: i
# Web: w
```

---

## 📊 Dữ liệu sau quét

| Trường | Tính toán | Ví dụ |
|--------|----------|-------|
| Điểm | Từ QR code | 50 |
| Chai | points ÷ 5 | 50 ÷ 5 = 10 |
| CO₂ | chai × 0.08 | 10 × 0.08 = 0.8kg |
| Lịch sử | Tự động lưu | "Quét QR - Máy rác #..." |

---

## 🧪 Test QR Code Online

### Tạo QR code:
1. Vào: https://www.qr-code-generator.com/
2. Chọn "Text"
3. Nhập: `50` hoặc `{"points":100}`
4. Download ảnh
5. Test quét

### Hoặc dùng công cụ tạo nhanh:
```bash
# Sử dụng qrencode (nếu cài)
qrencode -o test.png "50"
qrencode -o test.png '{"points":100}'
```

---

## ⚙️ Cấu hình trong Code

**File**: `App.js`

**Import**:
```javascript
import { CameraView, useCameraPermissions } from 'expo-camera';
```

**Hook**:
```javascript
const [permission, requestPermission] = useCameraPermissions();
```

**Hàm chính**:
- `handleScan()` - Mở camera
- `handleQRScanned(data)` - Xử lý dữ liệu QR

---

## 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|----------|
| Camera không mở | Chưa cấp quyền | Settings → Camera → Allow |
| "QR không hợp lệ" | Số <= 0 | Kiểm tra QR content |
| Quét không phản ứng | Độ sáng thấp | Nâng độ sáng, gần hơn |
| Đóng camera tự động | Lỗi xử lý | Nhấn "Bắt đầu quét" lại |

---

## 📱 Platform Support

| Platform | Hỗ trợ | Ghi chú |
|----------|--------|--------|
| 🍎 iOS | ✅ | iOS 13+ |
| 🤖 Android | ✅ | Android 5+ |
| 💻 Web | ❌ | Không hỗ trợ |

---

## 🎯 Tính năng

- ✅ Mở camera tự động
- ✅ Quét QR code in real-time
- ✅ Parse JSON hoặc số
- ✅ Cập nhật điểm tức thì
- ✅ Tính CO₂ tiết kiệm
- ✅ Lưu lịch sử
- ✅ Animation phản hồi
- ✅ Xử lý lỗi toàn diện

---

## 📚 Tài liệu

- **QR_CODE_GUIDE.md** - Hướng dẫn chi tiết
- **QR_FEATURE_SUMMARY.md** - Tóm tắt cập nhật
- **QR_TEST_GUIDE.sh** - Hướng dẫn test

---

## 🚀 Next Steps

1. **Test quét trên điện thoại thật**
   ```
   npm start → iOS/Android
   ```

2. **Tạo QR code cho các máy tái chế**
   ```
   https://www.qr-code-generator.com/
   ```

3. **In dán QR code trên máy**
   ```
   CS1: {"points":75,"machineId":"CS1"}
   CS2: {"points":50,"machineId":"CS2"}
   KTX: {"points":100,"machineId":"KTX_A"}
   ```

4. **Tích hợp Backend (tùy chọn)**
   ```
   POST /api/qr/validate
   { "qrCode": "50", "machineId": "CS1" }
   ```

---

**Status**: ✅ Ready to Deploy
**Version**: 1.0.0
**Last Updated**: December 7, 2025
