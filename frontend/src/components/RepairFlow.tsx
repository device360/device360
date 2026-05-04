import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { BrandSelection } from './steps/BrandSelection';
import { ModelSelection } from './steps/ModelSelection';
import { IssueSelection } from './steps/IssueSelection';
import { PricingDisplay } from './steps/PricingDisplay';
import { LeadCapture } from './steps/LeadCapture';
import { Confirmation } from './steps/Confirmation';
import type { FormData } from '../types';

interface AddressData {
  doorNumber: string;
  street: string;
  floor: string;
  landmark: string;
  city: string;
  pincode: string;
}

interface FormDataWithAddress extends FormData {
  address: AddressData;
}

const STORAGE_KEY = 'device360Location';

const STEPS = [
  { id: 1, name: 'Brand' },
  { id: 2, name: 'Model' },
  { id: 3, name: 'Issue' },
  { id: 4, name: 'Price' },
  { id: 5, name: 'Contact' },
  { id: 6, name: 'Done' },
];

const STEP_COMPONENTS: Record<number, React.ComponentType<any>> = {
  1: BrandSelection,
  2: ModelSelection,
  3: IssueSelection,
  4: PricingDisplay,
  5: LeadCapture,
  6: Confirmation,
};

const toPrettyLocation = (slug?: string) => {
  if (!slug) return 'Bengaluru';

  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const RepairFlow: React.FC = () => {
  const { location } = useParams<{ location?: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('Bengaluru');
  const [formData, setFormData] = useState<FormDataWithAddress>({
    brand: null,
    model: '',
    issue: null,
    pricing: null,
    name: '',
    phone: '',
    address: { doorNumber: '', street: '', floor: '', landmark: '', city: 'Bengaluru', pincode: '' },
    timeSlot: '',
    doorstepPickup: true,
    bookingId: null,
  });

  useEffect(() => {
    const resolvedLocation = toPrettyLocation(location || localStorage.getItem(STORAGE_KEY) || 'Bengaluru');

    setSelectedLocation(resolvedLocation);
    localStorage.setItem(STORAGE_KEY, resolvedLocation);
    window.dispatchEvent(new Event('device360-location-change'));

    setCurrentStep(1);
    setFormData((prev) => ({
      ...prev,
      brand: null,
      model: '',
      issue: null,
      pricing: null,
      address: {
        ...prev.address,
        city: resolvedLocation,
      },
    }));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  const updateFormData = (data: Partial<FormData>) =>
    setFormData((prev) => ({
      ...prev,
      ...data,
      address: (data.address as AddressData) || prev.address,
    }));

  const goToNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const CurrentStep = STEP_COMPONENTS[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 py-10 pb-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 text-xs font-semibold text-blue-700">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            Repair location: {selectedLocation}
          </div>

          <h1 className="font-extrabold text-2xl sm:text-3xl text-gray-900 mb-6 text-center">
            Book a Repair
          </h1>

          <div className="flex items-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="text-xs mt-1.5 font-medium text-gray-400 hidden sm:block">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 transition-all ${currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentStep}-${selectedLocation}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <CurrentStep
              formData={formData}
              updateFormData={updateFormData}
              goToNextStep={goToNextStep}
              goToPreviousStep={goToPreviousStep}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};