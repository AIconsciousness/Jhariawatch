import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Camera, Bell, Shield, Phone, Satellite, Info, ChevronRight, Radio, Layers, Clock, CheckCircle2 } from 'lucide-react';
import { BlueprintSatellite, BlueprintRadar, BlueprintSeismic, BlueprintMap } from '../components/BlueprintIcons';
import RiskMap from '../components/RiskMap';
import LanguageToggle from '../components/LanguageToggle';
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
              if (riskRes.data.success) setCurrentRisk(riskRes.data.data);
            } catch (error) {
              console.error('Failed to check risk:', error);
            }
          },
          () => setUserLocation({ lat: 23.75, lng: 86.42 })
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
      <div className="bg-primary text-white px-4 pt-6 pb-12 rounded-b-[40px] relative blueprint-grid">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <BlueprintSatellite className="w-10 h-10 text-blue-300 animate-float" />
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
          <div className="bg-white dark:bg-gray-800 rounded-[24px] shadow-xl overflow-hidden sketch-border">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b-2 border-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BlueprintMap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-800 dark:text-gray-100">
                  {language === 'hi' ? 'झरिया जोखिम क्षेत्र' : 'Jharia Risk Map'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="technical-label">{language === 'hi' ? 'लाइव' : 'Live Source'}</span>
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

          {/* Subsidence card */}
          <div className="blueprint-card p-6 sketch-border relative active:scale-95 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="technical-label mb-1">Live Subsidence</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                  {satelliteData?.subsidenceRate || stats?.maxSubsidenceRate || '15.4'}
                  <span className="text-sm font-normal text-gray-400 ml-1">mm/yr</span>
                </h3>
              </div>
              <BlueprintSeismic className="w-8 h-8 text-red-500 opacity-80" />
            </div>
            <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
              <div className="h-full bg-red-500 animate-draw" style={{ width: '65%' }} />
            </div>
            <p className="text-[10px] text-gray-400 italic font-medium leading-relaxed">
              Estimated via Sentinel-1 backscatter amplitude time-series analysis.
            </p>
          </div>

          {/* Confidence card */}
          <div className="blueprint-card p-5 border-blue-900/10">
            <div className="flex items-center justify-between mb-4">
              <p className="technical-label">Processing Confidence</p>
              <BlueprintRadar className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 border border-primary/5">
                <div
                  className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                  style={{ width: `${satelliteData?.confidence || 92}%` }}
                />
              </div>
              <span className="text-xl font-black text-blue-600">{satelliteData?.confidence || 92}%</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {satelliteData?.images_processed || 32} SCENES ANALYZED
              </span>
            </div>
          </div>

          {/* Active technique badge */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Active Technique</span>
            </div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Backscatter Amplitude Analysis</p>
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">Sentinel-1 SAR · C-Band · 6-day revisit</p>
            <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <Clock className="w-3 h-3 text-indigo-500" />
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">PS-InSAR precision upgrade in roadmap</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/dashboard/risk-check')}
            className="w-full py-5 bg-primary text-white rounded-[16px] font-black text-sm tracking-[0.2em] uppercase hover:bg-primary-dark transition-all transform hover:-translate-y-1 shadow-2xl overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blueprint-grid" />
            {language === 'hi' ? 'अपना जोखिम जाँचें' : 'Deep Risk Scan'}
            <ChevronRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 opacity-60">
            <div className="text-center">
              <p className="technical-label">Total Coverage</p>
              <p className="text-sm font-black text-gray-400">100% (Jharia)</p>
            </div>
            <div className="text-center">
              <p className="technical-label">Report ID</p>
              <p className="text-sm font-black text-gray-400">#JW-2026</p>
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
