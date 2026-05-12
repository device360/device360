import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  MapPin,
  Navigation,
  Loader2,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Check,
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

type LatLng = {
  lat: number;
  lng: number;
};

const WORLD_SIZE = 256 * Math.pow(2, 16);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const latLngToWorld = (lat: number, lng: number) => {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const x = ((lng + 180) / 360) * WORLD_SIZE;
  const y =
    (0.5 -
      Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) *
    WORLD_SIZE;

  return { x, y };
};

const worldToLatLng = (x: number, y: number): LatLng => {
  const lng = (x / WORLD_SIZE) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / WORLD_SIZE;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
};

const getTile = (lat: number, lng: number, zoom: number) => {
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y, z: zoom };
};

const reverseGeocode = async (latitude: number, longitude: number): Promise<GeoAddress> => {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18` +
    `&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Reverse geocoding failed');
  }

  const data = await response.json();
  const addr = data?.address || {};

  const doorNumber =
    cleanText(addr.house_number) ||
    cleanText(addr.unit) ||
    cleanText(addr.building) ||
    '';

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

  return {
    doorNumber,
    street: fallbackStreet,
    floor: '',
    landmark,
    city,
    pincode,
  };
};

const MapPickerModal = ({
  open,
  center,
  zoom,
  loading,
  onClose,
  onPick,
  onZoomIn,
  onZoomOut,
  onRecenter,
  onConfirm,
}: {
  open: boolean;
  center: LatLng;
  zoom: number;
  loading: boolean;
  onClose: () => void;
  onPick: (coords: LatLng) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onConfirm: () => void;
}) => {
  if (!open) return null;

  const size = 320;
  const tileSize = 256;
  const tilesPerSide = 3;
  const centerPx = size / 2;

  const world = latLngToWorld(center.lat, center.lng);
  const tileX = Math.floor(world.x / tileSize);
  const tileY = Math.floor(world.y / tileSize);
  const offsetX = world.x - tileX * tileSize;
  const offsetY = world.y - tileY * tileSize;

  const tiles = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      tiles.push({
        x: tileX + dx,
        y: tileY + dy,
        left: centerPx - offsetX + dx * tileSize,
        top: centerPx - offsetY + dy * tileSize,
      });
    }
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerWorld = latLngToWorld(center.lat, center.lng);
    const clickedWorldX = centerWorld.x + (x - rect.width / 2);
    const clickedWorldY = centerWorld.y + (y - rect.height / 2);
    const next = worldToLatLng(clickedWorldX, clickedWorldY);

    onPick({
      lat: clamp(next.lat, -85, 85),
      lng: clamp(next.lng, -180, 180),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-t-[28px] border border-gray-200 bg-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-600">
              Select on map
            </p>
            <h3 className="mt-1 text-lg font-black text-gray-950">Move the pin and confirm</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
          >
            Close
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Tap anywhere on the map to center the pin. Then press confirm.
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="relative mx-auto overflow-hidden rounded-[24px] border border-gray-200 bg-slate-100">
            <div
              role="button"
              tabIndex={0}
              onClick={handleMapClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleMapClick(e as any);
              }}
              className="relative h-[320px] w-full cursor-pointer select-none overflow-hidden"
            >
              {tiles.map((tile) => {
                const key = `${tile.x}-${tile.y}-${zoom}`;
                const url = `https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`;
                return (
                  <img
                    key={key}
                    src={url}
                    alt=""
                    draggable={false}
                    className="absolute h-[256px] w-[256px] select-none"
                    style={{
                      left: `${tile.left}px`,
                      top: `${tile.top}px`,
                    }}
                  />
                );
              })}

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.0),rgba(255,255,255,0.15))]" />

              <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
                <div className="relative flex flex-col items-center">
                  <div className="mb-1 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-700 shadow">
                    Selected location
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-[0_0_0_8px_rgba(37,99,235,0.14)]">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div className="mt-1 h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_0_10px_rgba(37,99,235,0.15)]" />
                </div>
              </div>
            </div>

            <div className="absolute left-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={onZoomIn}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onZoomOut}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onRecenter}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm"
              >
                <LocateFixed className="h-4 w-4" />
                My location
              </button>

              <div className="rounded-2xl border border-white/60 bg-white/90 px-3 py-2 text-right text-[11px] font-medium text-gray-600 shadow-sm">
                Click map to move pin
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Use the pin position to confirm your exact area. The address fields will fill after confirmation.
          </div>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {loading ? 'Detecting address…' : 'Use this location'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddressStep: React.FC<AddressStepProps> = ({ address, onSubmit, goBack }) => {
  const [fields, setFields] = useState<AddressFields>(() => toAddressFields(address));
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLng>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [mapZoom, setMapZoom] = useState(16);

  const update = (key: keyof AddressFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

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

  const handleAutoDetect = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError('');
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ lat: latitude, lng: longitude });
        setShowMapPicker(true);
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
      setShowMapPicker(false);
    } catch {
      setError('Could not detect your exact location. Please choose another point or fill it manually.');
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
    <>
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

        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={locating}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          {locating ? 'Detecting location…' : 'Auto-detect my location'}
        </button>

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

      <MapPickerModal
        open={showMapPicker}
        center={mapCenter}
        zoom={mapZoom}
        loading={mapLoading}
        onClose={() => setShowMapPicker(false)}
        onPick={setMapCenter}
        onZoomIn={() => setMapZoom((z) => Math.min(z + 1, 18))}
        onZoomOut={() => setMapZoom((z) => Math.max(z - 1, 14))}
        onRecenter={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setMapCenter({ lat: latitude, lng: longitude });
            },
            () => {
              setError('Location access denied. Please allow it to recenter the map.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
          );
        }}
        onConfirm={confirmMapLocation}
      />
    </>
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