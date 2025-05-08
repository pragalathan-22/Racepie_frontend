import { API_CONFIG } from '../config/api';
import { API_BASE_URL } from '../config/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Company Info API
export const getCompanyInfo = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY}`, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching company info:', error);
    throw error;
  }
};

// Food Items API
export const getFoods = async () => {
  try {
    console.log('Fetching from:', `${API_BASE_URL}/foods/`);
    const response = await fetch(`${API_BASE_URL}/foods/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    // If the data is already in the correct format, return it directly
    if (data.top_rated && data.recommended && data.all) {
      return data;
    }
    
    // If the data is an array, transform it into the required format
    if (Array.isArray(data)) {
      return {
        top_rated: data.filter(food => food.rating >= 4.0).slice(0, 5),
        recommended: data.filter(food => food.is_recommended).slice(0, 5),
        all: data
      };
    }
    
    // If the data is in a different format, try to extract the foods array
    const foodsArray = data.foods || data.results || data.items || [];
    return {
      top_rated: foodsArray.filter(food => food.rating >= 4.0).slice(0, 5),
      recommended: foodsArray.filter(food => food.is_recommended).slice(0, 5),
      all: foodsArray
    };
    
  } catch (error) {
    console.error('Error in getFoods:', error);
    throw error;
  }
};

// Orders API
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}; 