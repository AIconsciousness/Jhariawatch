// Jharia Places Data with Real Coordinates and Subsidence Rates
// Based on research papers and actual locations

export const jhariaPlaces = [
  {
    id: 'alkusa',
    name: { en: 'Alkusa Opencast Mines', hi: 'अल्कुसा ओपनकास्ट खदान' },
    coordinates: { lat: 23.767, lng: 86.396 },
    riskLevel: 'critical',
    baseSubsidenceRate: 27, // mm/year
    maxRate: 29,
    cumulativeDisplacement: 90,
    area: 'Alkusa',
    description: {
      en: 'Critical subsidence zone over Alkusa opencast mine. Maximum LOS velocity of -29 mm/year detected.',
      hi: 'अल्कुसा ओपनकास्ट खदान के ऊपर क्रिटिकल धंसाव क्षेत्र। -29 मिमी/वर्ष की अधिकतम LOS वेग पाई गई।'
    }
  },
  {
    id: 'ena',
    name: { en: 'Ena Colliery', hi: 'एना कोलियरी' },
    coordinates: { lat: 23.758, lng: 86.401 },
    riskLevel: 'critical',
    baseSubsidenceRate: 19, // Average of 10-28 range
    maxRate: 28,
    cumulativeDisplacement: 85,
    area: 'Ena',
    description: {
      en: 'Ena Colliery area showing critical subsidence rates between 10-28 mm/year.',
      hi: 'एना कोलियरी क्षेत्र में 10-28 मिमी/वर्ष की क्रिटिकल धंसाव दर दिख रही है।'
    }
  },
  {
    id: 'tisra',
    name: { en: 'Tisra - B.R. Company Jayrampur', hi: 'तिसरा - बी.आर. कंपनी जयरामपुर' },
    coordinates: { lat: 23.715, lng: 86.434 },
    riskLevel: 'critical',
    baseSubsidenceRate: 20,
    maxRate: 25,
    cumulativeDisplacement: 70,
    area: 'Tisra',
    description: {
      en: 'Tisra area with B.R. Company Jayrampur Colliery showing high subsidence activity.',
      hi: 'तिसरा क्षेत्र में बी.आर. कंपनी जयरामपुर कोलियरी में उच्च धंसाव गतिविधि दिख रही है।'
    }
  },
  {
    id: 'bera_dobari',
    name: { en: 'Bera-Dobari', hi: 'बेरा-डोबारी' },
    coordinates: { lat: 23.758, lng: 86.435 },
    riskLevel: 'high',
    baseSubsidenceRate: 28,
    maxRate: 28,
    cumulativeDisplacement: 87,
    area: 'Bera-Dobari',
    description: {
      en: 'Bera-Dobari area showing high subsidence rate of 28 mm/year.',
      hi: 'बेरा-डोबारी क्षेत्र में 28 मिमी/वर्ष की उच्च धंसाव दर दिख रही है।'
    }
  },
  {
    id: 'bastacola',
    name: { en: 'Bastacola', hi: 'बस्ताकोला' },
    coordinates: { lat: 23.745, lng: 86.420 },
    riskLevel: 'high',
    baseSubsidenceRate: 10,
    maxRate: 12,
    cumulativeDisplacement: 30,
    area: 'Bastacola',
    description: {
      en: 'Bastacola area with moderate to high subsidence rate around 10 mm/year.',
      hi: 'बस्ताकोला क्षेत्र में लगभग 10 मिमी/वर्ष की मध्यम से उच्च धंसाव दर है।'
    }
  },
  {
    id: 'ck_siding',
    name: { en: 'CK-Siding', hi: 'सीके-साइडिंग' },
    coordinates: { lat: 23.730, lng: 86.410 },
    riskLevel: 'high',
    baseSubsidenceRate: 15.5, // Average of 10-21
    maxRate: 21,
    cumulativeDisplacement: 60,
    area: 'CK-Siding',
    description: {
      en: 'CK-Siding area showing subsidence rates between 10-21 mm/year.',
      hi: 'सीके-साइडिंग क्षेत्र में 10-21 मिमी/वर्ष की धंसाव दर दिख रही है।'
    }
  },
  {
    id: 'jeenagora',
    name: { en: 'Jeenagora BCCL Hospital Area', hi: 'जीनागोरा BCCL अस्पताल क्षेत्र' },
    coordinates: { lat: 23.702, lng: 86.452 },
    riskLevel: 'moderate',
    baseSubsidenceRate: 8,
    maxRate: 12,
    cumulativeDisplacement: 45,
    area: 'Jeenagora',
    description: {
      en: 'Jeenagora BCCL Hospital area with moderate subsidence activity.',
      hi: 'जीनागोरा BCCL अस्पताल क्षेत्र में मध्यम धंसाव गतिविधि है।'
    }
  },
  {
    id: 'jorapokhar',
    name: { en: 'Begariya More, Jorapokhar', hi: 'बेगरिया मोड़, जोरापोखर' },
    coordinates: { lat: 23.699, lng: 86.427 },
    riskLevel: 'moderate',
    baseSubsidenceRate: 6,
    maxRate: 10,
    cumulativeDisplacement: 35,
    area: 'Jorapokhar',
    description: {
      en: 'Begariya More area in Jorapokhar showing moderate subsidence.',
      hi: 'जोरापोखर में बेगरिया मोड़ क्षेत्र में मध्यम धंसाव दिख रहा है।'
    }
  },
  {
    id: 'kuzama',
    name: { en: 'Kuzama Kali Mandir, Tisra', hi: 'कुजामा काली मंदिर, तिसरा' },
    coordinates: { lat: 23.734, lng: 86.432 },
    riskLevel: 'high',
    baseSubsidenceRate: 12,
    maxRate: 18,
    cumulativeDisplacement: 55,
    area: 'Kuzama',
    description: {
      en: 'Kuzama Kali Mandir area in Tisra showing high subsidence activity.',
      hi: 'तिसरा में कुजामा काली मंदिर क्षेत्र में उच्च धंसाव गतिविधि दिख रही है।'
    }
  },
  {
    id: 'jharia_town',
    name: { en: 'Jharia Town Center', hi: 'झरिया टाउन सेंटर' },
    coordinates: { lat: 23.750, lng: 86.420 },
    riskLevel: 'moderate',
    baseSubsidenceRate: 5,
    maxRate: 8,
    cumulativeDisplacement: 25,
    area: 'Jharia Town',
    description: {
      en: 'Jharia Town Center with moderate subsidence monitoring.',
      hi: 'झरिया टाउन सेंटर में मध्यम धंसाव निगरानी है।'
    }
  },
  {
    id: 'dhanbad',
    name: { en: 'Dhanbad City', hi: 'धनबाद शहर' },
    coordinates: { lat: 23.795, lng: 86.430 },
    riskLevel: 'low',
    baseSubsidenceRate: 2,
    maxRate: 4,
    cumulativeDisplacement: 10,
    area: 'Dhanbad',
    description: {
      en: 'Dhanbad City area with low subsidence risk, relatively stable.',
      hi: 'धनबाद शहर क्षेत्र में कम धंसाव जोखिम है, अपेक्षाकृत स्थिर।'
    }
  }
];

// Get place by ID
export const getPlaceById = (id) => {
  return jhariaPlaces.find(place => place.id === id);
};

// Get place by coordinates (nearest)
export const getPlaceByCoordinates = (lat, lng) => {
  let nearest = null;
  let minDistance = Infinity;

  jhariaPlaces.forEach(place => {
    const distance = Math.sqrt(
      Math.pow(place.coordinates.lat - lat, 2) + 
      Math.pow(place.coordinates.lng - lng, 2)
    ) * 111; // Convert to km

    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...place, distance: Math.round(distance * 10) / 10 };
    }
  });

  return nearest;
};

// Generate realistic time-series data for a place
export const generatePlaceTimeSeries = (place, months = 12) => {
  const now = new Date();
  const data = [];
  let cumulative = 0;

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    
    // Seasonal variation (monsoon = less, dry = more)
    const isMonsoon = month >= 5 && month <= 9; // May-September
    const seasonalFactor = isMonsoon ? 0.7 : 1.3;
    
    // Add realistic variation based on place
    const variation = (Math.random() - 0.5) * (place.baseSubsidenceRate * 0.2);
    const rate = Math.max(0, (place.baseSubsidenceRate * seasonalFactor) + variation);
    
    // Cumulative displacement
    cumulative += (rate / 12);
    
    data.push({
      date: date.toISOString(),
      dateLabel: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      rate: Math.round(rate * 10) / 10,
      cumulative: Math.round(cumulative * 10) / 10,
      riskLevel: rate > 7 ? 'critical' : rate > 3 ? 'high' : rate > 1 ? 'moderate' : 'low',
      isMonsoon
    });
  }

  return data;
};


