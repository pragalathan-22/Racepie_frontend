import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const screenWidth = Dimensions.get('window').width;
const itemSpacing = 16;
const numColumns = 3;
const cardSize = (screenWidth - itemSpacing * (numColumns + 1)) / numColumns;

export default function OrderFood() {
  const route = useRoute();
  const navigation = useNavigation();
  const { type } = route.params || {};

  const [allFoods, setAllFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const fetchFoodData = async () => {
    try {
      const response = await fetch('https://recepie-backend-9.onrender.com/api/foods/');
      const data = await response.json();

      const allItems = data.all || [];
      
      // Process image URLs to ensure they're complete
      const processedItems = allItems.map(item => ({
        ...item,
        image: item.image.startsWith('http') ? item.image : `https://recepie-backend-9.onrender.com${item.image}`
      }));

      const uniqueSubcategories = [
        ...new Set(processedItems.map((item) => item.subcategory).filter(Boolean)),
      ];

      setSubcategories(uniqueSubcategories);
      setAllFoods(processedItems);
      setFilteredFoods(processedItems);
    } catch (error) {
      console.error('Error fetching food data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBySubcategory = (subcategory) => {
    setActiveSubcategory(subcategory);
    const filtered = subcategory
      ? allFoods.filter((item) => item.subcategory === subcategory)
      : allFoods;

    // If search is active, also apply search filter
    const finalFiltered = searchText
      ? filtered.filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : filtered;

    setFilteredFoods(finalFiltered);
    setMenuOpen(false);
  };

  useEffect(() => {
    fetchFoodData();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = allFoods.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );

    // If subcategory is active, apply it too
    const finalFiltered = activeSubcategory
      ? filtered.filter((item) => item.subcategory === activeSubcategory)
      : filtered;

    setFilteredFoods(finalFiltered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff9500" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Sidebar */}
        {menuOpen && (
          <View style={styles.sideMenu}>
            <Text style={styles.menuTitle}>Subcategories</Text>
            <TouchableOpacity
              style={[styles.menuItem, activeSubcategory === null && styles.menuItemActive]}
              onPress={() => filterBySubcategory(null)}
            >
              <Text style={styles.menuItemText}>All</Text>
            </TouchableOpacity>
            {subcategories.map((subcategory, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  activeSubcategory === subcategory && styles.menuItemActive,
                ]}
                onPress={() => filterBySubcategory(subcategory)}
              >
                <Text style={styles.menuItemText}>{subcategory}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
  
        {/* Main Content */}
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleMenu}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
  
            <Text style={styles.headerText}>Order Food {type ? `- ${type}` : ''}</Text>
  
            <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
              <Text style={styles.menuIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
  
          {/* Search Bar */}
          {searchVisible && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search food..."
                placeholderTextColor="#aaa"
                value={searchText}
                onChangeText={handleSearch}
              />
            </View>
          )}
  
          {/* Food list */}
          <FlatList
            key={'3cols'}
            data={filteredFoods}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('AddToCart', { item })}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.foodImage}
                  onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
                />
                <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.foodPrice}>₹{item.rate}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1c1c1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c2c2e',
    padding: 16,
    marginTop: 30,
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
    marginHorizontal: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
  },
  sideMenu: {
    width: 200,
    backgroundColor: '#333',
    padding: 16,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    paddingTop: 80,
  },
  
  menuTitle: {
    color: '#ffcc00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  menuItemActive: {
    backgroundColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingHorizontal: itemSpacing / 2,
    paddingBottom: 20,
  },
  card: {
    width: cardSize,
    backgroundColor: '#2c2c2e',
    borderRadius: 10,
    padding: 8,
    margin: itemSpacing / 2,
    alignItems: 'center',
  },
  foodImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
  },
  foodName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  foodPrice: {
    color: '#ff9500',
    fontSize: 13,
    marginTop: 4,
  },
});
