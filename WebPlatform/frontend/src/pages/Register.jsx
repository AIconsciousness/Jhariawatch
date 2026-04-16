import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff, AlertTriangle, ChevronRight, ChevronLeft, Mail, Phone, Lock, MapPin } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import { isFirebaseConfigured } from '../config/firebase';

const Register = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { register, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    addressDetails: {
      area: '',
      street: '',
      landmark: '',
      pincode: '',
      nearbyMiningSite: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);

  useEffect(() => {
    // Check if Firebase is configured
    setFirebaseAvailable(isFirebaseConfigured());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        addressDetails: { ...formData.addressDetails, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const jhariaAreas = [
    'Alkusa', 'Ena', 'Tisra', 'Bastacola', 'Bera-Dobari', 'CK-Siding',
    'Jeenagora', 'Jorapokhar', 'Kusunda', 'Lodna', 'Kuzama', 'Begariya More',
    'Jharia Town', 'Dhanbad', 'Other'
  ];

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError(language === 'hi' ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError(language === 'hi' ? 'कृपया अपना ईमेल दर्ज करें' : 'Please enter your email');
      return false;
    }
    if (!formData.phone.trim()) {
      setError(language === 'hi' ? 'कृपया अपना फोन नंबर दर्ज करें' : 'Please enter your phone number');
      return false;
    }
    if (formData.password.length < 6) {
      setError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए' : 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(language === 'hi' ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.addressDetails.area) {
      setError(language === 'hi' ? 'कृपया क्षेत्र चुनें' : 'Please select an area');
      return false;
    }
    if (!formData.addressDetails.street.trim()) {
      setError(language === 'hi' ? 'कृपया सड़क का नाम दर्ज करें' : 'Please enter street name');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      preferredLanguage: language,
      addressDetails: formData.addressDetails
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      let errorMessage = 'Registration failed';
      if (result.error) {
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error.message) {
          if (typeof result.error.message === 'string') {
            errorMessage = result.error.message;
          } else if (typeof result.error.message === 'object') {
            errorMessage = result.error.message[language] || result.error.message.en || result.error.message.hi || 'Registration failed';
          }
        } else if (result.error.en || result.error.hi) {
          errorMessage = result.error[language] || result.error.en || result.error.hi;
        }
      }
      setError(errorMessage);
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error?.message || 'Google sign in failed');
      }
    } catch (err) {
      setError(language === 'hi' ? 'Google साइन इन विफल' : 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transform scale-110 animate-subtle-zoom"
        style={{
          backgroundImage: 'url(/images/mining.jpg)',
          filter: 'brightness(0.9) contrast(1.1) saturate(1.2)'
        }}
      />
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/60 via-red-900/50 to-orange-800/60 animate-gradient-shift" />

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -top-48 -right-48 animate-float-slow"></div>
        <div className="absolute w-96 h-96 bg-red-500/10 rounded-full blur-3xl -bottom-48 -left-48 animate-float-slower"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="absolute top-4 right-4">
          <LanguageToggle className="text-white" />
        </div>

        <div className="min-h-screen flex flex-col justify-center px-6 py-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-3">
              <img src="/logo.png" alt="JhariaWatch" className="w-14 h-14 rounded-full" />
            </div>
            <h1 className="text-2xl font-bold text-white">{t('app.name')}</h1>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-md mx-auto w-full">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              {step === 1 
                ? (language === 'hi' ? 'बुनियादी जानकारी' : 'Basic Information')
                : (language === 'hi' ? 'पता विवरण' : 'Address Details')
              }
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              {step === 1 
                ? (language === 'hi' ? 'चरण 1/2' : 'Step 1/2')
                : (language === 'hi' ? 'चरण 2/2' : 'Step 2/2')
              }
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('auth.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder={language === 'hi' ? 'आपका नाम' : 'Your name'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('auth.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {language === 'hi' ? 'अगला' : 'Next'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* Step 2: Address Details */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {language === 'hi' ? 'क्षेत्र/कॉलोनी (झरिया में)' : 'Area/Colony (in Jharia)'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="address.area"
                    value={formData.addressDetails.area}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    required
                  >
                    <option value="">{language === 'hi' ? 'क्षेत्र चुनें' : 'Select Area'}</option>
                    {jhariaAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'hi' ? 'गली/सड़क का नाम' : 'Street/Road Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.addressDetails.street}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder={language === 'hi' ? 'जैसे: मुख्य सड़क, स्टेशन रोड' : 'e.g., Main Road, Station Road'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'hi' ? 'निकटतम लैंडमार्क' : 'Nearest Landmark'} <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="address.landmark"
                    value={formData.addressDetails.landmark}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder={language === 'hi' ? 'जैसे: BCCL अस्पताल, स्कूल के पास' : 'e.g., Near BCCL Hospital, School'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'hi' ? 'पिनकोड' : 'Pincode'} <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.addressDetails.pincode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                      placeholder="826001"
                      maxLength="6"
                      pattern="[0-9]{6}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'hi' ? 'निकटतम खदान' : 'Nearby Mine'} <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="address.nearbyMiningSite"
                      value={formData.addressDetails.nearbyMiningSite}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                      placeholder={language === 'hi' ? 'जैसे: एना कोलियरी' : 'e.g., Ena Colliery'}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {language === 'hi' ? 'पीछे' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('common.loading')}
                      </span>
                    ) : (
                      t('auth.register')
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Google Sign In Button - Only show if Firebase configured */}
            {firebaseAvailable && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">{language === 'hi' ? 'या' : 'OR'}</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {language === 'hi' ? 'Google के साथ साइन इन करें' : 'Sign in with Google'}
                </button>
              </>
            )}

            <p className="text-center text-gray-600 mt-6">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
