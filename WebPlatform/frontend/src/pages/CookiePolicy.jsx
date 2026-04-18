import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Cookie } from 'lucide-react';

const CookiePolicy = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            {language === 'hi' ? 'होम पेज' : 'Back to Home'}
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <Cookie className="w-10 h-10" />
            <h1 className="text-4xl font-bold">
              {language === 'hi' ? 'कुकी नीति' : 'Cookie Policy'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-gray-600 mb-8">
            {language === 'hi' ? 'अंतिम अपडेट: दिसंबर 2024' : 'Last Updated: December 2024'}
          </p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'hi' ? 'कुकीज़ क्या हैं?' : 'What Are Cookies?'}
            </h2>
            <p className="text-gray-700 mb-6">
              {language === 'hi'
                ? 'कुकीज़ छोटी टेक्स्ट फ़ाइलें हैं जो आपके डिवाइस पर संग्रहीत होती हैं जब आप वेबसाइट पर जाते हैं। वे वेबसाइट को आपके डिवाइस को पहचानने और आपकी प्राथमिकताओं को याद रखने में मदद करती हैं।'
                : 'Cookies are small text files stored on your device when you visit a website. They help the website recognize your device and remember your preferences.'}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'hi' ? 'हम कुकीज़ का उपयोग कैसे करते हैं' : 'How We Use Cookies'}
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {language === 'hi' ? 'आवश्यक कुकीज़' : 'Essential Cookies'}
            </h3>
            <p className="text-gray-700 mb-4">
              {language === 'hi'
                ? 'ये कुकीज़ वेबसाइट के बुनियादी कार्यों के लिए आवश्यक हैं, जैसे लॉगिन और प्राथमिकताएं बनाए रखना।'
                : 'These cookies are necessary for basic website functions, such as maintaining login and preferences.'}
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {language === 'hi' ? 'कार्यात्मक कुकीज़' : 'Functional Cookies'}
            </h3>
            <p className="text-gray-700 mb-4">
              {language === 'hi'
                ? 'ये कुकीज़ आपकी भाषा प्राथमिकता और अन्य सेटिंग्स को याद रखने में मदद करती हैं।'
                : 'These cookies help remember your language preference and other settings.'}
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {language === 'hi' ? 'विश्लेषणात्मक कुकीज़' : 'Analytical Cookies'}
            </h3>
            <p className="text-gray-700 mb-6">
              {language === 'hi'
                ? 'ये कुकीज़ हमें यह समझने में मदद करती हैं कि उपयोगकर्ता हमारी वेबसाइट के साथ कैसे इंटरैक्ट करते हैं, ताकि हम सेवा में सुधार कर सकें।'
                : 'These cookies help us understand how users interact with our website, so we can improve the service.'}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'hi' ? 'कुकीज़ को प्रबंधित करें' : 'Managing Cookies'}
            </h2>
            <p className="text-gray-700 mb-4">
              {language === 'hi'
                ? 'आप अपने ब्राउज़र सेटिंग्स के माध्यम से कुकीज़ को नियंत्रित और हटा सकते हैं:'
                : 'You can control and delete cookies through your browser settings:'}
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies</li>
              <li><strong>Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies</li>
              <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies</li>
              <li><strong>Edge:</strong> Settings &gt; Privacy &gt; Cookies</li>
            </ul>

            <p className="text-gray-700 mb-6">
              {language === 'hi'
                ? 'नोट: कुकीज़ को अक्षम करने से कुछ वेबसाइट सुविधाएं प्रभावित हो सकती हैं।'
                : 'Note: Disabling cookies may affect some website features.'}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'hi' ? 'संपर्क करें' : 'Contact Us'}
            </h2>
            <p className="text-gray-700 mb-2">
              {language === 'hi'
                ? 'कुकीज़ के बारे में प्रश्नों के लिए:'
                : 'For questions about cookies:'}
            </p>
            <ul className="list-none text-gray-700 space-y-1">
              <li><strong>Email:</strong> privacy@jhariawatch.org</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
