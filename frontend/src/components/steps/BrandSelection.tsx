/**
 * BrandSelection.tsx — 100% Static data (no Firebase)
 * All brands and models from Cleaned_All_Brands_Database.xlsx
 * Logos use official brand SVG/PNG via CDN for pixel-perfect accuracy
 */

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import type { StepProps } from '../../types';

// ── Static brand + model data from database ───────────────────────
export const STATIC_BRANDS = [
  {
    id: 'apple', name: 'Apple', color: '#1d1d1f',
    models: ['Apple iPhone 6','Apple iPhone 6s','Apple iPhone 6s Plus','Apple iPhone 7','Apple iPhone 7 Plus','Apple iPhone 8','Apple iPhone 8 Plus','Apple iPhone X','Apple iPhone XR','Apple iPhone XS','Apple iPhone XS Max','Apple iPhone SE 2020','Apple iPhone 11','Apple iPhone 11 Pro','Apple iPhone 11 Pro Max','Apple iPhone 12','Apple iPhone 12 Mini','Apple iPhone 12 Pro','Apple iPhone 12 Pro Max','Apple iPhone 13','Apple iPhone 13 Mini','Apple iPhone 13 Pro','Apple iPhone 13 Pro Max','Apple iPhone 14','Apple iPhone 14 Plus','Apple iPhone 14 Pro','Apple iPhone 14 Pro Max','Apple iPhone 15','Apple iPhone 15 Plus','Apple iPhone 15 Pro','Apple iPhone 15 Pro Max','Apple iPhone 16','Apple iPhone 16 Plus','Apple iPhone 16 Pro','Apple iPhone 16 Pro Max','Apple iPhone 16e','Apple iPhone 17','Apple iPhone 17 Pro','Apple iPhone 17 Pro Max','Apple iPhone Air'],
  },
  {
    id: 'samsung', name: 'Samsung', color: '#1428A0',
    models: ['Samsung A03','Samsung A03 CORE','Samsung A03s','Samsung A04','Samsung A04e','Samsung A04s','Samsung A05','Samsung A05s','Samsung A06','Samsung A06 5G','Samsung A07','Samsung A10','Samsung A10s','Samsung A12','Samsung A13','Samsung A14','Samsung A15 5G','Samsung A16 5G','Samsung A17 5G','Samsung A20','Samsung A20s','Samsung A21s','Samsung A22','Samsung A22 5G','Samsung A23','Samsung A25 5G','Samsung A26 5G','Samsung A30','Samsung A30s','Samsung A31','Samsung A32','Samsung A33 5G','Samsung A34 5G','Samsung A35 5G','Samsung A36 5G','Samsung A50','Samsung A50s','Samsung A51','Samsung A52','Samsung A52s 5G','Samsung A53 5G','Samsung A54 5G','Samsung A55 5G','Samsung A56 5G','Samsung A70','Samsung A70s','Samsung A71','Samsung A72','Samsung A73 5G','Samsung F05','Samsung F06 5G','Samsung F07','Samsung F12','Samsung F13','Samsung F14','Samsung F14 5G','Samsung F15 5G','Samsung F16 5G','Samsung F17 5G','Samsung F22','Samsung F23 5G','Samsung F34 5G','Samsung F36 5G','Samsung F41','Samsung F42 5G','Samsung F54 5G','Samsung F55 5G','Samsung F56 5G','Samsung F62','Samsung Galaxy Fold','Samsung Galaxy Note 20 Ultra 5G','Samsung Galaxy S20','Samsung Galaxy S20 FE','Samsung Galaxy S20 Plus','Samsung Galaxy S20 Ultra','Samsung Galaxy S21 5G','Samsung Galaxy S21 FE 5G','Samsung Galaxy S21 Plus 5G','Samsung Galaxy S21 Ultra 5G','Samsung Galaxy S22 5G','Samsung Galaxy S22 Plus 5G','Samsung Galaxy S22 Ultra 5G','Samsung Galaxy S23 5G','Samsung Galaxy S23 FE 5G','Samsung Galaxy S23 Plus 5G','Samsung Galaxy S23 Ultra 5G','Samsung Galaxy S24 5G','Samsung Galaxy S24 FE 5G','Samsung Galaxy S24 Plus 5G','Samsung Galaxy S24 Ultra 5G','Samsung Galaxy S25 5G','Samsung Galaxy S25 Edge','Samsung Galaxy S25 FE','Samsung Galaxy S25 Plus 5G','Samsung Galaxy S25 Ultra 5G','Samsung Galaxy Z Flip','Samsung Galaxy Z Flip3 5G','Samsung Galaxy Z Flip4','Samsung Galaxy Z Flip5','Samsung Galaxy Z Flip6 5G','Samsung Galaxy Z Flip7','Samsung Galaxy Z Flip7 FE 5G','Samsung Galaxy Z Fold2 5G','Samsung Galaxy Z Fold3 5G','Samsung Galaxy Z Fold4','Samsung Galaxy Z Fold5','Samsung Galaxy Z Fold6 5G','Samsung Galaxy Z Fold7','Samsung M04','Samsung M05','Samsung M06 5G','Samsung M07','Samsung M10','Samsung M10s','Samsung M11','Samsung M12','Samsung M13','Samsung M14 5G','Samsung M15 5G','Samsung M15 5G Prime Edition','Samsung M16 5G','Samsung M20','Samsung M21','Samsung M30','Samsung M30s','Samsung M31','Samsung M31s','Samsung M32','Samsung M32 5G','Samsung M33 5G','Samsung M34 5G','Samsung M35 5G','Samsung M36 5G','Samsung M40','Samsung M42','Samsung M51','Samsung M52 5G','Samsung M53 5G','Samsung M55 5G','Samsung M55s 5G','Samsung M56 5G','Samsung Note 8','Samsung Note 9','Samsung Note 10','Samsung Note 10 Lite','Samsung Note 10 Plus','Samsung S8','Samsung S8 Plus','Samsung S9','Samsung S9 Plus','Samsung S10','Samsung S10 Lite','Samsung S10 Plus','Samsung S10e'],
  },
  {
    id: 'oneplus', name: 'OnePlus', color: '#eb0029',
    models: ['Oneplus 5','Oneplus 5T','Oneplus 6','Oneplus 6T','Oneplus 7','OnePlus 7 Pro/ 7t Pro','Oneplus 7T','Oneplus 8','Oneplus 8 Pro','Oneplus 8T 5G','Oneplus 9','OnePlus 9Pro','Oneplus 9R 5G','Oneplus 9Rt 5G','Oneplus 10 Pro 5G','Oneplus 10R 5G','Oneplus 10T 5G','Oneplus 11 5G','Oneplus 11R 5G','Oneplus 12','Oneplus 12R','Oneplus 13','Oneplus 13R','Oneplus 13S','Oneplus 15','Oneplus Nord','Oneplus Nord 2','Oneplus Nord 2t 5G','Oneplus Nord 3 5G','Oneplus Nord 4','Oneplus Nord 5','Oneplus Nord CE','Oneplus Nord CE 2','Oneplus Nord CE 2 Lite','Oneplus Nord CE 3 5G','Oneplus Nord CE 3 Lite 5G','Oneplus Nord CE 5','Oneplus Nord CE4 5G','Oneplus Nord CE4 Lite 5G','Oneplus Open'],
  },
  {
    id: 'xiaomi', name: 'Xiaomi', color: '#ff6900',
    models: ['Mi 10','Mi 10T','Mi 10T Pro','Mi 10i 5G','Mi 11','Mi 11 Lite','Mi 11 Ultra','Mi 11X','Mi 11X Pro','Mi A1','Mi A2','Mi A3','Mi Note 3','Redmi 4','Redmi 4A','Redmi 4X','Redmi 5','Redmi 5A','Redmi 6','Redmi 6A','Redmi 6Pro','Redmi 7','Redmi 7A','Redmi 8','Redmi 8A','Redmi 8A Dual','Redmi 9','Redmi 9A','Redmi 9Activ','Redmi 9C','Redmi 9Power','Redmi 9Prime','Redmi 9i','Redmi 9i Sport','Redmi 10','Redmi 10 Power','Redmi 10 Prime 2022','Redmi 10A','Redmi 10Prime','Redmi 11','Redmi 11 Prime','Redmi 11 Prime 5G','Redmi 12','Redmi 12 5G','Redmi 12C','Redmi 13','Redmi 13 5G','Redmi 13C','Redmi 13C 5G','Redmi 14C 5G','Redmi A1','Redmi A1 Plus','Redmi A2','Redmi A2 Plus','Redmi A3','Redmi A3x','Redmi A4 5G','Redmi A5','Redmi Go','Redmi K20','Redmi K50','Redmi K50i 5G','Redmi Note 4','Redmi Note 5','Redmi Note 5Pro','Redmi Note 6Pro','Redmi Note 7/ 7S / 7Pro','Redmi Note 8','Redmi Note 8Pro','Redmi Note 9','Redmi Note 9Pro','Redmi Note 9Pro Max','Redmi Note 10','Redmi Note 10 Lite','Redmi Note 10Pro','Redmi Note 10Pro Max','Redmi Note 10S','Redmi Note 10t 5G','Redmi Note 11','Redmi Note 11Pro','Redmi Note 11Pro + 5G','Redmi Note 11S','Redmi Note 11SE','Redmi Note 11t 5G','Redmi Note 12','Redmi Note 12 5G','Redmi Note 12 Pro 5G','Redmi Note 12 Pro Plus 5G','Redmi Note 13 5G','Redmi Note 13 Pro 5G','Redmi Note 13 Pro Plus 5G','Redmi Note 14 5G','Redmi Note 14 Pro 5G','Redmi Note 14 Pro Plus 5G','Xiaomi 11 Lite NE 5G','Xiaomi 11T Pro 5G','Xiaomi 11i 5G','Xiaomi 11i HyperCharge 5G','Xiaomi 12','Xiaomi 12 Pro 5G','Xiaomi 13 Pro 5G'],
  },
  {
    id: 'realme', name: 'Realme', color: '#f5a623',
    models: ['Realme 1','Realme 2','Realme 2Pro','Realme 3','Realme 3Pro','Realme 3i','Realme 5','Realme 5Pro','Realme 5i','Realme 5s','Realme 6','Realme 6Pro','Realme 6i','Realme 7','Realme 7Pro','Realme 7i','Realme 8','Realme 8 5G','Realme 8Pro','Realme 8i','Realme 8s 5G','Realme 9','Realme 9 5G','Realme 9 Pro','Realme 9 Pro Plus','Realme 9i','Realme 9i 5G','Realme 10','Realme 10 Pro 5G','Realme 10 Pro+ 5G','Realme 11 5G','Realme 11 Pro 5G','Realme 11 Pro+ 5G','Realme 12 5G','Realme 12 Pro 5G','Realme 12 Pro+ 5G','Realme 12+ 5G','Realme 12x 5G','Realme 13 5G','Realme 13 Plus 5G','Realme 13 Pro 5G','Realme 13 Pro Plus 5G','Realme 14 Pro 5G','Realme 14 Pro Lite 5G','Realme 14 Pro Plus 5G','Realme 14T 5G','Realme 14x 5G','Realme 15 5G','Realme 15 Pro 5G','Realme 15x 5G','Realme C1','Realme C2','Realme C3','Realme C11','Realme C11 2021','Realme C12','Realme C15','Realme C20','Realme C21','Realme C21Y','Realme C25','Realme C25S','Realme C25Y','Realme C30','Realme C30s','Realme C31','Realme C33','Realme C33 2023','Realme C35','Realme C51','Realme C53','Realme C55','Realme C61','Realme C63','Realme C63 5G','Realme C65 5G','Realme C67 5G','Realme C71','Realme C73 5G','Realme C75 5G','Realme C85 5G','Realme GT 5G','Realme GT 2','Realme GT 2 Pro','Realme GT 6','Realme GT 6T 5G','Realme GT 7','Realme GT 7Pro 5G','Realme GT 7T','Realme GT Master Edition','Realme GT Neo 2','Realme GT Neo 3T','Realme GT Neo3','Realme Narzo 10','Realme Narzo 10A','Realme Narzo 20','Realme Narzo 20A','Realme Narzo 20Pro','Realme Narzo 30','Realme Narzo 30 5g','Realme Narzo 30 Pro','Realme Narzo 30A','Realme Narzo 50','Realme Narzo 50 5G','Realme Narzo 50 Pro 5G','Realme Narzo 50A','Realme Narzo 50A Prime','Realme Narzo 50i','Realme Narzo 50i Prime','Realme Narzo 60 5G','Realme Narzo 60x 5G','Realme Narzo 70 5G','Realme Narzo 70 Pro 5G','Realme Narzo 70 Turbo 5G','Realme Narzo 70x 5G','Realme Narzo 80 Lite 4G','Realme Narzo 80 Lite 5G','Realme Narzo 80 Pro 5G','Realme Narzo 80x 5G','Realme Narzo N53','Realme Narzo N55','Realme Narzo N61','Realme Narzo N63','Realme Narzo N65 5G','Realme P1 5G','Realme P1 Pro 5G','Realme P1 Speed 5G','Realme P2 Pro 5G','Realme P3 5G','Realme P3 Lite 5G','Realme P3 Pro 5G','Realme P3 Ultra 5G','Realme P4 5G','Realme P4 Pro 5G','Realme U1','Realme X','Realme X2','Realme X3','Realme X3 Super Zoom','Realme X50 Pro','Realme X7','Realme X7 Max','Realme X7 Pro','Realme XT'],
  },
  {
    id: 'pixel', name: 'Google Pixel', color: '#4285F4',
    models: ['Google Pixel 2','Google Pixel 2XL','Google Pixel 3','Google Pixel 3A','Google Pixel 3A XL','Google Pixel 3XL','Google Pixel 4A 4G','Google Pixel 4a 5G','Google Pixel 5','Google Pixel 5A','Google Pixel 6','Google Pixel 6 Pro','Google Pixel 6A','Google Pixel 7','Google Pixel 7 Pro','Google Pixel 7A','Google Pixel 8','Google Pixel 8 Pro','Google Pixel 8A','Google Pixel 9','Google Pixel 9 Pro','Google Pixel 9 Pro Fold','Google Pixel 9 Pro XL','Google Pixel 9a','Google Pixel 10','Google Pixel 10 Pro','Google Pixel 10 Pro XL'],
  },
  {
    id: 'vivo', name: 'Vivo', color: '#415FFF',
    models: ['Vivo S1','Vivo S1 Pro','Vivo T1 44W','Vivo T1 5G','Vivo T1 Pro 5G','Vivo T1x','Vivo T2 5G','Vivo T2 Pro 5G','Vivo T2x 5G','Vivo T3 5G','Vivo T3 Lite 5G','Vivo T3 Pro 5G','Vivo T3 Ultra','Vivo T3x 5G','Vivo T4X 5G','Vivo U10','Vivo U20','Vivo V5/ V5s','Vivo V7','Vivo V7 Plus','Vivo V9/ V9 Pro/ V9 Youth','Vivo V11','Vivo V11 Pro','Vivo V15','Vivo V15 Pro','Vivo V17','Vivo V17 Pro','Vivo V19','Vivo V20','Vivo V20 Pro','Vivo V20 SE','Vivo V21 5G','Vivo V21e 5G','Vivo V23 5G','Vivo V23 Pro','Vivo V23e 5G','Vivo V25 5G','Vivo V25 Pro 5G','Vivo V27','Vivo V27 Pro','Vivo V29','Vivo V29 Pro','Vivo V29e','Vivo V30','Vivo V30 Pro','Vivo V30e','Vivo V40','Vivo V40 Pro','Vivo V40e','Vivo V50','Vivo V50e','Vivo X50','Vivo X50 Pro','Vivo X60','Vivo X60 Pro','Vivo X60 Pro+','Vivo X70 Pro','Vivo X70 Pro+','Vivo X80','Vivo X80 Pro','Vivo X90','Vivo X90 Pro','Vivo X100','Vivo X100 Pro','Vivo X200','Vivo X200 Pro','Vivo Y01','Vivo Y01A','Vivo Y02','Vivo Y02t','Vivo Y11','Vivo Y12/ Y15/ Y17','Vivo Y12G/ Y12S','Vivo Y15S','Vivo Y16','Vivo Y17S','Vivo Y18','Vivo Y18T','Vivo Y18e','Vivo Y18i','Vivo Y19','Vivo Y1s','Vivo Y20/ Y20A/ Y20G/ Y20i/ Y20T','Vivo Y21/ Y21A/ Y21e/ Y21S/ Y21T/','Vivo Y22 2020','Vivo Y27','Vivo Y28 5G','Vivo Y28e 5G','Vivo Y28s 5G','Vivo Y29 5G','Vivo Y30/ Y50','Vivo Y31','Vivo Y33s/ Y33t','Vivo Y35','Vivo Y36','Vivo Y3s','Vivo Y51/ Y51A','Vivo Y53s','Vivo Y55s','Vivo Y56 5G','Vivo Y58 5G','Vivo Y66','Vivo Y69','Vivo Y71','Vivo Y72 5G','Vivo Y73','Vivo Y75','Vivo Y75 5G','Vivo Y81/ Y83','Vivo Y81i','Vivo Y83 Pro','Vivo Y90/ Y91i','Vivo Y91/ Y93/ Y95','Vivo Y100','Vivo Y100A','Vivo Y200','Vivo Y200 Pro 5G','Vivo Y200e 5G','Vivo Y300 5G','Vivo Y300 Plus 5G','Vivo Z1 Pro'],
  },
  {
    id: 'oppo', name: 'OPPO', color: '#1D7D52',
    models: ['Oppo A1K','Oppo A3s','Oppo A5','Oppo A5 2020','Oppo A5s','Oppo A7','Oppo A71','Oppo A83','Oppo A9','Oppo A9 2020','Oppo A12','Oppo A15','Oppo A15s','Oppo A16','Oppo A16e','Oppo A16k','Oppo A31','Oppo A52','Oppo A53','Oppo A53s','Oppo A54','Oppo A55','Oppo A74 5G','Oppo A76','Oppo A96','Oppo A11k','OPPO A17','OPPO A18','OPPO A38','OPPO A58','OPPO A59 5G','OPPO A77 2020','OPPO A77s','OPPO A78 4G','OPPO A78 5G','OPPO A79 5G','OPPO A3 5G','OPPO A3 Pro 5G','OPPO A3x 5G','OPPO A5 5G','OPPO A5 Pro 5G','OPPO A5x','OPPO A5x 5G','Oppo F1s','Oppo F3','Oppo F5','Oppo F5 Youth','Oppo F7','Oppo F9/ F9 Pro','Oppo F11','Oppo F11 Pro','Oppo F15','Oppo F17','Oppo F17 Pro','Oppo F19','Oppo F19 Pro','Oppo F19 Pro Plus 5G','Oppo F19S','OPPO F21 Pro','OPPO F21s Pro','OPPO F23 5G','OPPO F25 Pro 5G','OPPO F27 5G','OPPO F27 Pro Plus 5G','OPPO F29 5G','OPPO F29 Pro 5G','OPPO F31 5G','OPPO F31 Pro 5G','OPPO F31 Pro Plus 5G','Oppo K1','Oppo K3','OPPO K10 5G','OPPO K12x 5G','OPPO K13 5G','OPPO K13 Turbo 5G','OPPO K13 Turbo Pro 5G','OPPO K13x 5G','OPPO Find N2 Flip 5G','OPPO Find N3 Flip 5G','OPPO Find X8 5G','OPPO Find X8 Pro 5G','Oppo Reno 2F','Oppo Reno3 Pro','Oppo Reno4 Pro','Oppo Reno5 Pro','Oppo Reno6','Oppo Reno6 Pro','Oppo Reno7 5G','Oppo Reno7 Pro 5G','OPPO Reno8 5G','OPPO Reno8 Pro 5G','OPPO Reno8T 5G','OPPO Reno10 5G','OPPO Reno10 Pro 5G','OPPO Reno10 Pro+ 5G','OPPO Reno11 5G','OPPO Reno11 Pro 5G','OPPO Reno12 5G','OPPO Reno12 Pro 5G','OPPO Reno13 5G','OPPO Reno13 Pro 5G','OPPO Reno14 5G','OPPO Reno14 Pro 5G'],
  },
  {
    id: 'motorola', name: 'Motorola', color: '#E1140A',
    models: ['Motorola Moto G04','Motorola Moto G04s','Motorola Moto G05','Motorola Moto G30','Motorola Moto G31','Motorola Moto G32','Motorola Moto G34 5G','Motorola Moto G35 5G','Motorola Moto G40 Fusion','Motorola Moto G42','Motorola Moto G45 5G','Motorola Moto G52','Motorola Moto G54 5G','Motorola Moto G60','Motorola Moto G62 5G','Motorola Moto G64 5G','Motorola Moto G71 5G','Motorola Moto G72','Motorola Moto G73 5G','Motorola Moto G82 5G','Motorola Moto G84 5G','Motorola Moto G85 5G','Motorola Moto G86 Power 5G','Motorola Moto G96 5G','Motorola Moto Edge 20','Motorola Moto Edge 20 Fusion','Motorola Moto Edge 20 Pro','Motorola Moto Edge 30','Motorola Moto Edge 30 Fusion','Motorola Moto Edge 30 Pro','Motorola Moto Edge 30 Ultra','Motorola Moto Edge 40','Motorola Moto Edge 40 Neo','Motorola Moto Edge 50','Motorola Moto Edge 50 Fusion','Motorola Moto Edge 50 Neo','Motorola Moto Edge 50 Pro 5G','Motorola Moto Edge 50 Ultra','Motorola Moto Edge 60','Motorola Moto Edge 60 Fusion','Motorola Moto Edge 60 Pro','Motorola Moto Edge 60 Stylus','Motorola Moto One','Motorola One Action','Motorola One Fusion Plus','Motorola One Power','Motorola One Vision','Motorola Razr 40 5G','Motorola Razr 40 Ultra 5G','Motorola Razr 50','Motorola Razr 50 Ultra','Motorola Moto Razr 60','Motorola Moto Razr 60 Ultra'],
  },
  {
    id: 'poco', name: 'POCO', color: '#f5d20a',
    models: ['Poco C3','Poco C31','Poco C50','Poco C51','Poco C55','Poco C65','Poco F1','Poco F3 GT','Poco F4 5G','Poco F5 5G','Poco M2 / M2 Reloaded','Poco M2 Pro','Poco M3','Poco M3 Pro 5G','Poco M4 5G','Poco M4 Pro','Poco M4 Pro 5G','Poco M5','Poco M6 Pro 5G','Poco X2','Poco X3','Poco X3 Pro','Poco X4 Pro 5G','Poco X5 5G','Poco X5 Pro 5G','Poco X6 5G','Poco X6 Pro 5G'],
  },
  {
    id: 'iqoo', name: 'iQOO', color: '#5b30e9',
    models: ['iQOO 3','iQOO 3 5G','iQOO 7 5G','iQOO 7 Legend 5G','iQOO 9 5G','iQOO 9 Pro','iQOO 9 SE','iQOO 9T 5G','iQOO 11 5G','iQOO 12 5G','iQOO Neo 6 5G','iQOO Neo 7','iQOO Neo 7 Pro','iQOO Neo 9 Pro 5G','iQOO Z3 5G','iQOO Z5 5G','iQOO Z6 44W','iQOO Z6 5G','iQOO Z6 Lite 5G','iQOO Z6 Pro 5G','iQOO Z7 5G','iQOO Z7 Pro 5G','iQOO Z7s','iQOO Z9 5G','iQOO Z9 Lite 5G','iQOO Z9s 5G','iQOO Z9s Pro 5G','iQOO Z9x 5G'],
  },
  {
    id: 'nothing', name: 'Nothing', color: '#111111',
    models: ['Nothing Phone 1','Nothing Phone 2','Nothing Phone 2a 5G','Nothing Phone 2a Plus','Nothing Phone 3a','Nothing Phone 3a Pro','CMF by Nothing Phone 1','CMF by Nothing Phone 2 Pro'],
  },
  {
    id: 'nokia', name: 'Nokia', color: '#124191',
    models: ['Nokia 2','Nokia 2.1','Nokia 2.2','Nokia 2.3','Nokia 2.4','Nokia 3','Nokia 3.1','Nokia 3.1 Plus','Nokia 3.2','Nokia 5','Nokia 5.1','Nokia 5.1 Plus','Nokia 6','Nokia 6.1','Nokia 6.1 Plus','Nokia 7','Nokia 7.1','Nokia 8','Nokia 8.1','Nokia C30 2020'],
  },
  {
    id: 'honor', name: 'Honor', color: '#CF0A2C',
    models: ['Honor 7A','Honor 7C','Honor 7S','Honor 7X','Honor 8','Honor 8X','Honor 9A','Honor 9Lite','Honor 9N','Honor 9S','Honor 9i','Honor 10','Honor 10Lite','Honor 20','Honor 20i'],
  },
  {
    id: 'tecno', name: 'Tecno', color: '#007fff',
    models: ['Tecno Spark 4','Tecno Spark 4 Air','Tecno Spark 5','Tecno Spark 5 Pro','Tecno Spark 6 Air','Tecno Spark 6 Go','Tecno Spark 7','Tecno Spark 7Pro','Tecno Spark 7T','Tecno Spark 8','Tecno Spark 8C','Tecno Spark 8T','Tecno Spark Go','Tecno Spark Go 2020','Tecno Spark Go 2021','Tecno Spark Power','Tecno Camon 12 Air','Tecno Camon 16'],
  },
] as const;

// Primary brands shown above the fold (by brand id)
const PRIMARY_BRAND_IDS = ['apple','samsung','oneplus','xiaomi','realme','pixel'];

// ── Brand logo config: uses official SVG inline definitions ───────
const BRAND_LOGOS: Record<string, {
  bg: string;
  selectedBg: string;
  render: (selected: boolean) => ReactNode;
}> = {
  apple: {
    bg: '#f5f5f7',
    selectedBg: '#1d1d1f',
    render: (selected) => (
      <svg viewBox="0 0 170 170" className="w-9 h-9" fill={selected ? '#ffffff' : '#1d1d1f'}>
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71 0.12 1.083 0.17 2.166 0.17 3.241z"/>
      </svg>
    ),
  },

  samsung: {
    bg: '#e8edf8',
    selectedBg: '#1428A0',
    render: (selected) => (
      <svg viewBox="0 0 300 60" className="w-20 h-7">
        <text x="150" y="48" textAnchor="middle" fontFamily="'Samsung Sharp Sans', 'Arial Black', sans-serif" fontWeight="700" fontSize="52" letterSpacing="-1" fill={selected ? '#ffffff' : '#1428A0'}>SAMSUNG</text>
      </svg>
    ),
  },

oneplus: {
  bg: '#fff5f5',
  selectedBg: '#eb0029',
  render: (selected) => (
    <svg
      viewBox="0 0 24 24"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 3.74V24h20.26V12.428h-2.256v9.317H2.254V5.995h9.318V3.742zM18.004 0v3.74h-3.758v2.256h3.758v3.758h2.255V5.996H24V3.74h-3.758V0zm-6.45 18.756V8.862H9.562c0 .682-.228 1.189-.577 1.504-.367.297-.91.437-1.556.437h-.245v1.625h2.133v6.31h2.237z"
        fill={selected ? '#ffffff' : '#F5010C'}
      />
    </svg>
  ),
},
  xiaomi: {
    bg: '#fff4ec',
    selectedBg: '#ff6900',
    render: (selected) => (
      <svg viewBox="0 0 48 48" className="w-9 h-9">
        <rect width="48" height="48" rx="10" fill="#ff6900" />
        <text x="24" y="34" textAnchor="middle" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="22" letterSpacing="1" fill="#ffffff">MI</text>
      </svg>
    ),
  },

  realme: {
    bg: '#FFF5BF',
    selectedBg: '#FFD400',
    render: () => (
      <span className="font-black tracking-tight lowercase leading-none text-gray-900" style={{ fontSize: '0.98rem', letterSpacing: '-0.04em' }}>realme</span>
    ),
  },

  pixel: {
    bg: '#e8f0fe',
    selectedBg: '#4285F4',
    render: (selected) => (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        {selected ? (
          <path fill="#ffffff" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        ) : (
          <>
            <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
            <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z" />
            <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" />
            <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
          </>
        )}
      </svg>
    ),
  },

  vivo: {
    bg: '#eef1ff',
    selectedBg: '#415FFF',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-16 h-8">
        <text x="100" y="46" textAnchor="middle" fontFamily="'Arial', sans-serif" fontWeight="700" fontSize="52" letterSpacing="2" fill={selected ? '#ffffff' : '#415FFF'}>vivo</text>
      </svg>
    ),
  },

  oppo: {
    bg: '#edf5f0',
    selectedBg: '#1D7D52',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-16 h-8">
        <text x="100" y="46" textAnchor="middle" fontFamily="'Arial', sans-serif" fontWeight="700" fontSize="52" letterSpacing="1" fill={selected ? '#ffffff' : '#1D7D52'}>OPPO</text>
      </svg>
    ),
  },

  motorola: {
    bg: '#feefef',
    selectedBg: '#E1140A',
    render: (selected) => (
      <svg viewBox="0 0 64 64" className="w-10 h-10" aria-label="Motorola logo">
        <circle cx="32" cy="32" r="26" fill={selected ? '#ffffff' : '#E1140A'} />
        <path d="M20 42V22l12 11 12-11v20h-5V32l-7 6-7-6v10z" fill={selected ? '#E1140A' : '#ffffff'} />
      </svg>
    ),
  },

  poco: {
    bg: '#FFD000',
    selectedBg: '#FFD000',
    render: () => (
      <svg viewBox="0 0 64 64" className="w-10 h-10">
        <rect width="64" height="64" rx="14" fill="#FFD000" />
        <text x="32" y="44" textAnchor="middle" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="24" letterSpacing="-0.5" fill="#111111">POCO</text>
      </svg>
    ),
  },

  iqoo: {
    bg: '#f0ecfd',
    selectedBg: '#5b30e9',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-16 h-8">
        <text x="100" y="46" textAnchor="middle" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="50" fill={selected ? '#ffffff' : '#5b30e9'}>iQOO</text>
      </svg>
    ),
  },

  nothing: {
    bg: '#f5f5f5',
    selectedBg: '#111111',
    render: (selected) => (
      <svg viewBox="0 0 56 56" className="w-9 h-9">
        <rect width="56" height="56" rx="12" fill={selected ? '#111111' : '#f5f5f5'} />
        {[
          [10,10],[10,18],[10,26],[10,34],[10,42],
          [18,18],
          [26,26],
          [34,34],
          [42,10],[42,18],[42,26],[42,34],[42,42],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.8" fill={selected ? '#ffffff' : '#111111'} />
        ))}
      </svg>
    ),
  },

  nokia: {
    bg: '#e8edf8',
    selectedBg: '#124191',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-16 h-8">
        <text x="100" y="46" textAnchor="middle" fontFamily="'Arial', sans-serif" fontWeight="700" fontSize="50" letterSpacing="2" fill={selected ? '#ffffff' : '#124191'}>NOKIA</text>
      </svg>
    ),
  },

  honor: {
    bg: '#f7fbff',
    selectedBg: '#ffffff',
    render: (selected) => (
      <svg viewBox="0 0 260 90" className="w-20 h-10" aria-label="Honor logo">
        <text
          x="130"
          y="58"
          textAnchor="middle"
          fontFamily="'Aptos', 'Arial Rounded MT Bold', 'Segoe UI', sans-serif"
          fontWeight="700"
          fontSize="48"
          letterSpacing="-1.5"
          fill={selected ? '#0ea5e9' : '#28a8e0'}
        >
          honor
        </text>
      </svg>
    ),
  },

  tecno: {
    bg: '#e6f3ff',
    selectedBg: '#007fff',
    render: (selected) => (
      <svg viewBox="0 0 200 60" className="w-16 h-8">
        <text x="100" y="46" textAnchor="middle" fontFamily="'Arial', sans-serif" fontWeight="700" fontSize="48" letterSpacing="1" fill={selected ? '#ffffff' : '#007fff'}>TECNO</text>
      </svg>
    ),
  },
};

type Brand = typeof STATIC_BRANDS[number];

const BrandLogo: React.FC<{ id: string; name: string; color: string; selected?: boolean }> = ({ id, name, color, selected = false }) => {
  const logo = BRAND_LOGOS[id];
  if (!logo) {
    return (
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all"
        style={{ backgroundColor: selected ? color : color + '22', color: selected ? '#fff' : color }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200 overflow-hidden"
      style={{ backgroundColor: selected ? logo.selectedBg : logo.bg }}
    >
      {logo.render(selected)}
    </div>
  );
};

export const BrandSelection: React.FC<StepProps> = ({ updateFormData, goToNextStep }) => {
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const primaryBrands = STATIC_BRANDS.filter(b => PRIMARY_BRAND_IDS.includes(b.id));
  const secondaryBrands = STATIC_BRANDS.filter(b => !PRIMARY_BRAND_IDS.includes(b.id));

  const isSearching = query.length > 0;
  const searchFiltered = STATIC_BRANDS.filter(b =>
    b.name.toLowerCase().includes(query.toLowerCase()) ||
    b.models.some(m => m.toLowerCase().includes(query.toLowerCase())),
  );

  const displayedBrands = isSearching ? searchFiltered : (showAll ? STATIC_BRANDS : primaryBrands);

  const handleSelect = (brand: Brand) => {
    updateFormData({
      brand: { id: brand.id, name: brand.name, color: brand.color, models: [...brand.models], modelFileMap: {} } as any,
      model: '',
      issue: null,
      pricing: null,
    });
    goToNextStep();
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/60 overflow-hidden">
      <div className="px-6 pt-8 pb-6 text-center border-b border-gray-50">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-blue-600 tracking-wide">Step 1 of 4</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Select Your Brand</h2>
        <p className="text-sm text-gray-400">Choose the manufacturer of your device</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search brand or model…"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium bg-gray-50 focus:bg-white transition-all"
            data-testid="brand-search"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 transition-all"
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l10 10M11 1L1 11" />
              </svg>
            </button>
          )}
        </div>

        {!isSearching && !showAll && secondaryBrands.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Popular brands</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <AnimatePresence>
            {displayedBrands.map((brand, i) => {
              const isHovered = hovered === brand.id;
              const accentColor = brand.color;
              return (
                <motion.button
                  key={brand.id}
                  layout
                  initial={{ opacity: 0, scale: 0.88, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 26 }}
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHovered(brand.id)}
                  onHoverEnd={() => setHovered(null)}
                  onClick={() => handleSelect(brand)}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white"
                  style={{
                    borderColor: isHovered ? accentColor + '66' : '#f1f5f9',
                    boxShadow: isHovered ? `0 8px 24px -4px ${accentColor}33` : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  data-testid={`brand-card-${brand.id}`}
                >
                  <BrandLogo id={brand.id} name={brand.name} color={brand.color} selected={isHovered} />
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-xs leading-tight">{brand.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{brand.models.length} models</p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {!isSearching && secondaryBrands.length > 0 && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 text-xs font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            {showAll
              ? <><ChevronUp className="w-4 h-4" /> Show fewer brands</>
              : <><ChevronDown className="w-4 h-4" /> See {secondaryBrands.length} more brands ({secondaryBrands.map(b => b.name).join(', ')})</>
            }
          </button>
        )}

        {isSearching && displayedBrands.length === 0 && (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No brands found for "{query}"</p>
            <button onClick={() => setQuery('')} className="mt-2 text-xs text-blue-500 hover:underline font-medium">
              Clear search
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-gray-50 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>Don't see your brand?</span>
          <a href="tel:+919876543210" className="inline-flex items-center gap-1 text-blue-500 font-bold hover:underline">
            <Phone className="w-3 h-3" /> Call us
          </a>
        </div>
      </div>
    </div>
  );
};