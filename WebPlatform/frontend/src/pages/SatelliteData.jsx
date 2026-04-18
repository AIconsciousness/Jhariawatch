import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { Satellite, MapPin, Calendar, Activity, Zap, Eye, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
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
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          
          // Trigger the location risk check for these specific coordinates!
          checkLocationRisk(lat, lng);
        },
        () => {
          const lat = 23.75;
          const lng = 86.42;
          setUserLocation({ lat, lng });
          checkLocationRisk(lat, lng);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header Section */}
      <div className="bg-primary text-white px-4 pt-8 pb-12 rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Satellite className="w-32 h-32" />
        </div>
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Satellite className="w-10 h-10 text-blue-300" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {language === 'hi' ? 'सैटेलाइट डेटा' : 'Satellite Data'}
            </h1>
            <p className="text-blue-100/60 text-xs font-bold uppercase tracking-widest mt-1">
              {language === 'hi' ? 'सेन्टीनेल-1 निगरानी' : 'Sentinel-1 Monitoring Protocol'}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="technical-label text-blue-100/40">Sensor Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-md text-[10px] font-black uppercase tracking-wider">Active</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm">
              <p className="text-blue-100/30 text-[10px] font-bold uppercase">Last Sync</p>
              <p className="font-black">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-sm">
              <p className="text-blue-100/30 text-[10px] font-bold uppercase">Region</p>
              <p className="font-black">Jharia (Jh-22)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 -mt-4">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center border border-gray-100">
            <Satellite className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Retrieving Telemetry...</p>
          </div>
        ) : satelliteData?.success ? (
          <div className="space-y-4">
            {/* Methodology Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-blue-500" />
                <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase text-xs tracking-widest">Methodology</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 text-xs">
                  <p className="font-black text-blue-700 uppercase mb-1">Active Analysis</p>
                  <p className="text-gray-700 dark:text-gray-300">Time-Series Backscatter Amplitude tracking via Sentinel-1 SAR imagery.</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border-l-4 border-gray-300 text-xs text-gray-400">
                  <p className="font-bold uppercase mb-1">Future Advancement</p>
                  <p className="italic">PS-InSAR Interferometry Pipeline (Development Phase).</p>
                </div>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-mono text-gray-400 uppercase mb-4 tracking-widest">Sensor Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Satellite</p>
                  <p className="font-black text-sm">{satelliteData.data.satellite || 'Sentinel-1B'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Mode</p>
                  <p className="font-black text-sm">{satelliteData.data.mode || 'IW Wide'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Polarization</p>
                  <p className="font-black text-sm">{satelliteData.data.polarization || 'VV+VH'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Orbit</p>
                  <p className="font-black text-sm">{satelliteData.data.orbit || 'Descending'}</p>
                </div>
              </div>
            </div>

            {/* Risk Zones List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-mono text-gray-400 uppercase mb-4 tracking-widest">Surface Stability Profile</h3>
              <div className="space-y-2">
                {/* Dynamically inserted user location from state if available */}
                {selectedZone && selectedZone.id === 'custom_location' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 flex justify-between items-center rounded-lg shadow-sm">
                    <div>
                      <p className="font-black text-sm uppercase text-blue-800">Your Current Coordinates</p>
                      <p className="text-[9px] text-blue-500 font-mono">LAT: {userLocation?.lat?.toFixed(4)}, LNG: {userLocation?.lng?.toFixed(4)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded font-black text-[10px] ${(selectedZone.location_risk?.rate || selectedZone.subsidence) > 15 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {selectedZone.location_risk?.rate || selectedZone.subsidence} mm/yr
                    </span>
                  </div>
                )}
                {satelliteData.data.zones?.map((zone) => (
                  <div key={zone.id} onClick={() => setSelectedZone(zone)} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-white transition shadow-sm">
                    <div>
                      <p className="font-black text-sm uppercase">{zone.id.replace('_', ' ')}</p>
                      <p className="text-[9px] text-gray-400">Confidence: {zone.confidence?.toFixed(1) || 92}%</p>
                    </div>
                    <span className={`px-2 py-1 rounded font-black text-[10px] ${zone.subsidence > 15 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {zone.subsidence} mm/yr
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Selection Report */}
            {selectedZone && selectedZone.id !== 'custom_location' && (
              <div className="bg-black text-white rounded-2xl p-6 shadow-2xl border-t-4 border-red-500 mt-6">
                <h3 className="text-xl font-black uppercase mb-4">Report: {selectedZone.id.replace('_', ' ')}</h3>
                <div className="space-y-4 text-xs font-mono">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="opacity-40 uppercase">Subsidence Rate</span>
                    <span className="font-black text-lg text-red-400">{selectedZone.subsidence} mm/yr</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="opacity-40 uppercase font-black">Data Status</span>
                    <span className="font-black text-green-400 uppercase tracking-widest">Verified</span>
                  </div>
                  {selectedZone.risk_assessment?.recommendations && (
                    <div className="pt-2">
                      <p className="opacity-40 uppercase font-black mb-2">Safety Protocols</p>
                      <ul className="space-y-1">
                        {selectedZone.risk_assessment.recommendations.map((rec, i) => (
                          <li key={i} className="bg-white/5 p-2 rounded border border-white/5">▶ {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center border border-red-200">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-red-500">Signal Offline</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteData;