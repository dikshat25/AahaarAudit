import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ShieldCheck, AlertTriangle, Navigation, Building2 } from 'lucide-react';
import { KITCHENS } from '../../mockData/kitchens';
import { fetchComplaints } from '../../api/backendApi';

const GOOGLE_MAPS_KEY = 'AIzaSyD31JCz4XC3nPQxEedtL9fmD2ORRYK9eQ4';

export default function GoogleMapComponent({ showAdminDetails = false }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const complaintMarkersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [activeCity, setActiveCity] = useState('Mumbai');
  const [complaints, setComplaints] = useState([]);

  const facilities = KITCHENS;

  useEffect(() => {
    let mounted = true;
    const loadComplaints = async () => {
      const data = await fetchComplaints();
      if (mounted) setComplaints(Array.isArray(data) ? data : []);
    };

    loadComplaints();
    const interval = setInterval(loadComplaints, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Check if google maps script is already loaded
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initMap();
      };
      script.onerror = () => {
        console.warn('Google Maps script failed to load, falling back to interactive map view');
        initFallbackMap();
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', initMap);
    }

    function initMap() {
      if (!mapRef.current || !window.google || !window.google.maps) return;

      const center = { lat: 18.9750, lng: 72.8258 }; // Mumbai center
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: center,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'on' }] }
        ]
      });
      mapInstanceRef.current = map;

      // Add markers
      facilities.forEach((k) => {
        if (!k.lat || !k.lng) return;

        const isCompliant = k.status === 'safe' || (k.riskScore && k.riskScore < 50);
        const markerColor = isCompliant ? '#1B7A3D' : k.status === 'warning' ? '#FF9933' : '#C0392B';

        const marker = new window.google.maps.Marker({
          position: { lat: k.lat, lng: k.lng },
          map: map,
          title: k.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
          }
        });

        const infoContent = `
          <div style="font-family: sans-serif; padding: 6px; max-width: 220px;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0A2647;">${k.name}</h4>
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #555;">${k.location}</p>
            <p style="margin: 0; font-size: 12px; font-weight: bold; color: ${markerColor}">
              Status: ${k.status?.toUpperCase()} (${k.compliance || 85}% Compliance)
            </p>
            ${k.ownerEmail ? `<p style="margin: 4px 0 0 0; font-size: 10px; color: #0A2647;">Owner: ${k.ownerEmail}</p>` : ''}
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setSelectedFacility(k);
        });
      });

      setMapLoaded(true);
    }

    function initFallbackMap() {
      // Fallback in case Google Maps quota/network restricts
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google?.maps) return undefined;

    complaintMarkersRef.current.forEach(({ marker, infoWindow }) => {
      marker.setMap(null);
      infoWindow.close();
    });
    complaintMarkersRef.current = [];

    const geocoder = new window.google.maps.Geocoder();
    const addComplaintMarker = (complaint, position) => {
      const map = mapInstanceRef.current;
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: `Complaint ${complaint.id}: ${complaint.establishment || complaint.establishmentName || 'Restaurant'}`,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 7,
          fillColor: '#C0392B',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
        },
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:6px;max-width:240px;">
          <h4 style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#0A2647;">${complaint.establishment || complaint.establishmentName || 'Complaint location'}</h4>
          <p style="margin:0 0 4px;font-size:11px;color:#555;">Complaint ${complaint.id}</p>
          <p style="margin:0;font-size:12px;font-weight:bold;color:#C0392B;">${complaint.title || complaint.category || 'Complaint'} · ${complaint.priority || 'Under review'}</p>
        </div>`,
      });
      marker.addListener('click', () => infoWindow.open(map, marker));
      complaintMarkersRef.current.push({ marker, infoWindow });
    };

    complaints.forEach((complaint) => {
      const establishmentName = complaint.establishment || complaint.establishmentName || '';
      const location = complaint.location || '';
      const queries = [
        `${establishmentName}, Mumbai, Maharashtra`,
        `${establishmentName}, ${location}, Mumbai, Maharashtra`,
      ].filter((query, index, all) => query.trim() && all.indexOf(query) === index);
      const normalizedText = `${establishmentName} ${location}`.toLowerCase();

      const geocodeNext = (index) => {
        if (index >= queries.length) {
          if (normalizedText.includes('dadar')) {
            addComplaintMarker(complaint, { lat: 19.0178, lng: 72.8478 });
          }
          return;
        }
        geocoder.geocode({ address: queries[index] }, (results, status) => {
          if (status === 'OK' && results?.[0]?.geometry?.location) {
            addComplaintMarker(complaint, results[0].geometry.location);
          } else {
            geocodeNext(index + 1);
          }
        });
      };

      geocodeNext(0);
    });

    return () => {
      complaintMarkersRef.current.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        infoWindow.close();
      });
      complaintMarkersRef.current = [];
    };
  }, [complaints, mapLoaded]);

  const panToCity = (city, lat, lng, zoom = 12) => {
    setActiveCity(city);
    if (window.google && window.google.maps && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: zoom,
        center: { lat, lng }
      });
      facilities.forEach((k) => {
        if (!k.lat || !k.lng) return;
        new window.google.maps.Marker({
          position: { lat: k.lat, lng: k.lng },
          map: map,
          title: k.name
        });
      });
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchMarker, setSearchMarker] = useState(null);

  const handleSearchLocation = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current || !window.google?.maps) return;
    
    // Check if query matches a known facility first
    const matchedFac = facilities.find(
      (f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matchedFac && matchedFac.lat && matchedFac.lng) {
      mapInstanceRef.current.panTo({ lat: matchedFac.lat, lng: matchedFac.lng });
      mapInstanceRef.current.setZoom(15);
      setSelectedFacility(matchedFac);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        mapInstanceRef.current.panTo(loc);
        mapInstanceRef.current.setZoom(15);

        if (searchMarker) searchMarker.setMap(null);
        const marker = new window.google.maps.Marker({
          position: loc,
          map: mapInstanceRef.current,
          title: searchQuery,
          animation: window.google.maps.Animation.DROP,
        });
        setSearchMarker(marker);
      } else {
        alert(`Location "${searchQuery}" not found. Please try another address or restaurant name.`);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & City Switcher Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#0A2647]/10 shadow-gov-card">
        <form onSubmit={handleSearchLocation} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <MapPin className="w-4 h-4 text-[#FF9933] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hotel, restaurant or destination (e.g. Dadar, Grand Palace)..."
              className="w-full pl-9 pr-3 py-2 border border-[#0A2647]/15 rounded-lg text-xs bg-[#F6F5F1] text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#0A2647] hover:bg-[#153C6E] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0"
          >
            Search Map
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#FF9933]" />
          <span className="text-xs font-bold text-[#0A2647]">City:</span>
          <div className="flex gap-1 ml-1">
            {[
              { name: 'Mumbai', lat: 18.9750, lng: 72.8258, zoom: 12 },
              { name: 'Pune', lat: 18.5204, lng: 73.8567, zoom: 13 },
              { name: 'Nashik', lat: 19.9975, lng: 73.7898, zoom: 13 },
            ].map((c) => (
              <button
                key={c.name}
                onClick={() => panToCity(c.name, c.lat, c.lng, c.zoom)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeCity === c.name
                    ? 'bg-[#0A2647] text-white'
                    : 'bg-[#F6F5F1] text-[#0A2647]/70 hover:bg-[#0A2647]/10'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Safe Outlet
          </span>
          <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning
          </span>
          <span className="flex items-center gap-1.5 text-red-800 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Critical Flag
          </span>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#0A2647]/15 shadow-gov-card bg-[#E5E3DF] min-h-[420px] h-[520px] w-full">
        <div ref={mapRef} className="w-full h-full" style={{ minHeight: '420px' }} />

        {/* Fallback overlay if Google Maps is still loading */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 border-4 border-[#0A2647] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold text-[#0A2647]">Loading Live Google Maps...</p>
            <p className="text-xs text-[#0A2647]/60">Connecting to Google Maps Geolocation Services</p>
          </div>
        )}
      </div>

      {/* Facility Information Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {facilities.map((k) => (
          <div
            key={k.id}
            onClick={() => setSelectedFacility(k)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedFacility?.id === k.id
                ? 'bg-white border-[#0A2647] shadow-md ring-2 ring-[#0A2647]/10'
                : 'bg-white border-[#0A2647]/10 hover:border-[#0A2647]/30'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-[#0A2647] truncate">{k.name}</p>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  k.status === 'safe'
                    ? 'bg-emerald-100 text-emerald-800'
                    : k.status === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {k.status}
              </span>
            </div>
            <p className="text-[11px] text-[#0A2647]/50 mt-0.5 truncate">{k.location}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#0A2647]/5 text-[11px]">
              <span className="text-[#0A2647]/60">Score: {k.compliance || 85}%</span>
              {k.ownerEmail && (
                <span className="text-[10px] font-mono text-emerald-700 truncate max-w-[120px]">
                  {k.ownerEmail}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
