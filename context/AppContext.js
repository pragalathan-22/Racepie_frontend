import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCompanyInfo, getFoodItems } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [companyInfo, setCompanyInfo] = useState(null);
    const [foodItems, setFoodItems] = useState({
        top_rated: [],
        recommended: [],
        all: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [companyData, foodData] = await Promise.all([
                getCompanyInfo(),
                getFoodItems()
            ]);
            setCompanyInfo(companyData);
            setFoodItems(foodData);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching initial data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refreshData = () => {
        fetchData();
    };

    return (
        <AppContext.Provider value={{
            companyInfo,
            foodItems,
            loading,
            error,
            refreshData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}; 