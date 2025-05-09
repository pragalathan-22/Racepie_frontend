import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { usePrinter } from '../context/PrinterContext';
import { WebView } from 'react-native-webview';
import { Buffer } from 'buffer';
import axios from 'axios';

const RAZORPAY_CONFIG = {
  KEY_ID: 'rzp_test_TgoyRB6TISQvTe',
  KEY_SECRET: '4j71MwXwEcplPWrqD7DLvNoQ',
  CURRENCY: 'INR',
  COMPANY_NAME: 'Recepie',
  DESCRIPTION: 'Food Order Payment',
  THEME_COLOR: '#c92828',
  BACKEND_URL: 'https://recepie-backend-9.onrender.com/api'
};

const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clearCart, cartItems } = useCart();
  const { printReceipt } = usePrinter();
  const { orderDetails } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [checkoutHtml, setCheckoutHtml] = useState(null);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const handlePaymentSuccess = async (paymentMethod, paymentId = null) => {
    try {
      const receiptData = {
        orderId: orderDetails.orderId,
        orderTime: new Date().toISOString(),
        cartItems: cartItems,
        total: orderDetails.total,
        paymentMethod: paymentMethod,
        deliveryAddress: orderDetails.deliveryAddress,
        customerName: orderDetails.name || 'Customer',
        customerPhone: orderDetails.phone || '9876543210',
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.rate,
          total: item.rate * item.quantity
        }))
      };
      
      // Print receipt
      await printReceipt(receiptData);
      
      // Clear cart
      clearCart();
      
      // Navigate to OrderConfirmation with all necessary data
      navigation.reset({
        index: 0,
        routes: [{
          name: 'OrderConfirmation',
          params: {
            orderId: orderDetails.orderId,
            paymentId: paymentId,
            paymentMethod: paymentMethod,
            orderDetails: receiptData,
            status: 'success',
            message: 'Your order has been placed successfully!'
          }
        }]
      });
    } catch (error) {
      console.error('Error in payment success flow:', error);
      Alert.alert('Error', 'Failed to complete the order process. Please try again.');
    }
  };

  const handleDeepLink = (event) => {
    const url = event.url;
    console.log('Deep link received:', url);
    
    if (url.includes('razorpay_payment_id')) {
      const paymentId = url.split('razorpay_payment_id=')[1].split('&')[0];
      console.log('Payment successful, ID:', paymentId);
      handlePaymentSuccess('Razorpay', paymentId);
    } else if (url.includes('payment_failed')) {
      console.log('Payment failed');
      Alert.alert('Payment Failed', 'Please try again');
    }
  };

  const storeOrderInBackend = async (orderData) => {
    try {
      const formattedOrderData = {
        order_number: orderData.order_number,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        status: orderData.status,
        notes: orderData.special_instructions || '',
        items: orderData.items.map(item => ({
          food_item: item.food_item,
          quantity: item.quantity,
          price: item.price
        }))
      };

      console.log('Sending order data:', JSON.stringify(formattedOrderData, null, 2));

      const response = await fetch(`${RAZORPAY_CONFIG.BACKEND_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formattedOrderData),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        console.error('Order tracking error:', responseData);
        throw new Error(responseData.detail || 'Failed to store order');
      }

      return responseData;
    } catch (error) {
      console.error('Error storing order:', error);
      throw error;
    }
  };

  const storeTransaction = async (paymentData, orderId) => {
    try {
      const transactionData = {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        // amount: Math.round(orderDetails.total * 100),
        amount: Math.round(parseFloat(orderDetails.total) * 1),
        status: 'success'
      };

      console.log('Sending transaction data:', JSON.stringify(transactionData, null, 2));

      const response = await fetch(`${RAZORPAY_CONFIG.BACKEND_URL}/transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      const responseData = await response.json();
      console.log('Transaction API Response:', responseData);

      if (!response.ok) {
        console.error('Transaction tracking error:', responseData);
        throw new Error(responseData.detail || 'Failed to store transaction');
      }

      return responseData;
    } catch (error) {
      console.error('Error storing transaction:', error);
      throw error;
    }
  };

  const handleCashOnDelivery = async () => {
    try {
      setLoading(true);
      
      const orderData = {
        order_number: `ORDER_${Date.now()}`,
        customer_name: orderDetails.name || 'Customer',
        customer_phone: orderDetails.phone || '9876543210',
        total_amount: orderDetails.total,
        status: 'pending',
        items: cartItems.map(item => ({
          food_item: item.id,
          quantity: item.quantity,
          price: item.rate
        })),
        special_instructions: orderDetails.specialInstructions || ''
      };

      console.log('Prepared order data:', JSON.stringify(orderData, null, 2));

      const storedOrder = await storeOrderInBackend(orderData);
      console.log('Stored order response:', storedOrder);

      const receiptData = {
        orderId: orderData.order_number,
        orderTime: new Date().toISOString(),
        cartItems: cartItems,
        total: orderDetails.total,
        paymentMethod: 'Cash on Delivery',
        deliveryAddress: orderDetails.deliveryAddress || 'Not specified',
        customerName: orderDetails.name || 'Customer',
        customerPhone: orderDetails.phone || '9876543210',
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.rate,
          total: item.rate * item.quantity
        }))
      };
      
      await printReceipt(receiptData);
      clearCart();
      
      navigation.navigate('OrderConfirmation', {
        orderId: orderData.order_number,
        paymentMethod: 'Cash on Delivery',
        orderDetails: receiptData
      });
    } catch (error) {
      console.error('Error in COD process:', error);
      Alert.alert(
        'Order Failed',
        error.message || 'Failed to process order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);  
    }
  };

  const startRazorpayPayment = async () => {
    if (!orderDetails) {
      Alert.alert('Error', 'No order details found');
      return;
    }
  
    setLoading(true);
    try {
      // Create order in backend (initial status: pending)
      const orderData = {
        order_number: `ORDER_${Date.now()}`,
        customer_name: orderDetails.name || 'Customer',
        customer_phone: orderDetails.phone || '9876543210',
        total_amount: orderDetails.total,
        status: 'pending',
        items: cartItems.map(item => ({
          food_item: item.id,
          quantity: item.quantity,
          price: item.rate
        })),
        special_instructions: orderDetails.specialInstructions || ''
      };
  
      const storedOrder = await storeOrderInBackend(orderData);
      console.log('Stored order response:', storedOrder);
  
      // Create Razorpay order
      const response = await axios.post(`${RAZORPAY_CONFIG.BACKEND_URL}/create-razorpay-order/`, {
        // amount: Math.round(orderDetails.total * 100),
        amount: Math.round(parseFloat(orderDetails.total) * 1),
        currency: RAZORPAY_CONFIG.CURRENCY,
        receipt: `receipt_${storedOrder.id}`,
        notes: {
          order_id: storedOrder.id,
          customer_name: orderDetails.name
        }
      });
  
      const { order_id, amount, currency, key_id } = response.data;
  
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: RAZORPAY_CONFIG.COMPANY_NAME,
        description: RAZORPAY_CONFIG.DESCRIPTION,
        order_id: order_id,
        prefill: {
          name: orderDetails.name || 'Customer',
          email: orderDetails.email || 'customer@example.com',
          contact: orderDetails.phone || '9876543210'
        },
        theme: {
          color: RAZORPAY_CONFIG.THEME_COLOR
        },
        handler: function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify(response));
        },
        modal: {
          ondismiss: function() {
            window.ReactNativeWebView.postMessage('dismissed');
          }
        }
      };
  
      const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body>
          <script>
            var options = ${JSON.stringify(options)};
            options.handler = function (response) {
              // After payment success, send payment details back to React Native
              window.ReactNativeWebView.postMessage(JSON.stringify(response));
            };
            options.modal = {
              ondismiss: function() {
                window.ReactNativeWebView.postMessage('dismissed');
              }
            };
            var rzp = new Razorpay(options);
            rzp.open();
          </script>
        </body>
      </html>
    `;
    
  
      const encodedHtml = Buffer.from(htmlContent).toString('base64');
      setCheckoutHtml(`data:text/html;base64,${encodedHtml}`);
  
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      Alert.alert('Error', 'Unable to create payment order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const onWebViewMessage = async (event) => {
    const data = event.nativeEvent.data;

    if (data === 'dismissed') {
      Alert.alert('Payment Cancelled', 'Payment was cancelled by the user');
      setCheckoutHtml(null);
      return;
    }

    try {
      const paymentData = JSON.parse(data);
      
      const receiptData = {
        orderId: `ORDER_${Date.now()}`,
        orderTime: new Date().toISOString(),
        cartItems: cartItems,
        total: orderDetails.total,
        paymentMethod: 'Razorpay',
        deliveryAddress: orderDetails.deliveryAddress,
        customerName: orderDetails.name || 'Customer',
        customerPhone: orderDetails.phone || '9876543210',
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.rate,
          total: item.rate * item.quantity
        }))
      };

      await printReceipt(receiptData);
      clearCart();

      setTimeout(() => {
        setCheckoutHtml(null);
        navigation.navigate('OrderConfirmation', {
          orderId: receiptData.orderId,
          paymentMethod: 'Razorpay',
          orderDetails: receiptData
        });
      }, 4000);
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment processing failed. Please try again.');
      setCheckoutHtml(null);
    }
  };
  
  if (!orderDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No order details found</Text>
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
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {!checkoutHtml ? (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Order ID:</Text>
                <Text style={styles.summaryValue}>{orderDetails.orderId}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items:</Text>
                <Text style={styles.summaryValue}>{orderDetails.totalItems}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount:</Text>
                <Text style={styles.summaryValue}>₹{orderDetails.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
            
            <TouchableOpacity 
              style={styles.paymentOption}
              onPress={startRazorpayPayment}
              disabled={loading}
            >
              <View style={styles.paymentOptionContent}>
                <Ionicons name="card" size={24} color="#c92828" />
                <View style={styles.paymentOptionText}>
                  <Text style={styles.paymentOptionTitle}>Pay with Razorpay</Text>
                  <Text style={styles.paymentOptionSubtitle}>
                    Credit/Debit Card, UPI, NetBanking
                  </Text>
                </View>
              </View>
              {loading && <ActivityIndicator color="#c92828" />}
            </TouchableOpacity>

            {/* <TouchableOpacity 
              style={styles.paymentOption}
              onPress={handleCashOnDelivery}
            >
              <View style={styles.paymentOptionContent}>
                <Ionicons name="cash" size={24} color="#c92828" />
                <View style={styles.paymentOptionText}>
                  <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                  <Text style={styles.paymentOptionSubtitle}>Pay when you receive your order</Text>
                </View>
              </View>
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <WebView
      originWhitelist={['*']}
      source={{ uri: checkoutHtml }}  // Razorpay HTML content or URL
      onMessage={onWebViewMessage}  // Listen to messages from the WebView
      startInLoadingState={true}
      renderLoading={() => (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#c92828" />
        </View>
      )}
      onNavigationStateChange={(navState) => {
        // Handle Razorpay-specific URL or any navigation state changes
        if (navState.url.includes('razorpay_payment_id')) {
          setCheckoutHtml(null);  // Close the WebView when payment is done
        }
      }}
    />
        </View>
      )}
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
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  paymentOption: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionText: {
    marginLeft: 15,
  },
  paymentOptionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentOptionSubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  orderSummary: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 16,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});

export default Payment; 