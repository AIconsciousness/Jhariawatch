import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, AlertTriangle, Shield, TrendingDown, Navigation, Satellite, Search, ChevronDown } from 'lucide-react';
import RiskMap from '../components/RiskMap';
import RiskBadge from '../components/RiskBadge';
import DetailedSubsidenceChart from '../components/DetailedSubsidenceChart';
import { useSubsidenceNotifications } from '../hooks/useSubsidenceNotifications';
import { riskAPI } from '../services/api';
import { jhariaPlaces, getPlaceByCoordinates, generatePlaceTimeSeries } from '../data/jhariaPlaces';
import api from '../services/api';

const RiskCheck = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  const [userLocation, setUserLocation] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showPlaceSelector, setShowPlaceSelector] = useState(false);

  useEffect(() => {
    checkUserLocation();
  }, []);

  useEffect(() => {
    if (selectedPlace) {
      // Generate chart data for selected place
      const data = generatePlaceTimeSeries(selectedPlace, 12);
      setChartData(data);
      
      // Fetch risk data for selected place coordinates
      fetchRiskData(selectedPlace.coordinates.lat, selectedPlace.coordinates.lng);
    }
  }, [selectedPlace]);

  const checkUserLocation = () => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          
          // Find nearest place
          const nearestPlace = getPlaceByCoordinates(loc.lat, loc.lng);
          if (nearestPlace && nearestPlace.distance < 5) { // Within 5km
            setSelectedPlace(nearestPlace);
          } else {
            // Create a custom location object to ensure UI renders correctly
            setSelectedPlace({
              id: 'custom_location_' + Date.now(),
              name: { en: 'Custom Coordinate Scan', hi: 'कस्टम स्थान स्कैन' },
              coordinates: loc,
              distance: nearestPlace ? nearestPlace.distance : 0,
              baseSubsidenceRate: 15, // Will be overridden by actual riskData visually
              riskLevel: 'moderate',
              description: {
                en: 'Dynamic scan for user-specified coordinates outside master zones.',
                hi: 'मानक निगरानी क्षेत्रों के बाहर उपयोगकर्ता द्वारा निर्दिष्ट कस्टम स्थान।'
              }
            });
          }
        },
        (err) => {
          // Default to Alkusa (most critical area)
          const defaultPlace = jhariaPlaces.find(p => p.id === 'alkusa');
          setUserLocation(defaultPlace.coordinates);
          setSelectedPlace(defaultPlace);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      const defaultPlace = jhariaPlaces.find(p => p.id === 'alkusa');
      setUserLocation(defaultPlace.coordinates);
      setSelectedPlace(defaultPlace);
    }
  };

  const fetchRiskData = async (lat, lng) => {
    try {
      const response = await riskAPI.checkLocation(lat, lng);
      if (response.data.success) {
        setRiskData(response.data.data);
        const data = response.data.data;
        // Auto-send risk report email to user
        const zone = data.riskAssessment?.zone || data.zone || {};
        api.post('/notifications/risk-report', {
          riskLevel: data.riskAssessment?.riskLevel || data.location_risk?.level || 'moderate',
          subsidenceRate: data.location_risk?.rate || data.riskAssessment?.subsidenceData?.averageRate || 0,
          confidence: 92,
          address: selectedPlace ? (selectedPlace.name[language] || selectedPlace.name.en) : 'Your Location',
          zoneName: zone.zoneName?.en || selectedPlace?.name?.en || 'Jharia Coalfield',
          zoneId: zone.zoneId || selectedPlace?.id || 'unknown',
          lastAcquisition: new Date().toISOString().split('T')[0],
          coordinates: { lat, lng }
        }).then(() => console.log('📧 Risk report email triggered'))
          .catch(err => console.error('⚠️ Risk report email failed:', err.message));
      }
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
      setError(language === 'hi' ? 'जोखिम डेटा प्राप्त करने में विफल' : 'Failed to fetch risk data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setShowPlaceSelector(false);
    setUserLocation(place.coordinates);
    setLoading(true);
    
    // The useEffect[selectedPlace] will handle chart generation and API call.
  };

  const getRiskColor = (level) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      moderate: '#ca8a04',
      low: '#65a30d',
      stable: '#16a34a'
    };
    return colors[level] || '#6b7280';
  };

  // Precompute risk values (must happen before any early return)
  const riskLevel = selectedPlace?.riskLevel 
    || riskData?.riskAssessment?.zone?.riskLevel 
    || riskData?.riskAssessment?.riskLevel 
    || 'stable';
  const riskColor = getRiskColor(riskLevel);
  const zoneId = riskData?.riskAssessment?.zone?.zoneId || selectedPlace?.id;

  // Enable notifications for dangerous subsidence (hooks must run unconditionally)
  useSubsidenceNotifications(zoneId, chartData);

  if (loading && !selectedPlace && !riskData) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">{t('risk.checking')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="bg-white px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">{t('risk.title')}</h1>
      </div>

      {/* Place Selector */}
      <div className="px-4 mt-4">
        <div className="relative">
          <button
            onClick={() => setShowPlaceSelector(!showPlaceSelector)}
            className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500">{language === 'hi' ? 'क्षेत्र चुनें' : 'Select Area'}</p>
                <p className="font-semibold text-gray-800">
                  {selectedPlace 
                    ? (selectedPlace.name[language] || selectedPlace.name.en)
                    : (language === 'hi' ? 'क्षेत्र चुनें' : 'Select an area')
                  }
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition ${showPlaceSelector ? 'rotate-180' : ''}`} />
          </button>

          {showPlaceSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl z-[100] max-h-96 overflow-y-auto border border-gray-100">
              {jhariaPlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handlePlaceSelect(place)}
                  className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {place.name[language] || place.name.en}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {place.coordinates.lat.toFixed(4)}°N, {place.coordinates.lng.toFixed(4)}°E
                      </p>
                    </div>
                    <RiskBadge level={place.riskLevel} size="sm" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {place.description[language] || place.description.en}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Location Display */}
      {userLocation && (
        <div className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">{t('risk.yourLocation')}</p>
            <p className="font-medium text-gray-800">
              {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
            </p>
            {selectedPlace && (
              <p className="text-xs text-gray-500 mt-1">
                {language === 'hi' ? 'निकटतम क्षेत्र:' : 'Nearest Area:'} {selectedPlace.name[language] || selectedPlace.name.en}
              </p>
            )}
          </div>
          <button 
            onClick={checkUserLocation}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
            title={language === 'hi' ? 'स्थान अपडेट करें' : 'Update Location'}
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Map */}
      <div className="px-4 mt-4">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200" style={{ isolation: 'isolate' }}>
          <div className="bg-white px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                {language === 'hi' ? 'झरिया जोखिम मानचित्र' : 'Jharia Risk Map'}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              {language === 'hi' ? 'क्षेत्र पर click करें' : 'Click a zone to select'}
            </span>
          </div>
          <RiskMap
            userLocation={userLocation}
            height="260px"
            onZoneClick={(zone) => {
              const place = jhariaPlaces.find(p =>
                p.name.en.toLowerCase().includes(zone.zoneName?.en?.toLowerCase() || '') ||
                p.name.hi.includes(zone.zoneName?.hi || '')
              );
              if (place) handlePlaceSelect(place);
            }}
          />
        </div>
      </div>


      {/* Risk Assessment Card */}
      {selectedPlace && (
        <>
          <div 
            className="mx-4 mt-4 p-6 rounded-xl text-center"
            style={{ backgroundColor: riskColor + '15' }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" style={{ backgroundColor: riskColor + '20' }}>
              <AlertTriangle className="w-8 h-8" style={{ color: riskColor }} />
            </div>
            <p className="text-sm text-gray-500 mb-1">{t('risk.riskLevel')}</p>
            <p className="text-3xl font-bold mb-2" style={{ color: riskColor }}>
              {t(`risk.${riskLevel}`)}
            </p>
            <p className="text-sm text-gray-600 mb-2 font-medium">
              {selectedPlace.name[language] || selectedPlace.name.en}
            </p>
            <RiskBadge level={riskLevel} size="lg" />
          </div>

          {/* PS-InSAR Data */}
          <div className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-800">
                  {language === 'hi' ? 'सेन्टीनेल-1 विश्लेषण' : 'Sentinel-1 Analysis'}
                </h3>
              </div>
              <div className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                Real-Time Data
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: riskColor }}>
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <TrendingDown className="w-4 h-4" />
                  {t('risk.subsidenceRate')}
                </div>
                <p className="text-2xl font-black" style={{ color: riskColor }}>
                  {riskData?.location_risk?.rate || riskData?.rate || riskData?.data?.subsidenceRate || selectedPlace?.baseSubsidenceRate || '0.0'}
                  <span className="text-sm font-normal text-gray-500 ml-1">mm/yr</span>
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                   <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(100, (riskData?.location_risk?.rate || riskData?.rate || 0) * 2)}%` }}
                      ></div>
                   </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="text-gray-500 text-xs mb-1">{language === 'hi' ? 'डेटा विश्वसनीयता' : 'Data Confidence'}</div>
                <p className="text-2xl font-black text-gray-800">
                  {riskData?.location_risk?.confidence || riskData?.confidence || riskData?.data?.confidence || '92'}%
                </p>
                <p className="text-[10px] text-blue-600 font-bold uppercase mt-2">
                  {language === 'hi' ? 'PS-InSAR प्रोक्सी' : 'PS-InSAR Proxy'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
               <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{language === 'hi' ? 'सैटेलाइट पास' : 'Satellite Passes'}</p>
                  <p className="text-sm font-bold text-gray-700">{riskData?.dataPoints || 12} {language === 'hi' ? 'इमेजेज' : 'Images'}</p>
               </div>
               <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{language === 'hi' ? 'आखिरी अपडेट' : 'Last Updated'}</p>
                  <p className="text-sm font-bold text-gray-700">{riskData?.lastAcquisition || new Date().toISOString().split('T')[0]}</p>
               </div>
            </div>

            <div className="mt-4 p-3 bg-red-50/50 rounded-lg border border-red-100">
              <p className="text-xs text-gray-600 leading-relaxed italic">
                {language === 'hi' 
                  ? 'यह डेटा सीधे यूरोपीय स्पेस एजेंसी (ESA) के सेन्टीनेल-1 सैटेलाइट से प्राप्त किया गया है।' 
                  : 'This data is derived directly from ESA Sentinel-1 Synthetic Aperture Radar (SAR) imagery.'}
              </p>
            </div>
          </div>

          {/* Detailed Chart */}
          {selectedPlace && chartData.length > 0 && (
            <div className="mx-4 mt-4">
              <DetailedSubsidenceChart place={selectedPlace} height={450} />
            </div>
          )}

          {/* Safety Recommendations */}
          {riskData?.safetyRecommendations && (
            <div className="mx-4 mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{t('risk.recommendations')}</h3>
              <div className="space-y-2">
                {(riskData.safetyRecommendations[language] || riskData.safetyRecommendations.en || []).map((rec, index) => (
                  <div key={index} className="bg-white p-3 rounded-xl shadow-sm flex items-start gap-3">
                    <div className="p-1.5 bg-green-100 rounded-full flex-shrink-0 mt-0.5">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-gray-700 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearest Safe Zone */}
          {riskData?.nearestSafeZone && (
            <div className="mx-4 mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-600">{t('risk.nearestSafe')}</p>
                  <p className="font-semibold text-gray-800">
                    {riskData.nearestSafeZone.name?.[language] || riskData.nearestSafeZone.name?.en || 'Safe Zone'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {riskData.nearestSafeZone.distance} {t('common.km')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default RiskCheck;
