import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

const FoodItemCard = ({ item }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={styles.fullImageCard}>
      <View style={styles.fullImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.fullFoodImage}
          resizeMode="cover"
          onError={(error) => {
            console.log('Image loading error:', error.nativeEvent.error);
            setHasError(true);
            setIsLoading(false);
          }}
          onLoadStart={() => {
            setIsLoading(true);
          }}
          onLoadEnd={() => {
            setIsLoading(false);
          }}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        )}
        {hasError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>Image not available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [topRatedFoods, setTopRatedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const topRatedRef = useRef(null);
  const topRatedScrollIndex = useRef(0);
  const topRatedScrollInterval = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const companyResponse = await fetch(`${API_BASE_URL}/company-info/`);
      const companyData = await companyResponse.json();
      setCompanyInfo(companyData);

      const foodsResponse = await fetch(`${API_BASE_URL}/foods/`);
      const foodsData = await foodsResponse.json();

      const processedTopRated = (foodsData.top_rated || []).map(food => ({
        ...food,
        image: food.image.startsWith('http') ? food.image : `${API_BASE_URL}${food.image}`
      }));

      setTopRatedFoods(processedTopRated);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (topRatedFoods.length > 0) {
      topRatedScrollInterval.current = setInterval(() => {
        topRatedScrollIndex.current = (topRatedScrollIndex.current + 1) % topRatedFoods.length;
        topRatedRef.current?.scrollToIndex({
          index: topRatedScrollIndex.current,
          animated: true,
        });
      }, 2500);
    }
    return () => clearInterval(topRatedScrollInterval.current);
  }, [topRatedFoods]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleDinnerPress = () => {
    navigation.navigate('OrderFood', { type: 'Dinein' });
  };

  const handleTakeoutPress = () => {
    navigation.navigate('OrderFood', { type: 'Takeout' });
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.headerContainer}>
        {companyInfo && (
          <View style={styles.headerRow}>
            <Image source={{ uri: companyInfo.logoUrl }} style={styles.logo} resizeMode="contain" />
            <Text style={styles.companyName}>{companyInfo.name}</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleProfilePress} style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={32} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }
      >
        <Text style={styles.sectionTitle}>Foody and Buddy</Text>
        <FlatList
          ref={topRatedRef}
          horizontal
          data={topRatedFoods}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={({ item }) => <FoodItemCard item={item} />}
          showsHorizontalScrollIndicator={false}
        />
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDinnerPress}>
          <Text style={styles.buttonText}>Dinein</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleTakeoutPress}>
          <Text style={styles.buttonText}>Takeout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingLeft: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#c92828',
    fontSize: 28,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 10,
    textAlign: 'center',  // Center the text
    alignSelf: 'center',  // Ensures it's centered in the container
  },
  fullImageCard: {
    width: 280,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111',
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:100,
  },
  fullImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  fullFoodImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#111',
    paddingVertical: 20,  // Increased vertical padding
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    backgroundColor: '#c92828',
    paddingVertical: 15,  // Increased vertical padding
    paddingHorizontal: 40, // Increased horizontal padding
    borderRadius: 10,     // Slightly larger border radius
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,  // Increased font size
  },
  profileIcon: {
    padding: 5,
  },
});


export default HomeScreen;
