import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import ThermalPrinterModule from 'react-native-thermal-receipt-printer';

const PrinterContext = createContext();

export const PrinterProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [printer, setPrinter] = useState(null);

  const connectToPrinter = async () => {
    try {
      const printers = await ThermalPrinterModule.getBluetoothDeviceList();
      if (printers.length === 0) {
        Alert.alert('No printers found', 'Please make sure your printer is turned on and in range.');
        return false;
      }

      // For demo purposes, we'll use the first printer found
      const printer = printers[0];
      const connected = await ThermalPrinterModule.connectBluetoothPrinter(printer.address);
      
      if (connected) {
        setPrinter(printer);
        setIsConnected(true);
        return true;
      } else {
        Alert.alert('Connection failed', 'Could not connect to the printer.');
        return false;
      }
    } catch (error) {
      console.error('Error connecting to printer:', error);
      // Alert.alert('Error', 'Failed to connect to printer.');
      return false;
    }
  };

  const printReceipt = async (orderDetails) => {
    if (!isConnected) {
      const connected = await connectToPrinter();
      if (!connected) return;
    }

    try {
      // Start printing
      await ThermalPrinterModule.printText('\n');
      await ThermalPrinterModule.printText('RECEIPT\n');
      await ThermalPrinterModule.printText('----------------\n');
      await ThermalPrinterModule.printText(`Order ID: ${orderDetails.orderId}\n`);
      await ThermalPrinterModule.printText(`Time: ${new Date(orderDetails.orderTime).toLocaleString()}\n\n`);
      
      // Print items
      await ThermalPrinterModule.printText('ITEMS\n');
      await ThermalPrinterModule.printText('----------------\n');
      orderDetails.cartItems.forEach(item => {
        ThermalPrinterModule.printText(`${item.name} x${item.quantity}\n`);
        ThermalPrinterModule.printText(`₹${item.rate.toFixed(2)}\n`);
      });
      
      // Print total
      await ThermalPrinterModule.printText('\n----------------\n');
      await ThermalPrinterModule.printText(`Total: ₹${orderDetails.total.toFixed(2)}\n`);
      await ThermalPrinterModule.printText(`Payment Method: ${orderDetails.paymentMethod || 'Cash on Delivery'}\n\n`);
      
      // Print delivery address
      if (orderDetails.deliveryAddress) {
        await ThermalPrinterModule.printText('DELIVERY ADDRESS\n');
        await ThermalPrinterModule.printText('----------------\n');
        await ThermalPrinterModule.printText(`${orderDetails.deliveryAddress}\n\n`);
      }
      
      // Print thank you message
      await ThermalPrinterModule.printText('Thank you for your order!\n');
      await ThermalPrinterModule.printText('\n\n\n'); // Add some space at the end

      Alert.alert('Success', 'Receipt printed successfully!');
    } catch (error) {
      console.error('Error printing receipt:', error);
      Alert.alert('Error', 'Failed to print receipt.');
    }
  };

  const disconnectPrinter = async () => {
    try {
      await ThermalPrinterModule.disconnectBluetoothPrinter();
      setIsConnected(false);
      setPrinter(null);
    } catch (error) {
      console.error('Error disconnecting printer:', error);
    }
  };

  return (
    <PrinterContext.Provider
      value={{
        isConnected,
        printer,
        connectToPrinter,
        printReceipt,
        disconnectPrinter,
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
};

export const usePrinter = () => {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error('usePrinter must be used within a PrinterProvider');
  }
  return context;
}; 