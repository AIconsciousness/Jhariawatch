import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { riskAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const JHARIA_CENTER = [23.75, 86.42];
const DEFAULT_ZOOM = 12;

const riskColors = {
  critical: '#dc2626',
  high: '#ea580c',
  moderate: '#ca8a04',
  low: '#65a30d',
  stable: '#16a34a',
  uplifting: '#2563eb'
};

const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `
    <div style="position: relative; display: flex; width: 36px; height: 36px; align-items: center; justify-content: center;">
      <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background-color: #3b82f6; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
      <span style="position: relative; display: inline-flex; border-radius: 50%; height: 16px; width: 16px; background-color: #2563eb; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const LocationMarker = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 14);
    }
  }, [position, map]);

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup>Your Location</Popup>
    </Marker>
  ) : null;
};

const RiskMap = ({ userLocation, onZoneClick, height = '300px', interactive = true }) => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await riskAPI.getZones();
        if (response.data.success) {
          setGeoData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch zones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  const getStyle = (feature) => {
    const riskLevel = feature.properties.riskLevel;
    return {
      fillColor: riskColors[riskLevel] || '#6b7280',
      weight: 2,
      opacity: 1,
      color: riskColors[riskLevel] || '#6b7280',
      fillOpacity: 0.4
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    const name = props.zoneName?.[language] || props.zoneName?.en || 'Unknown Zone';
    const riskLevel = props.riskLevel?.toUpperCase() || 'UNKNOWN';
    const rate = props.subsidenceRate || 'N/A';

    layer.bindPopup(`
      <div style="min-width: 150px;">
        <strong style="font-size: 14px;">${name}</strong>
        <div style="margin-top: 8px; padding: 4px 8px; border-radius: 4px; background: ${riskColors[props.riskLevel]}20; color: ${riskColors[props.riskLevel]}; font-weight: 600;">
          ${riskLevel}
        </div>
        <p style="margin-top: 8px; font-size: 12px; color: #666;">
          Subsidence Rate: <strong>${rate} mm/year</strong>
        </p>
      </div>
    `);

    layer.on({
      click: () => {
        if (onZoneClick) {
          onZoneClick(feature.properties);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-200 rounded-xl" style={{ height }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={JHARIA_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={interactive}
        dragging={interactive}
        touchZoom={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {geoData && (
          <GeoJSON
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {userLocation && (
          <LocationMarker position={[userLocation.lat, userLocation.lng]} />
        )}
      </MapContainer>
    </div>
  );
};

export default RiskMap;
