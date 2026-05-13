import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  MapPin,
  Navigation,
  Loader2,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Home,
  Building2,
  Milestone,
} from 'lucide-react';
import type { AddressFields } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressStepProps {
  address?: Partial<AddressFields> | string;
  onSubmit: (address: AddressFields) => void;
  goBack: () => void;
}

const emptyAddress: AddressFields = {
  doorNumber: '',
  street: '',
  floor: '',
  landmark: '',
  city: '',
  pincode: '',
};

const toAddressFields = (value?: Partial<AddressFields> | string): AddressFields => {
  if (!value || typeof value === 'string') return emptyAddress;
  return {
    doorNumber: value.doorNumber || '',
    street: value.street || '',
    floor: value.floor || '',
    landmark: value.landmark || '',
    city: value.city || '',
    pincode: value.pincode || '',
  };
};

type LatLng = { lat: number; lng: number };

// ─── Google Maps loader ────────────────────────────────────────────────────

// IMPORTANT: Replace this with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

let mapsLoaded = false;
let mapsLoading = false;
const mapsCallbacks: Array<() => void> = [];

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (mapsLoaded) { resolve(); return; }
    if (mapsLoading) { mapsCallbacks.push(resolve); return; }
    mapsLoading = true;
    mapsCallbacks.push(resolve);

    (window as any).initGoogleMaps = () => {
      mapsLoaded = true;
      mapsCallbacks.forEach((cb) => cb());
      mapsCallbacks.length = 0;
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

// ─── Reverse geocode using Google ─────────────────────────────────────────

async function reverseGeocodeGoogle(lat: number, lng: number): Promise<AddressFields> {
  return new Promise((resolve) => {
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status !== 'OK' || !results || results.length === 0) {
        resolve(emptyAddress);
        return;
      }

      const result = results[0];
      const components = result.address_components as any[];

      const get = (...types: string[]) =>
        components.find((c: any) => types.some((t) => c.types.includes(t)))?.long_name || '';
      const getShort = (...types: string[]) =>
        components.find((c: any) => types.some((t) => c.types.includes(t)))?.short_name || '';

      const doorNumber = get('street_number', 'premise', 'subpremise');
      const street =
        get('route') ||
        get('neighborhood') ||
        get('sublocality_level_1') ||
        get('sublocality');
      const landmark = get('neighborhood', 'sublocality_level_2', 'sublocality_level_1') || get('premise');
      const city = get('locality', 'administrative_area_level_2');
      const pincode = get('postal_code');

      resolve({ doorNumber, street, floor: '', landmark, city, pincode });
    });
  });
}

// ─── MapPicker (full-screen Google Map, Zomato/Uber style) ────────────────

declare global {
  interface Window {
    google: any;
  }
}

const MapPicker = ({
  initialCenter,
  onConfirm,
  onClose,
}: {
  initialCenter: LatLng;
  onConfirm: (coords: LatLng, address: AddressFields) => void;
  onClose: () => void;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const [center, setCenter] = useState<LatLng>(initialCenter);
  const [address, setAddress] = useState<AddressFields>(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [mapsReady, setMapsReady] = useState(mapsLoaded);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load Google Maps
  useEffect(() => {
    if (mapsLoaded) { setMapsReady(true); return; }
    loadGoogleMaps(GOOGLE_MAPS_API_KEY).then(() => setMapsReady(true));
  }, []);

  // Init map
  useEffect(() => {
    if (!mapsReady || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: 17,
      disableDefaultUI: true,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8ff' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5f5e5' }] },
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
      ],
    });

    mapInstanceRef.current = map;

    // Listen for map drag end — update center
    map.addListener('dragend', async () => {
      const c = map.getCenter();
      const newCenter = { lat: c.lat(), lng: c.lng() };
      setCenter(newCenter);
      setLoading(true);
      const detected = await reverseGeocodeGoogle(newCenter.lat, newCenter.lng);
      setAddress(detected);
      setLoading(false);
    });

    // Also on idle after zoom
    map.addListener('idle', async () => {
      const c = map.getCenter();
      const newCenter = { lat: c.lat(), lng: c.lng() };
      setCenter(newCenter);
    });

    // Initial reverse geocode
    (async () => {
      setLoading(true);
      const detected = await reverseGeocodeGoogle(initialCenter.lat, initialCenter.lng);
      setAddress(detected);
      setLoading(false);
    })();
  }, [mapsReady, initialCenter]);

  // Places Autocomplete
  useEffect(() => {
    if (!mapsReady || !searchInputRef.current || autocompleteRef.current) return;
    const ac = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ['geometry', 'address_components', 'formatted_address'],
    });
    autocompleteRef.current = ac;

    ac.addListener('place_changed', async () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const newCenter = { lat, lng };

      mapInstanceRef.current?.panTo(newCenter);
      mapInstanceRef.current?.setZoom(17);
      setCenter(newCenter);

      setLoading(true);
      const detected = await reverseGeocodeGoogle(lat, lng);
      setAddress(detected);
      setLoading(false);
      setSearchQuery(place.formatted_address || '');
    });
  }, [mapsReady]);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const newCenter = { lat: coords.latitude, lng: coords.longitude };
        mapInstanceRef.current?.panTo(newCenter);
        mapInstanceRef.current?.setZoom(17);
        setCenter(newCenter);
        setLoading(true);
        const detected = await reverseGeocodeGoogle(newCenter.lat, newCenter.lng);
        setAddress(detected);
        setLoading(false);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(center, address);
  }, [center, address, onConfirm]);

  const displayStreet = address.street
    ? `${address.doorNumber ? address.doorNumber + ', ' : ''}${address.street}`
    : loading
    ? 'Detecting location…'
    : 'Move the map to select location';

  const displayCity = address.city
    ? `${address.city}${address.pincode ? ' - ' + address.pincode : ''}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* ── Top search bar (Zomato style) ── */}
      <div
        className="absolute top-0 left-0 right-0 z-30"
        style={{ padding: 'clamp(10px, 3vw, 16px)', paddingBottom: 0 }}
      >
        <div
          className="flex items-center gap-3 bg-white shadow-lg"
          style={{
            borderRadius: 'clamp(14px, 3.5vw, 20px)',
            padding: 'clamp(8px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft style={{ width: 'clamp(18px, 5vw, 22px)', height: 'clamp(18px, 5vw, 22px)' }} />
          </button>
          <Search
            className="shrink-0 text-gray-400"
            style={{ width: 'clamp(14px, 3.5vw, 18px)', height: 'clamp(14px, 3.5vw, 18px)' }}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for area, street name…"
            className="flex-1 outline-none text-gray-900 placeholder:text-gray-400 bg-transparent"
            style={{ fontSize: 'clamp(13px, 3.5vw, 15px)' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="shrink-0 text-gray-400"
            >
              <X style={{ width: 'clamp(14px, 3.5vw, 16px)', height: 'clamp(14px, 3.5vw, 16px)' }} />
            </button>
          )}
        </div>
      </div>

      {/* ── Google Map fills entire screen ── */}
      <div className="flex-1 relative">
        {!mapsReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" style={{ width: 32, height: 32 }} />
              <p className="text-sm text-gray-500 font-medium">Loading map…</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="absolute inset-0" />

        {/* ── Center pin (fixed, Uber style) ── */}
        <div
          className="absolute left-1/2 z-20 pointer-events-none"
          style={{
            top: '50%',
            transform: 'translate(-50%, -100%)',
            marginTop: '-12px', // compensate for bottom sheet push
          }}
        >
          <div className="flex flex-col items-center">
            {/* Animated address bubble */}
            <div
              className="mb-2 bg-white shadow-lg text-gray-800 font-semibold text-center max-w-[200px]"
              style={{
                padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 14px)',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                fontSize: 'clamp(10px, 2.5vw, 12px)',
                lineHeight: 1.3,
              }}
            >
              {loading ? (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} />
                  Locating…
                </span>
              ) : (
                <span className="line-clamp-2">{displayStreet || 'Move map to pick location'}</span>
              )}
              {/* Bubble triangle */}
              <div
                className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0"
                style={{
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '7px solid white',
                }}
              />
            </div>

            {/* Pin icon */}
            <div
              className="flex items-center justify-center bg-blue-600 shadow-[0_0_0_8px_rgba(37,99,235,0.18)]"
              style={{
                width: 'clamp(40px, 11vw, 52px)',
                height: 'clamp(40px, 11vw, 52px)',
                borderRadius: '50% 50% 50% 8px',
                transform: 'rotate(45deg)',
              }}
            >
              <MapPin
                className="text-white"
                style={{
                  width: 'clamp(20px, 5.5vw, 26px)',
                  height: 'clamp(20px, 5.5vw, 26px)',
                  transform: 'rotate(-45deg)',
                }}
              />
            </div>
            {/* Pin shadow */}
            <div
              className="mt-1 bg-blue-900/20 rounded-full"
              style={{
                width: 'clamp(16px, 4.5vw, 20px)',
                height: 'clamp(4px, 1vw, 6px)',
                filter: 'blur(2px)',
              }}
            />
          </div>
        </div>

        {/* ── My Location button (Uber style, bottom-right) ── */}
        <button
          type="button"
          onClick={handleMyLocation}
          className="absolute right-4 bg-white shadow-lg text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center z-20"
          style={{
            bottom: 'clamp(260px, 38vw, 310px)',
            width: 'clamp(40px, 11vw, 48px)',
            height: 'clamp(40px, 11vw, 48px)',
            borderRadius: 'clamp(10px, 2.5vw, 14px)',
          }}
        >
          {geoLoading ? (
            <Loader2
              className="animate-spin text-blue-600"
              style={{ width: 'clamp(16px, 4vw, 20px)', height: 'clamp(16px, 4vw, 20px)' }}
            />
          ) : (
            <Navigation
              style={{ width: 'clamp(16px, 4vw, 20px)', height: 'clamp(16px, 4vw, 20px)' }}
            />
          )}
        </button>
      </div>

      {/* ── Bottom Sheet (Zomato / Uber style) ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 bg-white"
        style={{
          borderRadius: 'clamp(20px, 5vw, 28px) clamp(20px, 5vw, 28px) 0 0',
          boxShadow: '0 -8px 40px rgba(15,23,42,0.12)',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
          maxHeight: sheetExpanded ? '70vh' : 'clamp(200px, 36vw, 260px)',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <button
            type="button"
            onClick={() => setSheetExpanded((v) => !v)}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-10 h-1 rounded-full bg-gray-200" />
            {sheetExpanded ? (
              <ChevronDown className="text-gray-400" style={{ width: 14, height: 14 }} />
            ) : (
              <ChevronUp className="text-gray-400" style={{ width: 14, height: 14 }} />
            )}
          </button>
        </div>

        <div style={{ padding: '0 clamp(14px, 4vw, 20px) clamp(16px, 4vw, 24px)', overflowY: 'auto', maxHeight: 'calc(70vh - 48px)' }}>
          {/* Location preview row */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="shrink-0 bg-blue-50 flex items-center justify-center"
              style={{
                width: 'clamp(38px, 10vw, 46px)',
                height: 'clamp(38px, 10vw, 46px)',
                borderRadius: 'clamp(10px, 2.5vw, 14px)',
              }}
            >
              <MapPin className="text-blue-600" style={{ width: 'clamp(16px, 4.5vw, 20px)', height: 'clamp(16px, 4.5vw, 20px)' }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className="font-black text-gray-950 truncate"
                  style={{ fontSize: 'clamp(13px, 3.5vw, 16px)' }}
                >
                  {loading ? 'Detecting…' : (address.street || 'Move map to pick location')}
                </p>
                {loading && <Loader2 className="shrink-0 animate-spin text-blue-500" style={{ width: 14, height: 14 }} />}
              </div>
              {displayCity && (
                <p
                  className="text-gray-500 truncate mt-0.5"
                  style={{ fontSize: 'clamp(11px, 2.8vw, 13px)' }}
                >
                  {displayCity}
                </p>
              )}
            </div>
          </div>

          {/* Expanded: quick address type tags */}
          {sheetExpanded && (
            <div className="flex gap-2 flex-wrap mb-4">
              {[
                { icon: Home, label: 'Home' },
                { icon: Building2, label: 'Work' },
                { icon: Milestone, label: 'Other' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  className="inline-flex items-center gap-1.5 border border-gray-200 bg-gray-50 text-gray-700 font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                  style={{
                    padding: 'clamp(5px, 1.2vw, 8px) clamp(10px, 2.5vw, 14px)',
                    borderRadius: 'clamp(8px, 2vw, 12px)',
                    fontSize: 'clamp(11px, 2.8vw, 13px)',
                  }}
                >
                  <Icon style={{ width: 'clamp(12px, 3vw, 15px)', height: 'clamp(12px, 3vw, 15px)' }} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Confirm CTA */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || (!address.street && !address.city)}
            className="w-full flex items-center justify-center gap-2 font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              borderRadius: 'clamp(14px, 3.5vw, 20px)',
              padding: 'clamp(13px, 3.5vw, 16px)',
              fontSize: 'clamp(13px, 3.5vw, 15px)',
              boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
            }}
          >
            <Check style={{ width: 'clamp(16px, 4vw, 18px)', height: 'clamp(16px, 4vw, 18px)' }} />
            Confirm Pickup Location
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Field component ─────────────────────────────────────────────────────────

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <label className="block space-y-1.5">
    <span
      className="block font-bold uppercase tracking-wide text-gray-500"
      style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}
    >
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 bg-gray-50 outline-none transition-all placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
      style={{
        borderRadius: 'clamp(10px, 2.5vw, 16px)',
        padding: 'clamp(10px, 2.5vw, 13px) clamp(12px, 3vw, 16px)',
        fontSize: 'clamp(12px, 3.2vw, 14px)',
      }}
    />
  </label>
);

// ─── Main AddressStep ─────────────────────────────────────────────────────────

export const AddressStep: React.FC<AddressStepProps> = ({ address, onSubmit, goBack }) => {
  const [fields, setFields] = useState<AddressFields>(() => toAddressFields(address));
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [locationSet, setLocationSet] = useState(false);
  const [initialCenter] = useState<LatLng>({ lat: 12.9716, lng: 77.5946 }); // Bengaluru default

  const update = (key: keyof AddressFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const canSubmit = useMemo(
    () => Boolean(fields.doorNumber.trim() && fields.street.trim() && fields.city.trim() && fields.pincode.trim()),
    [fields],
  );

  const handleOpenMap = () => {
    setError('');
    setShowMapPicker(true);
  };

  const handleMapConfirm = (coords: LatLng, detected: AddressFields) => {
    setFields((prev) => ({
      doorNumber: detected.doorNumber || prev.doorNumber,
      street: detected.street || prev.street,
      floor: prev.floor,
      landmark: detected.landmark || prev.landmark,
      city: detected.city || prev.city,
      pincode: detected.pincode || prev.pincode,
    }));
    setLocationSet(true);
    setShowMapPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(fields);
  };

  return (
    <>
      {/* ── Full-screen map picker overlay ── */}
      {showMapPicker && (
        <MapPicker
          initialCenter={initialCenter}
          onConfirm={handleMapConfirm}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      {/* ── Address form ── */}
      <form
        onSubmit={handleSubmit}
        className="border border-gray-200 bg-white shadow-sm"
        style={{
          borderRadius: 'clamp(16px, 4.5vw, 28px)',
          padding: 'clamp(16px, 4.5vw, 24px)',
        }}
      >
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 'clamp(14px, 4vw, 20px)' }}>
          <div
            className="mx-auto flex items-center justify-center border border-blue-100 bg-blue-50"
            style={{
              width: 'clamp(48px, 13vw, 64px)',
              height: 'clamp(48px, 13vw, 64px)',
              borderRadius: '50%',
              marginBottom: 'clamp(10px, 3vw, 16px)',
            }}
          >
            <MapPin className="text-blue-600" style={{ width: 'clamp(22px, 6vw, 30px)', height: 'clamp(22px, 6vw, 30px)' }} />
          </div>
          <h3 className="font-black text-gray-950" style={{ fontSize: 'clamp(17px, 4.5vw, 22px)' }}>
            Pickup Address
          </h3>
          <p className="text-gray-500" style={{ marginTop: 4, fontSize: 'clamp(11px, 2.8vw, 14px)' }}>
            We'll send a porter to collect your device
          </p>
        </div>

        {/* Map picker CTA — Zomato style */}
        <button
          type="button"
          onClick={handleOpenMap}
          className="w-full text-left border transition-all hover:shadow-md active:scale-[0.99]"
          style={{
            borderRadius: 'clamp(14px, 3.5vw, 20px)',
            border: locationSet ? '2px solid #3b82f6' : '2px dashed #d1d5db',
            background: locationSet
              ? 'linear-gradient(135deg,#eff6ff 0%,#eef2ff 100%)'
              : '#f9fafb',
            padding: 'clamp(12px, 3.5vw, 16px)',
            marginBottom: 'clamp(12px, 3vw, 16px)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 'clamp(38px, 10vw, 46px)',
                height: 'clamp(38px, 10vw, 46px)',
                borderRadius: 'clamp(10px, 2.5vw, 14px)',
                background: locationSet ? '#3b82f6' : '#e5e7eb',
              }}
            >
              <Navigation
                style={{
                  width: 'clamp(16px, 4.5vw, 20px)',
                  height: 'clamp(16px, 4.5vw, 20px)',
                  color: locationSet ? 'white' : '#6b7280',
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="font-black truncate"
                style={{
                  fontSize: 'clamp(12px, 3.2vw, 14px)',
                  color: locationSet ? '#1e40af' : '#374151',
                }}
              >
                {locationSet
                  ? fields.street
                    ? `${fields.doorNumber ? fields.doorNumber + ', ' : ''}${fields.street}`
                    : 'Location selected'
                  : 'Select location on map'}
              </p>
              <p
                style={{
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  color: locationSet ? '#3b82f6' : '#9ca3af',
                  marginTop: 2,
                }}
              >
                {locationSet
                  ? `${fields.city}${fields.pincode ? ' · ' + fields.pincode : ''} · Tap to change`
                  : 'Like Zomato / Uber — drag pin to your exact spot'}
              </p>
            </div>

            <div
              className="shrink-0 flex items-center justify-center border"
              style={{
                width: 'clamp(28px, 7vw, 34px)',
                height: 'clamp(28px, 7vw, 34px)',
                borderRadius: 'clamp(7px, 2vw, 10px)',
                borderColor: locationSet ? '#93c5fd' : '#e5e7eb',
                background: locationSet ? '#dbeafe' : 'white',
              }}
            >
              <MapPin
                style={{
                  width: 'clamp(13px, 3.2vw, 16px)',
                  height: 'clamp(13px, 3.2vw, 16px)',
                  color: locationSet ? '#3b82f6' : '#9ca3af',
                }}
              />
            </div>
          </div>
        </button>

        {error && (
          <div
            className="border border-red-100 bg-red-50 text-red-700"
            style={{
              borderRadius: 'clamp(10px, 2.5vw, 16px)',
              padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
              marginBottom: 'clamp(10px, 2.5vw, 14px)',
              fontSize: 'clamp(11px, 2.8vw, 13px)',
            }}
          >
            {error}
          </div>
        )}

        {/* Address fields */}
        <div
          className="grid grid-cols-2"
          style={{ gap: 'clamp(10px, 2.5vw, 16px)', marginBottom: 'clamp(14px, 3.5vw, 20px)' }}
        >
          <Field label="Door / Flat No." value={fields.doorNumber} onChange={(v) => update('doorNumber', v)} placeholder="e.g. 12B" required />
          <Field label="Street / Area" value={fields.street} onChange={(v) => update('street', v)} placeholder="4th Cross, Indiranagar" required />
          <Field label="Floor" value={fields.floor} onChange={(v) => update('floor', v)} placeholder="2nd Floor" />
          <Field label="Landmark" value={fields.landmark} onChange={(v) => update('landmark', v)} placeholder="Near metro station" />
          <Field label="City" value={fields.city} onChange={(v) => update('city', v)} placeholder="Bengaluru" required />
          <Field label="Pincode" value={fields.pincode} onChange={(v) => update('pincode', v)} placeholder="560038" required />
        </div>

        {/* Actions */}
        <div className="flex" style={{ gap: 'clamp(8px, 2vw, 12px)' }}>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center justify-center gap-1.5 border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            style={{
              borderRadius: 'clamp(12px, 3vw, 18px)',
              padding: 'clamp(11px, 3vw, 14px) clamp(14px, 4vw, 20px)',
              fontSize: 'clamp(12px, 3vw, 14px)',
            }}
          >
            <ChevronLeft style={{ width: 'clamp(14px, 3.5vw, 16px)', height: 'clamp(14px, 3.5vw, 16px)' }} />
            Back
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 font-bold text-white transition-all active:scale-[0.99]"
            style={{
              borderRadius: 'clamp(12px, 3vw, 18px)',
              padding: 'clamp(11px, 3vw, 14px)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              background: canSubmit
                ? 'linear-gradient(135deg,#2563eb 0%,#4f46e5 100%)'
                : '#e5e7eb',
              color: canSubmit ? 'white' : '#9ca3af',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
            }}
          >
            Continue →
          </button>
        </div>
      </form>
    </>
  );
};