import React from 'react';
import { useLegal } from '../../context/LegalContext';
import { useCookieConsent } from '../../context/CookieConsentContext';

export default function LegalFooterLinks({ className = '' }: { className?: string }) {
  const { openLegal } = useLegal();
  const { openCookiePreferences } = useCookieConsent();

  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500 ${className}`}>
      <button type="button" onClick={() => openLegal('aviso')} className="hover:text-slate-300 underline-offset-2 hover:underline cursor-pointer">
        Aviso Legal
      </button>
      <span className="text-slate-700">·</span>
      <button type="button" onClick={() => openLegal('privacidad')} className="hover:text-slate-300 underline-offset-2 hover:underline cursor-pointer">
        Privacidad
      </button>
      <span className="text-slate-700">·</span>
      <button type="button" onClick={() => openLegal('terminos')} className="hover:text-slate-300 underline-offset-2 hover:underline cursor-pointer">
        Términos y Condiciones
      </button>
      <span className="text-slate-700">·</span>
      <button type="button" onClick={openCookiePreferences} className="hover:text-slate-300 underline-offset-2 hover:underline cursor-pointer">
        Preferencias de cookies
      </button>
    </div>
  );
}
