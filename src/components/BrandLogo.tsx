import React from 'react';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Recreación tipográfica exacta del logotipo de The Wellness Club (Brand Book pág. 1 y 12):
 * - Óvalo fino superior con "THE"
 * - "Wellness" en Serif Editorial Bold
 * - "Club" superpuesto en Script caligráfico elegante
 * - "Health & Community" en el pie
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  className = '',
}) => {
  const isLight = variant === 'light';
  const mainColor = isLight ? 'text-wellness-cream' : 'text-wellness-deep';
  const subColor = isLight ? 'text-wellness-pale' : 'text-wellness-olive';
  const borderColor = isLight ? 'border-wellness-pale/60' : 'border-wellness-olive/70';

  if (size === 'sm') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <span
          className={`px-2 py-[1px] text-[8px] tracking-[0.22em] uppercase border rounded-full font-serif ${borderColor} ${mainColor}`}
        >
          THE
        </span>
        <div className="relative flex flex-col items-center leading-none -mt-0.5">
          <span className={`font-serif font-bold text-2xl tracking-tight ${mainColor}`}>
            Wellness
          </span>
          <span
            className={`font-script text-2xl -mt-2.5 ${
              isLight ? 'text-wellness-sand' : 'text-wellness-olive'
            }`}
          >
            Club
          </span>
        </div>
        <span className={`text-[8px] tracking-[0.16em] uppercase -mt-1 ${subColor}`}>
          Health &amp; Community
        </span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <span
          className={`px-3.5 py-0.5 text-[11px] tracking-[0.25em] uppercase border rounded-full font-serif ${borderColor} ${mainColor}`}
        >
          THE
        </span>
        <div className="relative flex flex-col items-center leading-none -mt-1">
          <span className={`font-serif font-bold text-5xl sm:text-6xl tracking-tight ${mainColor}`}>
            Wellness
          </span>
          <span
            className={`font-script text-5xl sm:text-6xl -mt-5 ${
              isLight ? 'text-wellness-sand' : 'text-wellness-olive'
            }`}
          >
            Club
          </span>
        </div>
        <span className={`text-[11px] tracking-[0.2em] font-serif mt-0.5 ${subColor}`}>
          Health &amp; Community
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <span
        className={`px-2.5 py-[1px] text-[9px] tracking-[0.22em] uppercase border rounded-full font-serif ${borderColor} ${mainColor}`}
      >
        THE
      </span>
      <div className="relative flex flex-col items-center leading-none -mt-0.5">
        <span className={`font-serif font-bold text-3xl sm:text-4xl tracking-tight ${mainColor}`}>
          Wellness
        </span>
        <span
          className={`font-script text-3xl sm:text-4xl -mt-3.5 ${
            isLight ? 'text-wellness-sand' : 'text-wellness-olive'
          }`}
        >
          Club
        </span>
      </div>
      <span className={`text-[9px] tracking-[0.18em] font-serif -mt-0.5 ${subColor}`}>
        Health &amp; Community
      </span>
    </div>
  );
};
