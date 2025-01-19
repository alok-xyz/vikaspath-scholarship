import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signOutUser } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CircularProgress, Box } from '@mui/material';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Check for custom auth in localStorage
    const customAuth = localStorage.getItem('customAuth');
    if (customAuth) {
      setCurrentUser(JSON.parse(customAuth));
    }

    return unsubscribe;
  }, []);

  const login = async (userData) => {
    // Store custom auth data
    localStorage.setItem('customAuth', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('customAuth');
    localStorage.removeItem('userType');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    signOutUser
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
