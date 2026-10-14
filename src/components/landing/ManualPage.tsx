import React from 'react';
import { ManualLeadMagnet } from './ManualLeadMagnet';

/** loomisuite.net/manual: página corta para redes, solo el manual y el formulario. */
export const ManualPage: React.FC = () => (
  <div className="min-h-screen bg-[#0E0F12] text-[#EFECE5] font-sans flex flex-col">
    <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
      <a href="/" className="text-xl tracking-wide text-[#EFECE5]">
        loomi<span className="font-semibold text-[#E67E22]">suite</span>
      </a>
      <a href="/" className="text-sm font-semibold text-[#EFECE5] hover:text-[#E67E22]">
        Conocé Loomi Suite →
      </a>
    </header>
    <main className="flex-1 flex items-center">
      <ManualLeadMagnet />
    </main>
    <footer className="text-center text-xs text-[#D9D4C9] pb-6">Loomi Suite · Software de gestión para alojamientos</footer>
  </div>
);
