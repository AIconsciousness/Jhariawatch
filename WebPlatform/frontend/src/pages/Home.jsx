import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Camera, Bell, Shield, Phone, AlertTriangle, TrendingDown, Satellite } from 'lucide-react';
import RiskMap from '../components/RiskMap';
import LanguageToggle from '../components/LanguageToggle';
import RiskBadge from '../components/RiskBadge';
import { riskAPI, alertAPI } from '../services/api';

const Home = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [userLocation, setUserLocation] = useState(null);
  const [currentRisk, setCurrentRisk] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        const [alertsRes, statsRes] = await Promise.all([
          alertAPI.getAlerts({ limit: 3 }),
          riskAPI.getStatistics()
        ]);
        
        if (alertsRes.data.success) {
          setAlerts(alertsRes.data.data.alerts);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(loc);
            
            try {
              const riskRes = await riskAPI.checkLocation(loc.lat, loc.lng);
              if (riskRes.data.success) {
                setCurrentRisk(riskRes.data.data);
              }
            } catch (error) {
              console.error('Failed to check risk:', error);
            }
          },
          () => {
            setUserLocation({ lat: 23.75, lng: 86.42 });
          }
        );
      }
      
      setLoading(false);
    };

    initData();
  }, []);

  const quickActions = [
    { icon: MapPin, label: t('home.checkRisk'), path: '/dashboard/risk-check', color: 'bg-red-500' },
    { icon: Camera, label: t('home.submitReport'), path: '/dashboard/report', color: 'bg-blue-500' },
    { icon: Satellite, label: language === 'hi' ? 'सैटेलाइट डेटा' : 'Satellite Data', path: '/dashboard/satellite', color: 'bg-purple-500' },
    { icon: Bell, label: t('home.viewAlerts'), path: '/dashboard/alerts', color: 'bg-yellow-500', badge: alerts.length },
    { icon: Shield, label: t('home.safetyTips'), path: '/dashboard/safety', color: 'bg-green-500' }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="gradient-primary text-white px-4 pt-6 pb-8 rounded-b-3xl relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{t('home.title')}</h1>
            <p className="text-white/70 text-sm mt-1">{t('home.subtitle')}</p>
          </div>
          <LanguageToggle className="text-white" />
        </div>

        {currentRisk && currentRisk.riskAssessment && (
          <div 
            className="mt-4 p-4 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: currentRisk.color + '20' }}
          >
            <div className="p-2 rounded-full" style={{ backgroundColor: currentRisk.color + '30' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: currentRisk.color }} />
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-xs">{t('home.riskStatus')}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-lg" style={{ color: currentRisk.color }}>
                  {t(`risk.${currentRisk.riskAssessment.riskLevel || currentRisk.riskAssessment.zone?.riskLevel || 'stable'}`)}
                </span>
                {currentRisk.riskAssessment.subsidenceData && (
                  <span className="text-white/60 text-sm">
                    ({currentRisk.riskAssessment.subsidenceData.averageRate} mm{t('home.perYear')})
                  </span>
                )}
              </div>
            </div>
            <RiskBadge 
              level={currentRisk.riskAssessment.riskLevel || currentRisk.riskAssessment.zone?.riskLevel || 'stable'} 
              size="sm" 
            />
          </div>
        )}
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-sm">
                {language === 'hi' ? 'झरिया जोखिम मानचित्र' : 'Jharia Risk Map'}
              </h3>
              <span className="text-xs text-gray-600">
                {language === 'hi' ? 'PS-InSAR डेटा' : 'PS-InSAR Data'}
              </span>
            </div>
          </div>
          <RiskMap 
            userLocation={userLocation} 
            height="250px"
            onZoneClick={(zone) => navigate('/dashboard/risk-check', { state: { zone } })}
          />
          {stats && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {language === 'hi' ? 'कुल जोन:' : 'Total Zones:'} <strong className="text-gray-800">{stats.totalZones || 0}</strong>
                </span>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                    🔴 {stats.byRiskLevel?.critical || 0}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                    🟠 {stats.byRiskLevel?.high || 0}
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                    🟡 {stats.byRiskLevel?.moderate || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Satellite Data Status */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Satellite className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-800">
              {language === 'hi' ? 'सैटेलाइट डेटा स्थिति' : 'Satellite Data Status'}
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {language === 'hi' ? 'Sentinel-1' : 'Sentinel-1'}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {language === 'hi' ? 'सक्रिय' : 'Active'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {language === 'hi' ? 'अंतिम अपडेट' : 'Last Update'}
              </span>
              <span className="text-sm text-gray-800">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {language === 'hi' ? 'कवरेज' : 'Coverage'}
              </span>
              <span className="text-sm text-gray-800">
                {language === 'hi' ? 'झरिया क्षेत्र' : 'Jharia Region'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">{t('home.quickActions')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition relative"
            >
              <div className={`p-3 rounded-full ${action.color}`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
              {action.badge > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="px-4 mt-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Satellite className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-gray-800">{t('home.psinsar')}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{stats.byRiskLevel?.critical || 0}</p>
                <p className="text-xs text-gray-500">{t('risk.critical')}</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats.byRiskLevel?.high || 0}</p>
                <p className="text-xs text-gray-500">{t('risk.high')}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{stats.byRiskLevel?.moderate || 0}</p>
                <p className="text-xs text-gray-500">{t('risk.moderate')}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-500">{language === 'hi' ? 'अधिकतम धंसाव दर' : 'Max Subsidence Rate'}</span>
              <span className="font-bold text-red-600 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                {stats.maxSubsidenceRate} mm/year
              </span>
            </div>
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="px-4 mt-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">{t('alerts.title')}</h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div 
                key={alert.alertId}
                className="bg-white rounded-xl p-4 shadow-sm border-l-4"
                style={{ borderLeftColor: getSeverityColor(alert.severity).replace('bg-', '#') }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {alert.title?.[language] || alert.title?.en}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {alert.message?.[language] || alert.message?.en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/dashboard/emergency')}
        className="fixed bottom-20 right-4 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition z-40"
      >
        <Phone className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Home;
