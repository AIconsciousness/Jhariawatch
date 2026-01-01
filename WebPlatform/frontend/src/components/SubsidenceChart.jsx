import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingDown, AlertTriangle, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { riskAPI } from '../services/api';

const SubsidenceChart = ({ zoneId, height = 300 }) => {
  const { language } = useLanguage();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    const fetchTimeSeries = async () => {
      try {
        // Mock time-series data (in real app, this would come from Sentinel-1 API)
        // For now, generate realistic data based on zone
        const now = new Date();
        const data = [];
        let baseRate = 5; // mm/year
        
        // Generate last 12 months of data
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          
          // Simulate seasonal variation (monsoon = less subsidence, dry = more)
          const month = date.getMonth();
          const isMonsoon = month >= 5 && month <= 9; // May-September
          const seasonalFactor = isMonsoon ? 0.7 : 1.3;
          
          // Add some random variation
          const variation = (Math.random() - 0.5) * 2;
          const rate = Math.max(0, (baseRate * seasonalFactor) + variation);
          
          // Cumulative displacement (increasing over time)
          const cumulative = i === 11 ? 0 : data[data.length - 1].cumulative + (rate / 12);
          
          data.push({
            date: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
            month: date.toLocaleDateString('en-IN', { month: 'short' }),
            rate: Math.round(rate * 10) / 10,
            cumulative: Math.round(cumulative * 10) / 10,
            riskLevel: rate > 7 ? 'critical' : rate > 3 ? 'high' : rate > 1 ? 'moderate' : 'low'
          });
        }
        
        setChartData(data);
        
        // Calculate trend
        if (data.length >= 2) {
          const recent = data.slice(-3).reduce((sum, d) => sum + d.rate, 0) / 3;
          const older = data.slice(0, 3).reduce((sum, d) => sum + d.rate, 0) / 3;
          const trendValue = ((recent - older) / older) * 100;
          setTrend({
            value: Math.round(trendValue * 10) / 10,
            increasing: trendValue > 0,
            dangerous: recent > 7 || trendValue > 20
          });
        }
        
      } catch (error) {
        console.error('Failed to fetch time series:', error);
      } finally {
        setLoading(false);
      }
    };

    if (zoneId) {
      fetchTimeSeries();
    }
  }, [zoneId]);

  const getRiskColor = (level) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      moderate: '#ca8a04',
      low: '#65a30d',
      stable: '#16a34a'
    };
    return colors[level] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm" style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">
              {language === 'hi' ? 'ग्राफ लोड हो रहा है...' : 'Loading chart...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-gray-800">
            {language === 'hi' ? 'धंसाव रुझान (12 महीने)' : 'Subsidence Trend (12 Months)'}
          </h3>
        </div>
        {trend && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
            trend.dangerous ? 'bg-red-50 text-red-600' : 
            trend.increasing ? 'bg-orange-50 text-orange-600' : 
            'bg-green-50 text-green-600'
          }`}>
            <AlertTriangle className={`w-4 h-4 ${trend.dangerous ? '' : 'hidden'}`} />
            <span className="text-sm font-semibold">
              {trend.increasing ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>

      {trend && trend.dangerous && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {language === 'hi' ? '⚠️ खतरनाक रुझान' : '⚠️ Dangerous Trend Detected'}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {language === 'hi' 
                  ? 'इस क्षेत्र में धंसाव दर तेजी से बढ़ रही है। कृपया सावधानी बरतें।'
                  : 'Subsidence rate is increasing rapidly in this area. Please exercise caution.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height - 100}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            label={{ 
              value: language === 'hi' ? 'दर (mm/वर्ष)' : 'Rate (mm/year)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#6b7280' }
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value, name) => [
              `${value} mm/year`,
              language === 'hi' ? 'धंसाव दर' : 'Subsidence Rate'
            ]}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#dc2626"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRate)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>
            {language === 'hi' ? 'अंतिम अपडेट:' : 'Last Update:'} {new Date().toLocaleDateString()}
          </span>
        </div>
        <span>
          {language === 'hi' ? 'डेटा स्रोत: Sentinel-1 PS-InSAR' : 'Data Source: Sentinel-1 PS-InSAR'}
        </span>
      </div>
    </div>
  );
};

export default SubsidenceChart;


