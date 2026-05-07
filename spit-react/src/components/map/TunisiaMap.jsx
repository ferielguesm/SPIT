import React, { useEffect, useRef, useState } from 'react';

const CITY_COORDS = {
  'Tunis': [36.8065, 10.1815],
  'Bizerte': [37.2744, 9.8739],
  'Sousse': [35.8256, 10.6369],
  'Monastir': [35.7643, 10.8113],
  'Sfax': [34.7406, 10.7603],
  'Djerba': [33.8076, 10.8451],
  'Tozeur': [33.9197, 8.1335],
  'Douz': [33.4616, 9.0203],
  'Tabarka': [36.9542, 8.7539],
  'Hammamet': [36.4, 10.6167],
  'Nabeul': [36.4561, 10.7376],
  'Kairouan': [35.6781, 10.0963],
  'Ain Draham': [36.7791, 8.6833],
  'Carthage': [36.8524, 10.323],
  'Gammarth': [36.9189, 10.2872],
  'Sidi Bou Said': [36.87, 10.34],
  'La Marsa': [36.8781, 10.3247],
  'Tunis Medina': [36.7992, 10.1706],
};

export default function TunisiaMap({ destination, recommendations = [], activeRecId = null }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const routingControlRef = useRef(null);
  const [userLoc, setUserLoc] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLoc([36.8065, 10.1815])
      );
    }

    if (!document.getElementById('leaflet-css')) {
      const l1 = document.createElement('link'); l1.id = 'leaflet-css'; l1.rel = 'stylesheet'; l1.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(l1);
      const l2 = document.createElement('link'); l2.rel = 'stylesheet'; l2.href = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css'; document.head.appendChild(l2);
    }

    if (!window.L) {
      const s1 = document.createElement('script'); s1.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s1.async = true; s1.onload = () => {
        const s2 = document.createElement('script'); s2.src = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js'; s2.async = true; s2.onload = initMap; document.head.appendChild(s2);
      }; document.head.appendChild(s1);
    } else if (!window.L.Routing) {
      const s2 = document.createElement('script'); s2.src = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js'; s2.async = true; s2.onload = initMap; document.head.appendChild(s2);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || mapInstance.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([34.5, 9.5], 6);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
      mapInstance.current = map;
      renderMarkersAndRouting();
    }

    function renderMarkersAndRouting() {
      if (!mapInstance.current || !window.L.Routing) return;
      const L = window.L;
      const map = mapInstance.current;

      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};

      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      if (userLoc) {
        const userIcon = L.divIcon({
          className: 'user-marker',
          html: '<div style="width:16px; height:16px; background:#4A919E; border:3px solid white; border-radius:50%; box-shadow:0 0 15px #4A919E; animation: pulse-blue 2s infinite;"></div>',
          iconSize:[16,16], iconAnchor:[8,8]
        });
        L.marker(userLoc, { icon: userIcon }).addTo(map).bindPopup('<b>You are here</b>');
      }

      recommendations.forEach(rec => {
        const coords = CITY_COORDS[rec.destination] || [36.8, 10.2];
        const isActive = rec.id === activeRecId;
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:${isActive?24:14}px; height:${isActive?24:14}px; background:${isActive?'#FFC038':'rgba(255,255,255,0.4)'}; border:2px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; box-shadow:0 0 15px ${isActive?'#FFC038':'rgba(0,0,0,0.3)'}; transition:all 0.3s;">${isActive?'⭐':''}</div>`,
          iconSize: [isActive?24:14], iconAnchor: [isActive?12:7]
        });

        const marker = L.marker(coords, { icon }).addTo(map);
        marker.bindPopup(`<b>${rec.activity}</b><br/>${rec.destination}`);
        markersRef.current[rec.id] = marker;

        if (isActive) {
          marker.openPopup();
          if (userLoc) {
            const control = L.Routing.control({
              waypoints: [L.latLng(userLoc[0], userLoc[1]), L.latLng(coords[0], coords[1])],
              router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
              lineOptions: { styles: [{ color: '#FFC038', weight: 6, opacity: 0.9 }] },
              createMarker: () => null,
              addWaypoints: false,
              fitSelectedRoutes: true,
              show: false
            }).addTo(map);
            
            control.on('routesfound', (e) => {
              const route = e.routes[0];
              setRouteInfo({
                distance: (route.summary.totalDistance / 1000).toFixed(1),
                time: Math.round(route.summary.totalTime / 60)
              });
            });
            routingControlRef.current = control;
          } else {
            map.flyTo(coords, 12, { duration: 1.5 });
          }
        }
      });
      if (!activeRecId) setRouteInfo(null);
    }

    if (mapInstance.current) renderMarkersAndRouting();
  }, [destination, recommendations, activeRecId, userLoc]);

  const locate = () => {
    if (userLoc && mapInstance.current) mapInstance.current.flyTo(userLoc, 13);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#111', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Route Info Panel */}
      {routeInfo && (
        <div style={{ 
          position: 'absolute', top: '16px', left: '16px', zIndex: 1000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', 
          padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,192,56,0.3)',
          color: 'white', display: 'flex', gap: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#FFC038', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Distance</div>
            <div style={{ fontSize: '18px', fontWeight: 900 }}>{routeInfo.distance} <span style={{ fontSize: '12px' }}>km</span></div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '10px', color: '#FFC038', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Est. Time</div>
            <div style={{ fontSize: '18px', fontWeight: 900 }}>{routeInfo.time} <span style={{ fontSize: '12px' }}>min</span></div>
          </div>
        </div>
      )}

      {/* Locate Button */}
      <button onClick={locate} title="Locate Me"
        style={{ 
          position: 'absolute', bottom: '16px', right: '16px', zIndex: 1000,
          width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}>
        <span className="material-symbols-outlined">my_location</span>
      </button>

      <style>{`
        .leaflet-routing-container { display: none !important; }
        @keyframes pulse-blue { 0% { box-shadow: 0 0 0 0 rgba(74,145,158,0.7); } 70% { box-shadow: 0 0 0 15px rgba(74,145,158,0); } 100% { box-shadow: 0 0 0 0 rgba(74,145,158,0); } }
      `}</style>
    </div>
  );
}
