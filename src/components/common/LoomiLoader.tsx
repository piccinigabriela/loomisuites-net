import React from 'react';

/** Logo de Loomi Suite (círculo incompleto) para la pantalla de carga: el arco gira despacio, el texto queda quieto. */
export const LoomiLoader: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center gap-6">
    <div className="relative w-40 h-40" role="img" aria-label="Loomi Suite">
      <svg
        viewBox="0 0 1000 1000"
        className="absolute inset-0 w-full h-full motion-safe:animate-[spin_2.4s_linear_infinite]"
        aria-hidden="true"
      >
        <path
          d="M 888 356 A 400 400 0 1 1 640 117"
          fill="none"
          stroke="#EFECE5"
          strokeWidth="46"
          strokeLinecap="round"
        />
      </svg>
      <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <text x="497" y="620" textAnchor="middle" fill="#FFFFFF" fontSize="84" fontWeight="300" letterSpacing="10" fontFamily="Inter, system-ui, sans-serif">loomi</text>
        <text x="497" y="695" textAnchor="middle" fill="#E67E22" fontSize="84" fontWeight="700" letterSpacing="10" fontFamily="Inter, system-ui, sans-serif">suite</text>
      </svg>
    </div>
    {message && <p className="text-sm font-medium text-zinc-200">{message}</p>}
  </div>
);
