import { useState } from 'react';
import { PhoneStep } from './contact/PhoneStep';
import { OTPStep } from './contact/OTPStep';
import { NameStep, AddressStep, DeclarationStep } from './contact/ContactSteps';
import type { StepProps, AddressFields } from '../../types';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STEP_LABELS = ['Phone', 'Verify OTP', 'Your Name', 'Address', 'Declaration'];

export const LeadCapture: React.FC<StepProps> = ({
  formData,
  updateFormData,
  goToNextStep,
  goToPreviousStep,
}) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(formData.phone || '');
  const [name, setName] = useState(formData.name || '');
  const [address, setAddress] = useState<AddressFields>({
    doorNumber: '',
    street: '',
    floor: '',
    landmark: '',
    city: '',
    pincode: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const back = () => (step > 1 ? setStep((s) => s - 1) : goToPreviousStep());

  const submitBooking = async () => {
    setSubmitting(true);

    try {
      const addrStr = `${address.doorNumber}, ${address.floor ? address.floor + ', ' : ''}${address.street}, ${address.landmark ? address.landmark + ', ' : ''}${address.city} - ${address.pincode}`;

      const body = {
        name,
        phone,
        address: addrStr,
        addressDetails: address,
        brand: formData.brand?.name,
        model: formData.model,
        issue: formData.issue?.name,
        price: formData.pricing?.price,
        estimatedTime: formData.pricing?.time,
        isLiveRepair: formData.issue?.liveRepair || false,
        doorstepPickup: true,
      };

      const res = await fetch(`${BACKEND}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed');
      }

      const data = await res.json();

      updateFormData({
        phone,
        name,
        address,
        bookingId: data.bookingId,
      });

      goToNextStep();
    } catch (err: any) {
      alert(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
        <div className="flex flex-col items-center justify-center py-12 space-y-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-black text-gray-900 text-lg">Confirming your booking…</p>
            <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step progress indicator */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black text-gray-900 uppercase tracking-widest">
            Step {step} of 5
          </p>
          <p className="text-xs font-semibold text-blue-600">{STEP_LABELS[step - 1]}</p>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                i + 1 < step
                  ? 'bg-blue-600'
                  : i + 1 === step
                    ? 'bg-blue-400'
                    : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/60 overflow-hidden">
        {step === 1 && (
          <PhoneStep
            phone={phone}
            onSubmit={(p) => {
              setPhone(p);
              setStep(2);
            }}
            goBack={goToPreviousStep}
          />
        )}

        {step === 2 && (
          <OTPStep
            phone={phone}
            onVerify={() => setStep(3)}
            goBack={goToPreviousStep}
          />
        )}

        {step === 3 && (
          <NameStep
            name={name}
            onSubmit={(n) => {
              setName(n);
              setStep(4);
            }}
            goBack={back}
          />
        )}

        {step === 4 && (
          <AddressStep
            address={address}
            onSubmit={(a) => {
              setAddress(a);
              setStep(5);
            }}
            goBack={back}
          />
        )}

        {step === 5 && (
          <DeclarationStep
            goBack={back}
            onSubmit={submitBooking}
          />
        )}
      </div>
    </div>
  );
};