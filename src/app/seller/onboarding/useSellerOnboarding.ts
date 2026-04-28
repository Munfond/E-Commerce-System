import { useEffect, useMemo, useState } from 'react';

export type SellerOnboardingData = {
  shopName: string;
  pickupAddress: string;
  email: string;
  phone: string;
  shippingProvider: string;
  identityFullName: string;
  identityIdNumber: string;
  identityAddress: string;
  taxCode: string;
  taxCompanyName: string;
};

const STORAGE_KEY = 'shopviet.sellerOnboarding.v1';

const defaultData: SellerOnboardingData = {
  shopName: '',
  pickupAddress: '',
  email: '',
  phone: '',
  shippingProvider: '',
  identityFullName: '',
  identityIdNumber: '',
  identityAddress: '',
  taxCode: '',
  taxCompanyName: '',
};

function safeParse(json: string | null): SellerOnboardingData | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Partial<SellerOnboardingData>;
    return { ...defaultData, ...parsed };
  } catch {
    return null;
  }
}

export function useSellerOnboarding() {
  const [data, setData] = useState<SellerOnboardingData>(() => {
    if (typeof window === 'undefined') return defaultData;
    return safeParse(window.sessionStorage.getItem(STORAGE_KEY)) ?? defaultData;
  });

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const actions = useMemo(
    () => ({
      update(patch: Partial<SellerOnboardingData>) {
        setData((prev) => ({ ...prev, ...patch }));
      },
      reset() {
        setData(defaultData);
        window.sessionStorage.removeItem(STORAGE_KEY);
      },
    }),
    []
  );

  return { data, ...actions };
}

