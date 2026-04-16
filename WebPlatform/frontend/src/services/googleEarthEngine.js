// Google Earth Engine API Integration via Backend
// This service now calls our backend GEE endpoints instead of direct GEE API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const isGEEConfigured = () => {
  return true; // Backend handles GEE configuration
};

/**
 * Get Sentinel-1 subsidence data for Jharia region
 * @param {Object} bounds - Bounding box {north, south, east, west} or null for default Jharia
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise} Subsidence data
 */
export const getSentinel1SubsidenceData = async (bounds = null, startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();

    if (bounds) {
      params.append('bbox', `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`);
    }

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/api/gee/data?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('GEE Backend API error:', error);
    return {
      success: false,
      error: error.message,
      data: getMockSubsidenceData(bounds) // Fallback to mock data
    };
  }
};

/**
 * Get subsidence risk assessment for a specific location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise} Risk assessment data
 */
export const getLocationRiskAssessment = async (lat, lng) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gee/risk?lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Risk Assessment API error:', error);
    return {
      success: false,
      error: error.message,
      data: getMockRiskAssessment(lat, lng)
    };
  }
};

/**
 * Get time-series subsidence data
 * @param {Object} point - Point coordinates {lat, lng}
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise} Time-series data
 */
export const getSubsidenceTimeSeries = async (point, startDate, endDate) => {
  try {
    // For now, return mock time-series data
    // In future, backend can provide historical data
    return getMockTimeSeries(point, startDate, endDate);
  } catch (error) {
    console.error('Time-series API error:', error);
    return getMockTimeSeries(point, startDate, endDate);
  }
};

/**
 * Mock subsidence data (fallback when GEE not configured)
 */
const getMockSubsidenceData = (bounds) => {
  return {
    success: true,
    data: {
      subsidenceRate: 5.2, // mm/year
      riskLevel: 'high',
      lastUpdated: new Date().toISOString(),
      source: 'Mock Data'
    },
    source: 'Mock'
  };
};

/**
 * Mock time-series data
 */
const getMockTimeSeries = (point, startDate, endDate) => {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
  
  for (let i = 0; i < months; i++) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    const isMonsoon = date.getMonth() >= 5 && date.getMonth() <= 9;
    const rate = isMonsoon ? 3 + Math.random() * 2 : 5 + Math.random() * 3;
    
    data.push({
      date: date.toISOString(),
      rate: Math.round(rate * 10) / 10,
      cumulative: i === 0 ? 0 : data[i - 1].cumulative + (rate / 12)
    });
  }

  return {
    success: true,
    data: data,
    source: 'Mock'
  };
};

