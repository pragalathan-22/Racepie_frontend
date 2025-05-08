import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const AddToCart = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addToCart, cartItems } = useCart();
  const { item } = route.params || {};

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Process image URL if needed
  const processedItem = item ? {
    ...item,
    image: item.image.startsWith('http') ? item.image : `https://recepie-backend-9.onrender.com/${item.image}`
  } : null;

  // Helper function to safely convert rate to number
  const getSafeRate = (rate) => {
    if (rate === undefined || rate === null) return 0;
    const num = parseFloat(rate);
    return isNaN(num) ? 0 : num;
  };

  const handleAddToCart = () => {
    if (processedItem) {
      try {
        // Add to local cart
        addToCart({
          ...processedItem,
          quantity,
          specialInstructions,
          rate: getSafeRate(processedItem.rate),
        });

        // Reset form
        setQuantity(1);
        setSpecialInstructions('');
        Alert.alert('Product added successfully');
      } catch (error) {
        console.error('Error adding to cart:', error);
        Alert.alert('Error', 'Failed to add item to cart. Please try again.');
      }
    }
  };

  const handleContinueShopping = () => {
    navigation.navigate('OrderFood');
  };

  const handleViewCart = () => {
    navigation.navigate('Cart');
  };

  const handleTrackOrder = () => {
    if (orderId) {
      navigation.navigate('TrackOrder', { orderId });
    } else {
      Alert.alert('Error', 'No order ID found');
    }
  };

  if (!processedItem) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Item not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Cart</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Food Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: processedItem.image }}
            style={styles.foodImage}
            resizeMode="cover"
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          {hasError && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorText}>Image not available</Text>
            </View>
          )}
        </View>

        {/* Food Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.foodName}>{processedItem.name}</Text>
          <Text style={styles.foodPrice}>₹{getSafeRate(processedItem.rate).toFixed(2)}</Text>
          {processedItem.description && (
            <Text style={styles.foodDescription}>{processedItem.description}</Text>
          )}
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Calculation */}
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceText}>Total Price: ₹{(getSafeRate(processedItem.rate) * quantity).toFixed(2)}</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContinueShopping}
          >
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewCart}
          >
            <Text style={styles.secondaryButtonText}>View Cart</Text>
          </TouchableOpacity>
        </View>

        {orderId && (
          <TouchableOpacity
            style={styles.trackOrderButton}
            onPress={handleTrackOrder}
          >
            <Ionicons name="location" size={20} color="#fff" style={styles.trackOrderIcon} />
            <Text style={styles.trackOrderButtonText}>Track Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#c92828',
    padding: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width * 0.6,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  foodName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  foodPrice: {
    color: '#c92828',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  foodDescription: {
    color: '#888',
    fontSize: 16,
    lineHeight: 24,
  },
  quantityContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
  },
  quantityButton: {
    padding: 10,
  },
  quantityText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  totalPriceContainer: {
    padding: 20,
    marginTop: 10,
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
  },
  totalPriceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  addToCartButton: {
    backgroundColor: '#c92828',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trackOrderButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  trackOrderIcon: {
    marginRight: 10,
  },
  trackOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddToCart;
