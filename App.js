// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from './context/CartContext';
import { PrinterProvider } from './context/PrinterContext';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import OrderFood from './screens/OrderFood';
import AddToCart from './screens/AddToCart';
import Payment from './screens/Payment';
import OrderConfirmation from './screens/OrderConfirmation';
import TrackOrder from './screens/TrackOrder';
import Profile from './screens/Profile';
import Cart from './screens/Cart';
import CheckoutScreen from './screens/CheckoutScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <CartProvider>
      <PrinterProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}} />
            <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}} />
            <Stack.Screen name="OrderFood" component={OrderFood} options={{headerShown:false}} />
            <Stack.Screen name="AddToCart" component={AddToCart} options={{headerShown:false}} />
            <Stack.Screen name="Payment" component={Payment} options={{headerShown:false}} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} options={{headerShown:false}} />
            <Stack.Screen name="TrackOrder" component={TrackOrder} options={{headerShown:false}} />
            <Stack.Screen name="Profile" component={Profile} options={{headerShown:false}} />
            <Stack.Screen name="Cart" component={Cart} options={{headerShown:false}} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{headerShown:false}} />
          </Stack.Navigator>
        </NavigationContainer>
      </PrinterProvider>
    </CartProvider>
  );
}



// App.js
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { CartProvider } from './context/CartContext';
// import HomeScreen from './screens/HomeScreen';
// import LoginScreen from './screens/LoginScreen';
// import OrderFood from './screens/OrderFood';
// import AddToCart from './screens/AddToCart';
// import Payment from './screens/Payment';
// import OrderConfirmation from './screens/OrderConfirmation';
// import TrackOrder from './screens/TrackOrder';
// import Profile from './screens/Profile';
// import Cart from './screens/Cart';
// import CheckoutScreen from './screens/CheckoutScreen';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <CartProvider>
//       <NavigationContainer>
//         <Stack.Navigator initialRouteName="Home">
//           <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}} />
//           <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}} />
//           <Stack.Screen name="OrderFood" component={OrderFood} options={{headerShown:false}} />
//           <Stack.Screen name="AddToCart" component={AddToCart} options={{headerShown:false}} />
//           <Stack.Screen name="Payment" component={Payment} options={{headerShown:false}} />
//           <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} options={{headerShown:false}} />
//           <Stack.Screen name="TrackOrder" component={TrackOrder} options={{headerShown:false}} />
//           <Stack.Screen name="Profile" component={Profile} options={{headerShown:false}} />
//           <Stack.Screen name="Cart" component={Cart} options={{headerShown:false}} />
//           <Stack.Screen name="Checkout" component={CheckoutScreen} options={{headerShown:false}} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </CartProvider>
//   );
// }
