import { useMemo, useState, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  MapPin,
  Navigation,
  Loader2,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Check,
  X,
} from 'lucide-react';
import type { AddressFields } from '../../types';

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

const cleanText = (value?: string | null) =>
  (value || '')
    .replace(/\s+/g, ' ')
    .replace(/^[,\s-]+|[,\s-]+$/g, '')
    .trim();

type GeoAddress = {
  doorNumber: string;
  street: string;
  floor: string;
  landmark: string;
  city: string;
  pincode: string;
};

type LatLng = { lat: number; lng: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// ── Tile / projection helpers ─────────────────────────────────────────────
const TILE_SIZE = 256;

function latLngToPixel(lat: number, lng: number, zoom: number) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function pixelToLatLng(px: number, py: number, zoom: number): LatLng {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const lng = (px / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * py) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
}

const reverseGeocode = async (latitude: number, longitude: number): Promise<GeoAddress> => {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18` +
    `&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', 'Accept-Language': 'en' },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Reverse geocoding failed');

  const data = await response.json();
  const addr = data?.address || {};

  const doorNumber =
    cleanText(addr.house_number) || cleanText(addr.unit) || cleanText(addr.building) || '';

  const street =
    cleanText(addr.road) ||
    cleanText(addr.pedestrian) ||
    cleanText(addr.neighbourhood) ||
    cleanText(addr.suburb) ||
    cleanText(addr.city_district) ||
    cleanText(addr.residential) ||
    '';

  const landmark =
    cleanText(addr.neighbourhood) ||
    cleanText(addr.suburb) ||
    cleanText(addr.city_district) ||
    cleanText(addr.quarter) ||
    cleanText(addr.estate) ||
    cleanText(addr.amenity) ||
    '';

  const city =
    cleanText(addr.city) ||
    cleanText(addr.town) ||
    cleanText(addr.village) ||
    cleanText(addr.municipality) ||
    cleanText(addr.city_district) ||
    cleanText(addr.county) ||
    cleanText(addr.state_district) ||
    cleanText(addr.state) ||
    '';

  const pincode = cleanText(addr.postcode) || '';
  const displayName = cleanText(data?.display_name);
  const fallbackStreet = street || displayName.split(',').slice(0, 2).join(', ');

  return { doorNumber, street: fallbackStreet, floor: '', landmark, city, pincode };
};

// ── Inline draggable map ──────────────────────────────────────────────────
const MAP_H = 280;

const InlineMapPicker = ({
  center,
  zoom,
  loading,
  onPick,
  onZoomIn,
  onZoomOut,
  onRecenter,
  onConfirm,
  onClose,
}: {
  center: LatLng;
  zoom: number;
  loading: boolean;
  onPick: (coords: LatLng) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startLat: number;
    startLng: number;
    dragging: boolean;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLat: center.lat,
        startLng: center.lng,
        dragging: false,
      };
    },
    [center],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      if (!dragRef.current.dragging && Math.hypot(dx, dy) > 4) {
        dragRef.current.dragging = true;
      }
      if (!dragRef.current.dragging) return;

      const origin = latLngToPixel(dragRef.current.startLat, dragRef.current.startLng, zoom);
      const next = pixelToLatLng(origin.x - dx, origin.y - dy, zoom);
      onPick({ lat: clamp(next.lat, -85, 85), lng: clamp(next.lng, -180, 180) });
    },
    [zoom, onPick],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const wasDragging = dragRef.current.dragging;
      dragRef.current = null;

      // Tap (not drag) → move pin to tapped spot
      if (!wasDragging) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const c = latLngToPixel(center.lat, center.lng, zoom);
        const next = pixelToLatLng(c.x + (x - rect.width / 2), c.y + (y - rect.height / 2), zoom);
        onPick({ lat: clamp(next.lat, -85, 85), lng: clamp(next.lng, -180, 180) });
      }
    },
    [center, zoom, onPick],
  );

  // Build visible tiles
  const c = latLngToPixel(center.lat, center.lng, zoom);
  const tileX0 = Math.floor(c.x / TILE_SIZE);
  const tileY0 = Math.floor(c.y / TILE_SIZE);
  const tiles = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const tx = tileX0 + dx;
      const ty = tileY0 + dy;
      tiles.push({
        tx,
        ty,
        left: Math.round(c.x % 1 === 0 ? 0 : 0) + (tx - tileX0) * TILE_SIZE - (c.x - tileX0 * TILE_SIZE) + 50 + '%',
        // use pixel offsets relative to map center instead:
        offsetLeft: (tx * TILE_SIZE - c.x) + '??', // recalc below
        key: `${tx}-${ty}-${zoom}`,
      });
    }
  }

  // Simpler tile positioning: offset from center
  const tilesClean = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const tx = tileX0 + dx;
      const ty = tileY0 + dy;
      // pixel position of tile origin relative to map center
      const left = tx * TILE_SIZE - c.x + (containerRef.current?.offsetWidth ?? 360) / 2;
      const top = ty * TILE_SIZE - c.y + MAP_H / 2;
      tilesClean.push({ tx, ty, left, top, key: `${tx}-${ty}-${zoom}` });
    }
  }

  // We need container width for tile positioning; use CSS calc trick instead
  // Use a wrapper with overflow:hidden and absolute children
  const mapW = containerRef.current?.offsetWidth ?? 360;
  const tilesForRender = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const tx = tileX0 + dx;
      const ty = tileY0 + dy;
      const left = tx * TILE_SIZE - c.x + mapW / 2;
      const top = ty * TILE_SIZE - c.y + MAP_H / 2;
      tilesForRender.push({ tx, ty, left, top, key: `${tx}-${ty}-${zoom}` });
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">
            Select on map
          </p>
          <p className="mt-0.5 text-xs text-gray-500">Drag to pan · tap to place pin</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Map canvas */}
      <div
        ref={containerRef}
        className="relative select-none overflow-hidden bg-slate-100"
        style={{ height: `${MAP_H}px`, cursor: 'grab', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        {/* OSM tiles */}
        {tilesForRender.map(({ tx, ty, left, top, key }) => (
          <img
            key={key}
            src={`https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`}
            alt=""
            draggable={false}
            className="absolute h-[256px] w-[256px] pointer-events-none"
            style={{ left: `${left}px`, top: `${top}px` }}
          />
        ))}

        {/* Fixed center pin */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
          <div className="flex flex-col items-center">
            <div className="mb-1 rounded-full bg-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-700 shadow">
              Your pin
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 shadow-[0_0_0_7px_rgba(37,99,235,0.18)]">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-600 opacity-80" />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute left-2 top-2 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onZoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* My location button */}
        <div className="absolute bottom-2 left-2 z-20">
          <button
            type="button"
            onClick={onRecenter}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm hover:bg-white"
          >
            <LocateFixed className="h-3.5 w-3.5 text-blue-600" />
            My location
          </button>
        </div>

        {/* Coords badge */}
        <div className="absolute bottom-2 right-2 z-20 rounded-xl bg-white/90 px-2.5 py-1 text-[10px] font-medium text-gray-600 shadow-sm">
          {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
        </div>
      </div>

      {/* Confirm footer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <p className="mb-2.5 text-xs text-gray-500">
          Pan the map so the pin sits on your exact pickup spot, then confirm.
        </p>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {loading ? 'Detecting address…' : 'Use this location'}
        </button>
      </div>
    </div>
  );
};

export const AddressStep: React.FC<AddressStepProps> = ({ address, onSubmit, goBack }) => {
  const [fields, setFields] = useState<AddressFields>(() => toAddressFields(address));
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLng>({ lat: 12.9716, lng: 77.5946 });
  const [mapZoom, setMapZoom] = useState(16);

  const update = (key: keyof AddressFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const canSubmit = useMemo(
    () =>
      Boolean(
        fields.doorNumber.trim() &&
          fields.street.trim() &&
          fields.city.trim() &&
          fields.pincode.trim(),
      ),
    [fields],
  );

  const fillAddressFromCoords = async (latitude: number, longitude: number) => {
    const detected = await reverseGeocode(latitude, longitude);
    setFields((prev) => ({
      ...prev,
      doorNumber: prev.doorNumber || detected.doorNumber,
      street: detected.street || prev.street,
      floor: prev.floor,
      landmark: detected.landmark || prev.landmark,
      city: detected.city || prev.city,
      pincode: detected.pincode || prev.pincode,
    }));
    if (!detected.street && !detected.city && !detected.pincode) {
      setError('We found your area, but not a full address. Please fill the rest manually.');
    }
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setError('');
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMapCenter({ lat: coords.latitude, lng: coords.longitude });
        setShowMap(true);
        setLocating(false);
      },
      () => {
        setError('Location access denied. Please enter your address manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const confirmMapLocation = async () => {
    setMapLoading(true);
    setError('');
    try {
      await fillAddressFromCoords(mapCenter.lat, mapCenter.lng);
      setShowMap(false);
    } catch {
      setError(
        'Could not detect your exact location. Please choose another point or fill manually.',
      );
    } finally {
      setMapLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(fields);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
          <MapPin className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-950">Pickup Address</h3>
        <p className="mt-1 text-sm text-gray-500">We will send a porter to collect your device</p>
      </div>

      {/* Auto-detect button */}
      <button
        type="button"
        onClick={handleAutoDetect}
        disabled={locating}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
        {locating ? 'Detecting location…' : 'Auto-detect my location'}
      </button>

      {/* Inline map — shown right below the button after location is detected */}
      {showMap && (
        <InlineMapPicker
          center={mapCenter}
          zoom={mapZoom}
          loading={mapLoading}
          onPick={setMapCenter}
          onZoomIn={() => setMapZoom((z) => Math.min(z + 1, 19))}
          onZoomOut={() => setMapZoom((z) => Math.max(z - 1, 10))}
          onRecenter={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
              ({ coords }) =>
                setMapCenter({ lat: coords.latitude, lng: coords.longitude }),
              () => setError('Location access denied. Please allow it to recenter.'),
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
            );
          }}
          onConfirm={confirmMapLocation}
          onClose={() => setShowMap(false)}
        />
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Door / Flat No."
          value={fields.doorNumber}
          onChange={(v) => update('doorNumber', v)}
          placeholder="e.g. 12B"
        />
        <Field
          label="Street / Area"
          value={fields.street}
          onChange={(v) => update('street', v)}
          placeholder="e.g. 4th Cross, Indiranagar"
        />
        <Field
          label="Floor"
          value={fields.floor}
          onChange={(v) => update('floor', v)}
          placeholder="e.g. 2nd Floor"
        />
        <Field
          label="Landmark"
          value={fields.landmark}
          onChange={(v) => update('landmark', v)}
          placeholder="Near metro station"
        />
        <Field
          label="City"
          value={fields.city}
          onChange={(v) => update('city', v)}
          placeholder="Bengaluru"
        />
        <Field
          label="Pincode"
          value={fields.pincode}
          onChange={(v) => update('pincode', v)}
          placeholder="560038"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          Continue →
        </button>
      </div>
    </form>
  );
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <label className="space-y-2">
    <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
    />
  </label>
);