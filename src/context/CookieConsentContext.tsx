import React, { createContext, useContext, useState, ReactNode } from 'react';
import CookieBanner, { loadCookieConsent, CookieConsent } from '../components/legal/CookieBanner';

interface CookieConsentContextValue {
  openCookiePreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent debe usarse dentro de CookieConsentProvider');
  return ctx;
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(() => loadCookieConsent());
  const [reopened, setReopened] = useState(false);

  const visible = consent === null || reopened;

  const openCookiePreferences = () => setReopened(true);

  const handleResolved = (newConsent: CookieConsent) => {
    setConsent(newConsent);
    setReopened(false);
  };

  return (
    <CookieConsentContext.Provider value={{ openCookiePreferences }}>
      {children}
      <CookieBanner
        visible={visible}
        startExpanded={reopened}
        initialAnalytics={consent?.analytics ?? false}
        onResolved={handleResolved}
      />
    </CookieConsentContext.Provider>
  );
}
