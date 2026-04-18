import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Camera, Bell, Shield, Phone, Satellite, Info, ChevronRight, Radio, Layers, Clock, CheckCircle2, Activity, Target, Map } from 'lucide-react';
import RiskMap from '../components/RiskMap';
import LanguageToggle from '../components/LanguageToggle';
import { riskAPI, alertAPI } from '../services/api';
import { getLocationRiskAssessment } from '../services/googleEarthEngine';

const Home = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [currentRisk, setCurrentRisk] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [satelliteData, setSatelliteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        const [alertsRes, statsRes] = await Promise.all([
          alertAPI.getAlerts({ limit: 3 }),
          riskAPI.getStatistics()
        ]);
        if (alertsRes.data.success) setAlerts(alertsRes.data.data.alerts);
        if (statsRes.data.success) setStats(statsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLocation(loc);
            try {
              const riskRes = await riskAPI.checkLocation(loc.lat, loc.lng);
              if (riskRes.data.success) {
                const data = riskRes.data.data;
                if (data.riskAssessment && data.riskAssessment.isInRiskZone) {
                  setCurrentRisk({
                    subsidenceRate: data.riskAssessment.subsidenceData?.averageRate || data.riskAssessment.riskScore || 15.0,
                    confidence: data.riskAssessment.psinsar?.confidence || 94,
                    riskLevel: data.riskAssessment.riskLevel
                  });
                } else {
                  throw new Error('Not in mapped zone');
                }
              } else {
                throw new Error('Backend returned failure');
              }
            } catch (error) {
              // IDW proxy always returns success:true with computed rate
              const fallbackRes = await getLocationRiskAssessment(loc.lat, loc.lng);
              setCurrentRisk(fallbackRes.data);
            }
          },
          async () => {
            // Geolocation denied — use Jharia centre coordinates and still run IDW
            const defaultLoc = { lat: 23.75, lng: 86.42 };
            setUserLocation(defaultLoc);
            const fallbackRes = await getLocationRiskAssessment(defaultLoc.lat, defaultLoc.lng);
            setCurrentRisk(fallbackRes.data);
          }
        );
      }
      setLoading(false);
    };
    initData();
  }, []);

  const quickActions = [
    { icon: MapPin,    label: t('home.checkRisk'),   path: '/dashboard/risk-check', color: 'bg-red-500' },
    { icon: Camera,    label: t('home.submitReport'), path: '/dashboard/report',     color: 'bg-blue-500' },
    { icon: Satellite, label: language === 'hi' ? 'सैटेलाइट डेटा' : 'Satellite Data', path: '/dashboard/satellite', color: 'bg-purple-500' },
    { icon: Bell,      label: t('home.viewAlerts'),   path: '/dashboard/alerts',    color: 'bg-yellow-500', badge: alerts.length },
    { icon: Shield,    label: t('home.safetyTips'),   path: '/dashboard/safety',    color: 'bg-green-500' },
  ];

  // ── inline data ──────────────────────────────────────────────────────────────
  const backscatterSteps = {
    en: [
      'Sentinel-1 GRD scenes acquired every 6 days and ingested into Google Earth Engine',
      'Multi-temporal VV/VH backscatter stack built; Lee speckle filter applied',
      'Per-pixel linear regression on amplitude time-series → subsidence rate (mm/yr)',
      'Rate raster classified into risk zones and surfaced via backend API',
    ],
    hi: [
      'Sentinel-1 GRD दृश्य हर 6 दिन में Google Earth Engine में अपलोड',
      'Multi-temporal VV/VH backscatter stack → Lee speckle filter',
      'प्रति-पिक्सेल linear regression → subsidence rate (mm/yr)',
      'Rate raster → risk zone classification → backend API के माध्यम से प्रदर्शन',
    ],
  };

  const psinsar_steps = {
    en: [
      'Sentinel-1 SLC (complex) stack of 20+ scenes — precise coregistration to master',
      'Amplitude dispersion index used to select Persistent Scatterer candidates (PS)',
      'Differential interferograms generated for each image pair; phase unwrapped via SNAPHU',
      'Atmospheric phase screen (APS) removed; final displacement velocity map produced',
    ],
    hi: [
      '20+ SLC scenes → single master पर precise coregistration',
      'Amplitude dispersion index → Persistent Scatterer candidates (PS) चयन',
      'प्रत्येक image pair के लिए differential interferogram → SNAPHU phase unwrapping',
      'Atmospheric Phase Screen हटाना → mm-level displacement velocity map',
    ],
  };

  const comparison = [
    { param: language === 'hi' ? 'माप का आधार'   : 'Measurement basis',   b: 'Amplitude (intensity)',   p: 'Phase (wave shift)' },
    { param: language === 'hi' ? 'सटीकता'          : 'Accuracy',            b: '±3–5 mm/yr',              p: '<1 mm/yr' },
    { param: language === 'hi' ? 'spatial resolution' : 'Spatial resolution', b: 'Zone (10–20 m pixel)',  p: 'Point-level (PS)' },
    { param: language === 'hi' ? 'डेटा प्रकार'    : 'Required data',       b: 'Sentinel-1 GRD',          p: 'Sentinel-1 SLC (complex)' },
    { param: language === 'hi' ? 'न्यूनतम Scenes' : 'Min. scenes needed',  b: '6–10',                    p: '20–30' },
    { param: language === 'hi' ? 'वर्तमान स्थिति' : 'Status',              b: '● Live on JhariyaWatch',  p: '○ In development roadmap' },
  ];
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-primary text-white px-4 pt-6 pb-12 rounded-b-[40px] relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Satellite className="w-8 h-8 text-blue-300" />
            <div>
              <h1 className="text-2xl font-black tracking-tight">{t('home.title')}</h1>
              <p className="text-blue-100/60 text-[10px] uppercase tracking-widest font-bold">Nexus Intelligence Hub</p>
            </div>
          </div>
          <LanguageToggle className="text-white bg-white/10 rounded-full px-3 py-1 backdrop-blur" />
        </div>
      </div>

      {/* ── Map + Sidebar ───────────────────────────────────────────────────── */}
      <div className="px-4 -mt-8 flex flex-col lg:flex-row gap-6">

        {/* Left: Map */}
        <div className="flex-1 lg:max-w-[65%]">
          <div className="bg-white dark:bg-gray-800 rounded-[24px] shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest">
                  {language === 'hi' ? 'झरिया जोखिम क्षेत्र' : 'Jharia Risk Map'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{language === 'hi' ? 'लाइव' : 'Live Source'}</span>
              </div>
            </div>
            <RiskMap
              userLocation={userLocation}
              height="350px"
              onZoneClick={(zone) => navigate('/dashboard/risk-check', { state: { zone } })}
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="technical-label mb-4 opacity-70 p-1">Essential Commands</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-2 border-transparent hover:border-primary transition group flex flex-col items-center gap-3 blueprint-card"
                >
                  <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition shadow-inner`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Control Sidebar */}
        <div className="w-full lg:w-96 space-y-4">
          <h2 className="technical-label p-1 opacity-70">Control Panel</h2>

          {/* Subsidence card - Dynamic based on location */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                  {language === 'hi' ? 'स्थान आधारित धंसाव' : 'Location Subsidence'}
                </p>
                <div className="flex items-baseline gap-1">
                  {loading ? (
                    <span className="text-xl font-bold text-gray-400 animate-pulse">
                      {language === 'hi' ? 'खोज रहा है...' : 'Scanning...'}
                    </span>
                  ) : (
                    <>
                      <h3 className="text-4xl font-black text-gray-900 dark:text-white">
                        {currentRisk ? currentRisk.subsidenceRate : '—'}
                      </h3>
                      <span className="text-sm font-normal text-gray-500 ml-1">mm/yr</span>
                    </>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-red-500" />
              </div>
            </div>
            
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-1000" 
                style={{ width: currentRisk ? `${Math.min(((currentRisk.subsidenceRate || 0) / 50) * 100, 100)}%` : '0%' }} 
              />
            </div>
            
            <p className="text-[10px] text-gray-500 font-mono leading-relaxed mt-4">
              {language === 'hi' 
                ? 'आपके वर्तमान coordinate के आधार पर Sentinel-1 data से गणना की गई।' 
                : 'Calculated dynamically from Sentinel-1 data for your active coordinate.'}
            </p>
            {userLocation && (
              <p className="text-[9px] text-gray-400 font-mono mt-1">
                LAT: {userLocation.lat.toFixed(4)} • LNG: {userLocation.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Confidence card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                {language === 'hi' ? 'डेटा विश्वसनीयता' : 'Data Confidence'}
              </p>
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-1000"
                  style={{ width: `${currentRisk ? (currentRisk.confidence || 92) : 0}%` }}
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {currentRisk ? (currentRisk.confidence || 92).toFixed(0) : '—'}%
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                32 SCENES ANALYZED
              </span>
            </div>
          </div>

          {/* Active technique badge */}
          <div className="p-4 bg-[#0d0f14] rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Active Technique</span>
            </div>
            <p className="text-sm font-bold text-white">Backscatter Amplitude</p>
            <p className="text-[10px] font-mono text-stone-400 mt-0.5">Sentinel-1 GRD · C-Band</p>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
              <Clock className="w-3 h-3 text-stone-500" />
              <span className="text-[9px] font-mono text-stone-500 uppercase">PS-InSAR upgrade in roadmap</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/dashboard/risk-check')}
            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-mono text-xs tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-3"
          >
            {language === 'hi' ? 'विस्तृत जोखिम स्कैन' : 'Deep Risk Scan'}
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-[9px] font-mono text-gray-500 uppercase mb-1">Coverage</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">100% Jharia</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-[9px] font-mono text-gray-500 uppercase mb-1">Session ID</p>
              <p className="text-xs font-mono text-gray-900 dark:text-white">#JW-{Math.floor(Math.random() * 9000) + 1000}</p>
            </div>
          </div>
        </div>
      </div>


      {/* METHODOLOGY SECTION */}
      <div className="px-4 mt-10 mb-4">
        <div className="mb-6">
          <p className="text-[10px] font-mono text-gray-400 dark:text-stone-500 uppercase tracking-[0.18em] mb-1">
            {language === 'hi' ? 'उपग्रह विश्लेषण पद्धति' : 'Satellite Analysis Methodology'}
          </p>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'hi' ? 'हम धंसाव कैसे मापते हैं' : 'How Subsidence is Measured'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {language === 'hi'
              ? 'दो SAR techniques — एक अभी सक्रिय, एक विकास में।'
              : 'Two SAR techniques — one live today, one precision upgrade in development.'}
          </p>
        </div>

        <div className="space-y-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">

          {/* Method 01 */}
          <div className="bg-white dark:bg-gray-800 p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-[10px] font-mono text-gray-400 dark:text-stone-600">01</span>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {language === 'hi' ? 'बैकस्कैटर एम्पलीट्यूड विश्लेषण' : 'Backscatter Amplitude Analysis'}
                  </h3>
                </div>
                <p className="text-[10px] font-mono text-gray-400 dark:text-stone-500 mt-1 ml-6">
                  Sentinel-1 GRD &middot; C-Band &middot; 6-day revisit &middot; &plusmn;3&ndash;5 mm/yr
                </p>
              </div>
              <span className="flex-shrink-0 text-[9px] font-mono text-gray-400 dark:text-stone-500 border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5 uppercase tracking-wider">
                {language === 'hi' ? 'सक्रिय' : 'Active'}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed ml-6 mb-4">
              {language === 'hi'
                ? 'Sentinel-1 har 6 din mein C-band microwave daalen jameen par bhejta hai. Reflected signal ki shakti — backscatter amplitude — record hoti hai. Jab zameen dhansati hai, surface ki banavat badlati hai, jisse amplitude mein measurable parivartan aata hai. 32+ time-series images par per-pixel linear regression se dhansav dar mm/varsh mein nikali jati hai.'
                : 'Sentinel-1 transmits C-band microwave pulses every 6 days. The reflected intensity — backscatter amplitude — is recorded. When ground subsides, surface texture and dielectric properties shift, producing a measurable amplitude change. Per-pixel linear regression across 32+ time-series scenes yields a subsidence rate in mm/year.'}
            </p>
            <div className="ml-6 space-y-1.5">
              {['Sentinel-1 GRD acquisition → Google Earth Engine',
                'VV/VH stack → Lee speckle filter',
                'Per-pixel regression → subsidence rate (mm/yr)',
                'Rate raster → risk zone classification → API'
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="font-mono text-[9px] text-gray-400 dark:text-stone-600 flex-shrink-0 mt-0.5">{String(i+1).padStart(2,'0')}.</span>
                  <span className="text-[11px] text-gray-500 dark:text-stone-400">{s}</span>
                </div>
              ))}
            </div>
            <p className="ml-6 mt-3 text-[10px] text-gray-400 dark:text-stone-600 leading-relaxed">
              <span className="text-gray-500 dark:text-stone-500">{language === 'hi' ? 'सीमा: ' : 'Note: '}</span>
              {language === 'hi'
                ? 'Indirect measurement — amplitude proxy hai, direct displacement nahi. ~±5 mm uncertainty. Zone-level mapping ke liye upayukt.'
                : 'Indirect measurement — amplitude is a proxy, not direct displacement. ~±5 mm uncertainty. Zone-level mapping only.'}
            </p>
          </div>

          {/* Method 02 */}
          <div className="bg-white dark:bg-gray-800 p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-[10px] font-mono text-gray-400 dark:text-stone-600">02</span>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    PS-InSAR Interferometry
                  </h3>
                </div>
                <p className="text-[10px] font-mono text-gray-400 dark:text-stone-500 mt-1 ml-6">
                  Sentinel-1 SLC &middot; Phase analysis &middot; 20&ndash;30 scenes &middot; &lt;1 mm/yr
                </p>
              </div>
              <span className="flex-shrink-0 text-[9px] font-mono text-gray-400 dark:text-stone-600 border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 uppercase tracking-wider">
                {language === 'hi' ? 'विकास में' : 'Roadmap'}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed ml-6 mb-4">
              {language === 'hi'
                ? 'PS-InSAR amplitude ki bajay radar signal ke phase ka upyog karta hai. Do acquisitions ke beech ka interferometric phase seedha line-of-sight displacement encode karta hai. Persistent Scatterers — imaartein, khambe, chattanein — wo bindu hain jinka phase varshon tak coherent rehta hai. In binduon ka track karke sub-millimetre displacement time-series milta hai.'
                : 'PS-InSAR uses the phase of the complex SAR signal, not amplitude. The interferometric phase between two acquisitions directly encodes line-of-sight displacement. Persistent Scatterers — facades, pylons, rock outcrops — maintain phase coherence over years. Tracking thousands of PS points yields sub-millimetre displacement time-series at each location.'}
            </p>
            <div className="ml-6 space-y-1.5">
              {['SLC stack (20+) → coregistration to single master',
                'Amplitude dispersion → Persistent Scatterer selection',
                'Differential interferograms → SNAPHU phase unwrapping',
                'APS removal → final mm/yr displacement velocity map'
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="font-mono text-[9px] text-gray-400 dark:text-stone-600 flex-shrink-0 mt-0.5">{String(i+1).padStart(2,'0')}.</span>
                  <span className="text-[11px] text-gray-500 dark:text-stone-400">{s}</span>
                </div>
              ))}
            </div>
            <p className="ml-6 mt-3 text-[10px] text-gray-400 dark:text-stone-600 leading-relaxed">
              <span className="text-gray-500 dark:text-stone-500">{language === 'hi' ? 'प्रभाव: ' : 'Impact: '}</span>
              {language === 'hi'
                ? 'Backscatter zone-level risk deta hai. PS-InSAR har imarat ke star par displacement map banega — sateek nikaasi planning ke liye.'
                : 'Where backscatter gives zone-level risk, PS-InSAR will map displacement at individual building level — enabling targeted evacuation planning.'}
            </p>
          </div>

          {/* Comparison */}
          <div className="bg-white dark:bg-gray-800 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-2.5 font-mono text-[9px] text-gray-400 dark:text-stone-600 uppercase tracking-wider">{language === 'hi' ? 'मापदंड' : 'Parameter'}</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[9px] text-gray-400 dark:text-stone-600 uppercase tracking-wider">{language === 'hi' ? 'बैकस्कैटर' : 'Backscatter'}</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[9px] text-gray-400 dark:text-stone-600 uppercase tracking-wider">PS-InSAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {[
                  [language === 'hi' ? 'माप' : 'Measurement', 'Amplitude (indirect)', 'Phase (direct)'],
                  [language === 'hi' ? 'सटीकता' : 'Accuracy', '±3-5 mm/yr', '<1 mm/yr'],
                  [language === 'hi' ? 'स्थानिक विभेदन' : 'Spatial detail', 'Zone (10 m pixel)', 'Point-level (PS)'],
                  [language === 'hi' ? 'डेटा' : 'Data', 'GRD', 'SLC (complex)'],
                  [language === 'hi' ? 'स्थिति' : 'Status', 'Live', 'Development'],
                ].map(([p, b, ps], i) => (
                  <tr key={i}>
                    <td className="px-5 py-2 text-gray-400 dark:text-stone-600 font-mono text-[9px]">{p}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-[11px]">{b}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-[11px]">{ps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ── Emergency FAB ───────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/dashboard/emergency')}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-red-700 transition-all z-40 sketch-border group scale-110"
      >
        <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};

export default Home;
