# 🔧 Hướng dẫn Quét QR Code - GreenMate Box

## Tổng quan
Chức năng quét QR code cho phép người dùng quét mã QR trên các máy tái chế rác để nhận điểm thưởng.

## Format QR Code

QR code cần chứa một trong hai định dạng sau:

### 1. **Chỉ số điểm (Đơn giản)**
```
50
100
250
```
Ứng dụng sẽ lấy số này làm điểm thưởng

### 2. **JSON Format (Tùy chọn)**
```json
{
  "points": 50,
  "machineId": "CS1_LAC_HONG"
}
```
Ứng dụng sẽ lấy giá trị `points`

## Cách Sử Dụng

### Bước 1: Nhấn nút "Bắt đầu quét"
- Ứng dụng sẽ yêu cầu quyền truy cập camera
- Cho phép quyền camera

### Bước 2: Hướng camera vào QR code
- Giữ máy ở khoảng cách 15-30cm từ QR code
- Đảm bảo QR code nằm trong khung xanh

### Bước 3: Quét tự động
- Ứng dụng tự động nhận diện QR code
- Hiển thị thông báo "✓ Quét thành công!"
- Cập nhật điểm tích lũy

## Kết quả Quét

Sau khi quét thành công, ứng dụng sẽ:
1. ✅ Cộng điểm vào tổng Eco Points
2. 📊 Cập nhật số chai nhựa dự kiến
3. 💨 Tính toán CO₂ tiết kiệm
4. 📝 Thêm vào lịch sử giao dịch

### Tính toán tự động
- **1 điểm = ~0.2 chai nhựa** (ước lượng)
- **CO₂ tiết kiệm = số chai × 0.08kg**

## Yêu cầu Quyền

Ứng dụng cần:
- ✅ **Camera Permission**: Để mở camera quét QR
- ✅ **Quyền truy cập máy ảnh**: Cho phép trong cài đặt ứng dụng

## Lỗi Thường Gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|------------|---------|
| "QR code không hợp lệ" | QR chứa số âm hoặc 0 | Quét lại, đảm bảo số > 0 |
| Camera không mở | Chưa cấp quyền camera | Vào Settings → Cho phép Camera |
| Quét không phản ứng | QR code không rõ | Di chuyển gần hơn, nâng độ sáng |
| "Lỗi xử lý QR" | Format sai | Kiểm tra format QR theo hướng dẫn |

## Tạo QR Code Cho Máy Tái Chế

### Online Tools
- **QR Code Generator**: https://www.qr-code-generator.com/
- **QR Code Monkey**: https://www.qr-code-monkey.com/

### Bước tạo:
1. Chọn "Text/URL" hoặc "Custom"
2. Nhập số điểm hoặc JSON: `{"points": 50}`
3. Download hình ảnh QR
4. In dán trên máy tái chế

### Ví dụ QR Code Content
```
Máy CS1 ĐH Lạc Hồng: {"points": 75, "machineId": "CS1"}
Máy CS2 ĐH Lạc Hồng: {"points": 50, "machineId": "CS2"}
Máy Ký túc xá: {"points": 100, "machineId": "KTX_A"}
```

## Testing

### Cách kiểm tra trên Điện thoại
1. Mở ứng dụng GreenMate Box
2. Tải ảnh QR code lên và quét
3. Hoặc dùng **QR Scanner mobile** để tạo QR tạm thời

### Cách kiểm tra trên Emulator
- Tạo QR code từ online tools
- Dùng "camera mock" hoặc hình ảnh
- Hoặc test bằng adb (nếu emulator hỗ trợ)

## Ghi chú Kỹ Thuật

### Công nghệ sử dụng
- **expo-camera**: Mở camera
- **CameraView barcodeScannerSettings**: Quét QR tự động

### Lưu lịch sử
Mỗi lần quét QR thành công sẽ:
- Lưu vào `walletHistory`
- Ghi nhận thời gian quét
- Cập nhật points state

### Giới hạn
- ❌ Không hỗ trợ quét đa QR cùng lúc
- ✅ Tự động chặn quét lặp lại
- ✅ Hỗ trợ tất cả loại QR code có chữ/số

---

**Phát triển thêm**: Có thể tích hợp với server backend để:
- Xác thực QR code từ database
- Kiểm tra trạng thái máy tài chế
- Lưu lịch sử quét trên server
