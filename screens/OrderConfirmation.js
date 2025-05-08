import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Button,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { Asset } from 'expo-asset';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const OrderConfirmation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderDetails } = route.params || {};
  const { clearCart } = useCart();
  const logoImage = Asset.fromModule(require('../assets/logo/logo.jpeg')).uri;

  const generateHTML = () => {
    const itemsHTML = orderDetails?.cartItems?.map(
      (item, index) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">₹${item.rate.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">₹${(item.quantity * item.rate).toFixed(2)}</td>
        </tr>
      `
    ).join('');

    return `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              display: flex;
              align-items: center;
              border-bottom: 2px solid #444;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .logo {
              width: 80px;
              height: auto;
              margin-right: 20px;
            }
            .company-details {
              font-size: 20px;
            }
            .summary p {
              margin: 4px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 14px;
            }
            th {
              background-color: #f2f2f2;
              text-align: left;
              padding: 10px;
              border: 1px solid #ccc;
            }
            h3.total {
              text-align: right;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoImage}" alt="Company Logo" class="logo" />
            <div class="company-details">
              <strong>Newtonsky5</strong><br/>
              Address: Chengalpattu<br/>
              Phone: 1234567890<br/>
              Email: newtonsky5tech@gmail.com
            </div>
          </div>

          <h2 style="text-align:center;">Order Receipt</h2>
          <div class="summary">
            <p><strong>Order ID:</strong> ${orderDetails?.orderId}</p>
            <p><strong>Date:</strong> ${new Date(orderDetails?.orderTime).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${orderDetails?.paymentMethod}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <h3 class="total">Total Amount: ₹${orderDetails?.total.toFixed(2)}</h3>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = async () => {
    try {
      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Confirmation</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.successText}>Order Placed Successfully!</Text>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderId}>Order ID: {orderDetails?.orderId}</Text>
          <Text style={styles.orderTime}>
            {new Date(orderDetails?.orderTime).toLocaleString()}
          </Text>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount:</Text>
            <Text style={styles.amountValue}>
              ₹{orderDetails?.total?.toFixed(2) || '0.00'}
            </Text>
          </View>

          <View style={styles.paymentMethod}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentValue}>{orderDetails?.paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Order</Text>
          {orderDetails?.cartItems?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {item.name} x {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ₹{(item.rate * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* PDF Button */}
        <TouchableOpacity style={styles.pdfButton} onPress={handleDownloadPDF}>
          <Text style={styles.pdfButtonText}>Download Receipt as PDF</Text>
        </TouchableOpacity>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  orderDetails: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  orderId: {
    fontSize: 16,
    color: '#ccc',
  },
  orderTime: {
    fontSize: 14,
    color: '#bbb',
    marginVertical: 5,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  amountLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  paymentValue: {
    fontSize: 16,
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemName: {
    fontSize: 16,
    color: '#fff',
  },
  itemPrice: {
    fontSize: 16,
    color: '#fff',
  },
  pdfButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
});

export default OrderConfirmation;
