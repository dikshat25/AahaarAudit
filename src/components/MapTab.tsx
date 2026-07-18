
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Compass } from 'lucide-react';
import { KITCHENS } from '../mockData/kitchens';


const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
const LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';

const MUMBAI = { lat: 19.076, lng: 72.8777 };
const NASHIK = { lat: 19.9975, lng: 73.7898 };

const inMumbai = (loc) => loc.toLowerCase().includes('mumbai');
const inNashik = (loc) => loc.toLowerCase().includes('nashik');

// Real approximate coordinates for the Mumbai-cluster facility neighborhoods,
// plus Nashik itself.
const COORDS = {
  'k-1': { lat: 19.0178, lng: 72.8478 }, // Dadar Dark Store #58
  'k-2': { lat: 19.0596, lng: 72.8295 }, // Bandra Central Kitchen
  'k-7': { lat: 19.1136, lng: 72.8697 }, // Andheri Cloud Ops
  'k-8': { lat: 19.1874, lng: 72.8484 }, // Malad Prep Center
  'k-6': { lat: 19.9975, lng: 73.7898 }, // Nashik Fresh Bites
};

const STATUS_COLOR = {
  critical: '#C0392B',
  warning: '#FF9933',
  compliant: '#1B7A3D',
};

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);

    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function MapTab() {
  const [selectedPin, setSelectedPin] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const facilities = KITCHENS.filter((k) => inMumbai(k.location) || inNashik(k.location))
    .filter((k) => COORDS[k.id])
    .map((k) => ({ ...k, ...COORDS[k.id] }));

  const handleSelect = useCallback((facility) => setSelectedPin(facility), []);

  // Init the Leaflet map once
  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([19.55, 73.3], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // NH160 style corridor between the two jurisdiction hubs
        L.polyline(
          [
            [MUMBAI.lat, MUMBAI.lng],
            [NASHIK.lat, NASHIK.lng],
          ],
          { color: '#FF9933', weight: 3, dashArray: '6 6', opacity: 0.85 }
        ).addTo(map);

        L.circleMarker([MUMBAI.lat, MUMBAI.lng], {
          radius: 10,
          color: '#0A2647',
          weight: 1,
          fillColor: '#0A2647',
          fillOpacity: 0.08,
        }).addTo(map);
        L.circleMarker([NASHIK.lat, NASHIK.lng], {
          radius: 9,
          color: '#0A2647',
          weight: 1,
          fillColor: '#0A2647',
          fillOpacity: 0.08,
        }).addTo(map);

        L.marker([MUMBAI.lat, MUMBAI.lng], { opacity: 0 }).addTo(map).bindTooltip('MUMBAI', {
          permanent: true,
          direction: 'bottom',
          className: 'jurisdiction-label',
        });
        L.marker([NASHIK.lat, NASHIK.lng], { opacity: 0 }).addTo(map).bindTooltip('NASHIK', {
          permanent: true,
          direction: 'top',
          className: 'jurisdiction-label',
        });

        mapRef.current = map;
        setMapReady(true);
      })
      .catch(() => {
        // Leaflet failed to load (e.g. offline) — mapReady stays false and
        // the fallback message below is shown instead.
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync facility markers whenever the map is ready
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.L) return;
    const L = window.L;
    const map = mapRef.current;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    facilities.forEach((k) => {
      const color = STATUS_COLOR[k.status] || '#0A2647';

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:26px;height:26px;">
            ${
              k.status === 'critical'
                ? `<div style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:0.5;animation:fda-pulse 2s infinite;"></div>`
                : ''
            }
            <div style="position:relative;width:24px;height:24px;border-radius:9999px;background:${color};border:2px solid #0A2647;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([k.lat, k.lng], { icon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family:sans-serif;min-width:140px;">
           <strong style="color:#0A2647;">${k.name}</strong><br/>
           <span style="color:#047857;font-size:12px;">${k.location}</span><br/>
           <span style="font-size:11px;color:#0A2647;">Risk: ${k.riskScore}/100 &middot; Compliance: ${k.compliance}%</span>
         </div>`
      );
      marker.on('click', () => handleSelect(k));
      markersRef.current.push(marker);
    });
  }, [mapReady, facilities, handleSelect]);

  return (
    <div className="w-full h-[600px] glass-panel relative overflow-hidden flex bg-[#DCEBF5] border border-[#0A2647]/10 shadow-xl">
      <style>{`
        @keyframes fda-pulse {
          0% { transform: scale(1); opacity: 0.55; }
          70% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .jurisdiction-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-weight: 700;
          font-size: 11px;
          color: #0A2647;
          font-family: sans-serif;
        }
        .leaflet-container { background: #DCEBF5; font-family: sans-serif; }
      `}</style>

      {/* ---------------- Real map (Leaflet / OpenStreetMap) ---------------- */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center text-[#0A2647]/60 text-sm font-mono">
          Loading map&hellip;
        </div>
      )}

      {/* Compass */}
      <div className="absolute top-4 right-6 z-[500] flex flex-col items-center text-[#0A2647]/70 bg-white/80 rounded-full p-1.5 shadow">
        <Compass className="w-5 h-5" />
        <span className="text-[9px] font-mono font-bold mt-0.5">N</span>
      </div>

      {/* Map title */}
      <div className="absolute top-4 left-4 z-[500] text-[#0A2647]/80 font-mono text-xs font-bold tracking-widest uppercase bg-white/80 px-2 py-1 rounded shadow">
        Map Area
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[500] bg-white/90 border border-[#0A2647]/10 rounded-lg px-3 py-2 flex gap-4 text-[11px] font-medium text-[#0A2647]/80 shadow">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#C0392B] inline-block" /> Critical</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF9933] inline-block" /> Warning</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#1B7A3D] inline-block" /> Compliant</span>
      </div>

      {/* Side Panel for Selected Pin */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl border-l border-[#0A2647]/10 p-6 shadow-2xl z-[1000] flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-[#0A2647] text-lg">{selectedPin.name}</h3>
                <p className="text-sm text-emerald-700">{selectedPin.location}</p>
                <span className="inline-block mt-2 text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">{selectedPin.type}</span>
              </div>
              <button onClick={() => setSelectedPin(null)} className="text-emerald-700 hover:text-[#0A2647] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-700 text-sm">Risk Score</span>
                <span className={`font-bold font-mono text-lg ${
                  selectedPin.riskScore > 80 ? 'text-[#C0392B]' : selectedPin.riskScore > 50 ? 'text-[#FF9933]' : 'text-[#1B7A3D]'
                }`}>{selectedPin.riskScore}/100</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-700 text-sm">Compliance</span>
                <span className="font-bold font-mono text-lg text-[#0A2647]">{selectedPin.compliance}%</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-700 text-sm">Last Inspection</span>
                <span className="font-mono text-sm text-emerald-800">{selectedPin.lastInspection}</span>
              </div>

              {selectedPin.status === 'critical' && (
                <div className="p-4 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-lg mt-4">
                  <div className="flex items-center gap-2 text-[#C0392B] mb-2 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" /> Priority Actions
                  </div>
                  <ul className="text-xs text-emerald-800 list-disc pl-4 space-y-1">
                    <li>Immediate ground inspection required</li>
                    <li>Verify hygiene protocols</li>
                    <li>Check supplier logs for Batch X</li>
                  </ul>
                </div>
              )}
            </div>

            <button className={`w-full mt-auto text-white text-sm font-bold py-3 rounded transition-colors ${
              selectedPin.status === 'critical' ? 'bg-[#C0392B] hover:bg-red-700' : 'bg-[#FF9933] hover:bg-amber-600 text-[#0A2647]'
            }`}>
              {selectedPin.status === 'critical' ? 'Dispatch Priority Inspector' : 'Schedule Routine Audit'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}