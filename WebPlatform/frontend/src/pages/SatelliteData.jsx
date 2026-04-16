import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { Satellite, MapPin, Calendar, Activity, Zap, Eye } from 'lucide-react';
import { getSentinel1SubsidenceData, getLocationRiskAssessment } from '../services/googleEarthEngine';

const SatelliteData = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [satelliteData, setSatelliteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchSatelliteData();
    getUserLocation();
  }, []);

  const fetchSatelliteData = async () => {
    try {
      setLoading(true);
      const data = await getSentinel1SubsidenceData();
      setSatelliteData(data);
    } catch (error) {
      console.error('Failed to fetch satellite data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to Jharia center
          setUserLocation({ lat: 23.75, lng: 86.42 });
        }
      );
    }
  };

  const checkLocationRisk = async (lat, lng) => {
    try {
      const result = await getLocationRiskAssessment(lat, lng);
      setSelectedZone(result.data);
    } catch (error) {
      console.error('Failed to check location risk:', error);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Satellite className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'hi' ? 'सैटेलाइट डेटा' : 'Satellite Data'}
            </h1>
            <p className="text-white/70 text-sm">
              {language === 'hi' ? 'Sentinel-1 PS-InSAR निगरानी' : 'Sentinel-1 PS-InSAR Monitoring'}
            </p>
          </div>
        </div>

        {/* Satellite Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              {language === 'hi' ? 'सिस्टम स्थिति' : 'System Status'}
            </span>
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
              {language === 'hi' ? 'सक्रिय' : 'Active'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/60">
                {language === 'hi' ? 'अंतिम अपडेट' : 'Last Update'}
              </p>
              <p className="font-medium">
                {new Date().toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-white/60">
                {language === 'hi' ? 'कवरेज' : 'Coverage'}
              </p>
              <p className="font-medium">
                {language === 'hi' ? 'झरिया क्षेत्र' : 'Jharia Region'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Satellite Data Details */}
        {loading ? (
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Satellite className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">
              {language === 'hi' ? 'सैटेलाइट डेटा लोड हो रहा है...' : 'Loading satellite data...'}
            </p>
          </div>
        ) : satelliteData?.success ? (
          <div className="space-y-4">
            {/* Satellite Parameters */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                {language === 'hi' ? 'सैटेलाइट पैरामीटर्स' : 'Satellite Parameters'}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === 'hi' ? 'सैटेलाइट:' : 'Satellite:'}
                  </span>
                  <span className="font-medium">{satelliteData.data.satellite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === 'hi' ? 'मोड:' : 'Mode:'}
                  </span>
                  <span className="font-medium">{satelliteData.data.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === 'hi' ? 'पोलराइजेशन:' : 'Polarization:'}
                  </span>
                  <span className="font-medium">{satelliteData.data.polarization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === 'hi' ? 'ऑर्बिट:' : 'Orbit:'}
                  </span>
                  <span className="font-medium">{satelliteData.data.orbit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === 'hi' ? 'छवियां:' : 'Images:'}
                  </span>
                  <span className="font-medium">{satelliteData.data.images_processed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === 'hi' ? 'स्रोत:' : 'Source:'}
                  </span>
                  <span className="font-medium text-blue-600">{satelliteData.data.source}</span>
                </div>
              </div>
            </div>

            {/* Risk Zones */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                {language === 'hi' ? 'जोखिम क्षेत्र' : 'Risk Zones'}
              </h3>
              <div className="space-y-2">
                {satelliteData.data.zones?.map((zone, index) => (
                  <div
                    key={zone.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setSelectedZone(zone)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800 capitalize">
                        {zone.id.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        zone.subsidence > 20 ? 'bg-red-100 text-red-700' :
                        zone.subsidence > 15 ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {zone.subsidence} mm/year
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      VV: {zone.vv_mean?.toFixed(2)} dB |
                      VH: {zone.vh_mean?.toFixed(2)} dB
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Check */}
            {userLocation && (
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  {language === 'hi' ? 'आपका स्थान जांचें' : 'Check Your Location'}
                </h3>
                <button
                  onClick={() => checkLocationRisk(userLocation.lat, userLocation.lng)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  {language === 'hi' ? 'जोखिम मूल्यांकन करें' : 'Assess Risk'}
                </button>
              </div>
            )}

            {/* Selected Zone Details */}
            {selectedZone && (
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-3">
                  {language === 'hi' ? 'विस्तृत विश्लेषण' : 'Detailed Analysis'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {language === 'hi' ? 'स्थान:' : 'Location:'}
                    </span>
                    <span className="font-medium">
                      {selectedZone.lat?.toFixed(4)}, {selectedZone.lng?.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {language === 'hi' ? 'जोखिम स्तर:' : 'Risk Level:'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedZone.level)}`}>
                      {selectedZone.level || 'unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {language === 'hi' ? 'भूमि धंसाव:' : 'Subsidence:'}
                    </span>
                    <span className="font-medium">
                      {selectedZone.subsidence || selectedZone.subsidence_rate || 0} mm/year
                    </span>
                  </div>
                  {selectedZone.risk_assessment?.recommendations && (
                    <div>
                      <span className="text-gray-600 block mb-2">
                        {language === 'hi' ? 'सिफारिशें:' : 'Recommendations:'}
                      </span>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {selectedZone.risk_assessment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Satellite className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {language === 'hi' ? 'सैटेलाइट डेटा उपलब्ध नहीं है' : 'Satellite data not available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteData;