import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Shield, Check, X } from 'lucide-react';
import { initializeSessionAnalytics } from '../services/analyticsService';

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (consent === 'accepted') {
      // If previously accepted, ensure session is active
      initializeSessionAnalytics();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    initializeSessionAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center pb-6 md:pb-8 animate-fade-in-up pointer-events-none">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-4xl w-full p-6 flex flex-col md:flex-row items-center gap-6 pointer-events-auto">
        
        {/* Icon & Text */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {language === 'hi' ? 'हम आपकी निजता का सम्मान करते हैं' : 'We value your privacy'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'hi' 
                ? 'बेहतर अनुभव और प्लेटफ़ॉर्म एनालिटिक्स के लिए हम कुकीज़ का उपयोग करते हैं। '
                : 'We use cookies and telemetry tools to analyze site traffic, improve platform stability, and record metrics safely to our internal secure database. '}
              <Link to="/cookie-policy" className="text-blue-600 hover:underline font-medium">
                {language === 'hi' ? 'कुकी नीति पढ़ें' : 'Read Cookie Policy'}
              </Link>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            {language === 'hi' ? 'केवल आवश्यक' : 'Essential Only'}
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {language === 'hi' ? 'सभी स्वीकार करें' : 'Accept All'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookieConsentBanner;
