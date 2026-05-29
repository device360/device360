export interface PhoneModel {
  id: string;
  name: string;
  generation: string;
}

export interface RepairIssue {
  id: string;
  name: string;
  iconName: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
}

export interface Step {
  id: string;
  title: string;
  subtitle: string;
  status: 'pending' | 'in-progress' | 'completed';
  time?: string;
}

export const PHONE_MODELS: PhoneModel[] = [
  { id: 'ip15pm', name: 'iPhone 15 Pro Max', generation: '15' },
  { id: 'ip15p', name: 'iPhone 15 Pro', generation: '15' },
  { id: 'ip15', name: 'iPhone 15', generation: '15' },
  { id: 'ip14pm', name: 'iPhone 14 Pro Max', generation: '14' },
  { id: 'ip14p', name: 'iPhone 14 Pro', generation: '14' },
  { id: 'ip14', name: 'iPhone 14', generation: '14' },
  { id: 'ip13pm', name: 'iPhone 13 Pro Max', generation: '13' },
  { id: 'ip13p', name: 'iPhone 13 Pro', generation: '13' },
  { id: 'ip13', name: 'iPhone 13', generation: '13' },
  { id: 'ip12p', name: 'iPhone 12 Pro', generation: '12' },
  { id: 'ip12', name: 'iPhone 12', generation: '12' },
  { id: 'ip11p', name: 'iPhone 11 Pro', generation: '11' },
  { id: 'ip11', name: 'iPhone 11', generation: '11' },
];

export const REPAIR_ISSUES: RepairIssue[] = [
  {
    id: 'screen',
    name: 'Front Screen Glass & OLED',
    iconName: 'Smartphone',
    description: 'Cracked outer glass, display lines, or unresponsive touch. Replaced with genuine ultra-retina panel.',
    basePrice: 199,
    durationMinutes: 45,
  },
  {
    id: 'battery',
    name: 'OEM Battery Replacement',
    iconName: 'Battery',
    description: 'Battery health degraded under 80%, swelling, or rapid draining. Replaced with original cell & cycle reset.',
    basePrice: 79,
    durationMinutes: 30,
  },
  {
    id: 'backglass',
    name: 'Rear Back Glass Shattered',
    iconName: 'Layers',
    description: 'Spiderweb cracks on the back panel. Removed cleanly via high-precision laser separation and custom glass refit.',
    basePrice: 109,
    durationMinutes: 60,
  },
  {
    id: 'camera',
    name: 'Main / Ultrawide Camera Module',
    iconName: 'Camera',
    description: 'Shaking optical stabilization lens, dark spots, or cracked zoom modules. Swapped with authentic optics.',
    basePrice: 149,
    durationMinutes: 40,
  },
  {
    id: 'charging',
    name: 'Charging Port & Connectors',
    iconName: 'Zap',
    description: 'Loose connection or zero charger detection. High-precision solder replacement of target port sub-board.',
    basePrice: 89,
    durationMinutes: 35,
  },
];
