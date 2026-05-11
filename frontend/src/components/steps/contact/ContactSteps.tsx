import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  User,
  MapPin,
  Navigation,
  Loader2,
  Truck,
  CheckCircle2,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface AddressFields {
  doorNumber: string;
  street: string;
  floor: string;
  landmark: string;
  city: string;
  pincode: string;
}

/* ─────────────────────────────────────────────────────────────
   NAME STEP
───────────────────────────────────────────────────────────── */
interface NameStepProps {
  name: string;
  onSubmit: (n: string) => void;
  goBack: () => void;
}

export const NameStep: React.FC<NameStepProps> = ({ name: init, onSubmit, goBack }) => {
  const [name, setName] = useState(init || '');
  const isValid = name.trim().length >= 2;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSubmit(name.trim());
      }}
      className="p-6 sm:p-8 space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1">What's your name?</h3>
        <p className="text-sm text-gray-400">For your booking confirmation</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Sharma"
          autoFocus
          className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-base font-semibold text-gray-900 bg-gray-50 focus:bg-white transition-all placeholder:font-normal placeholder:text-gray-400"
          required
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all ${
            isValid
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────────────────────
   ADDRESS STEP
───────────────────────────────────────────────────────────── */
interface AddressStepProps {
  address?: Partial<AddressFields>;
  onSubmit: (a: AddressFields) => void;
  goBack: () => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ address, onSubmit, goBack }) => {
  const [fields, setFields] = useState<AddressFields>({
    doorNumber: address?.doorNumber || '',
    street: address?.street || '',
    floor: address?.floor || '',
    landmark: address?.landmark || '',
    city: address?.city || '',
    pincode: address?.pincode || '',
  });
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState('');

  const set = (k: keyof AddressFields, v: string) =>
    setFields((f) => ({ ...f, [k]: v }));

  const canSubmit = useMemo(
    () =>
      fields.doorNumber.trim() &&
      fields.street.trim() &&
      fields.city.trim() &&
      fields.pincode.length >= 5,
    [fields],
  );

  const autoDetect = () => {
    if (!navigator.geolocation) {
      setLocErr('Geolocation not supported.');
      return;
    }

    setLocating(true);
    setLocErr('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          const a = data.address || {};

          setFields((f) => ({
            ...f,
            street: a.road || a.street || a.neighbourhood || f.street,
            city: a.city || a.town || a.village || a.suburb || f.city,
            pincode: a.postcode || f.pincode,
          }));
        } catch {
          setLocErr('Could not fetch address.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocErr('Location access denied. Enter manually.');
        setLocating(false);
      },
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(fields);
      }}
      className="p-6 sm:p-8 space-y-5"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1">Pickup Address</h3>
        <p className="text-sm text-gray-400">We'll send our technician to collect your device</p>
      </div>

      <button
        type="button"
        onClick={autoDetect}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all disabled:opacity-60"
      >
        {locating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Detecting location…
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4" /> Auto-detect my location
          </>
        )}
      </button>

      {locErr && <p className="text-xs text-red-500 text-center">{locErr}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="Door / Flat No. *"
          value={fields.doorNumber}
          onChange={(v) => set('doorNumber', v)}
          placeholder="e.g. 12B"
        />
        <Field
          label="Floor"
          value={fields.floor}
          onChange={(v) => set('floor', v)}
          placeholder="e.g. 2nd Floor"
        />
        <Field
          label="Street / Area *"
          value={fields.street}
          onChange={(v) => set('street', v)}
          placeholder="e.g. 4th Cross, Indiranagar"
          className="sm:col-span-2"
        />
        <Field
          label="Landmark"
          value={fields.landmark}
          onChange={(v) => set('landmark', v)}
          placeholder="Near metro / temple"
          className="sm:col-span-2"
        />
        <Field
          label="City *"
          value={fields.city}
          onChange={(v) => set('city', v)}
          placeholder="Bengaluru"
        />
        <Field
          label="Pincode *"
          value={fields.pincode}
          onChange={(v) => set('pincode', v.replace(/\D/g, '').slice(0, 6))}
          placeholder="560038"
          inputMode="numeric"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all ${
            canSubmit
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </form>
  );
};

/* Reusable field */
const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}> = ({ label, value, onChange, placeholder, className = '', inputMode }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">
      {label}
    </label>
    <input
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white transition-all placeholder:font-normal placeholder:text-gray-400"
    />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   DECLARATION STEP
───────────────────────────────────────────────────────────── */
interface DeclarationStepProps {
  goBack: () => void;
  onSubmit: () => void;
}

export const DeclarationStep: React.FC<DeclarationStepProps> = ({ goBack, onSubmit }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <style>{`
        .loader {
          width: fit-content;
          height: fit-content;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .truckWrapper {
          width: 200px;
          height: 100px;
          display: flex;
          flex-direction: column;
          position: relative;
          align-items: center;
          justify-content: flex-end;
          overflow-x: hidden;
        }

        .truckBody {
          width: 130px;
          height: fit-content;
          margin-bottom: 6px;
          animation: motion 1s linear infinite;
        }

        @keyframes motion {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(3px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .truckTires {
          width: 130px;
          height: fit-content;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0px 10px 0px 15px;
          position: absolute;
          bottom: 0;
        }

        .truckTires svg {
          width: 24px;
        }

        .road {
          width: 100%;
          height: 1.5px;
          background-color: #282828;
          position: relative;
          bottom: 0;
          align-self: flex-end;
          border-radius: 3px;
        }

        .road::before {
          content: "";
          position: absolute;
          width: 20px;
          height: 100%;
          background-color: #282828;
          right: -50%;
          border-radius: 3px;
          animation: roadAnimation 1.4s linear infinite;
          border-left: 10px solid white;
        }

        .road::after {
          content: "";
          position: absolute;
          width: 10px;
          height: 100%;
          background-color: #282828;
          right: -65%;
          border-radius: 3px;
          animation: roadAnimation 1.4s linear infinite;
          border-left: 4px solid white;
        }

        .lampPost {
          position: absolute;
          bottom: 0;
          right: -90%;
          height: 90px;
          animation: roadAnimation 1.4s linear infinite;
        }

        @keyframes roadAnimation {
          0% {
            transform: translateX(0px);
          }
          100% {
            transform: translateX(-350px);
          }
        }
      `}</style>

      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Truck className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1">Declaration</h3>
        <p className="text-sm text-gray-400">
          We will pick up your device within 10-15 minutes. Please be ready.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-5 sm:p-6">
        <div className="loader mx-auto">
          <div className="truckWrapper">
            <div className="truckBody">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 198 93"
                className="trucksvg"
              >
                <path
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#F83D3D"
                  d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
                />
                <path
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#7D7C7C"
                  d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
                />
                <path
                  strokeWidth="2"
                  stroke="#282828"
                  fill="#282828"
                  d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"
                />
                <rect
                  strokeWidth="2"
                  stroke="#282828"
                  fill="#FFFCAB"
                  rx="1"
                  height="7"
                  width="5"
                  y="63"
                  x="187"
                />
                <rect
                  strokeWidth="2"
                  stroke="#282828"
                  fill="#282828"
                  rx="1"
                  height="11"
                  width="4"
                  y="81"
                  x="193"
                />
                <rect
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#DFDFDF"
                  rx="2.5"
                  height="90"
                  width="121"
                  y="1.5"
                  x="6.5"
                />
                <rect
                  strokeWidth="2"
                  stroke="#282828"
                  fill="#DFDFDF"
                  rx="2"
                  height="4"
                  width="6"
                  y="84"
                  x="1"
                />
              </svg>
            </div>

            <div className="truckTires">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 30 30"
                className="tiresvg"
              >
                <circle
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#282828"
                  r="13.5"
                  cy="15"
                  cx="15"
                />
                <circle fill="#DFDFDF" r="7" cy="15" cx="15" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 30 30"
                className="tiresvg"
              >
                <circle
                  strokeWidth="3"
                  stroke="#282828"
                  fill="#282828"
                  r="13.5"
                  cy="15"
                  cx="15"
                />
                <circle fill="#DFDFDF" r="7" cy="15" cx="15" />
              </svg>
            </div>

            <div className="road" />

            <svg
              xmlSpace="preserve"
              viewBox="0 0 453.459 453.459"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              id="Capa_1"
              version="1.1"
              fill="#000000"
              className="lampPost"
            >
              <path
                d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"
              />
            </svg>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-4">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">
              Our pickup partner will reach you within 10-15 minutes.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">
              Pack your device with box and seal it properly to avoid damage during transit.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">
              We ensure safe transit and delivery to our service center.
            </p>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border-2 border-gray-200 bg-white p-4 cursor-pointer hover:border-blue-300 transition-all">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          I will be ready when the pickup partner arrives.
        </span>
      </label>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!agreed}
          className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all ${
            agreed
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          I’m Ready →
        </button>
      </div>
    </div>
  );
};