import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/auth';

// Create context outside the component
const AuthContext = createContext();

// Named function for the provider
function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    loading: true,
    error: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedToken && storedUser && storedUser !== 'undefined') {
          const parsedUser = JSON.parse(storedUser);
          setAuthState({
            user: parsedUser,
            token: storedToken,
            loading: false,
            error: null
          });
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to initialize authentication' }));
      }
    };

    initializeAuth();
  }, []);

  const signup = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const response = await authService.signup(credentials);
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      setAuthState({
        user: response.user,
        token: response.access_token,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error.response?.data?.message || error.message || 'Signup failed',
        loading: false
      }));
    }
  };

  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const response = await authService.login(credentials);
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      setAuthState({
        user: response.user,
        token: response.access_token,
        loading: false,
        error: null
      });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail || 'Login failed. Please check your credentials.';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return false;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null
    });
  };

  const setUser = (newUser) => {
    setAuthState(prev => ({ ...prev, user: newUser }));
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const changePassword = async (old_password, new_password) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authService.changePassword({ old_password, new_password }, authState.token);
      setAuthState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to change password';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error; // Re-throw the error so the component can catch it
    }
  };

  const value = useMemo(() => ({
    user: authState.user,
    token: authState.token,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.token,
    signup,
    login,
    logout,
    clearError,
    setUser,
    changePassword
  }), [authState]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Named function for the hook
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export as named exports only
export { AuthProvider, useAuth };