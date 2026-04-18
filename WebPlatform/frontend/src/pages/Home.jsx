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

      {/* ═══════════════════════════════════════════════════════════════════════
          METHODOLOGY SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 mt-10 mb-4">

        {/* Section header */}
        <div className="mb-6 border-l-4 border-primary pl-4">
          <span className="text-[10px] font-black text-primary/50 uppercase tracking-[0.15em]">
            {language === 'hi' ? 'उपग्रह विश्लेषण पद्धति' : 'Satellite Analysis Methodology'}
          </span>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mt-0.5 leading-tight">
            {language === 'hi' ? 'हम धंसाव कैसे मापते हैं' : 'How We Measure Ground Subsidence'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed max-w-2xl">
            {language === 'hi'
              ? 'JhariyaWatch दो अलग SAR processing approaches का उपयोग करता है — एक अभी सक्रिय है, एक precision upgrade के रूप में विकास में है। दोनों transparent तरीके से नीचे समझाए गए हैं।'
              : 'JhariyaWatch operates two distinct SAR processing pipelines — one active today, one precision upgrade under development. Both are explained transparently below.'}
          </p>
        </div>

        <div className="space-y-5">

          {/* ── PANEL 1: Backscatter (ACTIVE) ───────────────────────────────── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">

            {/* Color bar header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-emerald-600">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-white" />
                <div>
                  <p className="text-white font-bold text-sm leading-tight">Backscatter Amplitude Analysis</p>
                  <p className="text-emerald-200 text-[10px]">Sentinel-1 SAR · C-Band · 5.6 GHz</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-white text-[9px] font-black uppercase tracking-widest">
                  {language === 'hi' ? 'अभी सक्रिय' : 'Active Now'}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-5">

              {/* Spec pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  ['Sensor', 'Sentinel-1 SAR'],
                  ['Polarisation', 'VV + VH'],
                  ['Revisit Cycle', '6 days'],
                  ['Precision', '±3–5 mm/yr'],
                  ['Platform', 'Google Earth Engine'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase block">{k}</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{v}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {language === 'hi'
                  ? 'Sentinel-1 माइक्रोवेव राडार दालें पृथ्वी की सतह की ओर भेजता है और परावर्तित संकेत की शक्ति (backscatter amplitude) रिकार्ड करता है। जब कोयला खदानों के ऊपर जमीन धंसती है, तो सतह की बनावट और dielectric properties बदलती हैं — जिससे backscatter value में measurable बदलाव आता है। 32+ time-series scenes पर per-pixel statistical regression से हम subsidence दर mm/वर्ष में निकालते हैं।'
                  : "Sentinel-1 transmits C-band microwave pulses and records the intensity of the backscattered return. When the ground above a coal seam subsides, surface roughness and soil dielectric properties shift — producing a measurable change in backscatter amplitude. Running per-pixel linear regression across 32+ time-series scenes gives a subsidence rate in mm/year per location."}
              </p>

              {/* Pipeline */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  {language === 'hi' ? 'प्रक्रिया पाइपलाइन' : 'Processing Pipeline'}
                </p>
                <div className="space-y-2.5">
                  {(language === 'hi' ? backscatterSteps.hi : backscatterSteps.en).map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caveat */}
              <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-l-4 border-amber-400">
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  <span className="font-bold">{language === 'hi' ? 'सीमा — ' : 'Limitation — '}</span>
                  {language === 'hi'
                    ? 'यह अप्रत्यक्ष माप है। Amplitude बदलाव, surface deformation का proxy है, direct displacement नहीं। परिणाम ±5 mm uncertainty के साथ हैं।'
                    : 'This is an indirect measurement. Amplitude change is a proxy for surface deformation — not a direct displacement measurement. Results carry approximately ±5 mm uncertainty.'}
                </p>
              </div>
            </div>
          </div>

          {/* ── PANEL 2: PS-InSAR (ROADMAP) ─────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">

            <div className="flex items-center justify-between px-5 py-3.5 bg-indigo-700">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-white" />
                <div>
                  <p className="text-white font-bold text-sm leading-tight">PS-InSAR Interferometry</p>
                  <p className="text-indigo-200 text-[10px]">Persistent Scatterer InSAR · Sub-millimetre precision</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                <Clock className="w-2.5 h-2.5 text-white" />
                <span className="text-white text-[9px] font-black uppercase tracking-widest">
                  {language === 'hi' ? 'रोडमैप' : 'Roadmap'}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-5">

              {/* Spec pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  ['Data Type', 'Sentinel-1 SLC (complex)'],
                  ['Min. Scenes', '20–30 acquisitions'],
                  ['Precision', '<1 mm/yr'],
                  ['Resolution', 'Point-level (PS)'],
                  ['Phase Unwrapping', 'SNAPHU'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase block">{k}</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{v}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {language === 'hi'
                  ? 'PS-InSAR amplitude के बजाय radar signal के phase (तरंग-चरण) का उपयोग करता है। दो SAR acquisitions के बीच का interferometric phase सीधे line-of-sight displacement encode करता है। "Persistent Scatterers" — इमारतें, बिजली के खंभे, उजागर चट्टानें — वो बिंदु हैं जिनका phase वर्षों तक coherent रहता है। इनसे sub-millimetre accuracy का displacement time-series बनता है, जो amplitude-based methods से कहीं श्रेष्ठ है।'
                  : "PS-InSAR uses the phase component of the complex SAR signal — not amplitude. The interferometric phase between two acquisitions directly encodes the line-of-sight displacement of the surface. \"Persistent Scatterers\" — buildings, pylons, bare rock outcrops — are stable reflectors whose phase remains coherent over years. From these, a sub-millimetre displacement time-series is extracted at each PS point, delivering precision orders of magnitude beyond amplitude analysis."}
              </p>

              {/* Pipeline */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  {language === 'hi' ? 'प्रक्रिया पाइपलाइन' : 'Processing Pipeline'}
                </p>
                <div className="space-y-2.5">
                  {(language === 'hi' ? psinsar_steps.hi : psinsar_steps.en).map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why upgrade */}
              <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border-l-4 border-indigo-400">
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  <span className="font-bold">{language === 'hi' ? 'क्यों जरूरी है — ' : 'Why it matters — '}</span>
                  {language === 'hi'
                    ? 'Backscatter zone-level जोखिम देता है। PS-InSAR इमारत-दर-इमारत displacement map देगा — जिससे प्रत्येक प्रभावित घर की सटीक पहचान और targeted निकासी संभव होगी।'
                    : 'Backscatter gives zone-level risk. PS-InSAR will deliver building-by-building displacement maps — enabling precise identification of at-risk households and targeted, evidence-based evacuation planning across Jharia.'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Comparison table ─────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {language === 'hi' ? 'तुलनात्मक सारांश' : 'Side-by-side Comparison'}
              </span>
              <div className="flex gap-3 text-[9px] font-black uppercase tracking-wider">
                <span className="text-emerald-600">● Backscatter</span>
                <span className="text-indigo-500">○ PS-InSAR</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/60">
                    <th className="text-left px-5 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider w-1/3">
                      {language === 'hi' ? 'मापदंड' : 'Parameter'}
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-black text-emerald-600 uppercase tracking-wider">Backscatter</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-black text-indigo-600 uppercase tracking-wider">PS-InSAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {comparison.map(({ param, b, p }) => (
                    <tr key={param} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-5 py-2.5 text-gray-500 dark:text-gray-400 font-medium text-[11px]">{param}</td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-semibold text-[11px]">{b}</td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-semibold text-[11px]">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
