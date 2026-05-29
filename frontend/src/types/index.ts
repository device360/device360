export interface Brand {
  id: string;
  name: string;
  icon: string;
  models: string[];
}

export interface Issue {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  time: string;
  liveRepair: boolean;
  category: 'live' | 'other';
}

export interface Pricing extends Issue {
  price: number;
  oldPrice: number;
}

export interface AddressFields {
  doorNumber: string;
  street: string;
  floor: string;
  landmark: string;
  city: string;
  pincode: string;
}

export interface FormData {
  brand: Brand | null;
  model: string;
  issue: Issue | null;
  pricing: Pricing | null;
  name: string;
  phone: string;
  address: AddressFields | string;
  timeSlot: string;
  doorstepPickup: boolean;
  bookingId: string | null;
  otpVerified?: boolean;
}

export interface StepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

export interface Testimonial {
  id: number;
  name: string;
  rating: number;
  text: string;
  image: string;
}

export interface Lead {
  technicianNote: string;
  id: string;
  name: string;
  phone: string;
  address: string;
  timeSlot: string;
  brand: string;
  model: string;
  issue: string;
  price: number;
  estimatedTime: string;
  isLiveRepair: boolean;
  doorstepPickup: boolean;
  status: string;
  videoLink: string | null;
  technicianId: string | null;
  createdAt: string;
  updatedAt: string;
}
