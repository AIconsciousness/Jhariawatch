import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Satellite, AlertTriangle, Shield, TrendingDown, Users, Phone, Menu, X, ChevronRight, BookOpen } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import DarkModeToggle from '../components/DarkModeToggle';
import AnimatedCounter from '../components/AnimatedCounter';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

const Landing = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Satellite,
      title: language === 'hi' ? 'PS-InSAR तकनीक' : 'PS-InSAR Technology',
      description: language === 'hi'
        ? 'सैटेलाइट डेटा का उपयोग करके सटीक भूमि धंसाव की निगरानी'
        : 'Accurate land subsidence monitoring using satellite data'
    },
    {
      icon: AlertTriangle,
      title: language === 'hi' ? 'वास्तविक समय चेतावनी' : 'Real-time Alerts',
      description: language === 'hi'
        ? 'आपके क्षेत्र में जोखिम बढ़ने पर तुरंत सूचनाएं'
        : 'Instant notifications when risk increases in your area'
    },
    {
      icon: MapPin,
      title: language === 'hi' ? 'जोखिम मानचित्र' : 'Risk Maps',
      description: language === 'hi'
        ? 'झरिया के सभी क्षेत्रों के लिए विस्तृत जोखिम मानचित्र'
        : 'Detailed risk maps for all areas of Jharia'
    },
    {
      icon: Shield,
      title: language === 'hi' ? 'सुरक्षा सलाह' : 'Safety Guidelines',
      description: language === 'hi'
        ? 'आपातकालीन स्थिति में क्या करें की पूरी जानकारी'
        : 'Complete information on what to do in emergencies'
    }
  ];

  const stats = [
    { value: 0, suffix: '', label: language === 'hi' ? 'निगरानी क्षेत्र' : 'Monitored Areas' },
    { value: 0, suffix: '', label: language === 'hi' ? 'सक्रिय उपयोगकर्ता' : 'Active Users' },
    { value: 0, prefix: '', suffix: '/7', label: language === 'hi' ? 'निगरानी' : 'Monitoring' },
    { value: 0, suffix: '%', label: language === 'hi' ? 'सटीकता' : 'Accuracy' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navbar - Sky Blue Theme */}
      <nav className="fixed top-0 left-0 right-0 bg-sky-50/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm z-50 border-b border-sky-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="JhariaWatch" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold text-sky-700 dark:text-sky-300">JhariaWatch</span>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <a href="#features" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 transition font-medium">
                {language === 'hi' ? 'सुविधाएं' : 'Features'}
              </a>
              <a href="#about" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 transition font-medium">
                {language === 'hi' ? 'परिचय' : 'About'}
              </a>
              <a href="#technology" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 transition font-medium">
                {language === 'hi' ? 'तकनीक' : 'Technology'}
              </a>
              <a href="#blog" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 transition font-medium">
                {language === 'hi' ? 'ब्लॉग' : 'Blog'}
              </a>
              <a href="#community" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 transition font-medium">
                {language === 'hi' ? 'समुदाय' : 'Community'}
              </a>
              <LanguageToggle className="text-sky-700 dark:text-sky-300" />
              <DarkModeToggle />
              <Link
                to="/login"
                className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 transition font-medium"
              >
                {language === 'hi' ? 'लॉगिन' : 'Login'}
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium"
              >
                {language === 'hi' ? 'रजिस्टर करें' : 'Get Started'}
              </Link>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <DarkModeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-sky-700 dark:text-sky-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-sky-200 dark:border-gray-700">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100" onClick={() => setMobileMenuOpen(false)}>
                  {language === 'hi' ? 'सुविधाएं' : 'Features'}
                </a>
                <a href="#about" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100" onClick={() => setMobileMenuOpen(false)}>
                  {language === 'hi' ? 'परिचय' : 'About'}
                </a>
                <a href="#technology" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100" onClick={() => setMobileMenuOpen(false)}>
                  {language === 'hi' ? 'तकनीक' : 'Technology'}
                </a>
                <a href="#blog" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100" onClick={() => setMobileMenuOpen(false)}>
                  {language === 'hi' ? 'ब्लॉग' : 'Blog'}
                </a>
                <a href="#community" className="text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100" onClick={() => setMobileMenuOpen(false)}>
                  {language === 'hi' ? 'समुदाय' : 'Community'}
                </a>
                <div className="flex items-center gap-2 pt-2 border-t border-sky-200 dark:border-gray-700">
                  <LanguageToggle className="text-sky-700 dark:text-sky-300" />
                </div>
                <div className="flex gap-3">
                  <Link to="/login" className="flex-1 text-center border border-sky-300 dark:border-gray-600 text-sky-700 dark:text-sky-300 px-4 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-gray-700 transition" onClick={() => setMobileMenuOpen(false)}>
                    {language === 'hi' ? 'लॉगिन' : 'Login'}
                  </Link>
                  <Link to="/register" className="flex-1 text-center bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition" onClick={() => setMobileMenuOpen(false)}>
                    {language === 'hi' ? 'रजिस्टर करें' : 'Register'}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
            filter: 'brightness(0.4)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/80 to-blue-900/80 dark:from-gray-900/90 dark:to-gray-800/90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              {language === 'hi'
                ? 'झरिया में कोयला खदान धंसाव की निगरानी'
                : 'Monitoring Coal Mine Subsidence in Jharia'}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto animate-fade-in-delay">
              {language === 'hi'
                ? 'उन्नत सैटेलाइट तकनीक से अपने घर और परिवार की सुरक्षा सुनिश्चित करें'
                : 'Protect your home and family with advanced satellite technology'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              <Link
                to="/register"
                className="bg-white text-sky-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transition inline-flex items-center justify-center gap-2 transform hover:scale-105"
              >
                {language === 'hi' ? 'अभी शुरू करें' : 'Get Started Now'}
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#about"
                className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition inline-flex items-center justify-center"
              >
                {language === 'hi' ? 'और जानें' : 'Learn More'}
              </a>
            </div>
          </div>
        </div>

        {/* Animated Stats */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 text-center transform hover:scale-105 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                  <AnimatedCounter 
                    end={stat.value} 
                    prefix={stat.prefix || ''} 
                    suffix={stat.suffix || ''}
                    duration={2000}
                  />
                </div>
                <div className="text-xs md:text-base text-gray-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'hi' ? 'प्रमुख सुविधाएं' : 'Key Features'}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {language === 'hi'
                ? 'आधुनिक तकनीक से आपकी सुरक्षा सुनिश्चित करने के लिए'
                : 'Modern technology to ensure your safety'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About/Problem Section */}
      <section id="about" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src="/images/coalfield.jpg"
                alt="Jharia Coalfield"
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {language === 'hi' ? 'झरिया कोयला क्षेत्र की चुनौती' : 'The Jharia Coalfield Challenge'}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                {language === 'hi'
                  ? 'झरिया भारत का सबसे बड़ा कोकिंग कोल क्षेत्र है, लेकिन दशकों से भूमिगत आग और खदान धंसाव से हजारों लोगों की जान और संपत्ति खतरे में है।'
                  : "Jharia is India's largest coking coal field, but decades of underground fires and mine subsidence have put thousands of lives and properties at risk."}
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                {language === 'hi'
                  ? 'JhariaWatch उन्नत सैटेलाइट तकनीक का उपयोग करके भूमि धंसाव की निगरानी करता है और समय पर चेतावनी प्रदान करता है।'
                  : 'JhariaWatch uses advanced satellite technology to monitor land subsidence and provide timely warnings.'}
              </p>
              <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-800 dark:text-red-200 font-medium">
                  {language === 'hi'
                    ? '450+ वर्ग किलोमीटर क्षेत्र जोखिम में • 10 लाख+ प्रभावित लोग'
                    : '450+ sq km area at risk • 1M+ people affected'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                {language === 'hi' ? 'PS-InSAR तकनीक' : 'PS-InSAR Technology'}
              </h2>
              <p className="text-lg text-gray-300 mb-4">
                {language === 'hi'
                  ? 'Persistent Scatterer Interferometric Synthetic Aperture Radar (PS-InSAR) एक उन्नत रिमोट सेंसिंग तकनीक है जो मिलीमीटर स्तर की सटीकता के साथ भूमि विस्थापन को माप सकती है।'
                  : 'Persistent Scatterer Interferometric Synthetic Aperture Radar (PS-InSAR) is an advanced remote sensing technique that can measure land displacement with millimeter-level accuracy.'}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <span className="text-gray-300">
                    {language === 'hi' ? '1mm तक सटीक माप' : 'Accuracy up to 1mm'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <span className="text-gray-300">
                    {language === 'hi' ? 'वास्तविक समय निगरानी' : 'Real-time monitoring'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <span className="text-gray-300">
                    {language === 'hi' ? 'बड़े क्षेत्रों की कवरेज' : 'Wide area coverage'}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <img
                src="/images/mining.jpg"
                alt="Technology"
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 dark:bg-sky-900 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'hi' ? 'ब्लॉग और समाचार' : 'Blog & News'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {language === 'hi'
                ? 'झरिया में धंसाव, सुरक्षा और नवीनतम अपडेट के बारे में जानें'
                : 'Stay informed about subsidence, safety, and latest updates in Jharia'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-48 bg-gradient-to-br from-sky-400 to-blue-500"></div>
                <div className="p-6">
                  <div className="text-xs text-sky-600 dark:text-sky-400 mb-2">Coming Soon</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'hi' ? 'ब्लॉग पोस्ट शीर्षक' : 'Blog Post Title'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {language === 'hi' 
                      ? 'यहाँ जल्द ही उपयोगी ब्लॉग पोस्ट और समाचार आएंगे...'
                      : 'Useful blog posts and news coming soon...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subsidence Impact Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src="/images/subsidence.jpg"
                alt="Subsidence Impact"
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {language === 'hi' ? 'भूमि धंसाव का प्रभाव' : 'Impact of Land Subsidence'}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {language === 'hi' ? 'संरचनात्मक क्षति' : 'Structural Damage'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {language === 'hi'
                        ? 'घरों और इमारतों में दरारें, झुकाव और गिरने का खतरा'
                        : 'Cracks, tilting, and collapse risk for homes and buildings'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {language === 'hi' ? 'सामाजिक प्रभाव' : 'Social Impact'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {language === 'hi'
                        ? 'परिवारों का विस्थापन और आजीविका पर प्रभाव'
                        : 'Displacement of families and impact on livelihoods'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {language === 'hi' ? 'पर्यावरणीय खतरे' : 'Environmental Hazards'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {language === 'hi'
                        ? 'भूमिगत आग, प्रदूषण और जल स्रोतों को नुकसान'
                        : 'Underground fires, pollution, and damage to water sources'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'hi' ? 'समुदाय के साथ मिलकर' : 'Together with the Community'}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {language === 'hi'
                ? 'हम झरिया के लोगों को सशक्त बनाने और सुरक्षित भविष्य बनाने के लिए प्रतिबद्ध हैं'
                : 'We are committed to empowering the people of Jharia and building a safer future'}
            </p>
          </div>
          <div className="relative">
            <img
              src="/images/community.jpg"
              alt="Community"
              className="w-full h-96 object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl flex items-end">
              <div className="p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {language === 'hi' ? '00 परिवार सुरक्षित' : '00+ Families Protected'}
                </h3>
                <p className="text-gray-200">
                  {language === 'hi'
                    ? 'JhariaWatch ने हजारों लोगों को समय पर चेतावनी प्रदान करके बचाया है'
                    : 'JhariaWatch has saved thousands by providing timely warnings'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-700 dark:to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {language === 'hi' ? 'आज ही सुरक्षा शुरू करें' : 'Start Protecting Today'}
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-white/90">
            {language === 'hi'
              ? 'अपने और अपने परिवार की सुरक्षा के लिए अभी JhariaWatch से जुड़ें'
              : 'Join JhariaWatch now to protect yourself and your family'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-sky-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transition inline-flex items-center justify-center gap-2 transform hover:scale-105"
            >
              {language === 'hi' ? 'मुफ्त में रजिस्टर करें' : 'Register for Free'}
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:2230133"
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              {language === 'hi' ? 'हेल्पलाइन: 2230133' : 'Helpline: 2230133'}
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Improved Layout */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:grid grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="JhariaWatch" className="w-10 h-10 rounded-lg" />
                <span className="text-xl font-bold">JhariaWatch</span>
              </div>
              <p className="text-sm text-gray-400">
                {language === 'hi'
                  ? 'झरिया में सुरक्षा और निगरानी के लिए आपका विश्वसनीय साथी'
                  : 'Your trusted partner for safety and monitoring in Jharia'}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{language === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition">{language === 'hi' ? 'सुविधाएं' : 'Features'}</a></li>
                <li><a href="#about" className="hover:text-white transition">{language === 'hi' ? 'परिचय' : 'About'}</a></li>
                <li><a href="#technology" className="hover:text-white transition">{language === 'hi' ? 'तकनीक' : 'Technology'}</a></li>
                <li><a href="#blog" className="hover:text-white transition">{language === 'hi' ? 'ब्लॉग' : 'Blog'}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{language === 'hi' ? 'सहायता' : 'Support'}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/login" className="hover:text-white transition">{language === 'hi' ? 'लॉगिन' : 'Login'}</Link></li>
                <li><Link to="/register" className="hover:text-white transition">{language === 'hi' ? 'रजिस्टर' : 'Register'}</Link></li>
                <li><a href="#" className="hover:text-white transition">{language === 'hi' ? 'सहायता केंद्र' : 'Help Center'}</a></li>
                <li><a href="#" className="hover:text-white transition">{language === 'hi' ? 'संपर्क करें' : 'Contact Us'}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{language === 'hi' ? 'कानूनी & आपातकालीन' : 'Legal & Emergency'}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/privacy-policy" className="hover:text-white transition">{language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white transition">{language === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-white transition">{language === 'hi' ? 'कुकी नीति' : 'Cookie Policy'}</Link></li>
                <li className="flex items-center gap-2 pt-2 border-t border-gray-800">
                  <Phone className="w-4 h-4" />
                  <span>2230133</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile: Vertical Layout */}
          <div className="md:hidden space-y-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="JhariaWatch" className="w-10 h-10 rounded-lg" />
                <span className="text-xl font-bold">JhariaWatch</span>
              </div>
              <p className="text-sm text-gray-400">
                {language === 'hi'
                  ? 'झरिया में सुरक्षा और निगरानी के लिए आपका विश्वसनीय साथी'
                  : 'Your trusted partner for safety and monitoring in Jharia'}
              </p>
            </div>
            
            {/* Quick Links & Support - Horizontal */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-3 text-sm">{language === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li><a href="#features" className="hover:text-white transition">{language === 'hi' ? 'सुविधाएं' : 'Features'}</a></li>
                  <li><a href="#about" className="hover:text-white transition">{language === 'hi' ? 'परिचय' : 'About'}</a></li>
                  <li><a href="#technology" className="hover:text-white transition">{language === 'hi' ? 'तकनीक' : 'Technology'}</a></li>
                  <li><a href="#blog" className="hover:text-white transition">{language === 'hi' ? 'ब्लॉग' : 'Blog'}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3 text-sm">{language === 'hi' ? 'सहायता' : 'Support'}</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li><Link to="/login" className="hover:text-white transition">{language === 'hi' ? 'लॉगिन' : 'Login'}</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">{language === 'hi' ? 'रजिस्टर' : 'Register'}</Link></li>
                  <li><a href="#" className="hover:text-white transition">{language === 'hi' ? 'सहायता केंद्र' : 'Help Center'}</a></li>
                  <li><a href="#" className="hover:text-white transition">{language === 'hi' ? 'संपर्क करें' : 'Contact Us'}</a></li>
                </ul>
              </div>
            </div>

            {/* Legal & Emergency - Horizontal */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-800">
              <div>
                <h4 className="font-bold mb-3 text-sm">{language === 'hi' ? 'कानूनी' : 'Legal'}</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li><Link to="/privacy-policy" className="hover:text-white transition">{language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}</Link></li>
                  <li><Link to="/terms-of-service" className="hover:text-white transition">{language === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}</Link></li>
                  <li><Link to="/cookie-policy" className="hover:text-white transition">{language === 'hi' ? 'कुकी नीति' : 'Cookie Policy'}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3 text-sm">{language === 'hi' ? 'आपातकालीन' : 'Emergency'}</h4>
                <div className="space-y-2 text-xs text-gray-400">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>2230133</span>
                  </p>
                  <p className="text-xs">
                    {language === 'hi' ? '24/7 उपलब्ध' : '24/7 Available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 md:pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 JhariaWatch. {language === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Landing;
