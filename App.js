import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  Image,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  Award 
} from 'lucide-react-native';

// --- CẤU HÌNH MÀU SẮC & THEME ---
const COLORS = {
  primary: '#34D399',      // Xanh lá chủ đạo (Emerald)
  secondary: '#059669',    // Xanh đậm hơn
  glassWhite: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  textDark: '#064E3B',
  textLight: '#ECFDF5',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981'
};

const { width, height } = Dimensions.get('window');

// --- DATA GIẢ LẬP (MOCK DATA) ---
const MOCK_USER = {
  name: "Hàn Quốc Bảo",
  level: "Eco Warrior - Level 10",
  // Use a relative path from App.js so Metro bundler can include the asset
  avatar: require('./assets/imgage/bao.png'),
};


const NEARBY_MACHINES = [
  { id: 1, name: "Sảnh A - ĐH Bách Khoa", status: "active", capacity: 80, types: ["PET", "ALU"], x: 100, y: 150 },
  { id: 2, name: "Canteen Khu B", status: "full", capacity: 5, types: ["PET"], x: 250, y: 300 },
  { id: 3, name: "Ký túc xá Khu A", status: "maintenance", capacity: 0, types: ["PET", "ALU"], x: 180, y: 450 },
];

// --- COMPONENT: GLASS CARD ---
// Wrapper tạo hiệu ứng kính mờ
const GlassCard = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>
    {children}
  </View>
);

// --- COMPONENT: SIMPLE BAR CHART ---
const SimpleBarChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, justifyContent: 'space-between', paddingTop: 20 }}>
      {data.map((item, index) => (
        <View key={index} style={{ alignItems: 'center', width: 40 }}>
          <View 
            style={{ 
              width: 12, 
              height: (item.value / maxVal) * 100, 
              backgroundColor: COLORS.textDark, 
              borderRadius: 6,
              opacity: 0.8
            }} 
          />
          <Text style={{ fontSize: 10, color: COLORS.textDark, marginTop: 5 }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

// --- MÀN HÌNH CHÍNH (APP) ---
export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [points, setPoints] = useState(1280);
  const [bottles, setBottles] = useState(42);
  const [cans, setCans] = useState(31);
  const [co2, setCo2] = useState(3.4);
  
  // State cho quá trình scan
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  
  // Animation values
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- LOGIC: GIẢ LẬP PHẦN CỨNG ---
  const handleScan = () => {
    setIsScanning(true);
    setScanResult(null);

    // Giả lập độ trễ kết nối và xử lý AI
    setTimeout(() => {
      const newBottles = Math.floor(Math.random() * 5) + 1;
      const newCans = Math.floor(Math.random() * 3) + 1;
      const earnedPoints = (newBottles * 5) + (newCans * 3);
      const savedCo2 = (newBottles * 0.08) + (newCans * 0.15);

      setScanResult({
        bottles: newBottles,
        cans: newCans,
        points: earnedPoints,
        co2: savedCo2
      });

      runRewardAnimation();

      setTimeout(() => {
        setPoints(prev => prev + earnedPoints);
        setBottles(prev => prev + newBottles);
        setCans(prev => prev + newCans);
        setCo2(prev => parseFloat((prev + savedCo2).toFixed(2)));
        setIsScanning(false);
      }, 1500);

    }, 2000);
  };

  const runRewardAnimation = () => {
    pointsAnim.setValue(0);
    fadeAnim.setValue(1);
    Animated.parallel([
      Animated.timing(pointsAnim, {
        toValue: -100,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      })
    ]).start();
  };

  // --- RENDER CÁC MODULE ---

  const renderDashboard = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>GreenMate Box</Text>
          <Text style={styles.welcomeText}>Xin chào, {MOCK_USER.name}!</Text>
        </View>
        <Image source={MOCK_USER.avatar} style={styles.avatar} /> 
      </View>

      {/* Main Stats Card */}
      <GlassCard style={styles.bigCard}>
        <TouchableOpacity style={styles.refreshBtn}>
          <Recycle size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.cardLabel}>Điểm hiện tại</Text>
        <Text style={styles.bigPoint}>{points}</Text>
        <View style={styles.waveLine} />
      </GlassCard>

      {/* Grid Stats */}
      <View style={styles.gridContainer}>
        {[
          { label: 'Chai nhựa', val: bottles, icon: Leaf },
          { label: 'Lon nhôm', val: cans, icon: Zap },
          { label: 'CO₂ Giảm', val: `${co2} kg`, icon: Award },
        ].map((item, index) => (
          <GlassCard key={index} style={styles.smallCard}>
            <View style={styles.iconCircle}>
              <item.icon size={24} color={COLORS.textDark} />
            </View>
            <Text style={styles.statLabel}>{item.label}</Text>
            <Text style={styles.statValue}>{item.val}</Text>
          </GlassCard>
        ))}
      </View>

      {/* Badges */}
      <GlassCard style={styles.wideCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Thành tích</Text>
          <Text style={styles.linkText}>Xem tất cả</Text>
        </View>
        <View style={styles.badgeRow}>
          {['Eco Starter', 'Green Warrior', 'Zero Waste'].map((badge, idx) => (
            <View key={idx} style={styles.badgeItem}>
              <View style={[styles.badgeIcon, { backgroundColor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32' }]}>
                <Award color="white" size={20} />
              </View>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 15, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', color: COLORS.textDark }}>{MOCK_USER.level}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '60%' }]} />
          </View>
        </View>
      </GlassCard>
    </ScrollView>
  );

  const renderScan = () => (
    <View style={styles.centerContainer}>
      <GlassCard style={styles.scanCard}>
        <Text style={styles.scanTitle}>Kết nối máy phân loại</Text>
        <View style={styles.qrPlaceholder}>
          {isScanning ? (
            <View style={{alignItems: 'center'}}>
               {/* Note: In real app use ActivityIndicator */}
               <Recycle size={60} color={COLORS.textDark} />
               <Text style={{marginTop: 20, color: COLORS.textDark}}>Đang nhận dữ liệu...</Text>
            </View>
          ) : scanResult ? (
            <View style={{alignItems: 'center'}}>
              <Text style={{fontSize: 40, fontWeight: 'bold', color: COLORS.primary}}>+{scanResult.points}</Text>
              <Text style={{color: COLORS.textDark}}>Điểm thưởng</Text>
              <View style={{flexDirection: 'row', marginTop: 10}}>
                 <Text style={{marginRight: 10, fontSize: 18}}>🍾 {scanResult.bottles}</Text>
                 <Text style={{fontSize: 18}}>🥫 {scanResult.cans}</Text>
              </View>
            </View>
          ) : (
            <Scan size={80} color={COLORS.textDark} />
          )}
        </View>
        
        {!isScanning && (
          <TouchableOpacity style={styles.actionButton} onPress={handleScan}>
            <Text style={styles.actionButtonText}>
              {scanResult ? "Quét tiếp" : "Bắt đầu đổi rác"}
            </Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.hintText}>Đưa mã QR vào camera hoặc bật Bluetooth để kết nối máy gần nhất.</Text>
      </GlassCard>

      {/* Floating Animation */}
      {scanResult && (
        <Animated.View style={[styles.floatingReward, { transform: [{ translateY: pointsAnim }], opacity: fadeAnim }]}>
           <Text style={styles.floatingText}>+{scanResult.points} Điểm</Text>
           <Text style={styles.floatingSub}>Giỏi lắm!</Text>
        </Animated.View>
      )}
    </View>
  );

  const renderWallet = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
       <Text style={styles.screenHeader}>Ví Eco</Text>
       <GlassCard style={styles.balanceCard}>
         <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
         <Text style={styles.balanceValue}>{points} Eco</Text>
         <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.smallBtn}><Text style={styles.btnText}>Lịch sử</Text></TouchableOpacity>
            <TouchableOpacity style={styles.smallBtn}><Text style={styles.btnText}>Nạp điểm</Text></TouchableOpacity>
         </View>
       </GlassCard>

       <Text style={styles.sectionTitle}>Đổi quà</Text>
       <View style={styles.rewardGrid}>
          {['Voucher 50k', 'Bình nước tre', 'Túi Canvas', 'Thẻ xe bus'].map((item, idx) => (
            <GlassCard key={idx} style={styles.rewardItem}>
              <Gift size={30} color={COLORS.textDark} />
              <Text style={styles.rewardName}>{item}</Text>
              <Text style={styles.rewardCost}>{(idx + 1) * 200} điểm</Text>
              <TouchableOpacity style={styles.redeemBtn}>
                <Text style={styles.redeemText}>Đổi</Text>
              </TouchableOpacity>
            </GlassCard>
          ))}
       </View>
    </ScrollView>
  );

  const renderStats = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.screenHeader}>Thống kê cá nhân</Text>
      
      <GlassCard style={styles.wideCard}>
        <Text style={styles.cardLabel}>Hoạt động tuần qua (Chai/Lon)</Text>
        <SimpleBarChart data={[
          { label: 'T2', value: 5 }, { label: 'T3', value: 12 }, { label: 'T4', value: 8 },
          { label: 'T5', value: 20 }, { label: 'T6', value: 15 }, { label: 'T7', value: 30 }, { label: 'CN', value: 10 }
        ]} />
      </GlassCard>

      <GlassCard style={styles.wideCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardLabel}>Bảng xếp hạng (Trường ĐH)</Text>
          <Text style={styles.highlightText}>Hạng #124</Text>
        </View>
        {[1, 2, 3].map((rank) => (
           <View key={rank} style={styles.rankRow}>
             <Text style={styles.rankNum}>#{rank}</Text>
             <View style={styles.rankUser}>
                <View style={styles.rankAvatar} />
                <Text style={styles.rankName}>User {rank}0{rank}</Text>
             </View>
             <Text style={styles.rankScore}>{2000 - rank * 100} đ</Text>
           </View>
        ))}
      </GlassCard>
    </ScrollView>
  );

  const renderMap = () => (
    <View style={{ flex: 1 }}>
       <Text style={styles.screenHeader}>Máy gần bạn</Text>
       <View style={styles.mapContainer}>
          {/* Mock Map View */}
          <View style={styles.mapGrid}>
             <View style={styles.streetH} />
             <View style={[styles.streetH, { top: 300 }]} />
             <View style={styles.streetV} />
             <View style={[styles.streetV, { left: 250 }]} />
          </View>
          
          {NEARBY_MACHINES.map((machine) => (
            <TouchableOpacity 
              key={machine.id}
              style={[styles.mapMarker, { left: machine.x, top: machine.y }]}
              onPress={() => Alert.alert(
                machine.name,
                `Trạng thái: ${machine.status}\nSức chứa: ${machine.capacity}%\nLoại: ${machine.types.join(", ")}`
              )}
            >
              <MapPin 
                size={30} 
                fill={machine.status === 'active' ? COLORS.success : machine.status === 'full' ? COLORS.warning : COLORS.danger} 
                color="white" 
              />
            </TouchableOpacity>
          ))}
          <View style={[styles.userDot, { left: width/2, top: height/3 }]} />
       </View>
       
       <GlassCard style={styles.mapLegend}>
          <Text style={{fontWeight:'bold', marginBottom: 5}}>Chú thích:</Text>
          <View style={styles.row}><View style={[styles.dot, {backgroundColor: COLORS.success}]} /><Text> Hoạt động</Text></View>
          <View style={styles.row}><View style={[styles.dot, {backgroundColor: COLORS.warning}]} /><Text> Sắp đầy</Text></View>
          <View style={styles.row}><View style={[styles.dot, {backgroundColor: COLORS.danger}]} /><Text> Bảo trì</Text></View>
       </GlassCard>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#86EFAC', '#ffffff', '#E0F2FE']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
      <View style={styles.bottomNavContainer}>
        <GlassCard style={styles.bottomNav}>
          <TouchableOpacity onPress={() => setActiveTab('Home')} style={styles.navItem}>
             <Home color={activeTab === 'Home' ? COLORS.textDark : '#888'} size={24} />
             {activeTab === 'Home' && <View style={styles.navDot} />}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setActiveTab('Map')} style={styles.navItem}>
             <MapPin color={activeTab === 'Map' ? COLORS.textDark : '#888'} size={24} />
             {activeTab === 'Map' && <View style={styles.navDot} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('Scan')} style={styles.scanBtnWrapper}>
             <View style={styles.scanBtn}>
                <Scan color="white" size={28} />
             </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('Stats')} style={styles.navItem}>
             <BarChart3 color={activeTab === 'Stats' ? COLORS.textDark : '#888'} size={24} />
             {activeTab === 'Stats' && <View style={styles.navDot} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('Wallet')} style={styles.navItem}>
             <Wallet color={activeTab === 'Wallet' ? COLORS.textDark : '#888'} size={24} />
             {activeTab === 'Wallet' && <View style={styles.navDot} />}
          </TouchableOpacity>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  appName: { fontSize: 14, color: COLORS.textDark, opacity: 0.7, letterSpacing: 1 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: COLORS.textDark },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'white' },

  // Glass Card
  glassCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 15
  },
  bigCard: { alignItems: 'center', paddingVertical: 30, position: 'relative' },
  smallCard: { flex: 1, alignItems: 'center', padding: 15, marginHorizontal: 5 },
  wideCard: { width: '100%' },
  
  // Text Styles
  cardLabel: { fontSize: 14, color: COLORS.textDark, opacity: 0.8, marginBottom: 5 },
  bigPoint: { fontSize: 48, fontWeight: 'bold', color: COLORS.textDark },
  refreshBtn: { position: 'absolute', right: 15, top: 15, padding: 5 },
  waveLine: { height: 4, width: 40, backgroundColor: 'white', borderRadius: 2, marginTop: 10, opacity: 0.5 },
  
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statLabel: { fontSize: 12, color: COLORS.textDark, textAlign: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginTop: 5 },

  // Badges & Ranks
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 10 },
  linkText: { fontSize: 12, color: COLORS.textDark, textDecorationLine: 'underline' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  badgeItem: { alignItems: 'center' },
  badgeIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  badgeText: { fontSize: 10, color: COLORS.textDark },
  progressBarBg: { height: 6, width: 150, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 3, marginTop: 5 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },

  // Navigation
  bottomNavContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 30, marginBottom: 0 },
  navItem: { alignItems: 'center', justifyContent: 'center', width: 40 },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textDark, marginTop: 4 },
  scanBtnWrapper: { top: -25 },
  scanBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.textDark, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.textDark, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },

  // Scan
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanCard: { width: '90%', height: 400, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 },
  scanTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  qrPlaceholder: { width: 200, height: 200, borderRadius: 20, borderWidth: 2, borderColor: COLORS.textDark, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.3)' },
  actionButton: { backgroundColor: COLORS.textDark, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  actionButtonText: { color: 'white', fontWeight: 'bold' },
  hintText: { textAlign: 'center', fontSize: 12, color: COLORS.textDark, opacity: 0.7, paddingHorizontal: 20 },
  floatingReward: { position: 'absolute', top: '30%', backgroundColor: COLORS.success, padding: 15, borderRadius: 15, alignItems: 'center', zIndex: 100 },
  floatingText: { color: 'white', fontWeight: 'bold', fontSize: 24 },
  floatingSub: { color: 'white', fontSize: 12 },

  // Wallet
  screenHeader: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark, marginVertical: 20 },
  balanceCard: { height: 180, justifyContent: 'center' },
  balanceLabel: { color: COLORS.textDark, fontSize: 16 },
  balanceValue: { fontSize: 36, fontWeight: 'bold', color: COLORS.textDark, marginVertical: 10 },
  smallBtn: { backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 },
  btnText: { color: COLORS.textDark, fontWeight: '600' },
  rewardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  rewardItem: { width: '48%', marginBottom: 15, alignItems: 'center' },
  rewardName: { fontWeight: 'bold', marginTop: 10, color: COLORS.textDark },
  rewardCost: { fontSize: 12, color: '#666', marginBottom: 10 },
  redeemBtn: { backgroundColor: COLORS.textDark, width: '100%', padding: 8, borderRadius: 10, alignItems: 'center' },
  redeemText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  // Stats / Map
  highlightText: { color: COLORS.success, fontWeight: 'bold' },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  rankNum: { width: 30, fontWeight: 'bold', color: COLORS.textDark },
  rankUser: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  rankAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ddd', marginRight: 10 },
  rankName: { color: COLORS.textDark },
  rankScore: { fontWeight: 'bold', color: COLORS.success },
  mapContainer: { flex: 1, backgroundColor: '#E5E7EB', borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 20 },
  mapGrid: { position: 'absolute', width: '100%', height: '100%' },
  streetH: { position: 'absolute', width: '100%', height: 10, backgroundColor: 'white', top: 100 },
  streetV: { position: 'absolute', width: 10, height: '100%', backgroundColor: 'white', left: 80 },
  mapMarker: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  userDot: { position: 'absolute', width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: 'white' },
  mapLegend: { position: 'absolute', bottom: 20, left: 10, padding: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 }
});