import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  PanResponder,
  Image,
  Modal,
  Alert,
  StatusBar,
  Platform,
  Easing,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { 
  Scan, 
  Home, 
  Wallet, 
  BarChart3, 
  MapPin, 
  Recycle, 
  Zap, 
  Gift, 
  Leaf, 
  Award,
  ChevronRight,
  X,
  Lock,
  Star,
  Droplets,
  GhostIcon,
  GiftIcon,
  AwardIcon,
  Newspaper
} from 'lucide-react-native';
import { NewsScreen } from './news';

// --- CẤU HÌNH MÀU SẮC ---
const COLORS = {
  primary: '#34D399',
  textDark: '#064E3B',
  textLight: '#ECFDF5',
  glassWhite: 'rgba(255, 255, 255, 0.3)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const { width } = Dimensions.get('window');

// --- MOCK DATA ---
const MOCK_USER = {
  name: "Hàn Quốc Bảo",
  level: "Eco Warrior - Level 10",
  avatar: require('./assets/imgage/bao.png'), 
};


// Replace with an initial list that includes more positions:
const INITIAL_NEARBY_MACHINES = [
  { id: 1, name: "CS1 ĐH Lạc Hồng", status: "active", capacity: 80, types: ["PET", "ALU"], x: 100, y: 150 },
  { id: 2, name: "CS2 ĐH Lạc Hồng", status: "full", capacity: 5, types: ["PET"], x: 250, y: 300 },
  { id: 3, name: "CS3 ĐH Lạc Hồng", status: "maintenance", capacity: 0, types: ["PET", "ALU"], x: 420, y: 120 },
  { id: 4, name: "Ký túc xá Khu A", status: "active", capacity: 60, types: ["PET", "ALU"], x: 180, y: 450 },
  // extra static markers
  { id: 5, name: "Trạm Số 5", status: "active", capacity: 45, types: ["PET"], x: 130, y: 400 },
  { id: 6, name: "Trạm Số 6", status: "full", capacity: 2, types: ["ALU"], x: 520, y: 430 },
];

const MOCK_BADGES = [
  { id: 1, name: "Khởi đầu xanh", desc: "Đổi chai nhựa lần đầu tiên", color: '#FACC15', icon: Leaf, unlocked: true }, // Yellow
  { id: 2, name: "Chiến binh", desc: "Đạt mốc 1000 điểm Eco", color: '#10B981', icon: Award, unlocked: true }, // Emerald
  { id: 3, name: "Người BỐ ĐỜI", desc: "Mời 10 bạn tham gia", color: '#231aa4ff', icon: GhostIcon, unlocked: true }, // Red
  { id: 4, name: "Zero Waste", desc: "Không dùng rác thải nhựa 1 tuần", color: '#FB923C', icon: Recycle, unlocked: true }, // Orange
  { id: 5, name: "Bậc thầy nhôm", desc: "Tái chế 50 lon nhôm", color: '#9CA3AF', icon: Zap, unlocked: false }, // Gray
  { id: 6, name: "Siêu sao Eco", desc: "Đứng Top 1 BXH tuần", color: '#A855F7', icon: Star, unlocked: false }, // Purple
  { id: 7, name: "Lời thì thầm của ĐÁ", desc: "Quy đổi 10 cây xanh", color: '#16A34A', icon: Leaf, unlocked: false }, // Green
  { id: 8, name: "Người TRÊN MÂY", desc: "Mời 5 bạn tham gia", color: '#F87171', icon: Gift, unlocked: false }, // Red
  { id: 9, name: "Đại sứ biển", desc: "Quyên góp 5000đ cho biển", color: '#60A5FA', icon: Droplets, unlocked: false }, // Blue
  { id: 10, name: "ÁC WỦY PHI PHAI", desc: "Đổi 100 chai nhựa", color: '#ff5733ff', icon: AwardIcon, unlocked: false }, // Red

];

// Gifts with images from assets/imgage 
const GIFT_ITEMS = [
  { id: 'g1', name: 'Nhật BILI', cost: 1, img: require('./assets/imgage/nhat.png') },
  { id: 'g2', name: 'Kẹo trẻ em', cost: 10, img: require('./assets/imgage/keo.jpg') },
  { id: 'g3', name: 'túi giấy', cost: 50, img: require('./assets/imgage/tuiqua.png') },
  { id: 'g4', name: 'Tạ 2kg', cost: 200, img: require('./assets/imgage/ta.jpg') },
];

// --- COMPONENTS ---

// Glass Card Component
const GlassCard = ({ children, style, onPress }) => {
  // only use TouchableOpacity when onPress provided; otherwise use View
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.glassCard, style]} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.glassCard, style]}>{children}</View>;
};

// --- MAIN APP ---
export default function App() {
  // All Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Main App States
  const [activeTab, setActiveTab] = useState('Home');
  const [points, setPoints] = useState(1280);
  const [bottles, setBottles] = useState(42);
  const [cans, setCans] = useState(31);
  const [co2, setCo2] = useState(3.4);
  // Wallet history sample
  const [walletHistory, setWalletHistory] = useState([
    { id: 1, type: 'Nạp điểm', item: 'Tặng điểm đăng ký', points: 500, date: '2025-11-20 09:12', status: 'Hoàn tất' },
    { id: 2, type: 'Đổi quà', item: 'Bình nước tre', points: 400, date: '2025-11-25 15:30', status: 'Hoàn tất' },
    { id: 3, type: 'Đổi quà', item: 'Túi Canvas', points: 600, date: '2025-11-28 12:02', status: 'Hoàn tất' },
    { id: 4, type: 'Đổi quà', item: 'Thẻ xe bus', points: 800, date: '2025-12-01 18:20', status: 'Hoàn tất' },
    { id: 5, type: 'Hoạt động', item: 'Quét QR', points: 120, date: '2025-12-03 08:45', status: 'Hoàn tất' },
  ]);
  // Control wallet history modal visibility
  const [showWalletHistory, setShowWalletHistory] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState('Hàn Quốc Bảo');
  
  // State Modal & Scan
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showNews, setShowNews] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  // Map gestures: pan & pinch/zoom
  const mapPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const mapScale = useRef(new Animated.Value(1)).current;
  const lastPan = useRef({ x: 0, y: 0 });
  const lastScale = useRef(1);
  const initialPinchDistance = useRef(null);

  // helper: distance between two fingers for pinch gesture
  const getDistance = (t1, t2) => {
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        mapPan.setOffset({ x: lastPan.current.x, y: lastPan.current.y });
        mapPan.setValue({ x: 0, y: 0 });
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length === 2) {
          initialPinchDistance.current = getDistance(touches[0], touches[1]);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length === 2) {
          const dist = getDistance(touches[0], touches[1]);
          if (initialPinchDistance.current) {
            let scaleFactor = (dist / initialPinchDistance.current) * lastScale.current;
            if (scaleFactor < 0.6) scaleFactor = 0.6;
            if (scaleFactor > 3) scaleFactor = 3;
            mapScale.setValue(scaleFactor);
          }
        } else {
          mapPan.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        lastPan.current.x += gestureState.dx;
        lastPan.current.y += gestureState.dy;
        mapPan.flattenOffset();
        // store last scale
        try {
          // __getValue is supported by Animated.Value
          lastScale.current = mapScale.__getValue ? mapScale.__getValue() : lastScale.current;
        } catch (e) {}
        initialPinchDistance.current = null;
      }
    })
  ).current;

  useEffect(() => {
    // Intro Animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.exp), useNativeDriver: true })
    ]).start();

    // Scan Line Animation Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: true })
      ])
    ).start();

    // Spin Animation for loading
    Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const scanTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200] // Height of scan area
  });

  // --- LOGIC ---
  const [permission, requestPermission] = useCameraPermissions();
  const [qrScanned, setQrScanned] = useState(false);

  const handleScan = async () => {
    if (!permission) {
      requestPermission();
      return;
    }
    
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
      return;
    }

    if (permission && permission.granted) {
      setIsScanning(true);
      setScanResult(null);
      setQrScanned(false);
    } else {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập camera để quét QR code');
    }
  };

  const handleQRScanned = (data) => {
    if (qrScanned) return; // Prevent multiple scans
    setQrScanned(true);

    try {
      // Parse QR code data - expects format like "{"points":50}" or just a number
      let earnedPoints = 0;
      
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(data);
        earnedPoints = parseInt(parsed.points) || parseInt(data) || 0;
      } catch {
        // If not JSON, try to parse as number
        earnedPoints = parseInt(data) || 0;
      }

      if (earnedPoints <= 0) {
        Alert.alert('QR code không hợp lệ', 'QR code phải chứa số điểm > 0');
        setIsScanning(false);
        setQrScanned(false);
        return;
      }

      // Simulate processing time
      setTimeout(() => {
        // Calculate estimated items (for display purposes)
        const avgBottlePoints = 5;
        const estimatedBottles = Math.floor(earnedPoints / avgBottlePoints);

        setScanResult({ 
          bottles: estimatedBottles, 
          cans: 0, 
          points: earnedPoints, 
          co2: (estimatedBottles * 0.08).toFixed(2),
          qrData: data 
        });

        // Update points and stats after 2 seconds
        setTimeout(() => {
          setPoints(p => p + earnedPoints);
          setBottles(b => b + estimatedBottles);
          setCo2(c => parseFloat((c + parseFloat(estimatedBottles * 0.08)).toFixed(2)));
          setIsScanning(false);
          
          // Add to wallet history
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

  // Replace static NEARBY_MACHINES usage with state so markers can be added at runtime
  const [nearbyMachines, setNearbyMachines] = useState(INITIAL_NEARBY_MACHINES);

  // helper to add a marker at a random position (keeps demo simple)
  const addRandomMachine = () => {
    const id = Date.now();
    const x = Math.floor(Math.random() * 760) + 40; // within mapContent width
    const y = Math.floor(Math.random() * 640) + 20; // within mapContent height
    const newMachine = {
      id,
      name: `Vị trí ${id % 1000}`,
      status: ['active','full','maintenance'][Math.floor(Math.random() * 3)],
      capacity: Math.floor(Math.random() * 100),
      types: ['PET'],
      x,
      y
    };
    setNearbyMachines(prev => [...prev, newMachine]);
  };

  // Wallet: redeem handler
  const handleRedeem = (name, cost) => {
    // Not enough points
    if (points < cost) {
      const failedEntry = { id: Date.now(), type: 'Đổi quà', item: name, points: cost, date: new Date().toLocaleString(), status: 'Thất bại' };
      setWalletHistory(prev => [failedEntry, ...prev].slice(0, 20));
      Alert.alert('Không đủ Eco', `Bạn cần ${cost} Eco nhưng hiện có ${points} Eco.`);
      return;
    }

    // Deduct and add success history
    setPoints(p => p - cost);
    const newEntry = { id: Date.now(), type: 'Đổi quà', item: name, points: cost, date: new Date().toLocaleString(), status: 'Hoàn tất' };
    setWalletHistory(prev => [newEntry, ...prev].slice(0, 20));

    // Notify user
    Alert.alert('Đổi quà thành công', `Bạn đã đổi ${name} và trừ ${cost} Eco.`);
  };

  // --- RENDERS ---

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.appName}>GREENMATE BOX</Text>
        <Text style={styles.welcomeText}>Xin chào, {editName}!</Text>
      </View>
      <TouchableOpacity style={styles.avatarContainer} onPress={() => setShowProfileModal(true)}>
        <Image source={MOCK_USER.avatar} style={styles.avatar} />
        <View style={styles.onlineDot} />
      </TouchableOpacity>
    </View>
  );

  const renderDashboard = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {renderHeader()}

      {/* News Button */}
      <TouchableOpacity 
        style={styles.newsButton}
        onPress={() => setShowNews(true)}
      >
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          style={styles.newsButtonGradient}
        >
          <Newspaper size={24} color="white" />
          <View style={styles.newsButtonContent}>
            <Text style={styles.newsButtonTitle}>📰 Tin Tức Môi Trường</Text>
            <Text style={styles.newsButtonSubtitle}>Cập nhật những tin mới nhất</Text>
          </View>
          <ChevronRight size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Main Card */}
      <View style={styles.mainCardShadow}>
        <LinearGradient
          colors={['#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          {/* Decorative Circles */}
          <View style={[styles.decorCircle, { top: -20, right: -20, width: 100, height: 100 }]} />
          <View style={[styles.decorCircle, { bottom: -20, left: -20, width: 80, height: 80 }]} />

          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>TỔNG ĐIỂM TÍCH LŨY</Text>
            <View style={styles.iconBg}>
              <Recycle size={18} color="white" />
            </View>
          </View>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsUnit}>PTS</Text>
          </View>

          <View style={styles.levelContainer}>
            <View style={styles.levelBarBg}>
              <View style={[styles.levelBarFill, { width: '80%' }]} />
            </View>
            <Text style={styles.levelText}>{MOCK_USER.level}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Grid Stats */}
      <View style={styles.gridContainer}>
        {[
          { label: 'Chai nhựa', val: bottles, icon: Leaf, color: '#16A34A', bg: '#DCFCE7' },
          { label: 'Lon nhôm', val: cans, icon: Zap, color: '#2563EB', bg: '#DBEAFE' },
          { label: 'CO₂ Giảm', val: `${co2}kg`, icon: Award, color: '#EA580C', bg: '#FFEDD5' },
        ].map((item, idx) => (
          <GlassCard key={idx} style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: item.bg }]}>
              <item.icon size={22} color={item.color} />
            </View>
            <Text style={styles.statLabel}>{item.label}</Text>
            <Text style={styles.statValue}>{item.val}</Text>
          </GlassCard>
        ))}
      </View>

      {/* Achievements Section */}
      <GlassCard style={styles.achievementCard}>
        <View style={styles.sectionHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Award size={20} color="#D97706" style={{marginRight: 8}} />
            <Text style={styles.sectionTitle}>Thành tích</Text>
          </View>
          <TouchableOpacity 
            style={styles.seeAllBtn}
            onPress={() => setShowAllBadges(true)}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <ChevronRight size={14} color="#047857" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingVertical: 10}}>
          {MOCK_BADGES.slice(0, 3).map((badge, idx) => (
            <View key={idx} style={styles.badgeItemHorizontal}>
              <View style={[styles.badgeIconBg, { backgroundColor: badge.color }]}>
                <badge.icon size={24} color="white" />
              </View>
              <Text numberOfLines={2} style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => setShowAllBadges(true)} style={styles.moreBadgeBtn}>
             <View style={styles.moreBadgeCircle}>
                <Text style={styles.moreBadgeText}>+{MOCK_BADGES.length - 3}</Text>
             </View>
             <Text style={styles.moreBadgeLabel}>Xem thêm</Text>
          </TouchableOpacity>
        </ScrollView>
      </GlassCard>
    </ScrollView>
  );

  const renderScan = () => (
    <View style={styles.centerContent}>
      {isScanning && permission?.granted ? (
        // Camera view for QR scanning
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
            {/* Close button */}
            <TouchableOpacity 
              style={styles.cameraCloseBtn}
              onPress={() => {
                setIsScanning(false);
                setQrScanned(false);
              }}
            >
              <X size={28} color="white" />
            </TouchableOpacity>

            {/* Frame guide */}
            <View style={styles.cameraFrameGuide} />

            {/* Instructions */}
            <View style={styles.cameraInstructions}>
              <Text style={styles.cameraInstructionsText}>
                Hướng máy ảnh vào mã QR trên máy tái chế
              </Text>
            </View>

            {/* Scan feedback */}
            {scanResult && (
              <View style={styles.scanFeedback}>
                <Text style={styles.scanFeedbackText}>✓ Quét thành công!</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        // Result/info card
        <GlassCard style={styles.scanContainer}>
          <Text style={styles.sectionTitleLarge}>Quét Mã QR</Text>
          <Text style={styles.scanSubtitle}>Kết nối với máy GreenMate Box gần nhất</Text>
          
          <View style={styles.qrFrame}>
            {isScanning && !permission?.granted ? (
              <View style={{ alignItems: 'center' }}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Recycle size={60} color={COLORS.primary} />
                </Animated.View>
                <Text style={styles.scanningText}>Đang xử lý...</Text>
              </View>
            ) : scanResult ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.rewardPoints}>+{scanResult.points}</Text>
                <Text style={styles.rewardLabel}>ĐIỂM THƯỞNG</Text>
                <View style={styles.rewardDetails}>
                   <Text style={styles.rewardDetailText}>🍾 {scanResult.bottles}</Text>
                   <View style={styles.dividerV} />
                   <Text style={styles.rewardDetailText}>💨 {scanResult.co2}kg CO₂</Text>
                </View>
              </View>
            ) : (
              <>
                <Scan size={100} color="rgba(6, 78, 59, 0.2)" />
                <Animated.View 
                  style={[
                    styles.scanLine, 
                    { transform: [{ translateY: scanTranslateY }] }
                  ]} 
                />
              </>
            )}
          </View>

          {!isScanning && (
            <TouchableOpacity 
              style={styles.mainBtn} 
              onPress={handleScan}
            >
              {scanResult ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Recycle size={20} color="white" style={{marginRight: 8}}/>
                  <Text style={styles.mainBtnText}>Quét tiếp</Text>
                </View>
              ) : (
                 <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Scan size={20} color="white" style={{marginRight: 8}}/>
                  <Text style={styles.mainBtnText}>Bắt đầu quét</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </GlassCard>
      )}
    </View>
  );

  const renderWallet = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
       <Text style={styles.screenTitle}>Ví Eco</Text>
       <View style={styles.walletCardShadow}>
         <LinearGradient
            colors={['#065F46', '#115E59']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.walletCard}
         >
           <Text style={styles.walletLabel}>SỐ DƯ KHẢ DỤNG</Text>
           <View style={{ flexDirection: 'row', alignItems: 'baseline', marginVertical: 10 }}>
              <Text style={styles.walletValue}>{points}</Text>
              <Text style={styles.walletUnit}>Eco</Text>
           </View>
           <View style={styles.walletActions}>
                  <TouchableOpacity style={styles.walletBtnSecondary} onPress={() => setShowWalletHistory(true)}><Text style={styles.walletBtnTextSecondary}>Lịch sử</Text></TouchableOpacity>
              {/* <TouchableOpacity style={styles.walletBtnPrimary}><Text style={styles.walletBtnTextPrimary}>Nạp điểm</Text></TouchableOpacity> */}
           </View>
         </LinearGradient>
       </View>

      {/* History is now available via the 'Lịch sử' button to avoid showing it inline */}

       <Text style={styles.sectionTitle}>Đổi quà hot</Text>
       <View style={styles.gridContainer}>
          {GIFT_ITEMS.map((item, idx) => (
            <GlassCard key={item.id} style={styles.giftCard}>
               <View style={styles.giftIconBg}>
                  <Image source={item.img} style={styles.giftImage} resizeMode="contain" />
               </View>
               <View style={{padding: 12}}>
                 <Text style={styles.giftName}>{item.name}</Text>
                 <Text style={styles.giftPrice}>{item.cost} điểm</Text>
                 <TouchableOpacity style={styles.redeemBtn} onPress={() => handleRedeem(item.name, item.cost)}>
                   <Text style={styles.redeemBtnText}>Đổi ngay ({item.cost})</Text>
                 </TouchableOpacity>
               </View>
            </GlassCard>
          ))}
       </View>
    </ScrollView>
  );

  const renderStats = () => {
    const statsData = [
      { label: 'T2', value: 45, maxValue: 100 },
      { label: 'T3', value: 62, maxValue: 100 },
      { label: 'T4', value: 58, maxValue: 100 },
      { label: 'T5', value: 78, maxValue: 100 },
      { label: 'T6', value: 85, maxValue: 100 },
      { label: 'T7', value: 72, maxValue: 100 },
      { label: 'CN', value: 90, maxValue: 100 },
    ];

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.screenTitle}>Thống kê tuần</Text>

        {/* Main Stats Card */}
        <GlassCard style={[styles.statsMainCard, { marginBottom: 20 }]}>
          <View style={styles.statsMainHeader}>
            <View>
              <Text style={styles.statsMainLabel}>TỔNG LƯỢT ĐỔI TUẦN NÀY</Text>
              <Text style={styles.statsMainValue}>42</Text>
            </View>
            <View style={styles.statsMainIcon}>
              <BarChart3 size={32} color={COLORS.primary} />
            </View>
          </View>

          <View style={styles.statsMainDivider} />

          <View style={styles.statsMainRow}>
            <View style={styles.statsMainItem}>
              <Text style={styles.statsMainItemLabel}>Tăng từ tuần trước</Text>
              <View style={styles.statsMainItemValue}>
                <Zap size={14} color={COLORS.success} style={{ marginRight: 4 }} />
                <Text style={[styles.statsMainItemNumber, { color: COLORS.success }]}>+12%</Text>
              </View>
            </View>
            <View style={[styles.statsMainItem, { borderLeftWidth: 1, borderLeftColor: 'rgba(0,0,0,0.1)', paddingLeftWidth: 15 }]}>
              <Text style={styles.statsMainItemLabel}>Ranking</Text>
              <View style={styles.statsMainItemValue}>
                <Star size={14} color={COLORS.warning} style={{ marginRight: 4 }} />
                <Text style={[styles.statsMainItemNumber, { color: COLORS.warning }]}>Top 5</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Bar Chart */}
        <GlassCard style={{ padding: 20, marginBottom: 20 }}>
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.statsChartTitle}>Lượt đổi hàng ngày</Text>
            <Text style={styles.statsChartSubtitle}>Theo tuần (Thứ 2 - Chủ nhật)</Text>
          </View>

          <View style={styles.barChartContainer}>
            {statsData.map((item, idx) => (
              <View key={idx} style={styles.barChartItem}>
                <View style={styles.barChartBar}>
                  <Animated.View
                    style={[
                      styles.barFill,
                      {
                        height: `${(item.value / item.maxValue) * 100}%`,
                        backgroundColor: item.value >= 70 ? COLORS.success : item.value >= 50 ? COLORS.warning : COLORS.danger,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barChartLabel}>{item.label}</Text>
                <Text style={styles.barChartValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Performance Metrics */}
        <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Chi tiết hoạt động</Text>

        <GlassCard style={{ padding: 0, overflow: 'hidden', marginBottom: 15 }}>
          <View style={styles.metricItem}>
            <View style={[styles.metricIconBg, {backgroundColor: '#DBEAFE'}]}>
              <Leaf size={20} color="#2563EB" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Chai nhựa</Text>
              <Text style={styles.metricValue}>198 cái</Text>
            </View>
            <View style={styles.metricTrend}>
              <View style={[styles.trendBadge, { backgroundColor: '#DBEAFE' }]}>
                <Zap size={12} color="#2563EB" style={{ marginRight: 2 }} />
                <Text style={[styles.trendText, { color: '#2563EB' }]}>+24%</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <View style={[styles.metricIconBg, {backgroundColor: '#FEE2E2'}]}>
              <Zap size={20} color={COLORS.danger} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Lon nhôm</Text>
              <Text style={styles.metricValue}>127 cái</Text>
            </View>
            <View style={styles.metricTrend}>
              <View style={[styles.trendBadge, { backgroundColor: '#FEE2E2' }]}>
                <Zap size={12} color={COLORS.danger} style={{ marginRight: 2 }} />
                <Text style={[styles.trendText, { color: COLORS.danger }]}>+18%</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <View style={[styles.metricIconBg, {backgroundColor: '#FFEDD5'}]}>
              <Droplets size={20} color="#EA580C" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>CO₂ đã giảm</Text>
              <Text style={styles.metricValue}>52.3 kg</Text>
            </View>
            <View style={styles.metricTrend}>
              <View style={[styles.trendBadge, { backgroundColor: '#FFEDD5' }]}>
                <Zap size={12} color="#EA580C" style={{ marginRight: 2 }} />
                <Text style={[styles.trendText, { color: '#EA580C' }]}>+31%</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <View style={[styles.metricIconBg, {backgroundColor: '#DCFCE7'}]}>
              <Leaf size={20} color={COLORS.success} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>Cây xanh trồng</Text>
              <Text style={styles.metricValue}>26 cây</Text>
            </View>
            <View style={styles.metricTrend}>
              <View style={[styles.trendBadge, { backgroundColor: '#DCFCE7' }]}>
                <Zap size={12} color={COLORS.success} style={{ marginRight: 2 }} />
                <Text style={[styles.trendText, { color: COLORS.success }]}>+15%</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Recent Activities */}
        <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Hoạt động gần đây</Text>

        <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, {backgroundColor: '#DBEAFE'}]}>
              <Recycle size={18} color="#2563EB" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Đổi 5 chai nhựa</Text>
              <Text style={styles.activityTime}>Hôm nay - 14:30</Text>
            </View>
            <Text style={styles.activityPoints}>+25</Text>
          </View>

          <View style={styles.activityDivider} />

          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, {backgroundColor: '#FEE2E2'}]}>
              <Gift size={18} color={COLORS.danger} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Đổi quà - Bình nước</Text>
              <Text style={styles.activityTime}>Hôm qua - 10:15</Text>
            </View>
            <Text style={[styles.activityPoints, { color: COLORS.danger }]}>-400</Text>
          </View>

          <View style={styles.activityDivider} />

          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, {backgroundColor: '#FFEDD5'}]}>
              <Award size={18} color="#EA580C" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Mở khóa huy hiệu</Text>
              <Text style={styles.activityTime}>2 ngày trước</Text>
            </View>
            <Text style={[styles.activityPoints, { color: '#EA580C' }]}>🔓</Text>
          </View>

          <View style={styles.activityDivider} />

          <View style={styles.activityItem}>
            <View style={[styles.activityIconBg, {backgroundColor: '#DCFCE7'}]}>
              <Leaf size={18} color={COLORS.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Trồng cây xanh</Text>
              <Text style={styles.activityTime}>3 ngày trước</Text>
            </View>
            <Text style={[styles.activityPoints, { color: COLORS.success }]}>+1 cây</Text>
          </View>
        </GlassCard>
      </ScrollView>
    );
  };

  const renderMap = () => {
    const animatedStyle = {
      transform: [
        { translateX: mapPan.x },
        { translateY: mapPan.y },
        { scale: mapScale }
      ]
    };

    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.screenTitle}>Máy gần bạn</Text>

        <View style={styles.mapMockContainer}>
          {/* Controls (zoom badge / reset / add) */}
          <View style={styles.mapControlsRow} pointerEvents="box-none">
            <View style={styles.zoomBadge}>
              <Text style={styles.zoomBadgeText}>{Math.round((lastScale.current || 1) * 100)}%</Text>
            </View>

            <TouchableOpacity
              style={styles.mapAddBtn}
              onPress={addRandomMachine}
            >
              <Text style={styles.mapAddText}>Thêm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.zoomResetBtn}
              onPress={() => {
                // reset transforms
                Animated.spring(mapScale, { toValue: 1, useNativeDriver: false }).start(() => {
                  lastScale.current = 1;
                });
                Animated.spring(mapPan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start(() => {
                  lastPan.current = { x: 0, y: 0 };
                  mapPan.setValue({ x: 0, y: 0 });
                });
              }}
            >
              <Text style={styles.zoomResetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Animated map content: supports pan & pinch */}
          <Animated.View
            style={[styles.mapContent, animatedStyle]}
            {...panResponder.panHandlers}
          >
            {/* Improved map background and decor */}
            <LinearGradient colors={["#E6FFFB", "#ECFDF5"]} style={styles.mapBgImproved}>
              <View style={[styles.road, { top: '25%' }]} />
              <View style={[styles.road, { top: '60%' }]} />
              <View style={[styles.roadVertical, { left: '40%' }]} />

              {/* soft land patches */}
              <View style={[styles.landPatch, { left: 40, top: 40, backgroundColor: 'rgba(22,163,74,0.06)' }]} />
              <View style={[styles.landPatch, { right: 30, top: 200, backgroundColor: 'rgba(96,165,250,0.06)' }]} />
            </LinearGradient>

            {/* Map markers - now uses state nearbyMachines */}
            {nearbyMachines.map((machine) => (
              <TouchableOpacity
                key={machine.id}
                style={[styles.mapMarker, { left: machine.x, top: machine.y }]}
                activeOpacity={0.9}
                onPress={() =>
                  Alert.alert(
                    machine.name,
                    `Trạng thái: ${machine.status}\nSức chứa: ${machine.capacity}%\nLoại: ${machine.types.join(', ')}`
                  )
                }
              >
                <View style={styles.markerIconWrap}>
                  <MapPin
                    size={28}
                    fill={machine.status === 'active' ? COLORS.success : machine.status === 'full' ? COLORS.warning : COLORS.danger}
                    color="white"
                  />
                </View>
                <View style={styles.markerLabelFloating}>
                  <Text style={styles.markerLabelText} numberOfLines={3} ellipsizeMode="tail">
                    {machine.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* User location centralized */}
            <View style={[styles.userLocation, styles.userLocationImproved]}>
              <View style={styles.userPulse} />
              <View style={styles.userDot} />
            </View>
          </Animated.View>

          {/* Hint */}
          <View style={styles.mapHint} pointerEvents="none">
            <Text style={styles.mapHintText}>Pinch to zoom • Drag to pan</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLogin = () => {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#ECFDF5', '#F0FDF4', '#FFFFFF']}
          style={styles.background}
        />

        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.authContainer}>
            {/* Logo & Title */}
            <View style={styles.authLogoSection}>
              <View style={styles.authLogoBg}>
                <Recycle size={56} color="white" />
              </View>
              <Text style={styles.authAppName}>GREENMATE BOX</Text>
              <Text style={styles.authSubtitle}>Bảo vệ môi trường, nhận thưởng</Text>
            </View>

            {/* Login Form */}
            <View style={styles.authFormSection}>
              <Text style={styles.authFormTitle}>Đăng Nhập</Text>

              {/* Email Input */}
              <View style={styles.authInputGroup}>
                <Text style={styles.authInputLabel}>Email</Text>
                <View style={styles.authInputContainer}>
                  <Text style={styles.authInputIcon}>✉️</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.authInputGroup}>
                <Text style={styles.authInputLabel}>Mật khẩu</Text>
                <View style={styles.authInputContainer}>
                  <Text style={styles.authInputIcon}>🔐</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.authMainBtn}
                disabled={isAuthLoading}
                onPress={async () => {
                  if (!loginEmail || !loginPassword) {
                    Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
                    return;
                  }

                  setIsAuthLoading(true);
                  try {
                    const response = await fetch('http://192.168.1.2:5000/api/auth/login', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        email: loginEmail,
                        password: loginPassword,
                      }),
                    });

                    const data = await response.json();

                    if (data.success) {
                      setEditName(data.user.name);
                      setIsAuthenticated(true);
                      setLoginEmail('');
                      setLoginPassword('');
                      Alert.alert('Thành công', `Chào mừng ${data.user.name}!`);
                    } else {
                      Alert.alert('Lỗi đăng nhập', data.message || 'Đăng nhập thất bại');
                    }
                  } catch (error) {
                    Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server. Kiểm tra IP server: 192.168.1.2:5000');
                    console.error('Login error:', error);
                  } finally {
                    setIsAuthLoading(false);
                  }
                }}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.authMainBtnGradient}
                >
                  <Text style={styles.authMainBtnText}>{isAuthLoading ? '⏳ Đang xử lý...' : 'Đăng Nhập'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.authForgotBtn}>
                <Text style={styles.authForgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.authDivider}>
              <View style={styles.authDividerLine} />
              <Text style={styles.authDividerText}>hoặc</Text>
              <View style={styles.authDividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.authSocialSection}>
              <TouchableOpacity style={styles.authSocialBtn}>
                <Text style={styles.authSocialIcon}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.authSocialBtn}>
                <Text style={styles.authSocialIcon}>f</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.authSocialBtn}>
                <Text style={styles.authSocialIcon}>🍎</Text>
              </TouchableOpacity>
            </View>

            {/* Switch to Signup */}
            <View style={styles.authSwitchContainer}>
              <Text style={styles.authSwitchText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => {
                setAuthMode('signup');
                setLoginEmail('');
                setLoginPassword('');
              }}>
                <Text style={styles.authSwitchLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  };

  const renderSignup = () => {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#ECFDF5', '#F0FDF4', '#FFFFFF']}
          style={styles.background}
        />

        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.authContainer}>
            {/* Logo & Title */}
            <View style={styles.authLogoSection}>
              <View style={styles.authLogoBg}>
                <Leaf size={56} color="white" />
              </View>
              <Text style={styles.authAppName}>GREENMATE BOX</Text>
              <Text style={styles.authSubtitle}>Tham gia cộng đồng xanh</Text>
            </View>

            {/* Signup Form */}
            <View style={styles.authFormSection}>
              <Text style={styles.authFormTitle}>Đăng Ký</Text>

              {/* Name Input */}
              <View style={styles.authInputGroup}>
                <Text style={styles.authInputLabel}>Họ và tên</Text>
                <View style={styles.authInputContainer}>
                  <Text style={styles.authInputIcon}>👤</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="Nhập tên của bạn"
                    placeholderTextColor="#9CA3AF"
                    value={signupName}
                    onChangeText={setSignupName}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.authInputGroup}>
                <Text style={styles.authInputLabel}>Email</Text>
                <View style={styles.authInputContainer}>
                  <Text style={styles.authInputIcon}>✉️</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.authInputGroup}>
                <Text style={styles.authInputLabel}>Mật khẩu</Text>
                <View style={styles.authInputContainer}>
                  <Text style={styles.authInputIcon}>🔐</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="Tối thiểu 6 ký tự"
                    placeholderTextColor="#9CA3AF"
                    value={signupPassword}
                    onChangeText={setSignupPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.authInputGroup}>
                <Text style={styles.authInputLabel}>Xác nhận mật khẩu</Text>
                <View style={styles.authInputContainer}>
                  <Text style={styles.authInputIcon}>🔐</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={signupConfirmPassword}
                    onChangeText={setSignupConfirmPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Terms */}
              <View style={styles.authTermsContainer}>
                <Text style={styles.authTermsText}>
                  Bằng cách đăng ký, bạn đồng ý với {' '}
                  <Text style={styles.authTermsLink}>Điều khoản dịch vụ</Text>
                </Text>
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={styles.authMainBtn}
                disabled={isAuthLoading}
                onPress={async () => {
                  if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
                    Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
                    return;
                  }

                  if (signupPassword !== signupConfirmPassword) {
                    Alert.alert('Lỗi', 'Mật khẩu không khớp');
                    return;
                  }

                  if (signupPassword.length < 6) {
                    Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
                    return;
                  }

                  setIsAuthLoading(true);
                  try {
                    const response = await fetch('http://192.168.1.2:5000/api/auth/signup', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name: signupName,
                        email: signupEmail,
                        password: signupPassword,
                      }),
                    });

                    const data = await response.json();

                    if (data.success) {
                      setEditName(signupName);
                      setIsAuthenticated(true);
                      setSignupName('');
                      setSignupEmail('');
                      setSignupPassword('');
                      setSignupConfirmPassword('');
                      Alert.alert('Đăng ký thành công', `Chào mừng ${signupName}!`);
                    } else {
                      Alert.alert('Lỗi đăng ký', data.message || 'Đăng ký thất bại');
                    }
                  } catch (error) {
                    Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server. Kiểm tra IP server: 192.168.1.2:5000');
                    console.error('Signup error:', error);
                  } finally {
                    setIsAuthLoading(false);
                  }
                }}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.authMainBtnGradient}
                >
                  <Text style={styles.authMainBtnText}>{isAuthLoading ? '⏳ Đang xử lý...' : 'Đăng Ký'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Switch to Login */}
            <View style={styles.authSwitchContainer}>
              <Text style={styles.authSwitchText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => {
                setAuthMode('login');
                setSignupName('');
                setSignupEmail('');
                setSignupPassword('');
                setSignupConfirmPassword('');
              }}>
                <Text style={styles.authSwitchLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  };

  // --- MODAL ---
  const renderBadgesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAllBadges}
      onRequestClose={() => setShowAllBadges(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Kho Huy Hiệu</Text>
              <Text style={styles.modalSubtitle}>Sưu tập {MOCK_BADGES.filter(b => b.unlocked).length}/{MOCK_BADGES.length} huy hiệu</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAllBadges(false)} style={styles.closeBtn}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.badgesGrid}>
            {MOCK_BADGES.map((badge, idx) => (
              <View key={idx} style={[styles.badgeCard, !badge.unlocked && styles.badgeLocked]}>
                 <View style={[styles.badgeIconBig, { backgroundColor: badge.unlocked ? badge.color : '#E5E7EB' }]}>
                    <badge.icon size={32} color="white" />
                 </View>
                 {!badge.unlocked && (
                   <View style={styles.lockOverlay}>
                      <Lock size={16} color="white" />
                   </View>
                 )}
                 <Text style={styles.badgeCardName}>{badge.name}</Text>
                 <Text style={styles.badgeCardDesc}>{badge.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderWalletHistoryModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showWalletHistory}
      onRequestClose={() => setShowWalletHistory(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Lịch sử giao dịch</Text>
              <Text style={styles.modalSubtitle}>Các giao dịch gần nhất</Text>
            </View>
            <TouchableOpacity onPress={() => setShowWalletHistory(false)} style={styles.closeBtn}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
            {walletHistory.length === 0 && (
              <Text style={{ textAlign: 'center', color: '#6B7280' }}>Không có giao dịch nào</Text>
            )}

            {walletHistory.map((h) => (
              <View key={h.id} style={[styles.badgeCard, { width: '100%', alignItems: 'flex-start', flexDirection: 'row', padding: 16, marginBottom: 12 }]}>
                <View style={{flex: 1}}>
                  <Text style={{fontWeight: '800', color: COLORS.textDark}}>{h.type} · {h.item}</Text>
                  <Text style={{fontSize: 12, color: '#6B7280', marginTop: 6}}>{h.date}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={{fontWeight: '900', color: COLORS.textDark}}>-{h.points} Eco</Text>
                  <Text style={{fontSize: 12, marginTop: 6, fontWeight: '700', color: h.status === 'Hoàn tất' ? COLORS.success : COLORS.danger}}>{h.status}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderProfileModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showProfileModal}
      onRequestClose={() => setShowProfileModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Hồ Sơ Cá Nhân</Text>
              <Text style={styles.modalSubtitle}>Quản lý thông tin của bạn</Text>
            </View>
            <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.closeBtn}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.profileAvatarBg}>
                <Image source={MOCK_USER.avatar} style={styles.profileAvatar} />
              </View>
              <Text style={styles.profileName}>{editName}</Text>
              <Text style={styles.profileLevel}>{MOCK_USER.level}</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.profileStatsRow}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{points}</Text>
                <Text style={styles.profileStatLabel}>Eco</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{bottles + cans}</Text>
                <Text style={styles.profileStatLabel}>Rác tái chế</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{co2}kg</Text>
                <Text style={styles.profileStatLabel}>CO₂ giảm</Text>
              </View>
            </View>

            {/* Edit Profile Section */}
            <View style={styles.profileFormSection}>
              <Text style={styles.profileFormTitle}>Chỉnh Sửa Thông Tin</Text>
              
              <View style={styles.profileInputGroup}>
                <Text style={styles.profileInputLabel}>Họ và tên</Text>
                <View style={styles.profileInputContainer}>
                  <TextInput
                    style={styles.profileInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Nhập tên"
                  />
                </View>
              </View>

              <View style={styles.profileInputGroup}>
                <Text style={styles.profileInputLabel}>Email</Text>
                <View style={styles.profileInputContainer}>
                  <TextInput
                    style={styles.profileInput}
                    value={loginEmail}
                    editable={false}
                    placeholder="Email"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.profileSaveBtn}
                onPress={() => {
                  Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
                  setShowProfileModal(false);
                }}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.profileSaveBtnGradient}
                >
                  <Text style={styles.profileSaveBtnText}>Lưu Thay Đổi</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.profileLogoutBtn}
              onPress={() => {
                Alert.alert(
                  'Đăng xuất',
                  'Bạn chắc chắn muốn đăng xuất?',
                  [
                    { text: 'Hủy', onPress: () => {} },
                    {
                      text: 'Đăng xuất',
                      onPress: () => {
                        setIsAuthenticated(false);
                        setAuthMode('login');
                        setLoginEmail('');
                        setLoginPassword('');
                        setSignupName('');
                        setSignupEmail('');
                        setSignupPassword('');
                        setSignupConfirmPassword('');
                        setEditName('Hàn Quốc Bảo');
                        setShowProfileModal(false);
                        Alert.alert('Đã đăng xuất', 'Tạm biệt!');
                      },
                      style: 'destructive'
                    }
                  ]
                );
              }}
            >
              <Text style={styles.profileLogoutBtnText}>🚪 Đăng Xuất</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECFDF5" />
      
      {/* Show Auth Screens if not authenticated */}
      {!isAuthenticated ? (
        authMode === 'login' ? renderLogin() : renderSignup()
      ) : (
        <>
          {/* Background Gradient */}
          <LinearGradient
            colors={['#ECFDF5', '#F0FDF4', '#FFFFFF']}
            style={styles.background}
          />

          <SafeAreaView style={styles.safeArea}>
            <View style={styles.contentContainer}>
                {activeTab === 'Home' && renderDashboard()}
                {activeTab === 'Scan' && renderScan()}
                {activeTab === 'Wallet' && renderWallet()}
                {activeTab === 'Stats' && renderStats()}
                {activeTab === 'Map' && renderMap()}
            </View>
          </SafeAreaView>

          {/* Bottom Navigation */}
          <View style={styles.navContainer}>
            <GlassCard style={styles.navBar}>
              <TouchableOpacity onPress={() => setActiveTab('Home')} style={styles.navItem}>
                 <Home color={activeTab === 'Home' ? COLORS.primary : '#9CA3AF'} size={24} />
                 {activeTab === 'Home' && <View style={styles.activeDot} />}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setActiveTab('Map')} style={styles.navItem}>
                 <MapPin color={activeTab === 'Map' ? COLORS.primary : '#9CA3AF'} size={24} />
                 {activeTab === 'Map' && <View style={styles.activeDot} />}
              </TouchableOpacity>

              <View style={styles.scanBtnContainer}>
                <TouchableOpacity onPress={() => setActiveTab('Scan')} style={styles.scanBtn}>
                   <Scan color="white" size={28} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setActiveTab('Stats')} style={styles.navItem}>
                 <BarChart3 color={activeTab === 'Stats' ? COLORS.primary : '#9CA3AF'} size={24} />
                 {activeTab === 'Stats' && <View style={styles.activeDot} />}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setActiveTab('Wallet')} style={styles.navItem}>
                 <Wallet color={activeTab === 'Wallet' ? COLORS.primary : '#9CA3AF'} size={24} />
                 {activeTab === 'Wallet' && <View style={styles.activeDot} />}
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Modal Overlay */}
          {renderBadgesModal()}
          {renderWalletHistoryModal()}
          {renderProfileModal()}

          {/* News Modal */}
          <Modal
            visible={showNews}
            animationType="slide"
            transparent={false}
            statusBarTranslucent
          >
            <NewsScreen onClose={() => setShowNews(false)} />
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  contentContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  appName: { fontSize: 10, fontWeight: 'bold', color: 'rgba(6, 78, 59, 0.6)', letterSpacing: 2, textTransform: 'uppercase' },
  welcomeText: { fontSize: 24, fontWeight: '900', color: COLORS.textDark },
  avatarContainer: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'white' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.success, borderWidth: 2, borderColor: 'white' },

  // News Button
  newsButton: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  newsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  newsButtonContent: {
    flex: 1,
  },
  newsButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  newsButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },

  // Glass Card
  glassCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2, // Android shadow
  },

  // Main Card
  mainCardShadow: {
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
    borderRadius: 32,
  },
  mainCard: {
    borderRadius: 32,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLabel: { color: '#D1FAE5', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  iconBg: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 },
  pointsContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  pointsValue: { fontSize: 56, fontWeight: '900', color: 'white' },
  pointsUnit: { fontSize: 18, fontWeight: 'bold', color: '#A7F3D0', marginLeft: 8 },
  levelContainer: { flexDirection: 'row', alignItems: 'center' },
  levelBarBg: { flex: 1, height: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4, marginRight: 10, overflow: 'hidden' },
  levelBarFill: { height: '100%', backgroundColor: 'white', borderRadius: 4 },
  levelText: { color: '#D1FAE5', fontSize: 12, fontWeight: 'bold' },

  // Grid Stats
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' },
  statCard: { width: '31%', padding: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },
  statIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(6, 78, 59, 0.6)', textTransform: 'uppercase', marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: '900', color: COLORS.textDark },

  // Achievements
  achievementCard: { padding: 20, backgroundColor: 'rgba(255,255,255,0.5)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  seeAllText: { fontSize: 12, fontWeight: 'bold', color: '#047857', marginRight: 4 },
  badgeItemHorizontal: { alignItems: 'center', width: 80, marginRight: 10 },
  badgeIconBg: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, elevation: 3 },
  badgeName: { fontSize: 10, fontWeight: 'bold', color: COLORS.textDark, textAlign: 'center', height: 28 },
  moreBadgeBtn: { alignItems: 'center', width: 80, justifyContent: 'flex-start' },
  moreBadgeCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#6EE7B7', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  moreBadgeText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  moreBadgeLabel: { fontSize: 10, fontWeight: 'bold', color: '#047857' },

  // Scan
  centerContent: { flex: 1, justifyContent: 'center', paddingBottom: 80 },
  scanContainer: { padding: 30, alignItems: 'center', minHeight: 450, justifyContent: 'space-between' },
  sectionTitleLarge: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark },
  scanSubtitle: { fontSize: 14, color: '#059669', textAlign: 'center', marginBottom: 20 },
  qrFrame: { width: 250, height: 250, borderWidth: 4, borderColor: '#6EE7B7', borderRadius: 30, borderStyle: 'dashed', backgroundColor: 'rgba(16, 185, 129, 0.05)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  scanLine: { width: '100%', height: 2, backgroundColor: COLORS.success, position: 'absolute', top: 0, shadowColor: COLORS.success, shadowOpacity: 1, shadowRadius: 10, elevation: 5 },
  scanningText: { marginTop: 15, color: COLORS.textDark, fontWeight: '600' },
  rewardPoints: { fontSize: 56, fontWeight: '900', color: COLORS.success },
  rewardLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.textDark, letterSpacing: 2 },
  rewardDetails: { flexDirection: 'row', marginTop: 15, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  rewardDetailText: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  dividerV: { width: 1, height: '100%', backgroundColor: '#D1D5DB', marginHorizontal: 15 },
  mainBtn: { backgroundColor: COLORS.textDark, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 20, shadowColor: COLORS.textDark, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, elevation: 8 },
  mainBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Wallet
  screenTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textDark, marginBottom: 20 },
  walletCardShadow: { shadowColor: '#064E3B', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, elevation: 10, borderRadius: 32, marginBottom: 30 },
  walletCard: { borderRadius: 32, padding: 24, position: 'relative' },
  walletLabel: { color: '#A7F3D0', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  walletValue: { fontSize: 48, fontWeight: '900', color: 'white', marginRight: 8 },
  walletUnit: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  walletActions: { flexDirection: 'row', marginTop: 10 },
  walletBtnSecondary: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 16, alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  walletBtnPrimary: { flex: 1, backgroundColor: COLORS.success, padding: 12, borderRadius: 16, alignItems: 'center', shadowColor: COLORS.success, shadowOpacity: 0.4, elevation: 5 },
  walletBtnTextSecondary: { color: 'white', fontWeight: 'bold' },
  walletBtnTextPrimary: { color: 'white', fontWeight: 'bold' },
  giftCard: { width: '48%', padding: 0, overflow: 'hidden', marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.8)' },
  giftIconBg: { height: 100, backgroundColor: 'rgba(52, 211, 153, 0.1)', justifyContent: 'center', alignItems: 'center' },
  giftImage: { width: 64, height: 64 },
  giftName: { fontWeight: 'bold', color: COLORS.textDark, fontSize: 14, marginBottom: 4 },
  giftPrice: { color: COLORS.success, fontWeight: 'bold', fontSize: 12, marginBottom: 10 },
  redeemBtn: { backgroundColor: '#D1FAE5', padding: 8, borderRadius: 10, alignItems: 'center' },
  redeemBtnText: { color: '#064E3B', fontWeight: 'bold', fontSize: 12 },

  // Wallet history
  historyCard: { backgroundColor: 'rgba(255,255,255,0.95)' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  historyType: { fontWeight: 'bold', color: COLORS.textDark },
  historyDate: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  historyAmount: { fontWeight: '900', color: COLORS.textDark },
  historyStatus: { fontSize: 12, marginTop: 4, fontWeight: '700' },

  // Map
  mapMockContainer: { flex: 1, borderRadius: 32, overflow: 'hidden', position: 'relative', borderWidth: 4, borderColor: 'white', height: 500, backgroundColor: '#F7FFFB' },
  mapContent: { width: 900, height: 700, alignSelf: 'center', position: 'relative' },
  mapBg: { flex: 1, backgroundColor: '#ECFDF5', position: 'relative' },
  mapBgImproved: { flex: 1, borderRadius: 24, overflow: 'hidden', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  landPatch: { position: 'absolute', width: 180, height: 140, borderRadius: 20, opacity: 0.9 },
  mapControlsRow: { position: 'absolute', top: 16, right: 16, zIndex: 40, flexDirection: 'row', alignItems: 'center' },
  zoomBadge: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', marginRight: 8, shadowColor: '#000', shadowOpacity: 0.05, elevation: 3 },
  zoomBadgeText: { color: COLORS.textDark, fontWeight: '800' },
  zoomResetBtn: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  zoomResetText: { color: '#064E3B', fontWeight: '800' },
  road: { position: 'absolute', width: '100%', height: 12, backgroundColor: 'white' },
  roadVertical: { position: 'absolute', height: '100%', width: 12, backgroundColor: 'white' },
  mapMarker: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  markerIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, elevation: 5, marginBottom: 6 },
  markerLabelFloating: { position: 'absolute', left: 46, top: -8, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', shadowColor: '#000', shadowOpacity: 0.06, elevation: 4, maxWidth: 170 },
  markerLabel: { position: 'absolute', left: 36, top: -10, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 3, maxWidth: 140 },
  markerLabelText: { fontSize: 12, color: COLORS.textDark, fontWeight: '600' },
  userLocation: { position: 'absolute', top: '50%', left: '50%', transform: [{translateX: -10}, {translateY: -10}] },
  userLocationImproved: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  userDot: { position: 'absolute', width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: 'white' },
  userPulse: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(59, 130, 246, 0.2)', top: -20, left: -20 },
  machineLabel: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '600', color: COLORS.textDark },

  mapHint: { position: 'absolute', left: 16, bottom: 12, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)', shadowColor: '#000', shadowOpacity: 0.03, elevation: 4 },
  mapHintText: { color: '#064E3B', fontWeight: '700' },

  // Modal
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#F9FAFB', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '85%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textDark },
  modalSubtitle: { fontSize: 14, color: '#059669', marginTop: 4 },
  closeBtn: { padding: 8, backgroundColor: '#E5E7EB', borderRadius: 20 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 40 },
  badgeCard: { width: '48%', backgroundColor: 'white', borderRadius: 20, padding: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', elevation: 2 },
  badgeLocked: { opacity: 0.7, backgroundColor: '#F3F4F6' },
  badgeIconBig: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4 },
  badgeCardName: { fontWeight: 'bold', color: COLORS.textDark, marginBottom: 4, textAlign: 'center' },
  badgeCardDesc: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  lockOverlay: { position: 'absolute', top: 10, right: 10, backgroundColor: '#4B5563', padding: 4, borderRadius: 12 },

  // Navigation
  navContainer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'rgba(255,255,255,0.95)' },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary, marginTop: 4 },
  scanBtnContainer: { position: 'relative', top: -25 },
  scanBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.textDark, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.textDark, shadowOpacity: 0.4, shadowOffset: {width: 0, height: 8}, elevation: 10, borderWidth: 4, borderColor: '#ECFDF5' },
  mapAddBtn: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  mapAddText: { color: 'white', fontWeight: '800' },

  // Stats
  statsMainCard: { 
    backgroundColor: 'rgba(255,255,255,0.8)', 
    padding: 20, 
    marginBottom: 0 
  },
  statsMainHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 15
  },
  statsMainLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: 'rgba(6, 78, 59, 0.6)', 
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  statsMainValue: { 
    fontSize: 42, 
    fontWeight: '900', 
    color: COLORS.textDark 
  },
  statsMainIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    backgroundColor: '#DCFCE7', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    elevation: 3
  },
  statsMainDivider: { 
    height: 1, 
    backgroundColor: 'rgba(0,0,0,0.06)', 
    marginVertical: 15 
  },
  statsMainRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  statsMainItem: { 
    flex: 1, 
    paddingHorizontal: 10 
  },
  statsMainItemLabel: { 
    fontSize: 12, 
    color: '#6B7280', 
    fontWeight: '600',
    marginBottom: 6
  },
  statsMainItemValue: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  statsMainItemNumber: { 
    fontSize: 18, 
    fontWeight: '900' 
  },

  // Bar Chart
  barChartContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    justifyContent: 'space-around',
    height: 200,
    paddingHorizontal: 8
  },
  barChartItem: { 
    alignItems: 'center', 
    flex: 1,
    marginHorizontal: 4
  },
  barChartBar: { 
    width: '100%', 
    height: 150, 
    backgroundColor: '#ECFDF5', 
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8
  },
  barFill: { 
    width: '100%', 
    borderRadius: 8 
  },
  barChartLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: COLORS.textDark,
    marginBottom: 4
  },
  barChartValue: { 
    fontSize: 13, 
    fontWeight: '900', 
    color: COLORS.primary 
  },
  statsChartTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: COLORS.textDark 
  },
  statsChartSubtitle: { 
    fontSize: 12, 
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4
  },

  // Metrics
  metricItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16 
  },
  metricIconBg: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  metricContent: { 
    flex: 1 
  },
  metricLabel: { 
    fontSize: 12, 
    color: '#6B7280', 
    fontWeight: '600',
    marginBottom: 4
  },
  metricValue: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: COLORS.textDark 
  },
  metricTrend: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  metricDivider: { 
    height: 1, 
    backgroundColor: '#F3F4F6' 
  },
  trendBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 10 
  },
  trendText: { 
    fontSize: 11, 
    fontWeight: '700' 
  },

  // Activities
  activityItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16 
  },
  activityIconBg: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  activityContent: { 
    flex: 1 
  },
  activityTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: COLORS.textDark,
    marginBottom: 4
  },
  activityTime: { 
    fontSize: 12, 
    color: '#9CA3AF', 
    fontWeight: '500' 
  },
  activityPoints: { 
    fontSize: 14, 
    fontWeight: '900', 
    color: COLORS.primary 
  },
  activityDivider: { 
    height: 1, 
    backgroundColor: '#F3F4F6' 
  },

  // Auth Screens
  authContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 40,
    flexGrow: 1,
    justifyContent: 'space-between'
  },
  authLogoSection: {
    alignItems: 'center',
    marginBottom: 40
  },
  authLogoBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  authAppName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 2,
    marginBottom: 8
  },
  authSubtitle: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600'
  },
  authFormSection: {
    marginBottom: 30
  },
  authFormTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 24
  },
  authInputGroup: {
    marginBottom: 16
  },
  authInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 2
  },
  authInputIcon: {
    fontSize: 20,
    marginRight: 10
  },
  authInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark
  },
  authMainBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  authMainBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  authMainBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1
  },
  authForgotBtn: {
    alignItems: 'center',
    marginTop: 16
  },
  authForgotText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600'
  },
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB'
  },
  authDividerText: {
    paddingHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600'
  },
  authSocialSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24
  },
  authSocialBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  authSocialIcon: {
    fontSize: 24
  },
  authSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24
  },
  authSwitchText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  authSwitchLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700'
  },
  authTermsContainer: {
    marginTop: 16,
    marginBottom: 24
  },
  authTermsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center'
  },
  authTermsLink: {
    color: COLORS.primary,
    fontWeight: '700'
  },

  // Profile Modal
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20
  },
  profileAvatarBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
    overflow: 'hidden'
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 4
  },
  profileLevel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 20,
    borderRadius: 20
  },
  profileStatItem: {
    alignItems: 'center',
    flex: 1
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 4
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280'
  },
  profileStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB'
  },
  profileFormSection: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  profileFormTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 16
  },
  profileInputGroup: {
    marginBottom: 12
  },
  profileInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  profileInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12
  },
  profileInput: {
    height: 44,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark
  },
  profileSaveBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  profileSaveBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileSaveBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  profileLogoutBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FECACA'
  },
  profileLogoutBtnText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '800'
  },
  // Camera QR Scanner Styles
  cameraOverlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 60
  },
  cameraCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  cameraFrameGuide: {
    width: 280,
    height: 280,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.success,
    backgroundColor: 'transparent',
    shadowColor: COLORS.success,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5
  },
  cameraInstructions: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20
  },
  cameraInstructionsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  scanFeedback: {
    position: 'absolute',
    top: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  scanFeedbackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700'
  }
});
