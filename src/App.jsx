import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { StudentDataProvider } from './context/StudentDataContext';
import PrivateRoute from './components/PrivateRoute';
import "bootstrap/dist/css/bootstrap.min.css";
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import RegistrationModal from './components/RegistrationModal';
import LoginModal from './components/LoginModal';
import Dashboard from './components/Dashboard/Dashboard';
import ApplicationForm from './components/Dashboard/ApplicationForm';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import InstitutionDashboard from './components/Dashboard/InstitutionDashboard';
import About from './components/About';
import HowToApply from './components/Howtoapply';
import Downloads from './components/Downloads';
import Contact from './components/Contact';
import NotFound from './components/404';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
    },
    secondary: {
      main: '#ff4081',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Wrapper component to handle conditional header rendering
const AppContent = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const location = useLocation();

  const handleRegisterClick = () => {
    setIsRegistrationOpen(true);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
  };

  const handleCloseRegistration = () => {
    setIsRegistrationOpen(false);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  // Check if current path should show header
  const shouldShowHeader = !location.pathname.includes('/dashboard') && 
                         !location.pathname.includes('/application-form') &&
                         !location.pathname.includes('/admin/dashboard') &&
                         !location.pathname.includes('/admin-login') &&
                         !location.pathname.includes('/institution-dashboard') &&
                         !location.pathname.includes('/institution/dashboard');

  return (
    <div className="App">
      <ToastContainer position="top-right" />
      {shouldShowHeader && (
        <Header
          onRegisterClick={handleRegisterClick}
          onLoginClick={handleLoginClick}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <Footer />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/application"
          element={
            <PrivateRoute>
              <ApplicationForm />
            </PrivateRoute>
          }
        />
        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        {/* Institution Routes */}
        <Route 
          path="/institution-dashboard" 
          element={
            <PrivateRoute>
              <InstitutionDashboard />
            </PrivateRoute>
          } 
        />
        <Route
          path="/institution/dashboard/:institutionName"
          element={
            <PrivateRoute>
              <InstitutionDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route 
          path="/about" 
          element={
            <>
              <About />
              <Footer />
            </>
          } 
        />
        <Route 
          path="/howtoapply" 
          element={
            <>
              <HowToApply />
              <Footer />
            </>
          } 
        />
        <Route 
          path="/downloads" 
          element={
            <>
              <Downloads />
              <Footer />
            </>
          } 
        />
        <Route 
          path="/contact" 
          element={
            <>
              <Contact />
              <Footer />
            </>
          } 
        />
        {/* 404 Route - This should be the last route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <RegistrationModal
        open={isRegistrationOpen}
        onClose={handleCloseRegistration}
      />
      <LoginModal
        open={isLoginOpen}
        onClose={handleCloseLogin}
      />
    </div>
  );
};

function App() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }

      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleSelect = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelect);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelect);
    };
  }, []);

  const preventSelectionStyles = `
    * {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  `;

  return (
    <ThemeProvider theme={theme}>
      <style>{preventSelectionStyles}</style>
      <AuthProvider>
        <StudentDataProvider>
          <Router>
            <AppContent />
          </Router>
        </StudentDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
