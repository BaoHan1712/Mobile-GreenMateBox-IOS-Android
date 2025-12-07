# 🔧 Tài liệu Kỹ Thuật - Chức năng Quét QR Code

## 📋 Tổng Quan Kỹ Thuật

### Architecture
```
App.js (Main)
├── Import expo-camera
├── useCameraPermissions Hook
├── handleScan() - Quản lý camera
├── handleQRScanned(data) - Xử lý QR data
└── renderScan() - UI cho Scan tab
    ├── CameraView (Live feed)
    ├── Camera Controls (Close btn)
    └── Result Card (Show points)
```

### State Management
```javascript
// Camera states
const [permission, requestPermission] = useCameraPermissions();
const [qrScanned, setQrScanned] = useState(false);

// Existing states (reused)
const [isScanning, setIsScanning] = useState(false);
const [scanResult, setScanResult] = useState(null);
const [points, setPoints] = useState(initialValue);
const [bottles, setBottles] = useState(initialValue);
const [co2, setCo2] = useState(initialValue);
const [walletHistory, setWalletHistory] = useState([]);
```

---

## 🎬 Flow Diagram

```
User Action
    ↓
handleScan()
    ├─ Check permission
    ├─ Request permission if needed
    ├─ Open CameraView
    └─ Show camera overlay
         ↓
    QR Code Detected
         ↓
    handleQRScanned(data)
         ├─ Check if already scanned (qrScanned flag)
         ├─ Parse JSON or Integer
         ├─ Validate (points > 0)
         ├─ Calculate bottles & CO₂
         ├─ Show result (1.5s delay)
         ├─ Update state (points, bottles, co2)
         └─ Log to walletHistory
```

---

## 💻 Code Details

### 1. Import Camera Module
```javascript
import { CameraView, useCameraPermissions } from 'expo-camera';
```

**Why**:
- `CameraView`: Display camera feed
- `useCameraPermissions`: Check/request camera access

---

### 2. Initialize Camera Hook
```javascript
const [permission, requestPermission] = useCameraPermissions();
const [qrScanned, setQrScanned] = useState(false);
```

**Purpose**:
- `permission`: { granted: boolean, canAskAgain: boolean }
- `requestPermission()`: Show permission dialog
- `qrScanned`: Prevent multiple scan triggers

---

### 3. handleScan() Function
```javascript
const handleScan = async () => {
  // Check if permission exists
  if (!permission) {
    requestPermission();
    return;
  }
  
  // Ask for permission if needed
  if (permission && !permission.granted && permission.canAskAgain) {
    requestPermission();
    return;
  }

  // Open camera if granted
  if (permission && permission.granted) {
    setIsScanning(true);
    setScanResult(null);
    setQrScanned(false);
  } else {
    Alert.alert('Quyền truy cập', '...');
  }
};
```

**Logic**:
1. If no permission object → Request
2. If not granted but can ask → Request
3. If granted → Open camera
4. If denied → Show alert

---

### 4. handleQRScanned(data) Function
```javascript
const handleQRScanned = (data) => {
  // 1. Prevent multiple scans
  if (qrScanned) return;
  setQrScanned(true);

  try {
    // 2. Parse QR data
    let earnedPoints = 0;
    
    // Try JSON first
    try {
      const parsed = JSON.parse(data);
      earnedPoints = parseInt(parsed.points) || parseInt(data) || 0;
    } catch {
      // Fallback to integer
      earnedPoints = parseInt(data) || 0;
    }

    // 3. Validate
    if (earnedPoints <= 0) {
      Alert.alert('QR code không hợp lệ', '...');
      setIsScanning(false);
      setQrScanned(false);
      return;
    }

    // 4. Calculate and display result
    setTimeout(() => {
      const avgBottlePoints = 5;
      const estimatedBottles = Math.floor(earnedPoints / avgBottlePoints);

      setScanResult({ 
        bottles: estimatedBottles, 
        cans: 0, 
        points: earnedPoints, 
        co2: (estimatedBottles * 0.08).toFixed(2),
        qrData: data 
      });

      // 5. Update state after 2 seconds
      setTimeout(() => {
        setPoints(p => p + earnedPoints);
        setBottles(b => b + estimatedBottles);
        setCo2(c => parseFloat((c + parseFloat(estimatedBottles * 0.08)).toFixed(2)));
        setIsScanning(false);
        
        // 6. Log to history
        const historyEntry = {
          id: Date.now(),
          type: 'Quét QR',
          item: `Máy rác #${data.slice(0, 8)}`,
          points: earnedPoints,
          date: new Date().toLocaleString(),
          status: 'Hoàn tất'
        };
        setWalletHistory(prev => [historyEntry, ...prev].slice(0, 20));
      }, 2000);
    }, 1500);
  } catch (error) {
    console.error('Error parsing QR:', error);
    Alert.alert('Lỗi', 'Không thể xử lý QR code này');
    setIsScanning(false);
    setQrScanned(false);
  }
};
```

**Flow**:
1. ✅ Check if already scanned
2. 🔍 Try JSON parse, fallback to int
3. ✔️ Validate points > 0
4. 📊 Calculate bottles and CO₂
5. ⏳ Wait 1.5s (show spinner)
6. 📝 Update state & history

---

### 5. renderScan() UI Component

#### Camera View (When scanning)
```javascript
{isScanning && permission?.granted ? (
  <View style={{ flex: 1, width: '100%' }}>
    <CameraView
      style={StyleSheet.absoluteFillObject}
      facing="back"
      onBarcodeScanned={({ data }) => handleQRScanned(data)}
      barcodeScannerSettings={{
        barcodeTypes: ['qr'],
      }}
    />
    
    {/* Overlay UI */}
    <View style={styles.cameraOverlay}>
      <TouchableOpacity style={styles.cameraCloseBtn}>
        {/* Close button */}
      </TouchableOpacity>
      
      <View style={styles.cameraFrameGuide} />
      
      <View style={styles.cameraInstructions}>
        {/* Instructions */}
      </View>
      
      {scanResult && (
        <View style={styles.scanFeedback}>
          {/* Success feedback */}
        </View>
      )}
    </View>
  </View>
) : (
  // Result card
)}
```

**CameraView Props**:
- `facing="back"`: Use rear camera
- `onBarcodeScanned`: Callback when QR detected
- `barcodeScannerSettings`: QR only (not other barcodes)

#### Result Card (When not scanning)
```javascript
<GlassCard>
  {isScanning && !permission?.granted ? (
    // Loading spinner
  ) : scanResult ? (
    // Show result: +50 ĐIỂM THƯỞNG
  ) : (
    // Initial state: QR icon + scan line
  )}
</GlassCard>
```

---

## 🎨 Styles Reference

### Camera Overlay
```javascript
cameraOverlay: {
  flex: 1,
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  justifyContent: 'space-between',
  paddingTop: 30,
  paddingBottom: 60
}
```

### Camera Frame Guide
```javascript
cameraFrameGuide: {
  width: 280,
  height: 280,
  borderRadius: 20,
  borderWidth: 3,
  borderColor: COLORS.success, // Green
  backgroundColor: 'transparent',
  shadowColor: COLORS.success,
  shadowOpacity: 0.3,
  shadowRadius: 20,
  elevation: 5
}
```

### Camera Instructions
```javascript
cameraInstructions: {
  position: 'absolute',
  bottom: 100,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 20
}
```

---

## 📊 Data Structure

### Scan Result Object
```javascript
scanResult = {
  points: 50,              // From QR code
  bottles: 10,             // Calculated: points / 5
  cans: 0,                 // Reserved
  co2: "0.80",             // String: bottles * 0.08
  qrData: "50"             // Original QR content
}
```

### Wallet History Entry
```javascript
historyEntry = {
  id: 1733595045000,                      // Timestamp
  type: 'Quét QR',                        // Transaction type
  item: 'Máy rác #50',                    // Description
  points: 50,                             // Amount
  date: '2025-12-07 14:30:45',           // Formatted date
  status: 'Hoàn tất'                      // Status
}
```

---

## 🔄 State Transitions

```
Initial State:
- isScanning: false
- scanResult: null
- qrScanned: false

↓ User tap "Bắt đầu quét"

handleScan():
- isScanning: true
- scanResult: null
- qrScanned: false
- CameraView opens

↓ QR Code detected

handleQRScanned(data):
- qrScanned: true (prevent duplicate)
- Parse & validate data
- Wait 1.5s (show spinner)

↓ 1.5s passed

setScanResult():
- Show result card
- Wait 2s

↓ 2s passed

Update States:
- points += earnedPoints
- bottles += estimatedBottles
- co2 += savingCo2
- walletHistory += entry
- isScanning: false

↓ Show result card

User tap "Quét tiếp" or "Thoát"
- Reset states
- Scan again or back to home
```

---

## ⚠️ Error Handling

### Validation
```javascript
// 1. QR Parse Error
try {
  const parsed = JSON.parse(data);
  earnedPoints = parseInt(parsed.points) || parseInt(data) || 0;
} catch {
  earnedPoints = parseInt(data) || 0;
}

// 2. Invalid Points
if (earnedPoints <= 0) {
  Alert.alert('QR code không hợp lệ', 'QR code phải chứa số điểm > 0');
  return;
}

// 3. Permission Denied
if (permission && !permission.granted) {
  Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập camera...');
}

// 4. Duplicate Scan
if (qrScanned) return; // Prevent multiple triggers
```

---

## 📈 Performance Considerations

1. **Debounce Scans**: `qrScanned` flag prevents processing same QR twice
2. **Async Timeout**: setTimeout for smooth UI updates
3. **State Batching**: Update multiple states together
4. **History Limit**: Keep only last 20 transactions (`slice(0, 20)`)

---

## 🔐 Security Notes

- ❌ **No server validation**: Client-side only (for now)
- ❌ **QR not encrypted**: Can be forged
- ⚠️ **Points not verified**: Any QR with number = valid

### Future Improvements:
- ✅ Backend validation API
- ✅ Machine ID verification
- ✅ QR signature/hash
- ✅ Rate limiting per machine
- ✅ Audit log on server

---

## 🧪 Testing Checklist

- [ ] Test with simple number: `50`
- [ ] Test with JSON: `{"points":100}`
- [ ] Test invalid (negative): `-50`
- [ ] Test invalid (zero): `0`
- [ ] Test invalid (non-numeric): `abc`
- [ ] Test permission denied
- [ ] Test rapid scans (should prevent duplicates)
- [ ] Test result display
- [ ] Test wallet history update
- [ ] Test rotation (portrait/landscape)
- [ ] Test on iOS 13+
- [ ] Test on Android 5+

---

## 📚 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| expo-camera | ^15.0.12 | Camera access |
| react | 19.1.0 | React hooks |
| react-native | 0.81.5 | Native UI |

---

## 🚀 Deployment

### Prerequisites
```bash
npm install expo-camera
```

### Build
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Local
expo prebuild
expo run:ios
expo run:android
```

### Configuration
```json
// app.json (if needed)
{
  "expo": {
    "plugins": [
      ["expo-camera", {}]
    ]
  }
}
```

---

**Version**: 1.0.0
**Last Updated**: December 7, 2025
**Status**: Production Ready
