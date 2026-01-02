import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { signInWithGoogle as firebaseGoogleSignIn, initializeFirebase } from '../services/firebaseAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to extract error message string
const getErrorMessage = (error, fallback = 'An error occurred') => {
  if (typeof error === 'string') return error;
  if (error?.message) {
    if (typeof error.message === 'string') return error.message;
    if (typeof error.message === 'object') {
      return error.message.en || error.message.hi || fallback;
    }
  }
  if (error?.en || error?.hi) {
    return error.en || error.hi;
  }
  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize Firebase if configured
    initializeFirebase();
    
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('🔐 Login attempt:', { email });
      console.log('📤 Request URL:', api.defaults.baseURL + '/auth/login');
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('✅ Login response received');
      console.log('  - Status:', response.status);
      console.log('  - Data:', response.data);
      console.log('  - Data type:', typeof response.data);
      console.log('  - Full response:', JSON.stringify(response.data, null, 2));
      
      // Check response structure - handle empty string responses
      if (!response || response.data === undefined || response.data === null) {
        console.error('❌ Invalid response structure:', response);
        return {
          success: false,
          error: 'Invalid server response'
        };
      }

      // Handle empty string response (common with proxy issues)
      if (response.data === '' || (typeof response.data === 'string' && response.data.trim() === '')) {
        console.error('❌ Empty response body - possible proxy/CORS issue');
        return {
          success: false,
          error: 'Server returned empty response. Please check backend configuration.'
        };
      }

      if (response.data.success === true) {
        const { token, user: userData} = response.data.data || {};
        if (!token || !userData) {
          console.error('❌ Missing token or user data:', response.data);
          return {
            success: false,
            error: 'Missing authentication data'
          };
        }
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      
      console.warn('⚠️ Login failed - response not successful:', JSON.stringify(response.data, null, 2));
      const error = getErrorMessage(response.data.error, 'Login failed');
      return { success: false, error };
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: { url: err.config?.url, method: err.config?.method }
      });
      
      // Network error (backend not running, CORS, etc.)
      if (!err.response) {
        const networkError = 'Cannot connect to server. Please check if backend is running.';
        setError(networkError);
        return { success: false, error: networkError };
      }

      // Server error response
      let errorMsg = 'Login failed';

      if (err.response?.data) {
        errorMsg = getErrorMessage(err.response.data.error || err.response.data, errorMsg);
      }

      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('📝 Register attempt:', { email: userData.email, name: userData.name });
      const response = await api.post('/auth/register', userData);
      console.log('✅ Register response:', JSON.stringify(response.data, null, 2));
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data type:', typeof response.data);
      console.log('Response data length:', response.data?.length || 'N/A');
      
      // Check response structure - handle empty string responses
      if (!response || response.data === undefined || response.data === null) {
        console.error('❌ Invalid response structure:', response);
        return {
          success: false,
          error: 'Invalid server response'
        };
      }

      // Handle empty string response (common with proxy issues)
      if (response.data === '' || (typeof response.data === 'string' && response.data.trim() === '')) {
        console.error('❌ Empty response body - possible proxy/CORS issue');
        return {
          success: false,
          error: 'Server returned empty response. Please check backend configuration.'
        };
      }

      if (response.data.success === true) {
        const { token, user: newUser } = response.data.data || {};
        if (!token || !newUser) {
          console.error('❌ Missing token or user data:', response.data);
          return {
            success: false,
            error: 'Missing authentication data'
          };
        }
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return { success: true };
      }
      
      console.warn('⚠️ Registration failed - response not successful:', JSON.stringify(response.data, null, 2));
      const error = getErrorMessage(response.data.error, 'Registration failed');
      return { success: false, error };
    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: { url: err.config?.url, method: err.config?.method }
      });
      
      // Network error (backend not running, CORS, etc.)
      if (!err.response) {
        const networkError = 'Cannot connect to server. Please check if backend is running.';
        setError(networkError);
        return { success: false, error: networkError };
      }

      // Server error response
      let errorMsg = 'Registration failed';

      if (err.response?.data) {
        errorMsg = getErrorMessage(err.response.data.error || err.response.data, errorMsg);
      }

      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await firebaseGoogleSignIn();
      
      if (result.success) {
        // Send Firebase token to backend for user creation/login
        const response = await api.post('/auth/google', {
          token: result.token,
          user: result.user
        });
        
        if (response.data.success) {
          const { token, user: userData } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          return { success: true };
        }
        return { success: false, error: response.data.error };
      }
      return result;
    } catch (err) {
      console.error('Google sign in error:', err);
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.error || 'Google sign in failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
