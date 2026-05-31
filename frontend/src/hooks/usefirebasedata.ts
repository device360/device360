/**
 * src/hooks/useFirebaseData.ts
 * Real-time Firestore listeners — admin changes reflect instantly on frontend.
 */

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseClient';

export interface Brand {
  id: string; name: string; color: string;
  models: string[]; modelFileMap: Record<string, string>;
  active?: boolean; sortOrder?: number;
}
export interface Issue {
  id: string; name: string; icon: string; category: 'live' | 'other';
  liveRepair: boolean; description: string; estimatedTime: string; active?: boolean;
}
export interface PricingDoc {
  id: string; brandId: string; issueId: string; name: string;
  price: number; oldPrice: number | null; time: string;
}
export interface AppData {
  brands: Brand[]; issues: Issue[]; pricing: PricingDoc[];
  loading: boolean; error: string | null;
}

export function useFirebaseData(): AppData {
  const [brands,   setBrands]   = useState<Brand[]>([]);
  const [issues,   setIssues]   = useState<Issue[]>([]);
  const [pricing,  setPricing]  = useState<PricingDoc[]>([]);
  const [loadingB, setLoadingB] = useState(true);
  const [loadingI, setLoadingI] = useState(true);
  const [loadingP, setLoadingP] = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    const unsubBrands = onSnapshot(
      collection(db, 'brands'),
      (snap) => {
        setBrands(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Brand))
            .filter(b => b.active !== false)
            .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)),
        );
        setLoadingB(false);
      },
      (err) => { setError(err.message); setLoadingB(false); },
    );

    const unsubIssues = onSnapshot(
      collection(db, 'issues'),
      (snap) => {
        setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() } as Issue)).filter(i => i.active !== false));
        setLoadingI(false);
      },
      (err) => { setError(err.message); setLoadingI(false); },
    );

    const unsubPricing = onSnapshot(
      collection(db, 'pricing'),
      (snap) => {
        setPricing(snap.docs.map(d => ({ id: d.id, ...d.data() } as PricingDoc)));
        setLoadingP(false);
      },
      (err) => { setError(err.message); setLoadingP(false); },
    );

    return () => { unsubBrands(); unsubIssues(); unsubPricing(); };
  }, []);

  return { brands, issues, pricing, loading: loadingB || loadingI || loadingP, error };
}

export function getPricingForRepair(
  pricing: PricingDoc[], brandId: string, issueId: string,
): PricingDoc | null {
  const exact = pricing.find(p => p.brandId === brandId && p.issueId === issueId);
  if (exact) return exact;
  const fuzzy = pricing.find(p =>
    (brandId.toLowerCase().includes(p.brandId.toLowerCase()) ||
     p.brandId.toLowerCase().includes(brandId.toLowerCase())) &&
    p.issueId === issueId,
  );
  return fuzzy ?? null;
}