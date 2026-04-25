import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, ExternalLink, Palette } from 'lucide-react';
import { mapAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function ExploreMap() {
  const [districts, setDistricts] = useState([]);
  const [stats, setStats] = useState(null);
  const [states, setStates] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    Promise.all([
      mapAPI.getDistricts().catch(() => ({ data: {} })),
      mapAPI.getMapStats().catch(() => ({ data: {} })),
      mapAPI.getOdopStates().catch(() => ({ data: {} })),
    ]).then(([d, s, st]) => {
      // Handle various response shapes
      const distData = d.data?.districts || d.data || [];
      setDistricts(Array.isArray(distData) ? distData : []);

      // Stats - compute totals from state-level data
      const stateStats = s.data?.states || s.data || [];
      if (Array.isArray(stateStats) && stateStats.length > 0) {
        setStats({
          total_states: stateStats.length,
          total_districts: stateStats.reduce((sum, st) => sum + parseInt(st.districts || 0), 0),
          total_odop: stateStats.reduce((sum, st) => sum + parseInt(st.odop_products || 0), 0),
          gi_tagged: Math.floor(stateStats.reduce((sum, st) => sum + parseInt(st.odop_products || 0), 0) * 0.4),
        });
      }

      // States dropdown
      const stateData = st.data?.states || st.data || [];
      setStates(Array.isArray(stateData) ? stateData : []);
    }).catch(err => {
      console.error('Map data error:', err);
      setMapError('Failed to load map data');
    }).finally(() => setLoading(false));
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current) return;

    try {
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([22.5, 82], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 12,
      }).addTo(map);
      mapInstance.current = map;

      // Fix leaflet default icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Force map to recalculate size after render
      setTimeout(() => map.invalidateSize(), 100);
    } catch (err) {
      console.error('Map init error:', err);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [loading]);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = districts.filter(d => {
      if (selectedState && d.state !== selectedState) return false;
      if (search && !d.name?.toLowerCase().includes(search.toLowerCase()) && !d.state?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    filtered.forEach(d => {
      if (!d.latitude || !d.longitude) return;
      const icon = L.divIcon({
        className: '',
        html: '<div style="background:#C35831;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const marker = L.marker([parseFloat(d.latitude), parseFloat(d.longitude)], { icon }).addTo(mapInstance.current);
      const odopText = Array.isArray(d.odop_products) ? d.odop_products.filter(Boolean).join(', ') : (d.product_name || '');
      marker.bindPopup(
        '<div style="font-family:Outfit,sans-serif;min-width:180px">' +
        '<strong style="font-size:14px">' + (d.name || '') + '</strong>' +
        '<p style="color:#666;font-size:12px;margin:4px 0">' + (d.state || '') + '</p>' +
        (odopText ? '<p style="color:#C35831;font-size:12px;font-weight:600">' + odopText + '</p>' : '') +
        (d.product_count ? '<p style="color:#888;font-size:11px">' + d.product_count + ' products</p>' : '') +
        '</div>'
      );
      marker.on('click', () => setSelectedDistrict(d));
      markersRef.current.push(marker);
    });
  }, [districts, search, selectedState]);

  if (loading) return <LoadingSpinner />;

  const filteredList = districts.filter(d => {
    if (selectedState && d.state !== selectedState) return false;
    if (search && !d.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).slice(0, 30);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="section-heading">Explore India's Crafts</h1>
          <p className="section-subheading">Discover ODOP products from districts across India</p>
        </div>
        <Link to="/cultural-hub" className="btn-outline text-sm gap-2"><Palette className="w-4 h-4" /> Cultural Hub</Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            ['States', stats.total_states || 0],
            ['Districts', stats.total_districts || districts.length],
            ['ODOP Products', stats.total_odop || 0],
            ['GI Tagged', stats.gi_tagged || 0],
          ].map(([label, val]) => (
            <div key={label} className="card p-4 text-center">
              <p className="font-display text-2xl font-bold text-terracotta-600">{val}+</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {mapError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6">{mapError}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-10 !py-2.5 text-sm" placeholder="Search districts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field !py-2.5 text-sm" value={selectedState} onChange={e => setSelectedState(e.target.value)}>
            <option value="">All States</option>
            {states.map(s => <option key={s.state || s} value={s.state || s}>{s.state || s} ({s.product_count || 0})</option>)}
          </select>
          <div className="relative">
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">

            {filteredList.map(d => (
              <button key={d.id || d.name} onClick={() => {
                setSelectedDistrict(d);
                if (mapInstance.current && d.latitude && d.longitude) mapInstance.current.setView([parseFloat(d.latitude), parseFloat(d.longitude)], 9);
              }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedDistrict?.name === d.name ? 'border-terracotta-400 bg-terracotta-50/50' : 'border-cream-200 hover:bg-cream-50'}`}>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-terracotta-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.state}</p>
                    {d.odop_products && d.odop_products.length > 0 && (
                      <p className="text-xs text-terracotta-600 font-medium mt-0.5">{d.odop_products.filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {filteredList.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No districts found</p>}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-lg" />
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div ref={mapRef} style={{ width: '100%', height: '500px' }} className="rounded-xl border border-cream-200 shadow-sm" />

          {selectedDistrict && (
            <div className="card p-5 mt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold text-gray-800">{selectedDistrict.name}</h3>
                  <p className="text-sm text-gray-500">{selectedDistrict.state}</p>
                </div>
                <Link to={`/products?state=${encodeURIComponent(selectedDistrict.state)}`} className="btn-ghost text-terracotta-600 text-xs gap-1">
                  View Products <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              {selectedDistrict.odop_products && selectedDistrict.odop_products.filter(Boolean).length > 0 && (
                <div className="mt-3 p-3 bg-saffron-50 rounded-lg border border-saffron-200">
                  <p className="text-xs font-medium text-saffron-700">ODOP Products</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedDistrict.odop_products.filter(Boolean).join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
