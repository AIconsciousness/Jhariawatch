import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { useNotifications } from './hooks/useNotifications';
import { setAnalyticsUserId, setAnalyticsUserProperties } from './services/analyticsService';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RiskCheck from './pages/RiskCheck';
import Report from './pages/Report';
import Alerts from './pages/Alerts';
import Safety from './pages/Safety';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import SatelliteData from './pages/SatelliteData';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();
  const { requestPermission, isDefault } = useNotifications();

  // Set analytics user properties
  useEffect(() => {
    if (user) {
      setAnalyticsUserId(user._id);
      setAnalyticsUserProperties({
        language: user.preferredLanguage,
        role: user.role,
        area: user.addressDetails?.area
      });
    }
  }, [user]);

  // Auto-request notification permission for logged-in users
  useEffect(() => {
    if (user && isDefault) {
      // Show permission prompt after 3 seconds
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, isDefault, requestPermission]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user && !loading ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user && !loading ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="risk-check" element={<RiskCheck />} />
        <Route path="report" element={<Report />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="safety" element={<Safety />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="profile" element={<Profile />} />
        <Route path="satellite" element={<SatelliteData />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
