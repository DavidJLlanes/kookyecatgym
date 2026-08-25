import React, { createContext, useContext, useState, ReactNode } from 'react';
import LegalModal from '../components/legal/LegalModal';
import { LegalPage } from '../components/legal/legalContent';

interface LegalContextValue {
  openLegal: (page: LegalPage) => void;
}

const LegalContext = createContext<LegalContextValue | null>(null);

export function useLegal() {
  const ctx = useContext(LegalContext);
  if (!ctx) throw new Error('useLegal debe usarse dentro de LegalProvider');
  return ctx;
}

export function LegalProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<LegalPage | null>(null);
  const openLegal = (page: LegalPage) => setActivePage(page);

  return (
    <LegalContext.Provider value={{ openLegal }}>
      {children}
      <LegalModal activePage={activePage} onSelectPage={setActivePage} onClose={() => setActivePage(null)} />
    </LegalContext.Provider>
  );
}
