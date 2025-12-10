import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Share2, Search, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// --- MÀU SẮC ---
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

// --- TIN TỨC MẪU ---
const NEWS_DATA = [
  {
    id: 1,
    title: '🌍 Ngành công nghiệp tái chế toàn cầu tăng 47% năm 2024',
    description: 'Các quốc gia đang đầu tư mạnh vào công nghệ tái chế tiên tiến để giảm thiểu rác thải nhựa. Dự kiến sẽ tạo ra 2 triệu việc làm mới.',
    image: 'https://lilama18-1.com.vn/assets/images/content/nhung-kien-thuc-co-ban-ve-nganh-cong-nghiep-nang.jpg',
    date: '10 tháng 12, 2024',
    category: 'Tái chế',
    likes: 245,
    saved: false,
  },
  {
    id: 2,
    title: '♻️ Thế giới sử dụng 430 triệu tấn nhựa mỗi năm',
    description: 'Theo nghiên cứu mới nhất, chỉ có 9% nhựa được tái chế. Cần hành động khẩn cấp để giảm sử dụng nhựa một lần.',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=250&fit=crop',
    date: '8 tháng 12, 2024',
    category: 'Nhựa',
    likes: 567,
    saved: false,
  },
  {
    id: 3,
    title: '🌳 Trồng 1 tỷ cây xanh: Chiến dịch đầu tiên của năm',
    description: 'Liên Hợp Quốc khởi động dự án trồng 1 tỷ cây để chống lại biến đổi khí hậu. Việt Nam được lựa chọn làm điểm sáng.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop',
    date: '5 tháng 12, 2024',
    category: 'Cây xanh',
    likes: 890,
    saved: false,
  },
  {
    id: 4,
    title: '🌊 Rác thải biển giảm 22% nhờ chiến dịch toàn cầu',
    description: 'Các tổ chức môi trường báo cáo thành công đáng kể trong việc làm sạch đại dương và bảo vệ các hệ sinh thái biển.',
    image: 'https://hatinh.gov.vn/uploads/topics/17291382361241.jpg',
    date: '3 tháng 12, 2024',
    category: 'Biển',
    likes: 432,
    saved: false,
  },
  {
    id: 5,
    title: '🏭 Công ty Apple cam kết 75% tái chế năm 2030',
    description: 'Hãng sản xuất công nghệ hàng đầu thế giới công bố kế hoạch giảm phát thải CO₂ và tăng sử dụng vật liệu tái chế.',
    image: 'https://file.hstatic.net/1000177816/file/58778eb3-tru-so-apple-e1555688697853_21dfaf96554648eb9bed5ceb37a70373_1024x1024.jpg',
    date: '1 tháng 12, 2024',
    category: 'Công nghệ',
    likes: 678,
    saved: false,
  },
  {
    id: 6,
    title: '🌿 Phong trào không nhựa: 500 triệu người tham gia',
    description: 'Cuộc vận động từ chối sử dụng nhựa một lần đã lan rộng đến 195 quốc gia trên toàn thế giới.',
    image: 'https://toquoc.mediacdn.vn/thumb_w/640/280518851207290880/2022/9/21/ocean-plastic-1663728488376386080061.jpg',
    date: '28 tháng 11, 2024',
    category: 'Cộng đồng',
    likes: 1234,
    saved: false,
  },
];

// --- COMPONENTS ---
export function NewsScreen({ onClose }) {
  const [news, setNews] = useState(NEWS_DATA);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Tái chế', 'Nhựa', 'Cây xanh', 'Biển', 'Công nghệ', 'Cộng đồng'];

  // Lọc tin tức
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle like
  const toggleLike = (id) => {
    setNews(news.map(item =>
      item.id === id ? { ...item, saved: !item.saved } : item
    ));
  };

  // Render tin tức
  const renderNewsItem = ({ item }) => (
    <TouchableOpacity
      style={styles.newsCard}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.newsImage}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.newsGradient}
      />

      <View style={styles.newsContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsDescription} numberOfLines={2}>{item.description}</Text>

        <View style={styles.newsFooter}>
          <Text style={styles.newsDate}>{item.date}</Text>
          
          <View style={styles.newsActions}>
            <TouchableOpacity
              style={[styles.actionBtn, item.saved && styles.actionBtnActive]}
              onPress={() => toggleLike(item.id)}
            >
              <Heart
                size={18}
                color={item.saved ? COLORS.danger : 'white'}
                fill={item.saved ? COLORS.danger : 'none'}
              />
              <Text style={styles.actionText}>{item.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Share2 size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ECFDF5', '#F0FDF4', '#FFFFFF']}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📰 Tin Tức Môi Trường</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={28} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tin tức..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <X size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
        scrollEventThrottle={16}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryBtn,
              selectedCategory === cat && styles.categoryBtnActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryBtnText,
                selectedCategory === cat && styles.categoryBtnTextActive,
              ]}
              numberOfLines={1}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News List */}
      {filteredNews.length > 0 ? (
        <FlatList
          data={filteredNews}
          renderItem={renderNewsItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.newsList}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy tin tức</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 211, 153, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  categoriesScroll: {
    marginVertical: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  categoryBtnTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  newsList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 12,
  },
  newsCard: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  newsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newsGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  newsContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    lineHeight: 22,
  },
  newsDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    lineHeight: 18,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  newsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
});

export default NewsScreen;
