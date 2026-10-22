import React from 'react';
import { Reservation, WellnessSession } from '../types/wellness';
import { Sparkles, ShieldAlert, CheckCircle2, User } from 'lucide-react';

interface MatGridSelectorProps {
  session: WellnessSession;
  sessionReservations: Reservation[];
  selectedMats: number[];
  partySize: number;
  onToggleMat: (matNumber: number) => void;
  isStaffMode?: boolean;
  onSelectOccupiedMat?: (reservation: Reservation) => void;
}

/**
 * Mapa interactivo de las 40 esterillas (+ 4 de reserva = 44) según la página 5 del Plan Estratégico:
 * "40 + 4 de reserva. Color recomendado: crema / verde suave. Colocación uniforme y espacio suficiente."
 */
export const MatGridSelector: React.FC<MatGridSelectorProps> = ({
  session,
  sessionReservations,
  selectedMats,
  partySize,
  onToggleMat,
  isStaffMode = false,
  onSelectOccupiedMat,
}) => {
  // Mapa de número de esterilla -> información de quién la ocupa
  const matOccupancyMap = new Map<
    number,
    { reservation: Reservation; guestName: string }
  >();

  sessionReservations
    .filter((r) => r.status !== 'waitlist')
    .forEach((res) => {
      res.matNumbers.forEach((matNum, index) => {
        const guestName =
          index === 0
            ? res.holderName
            : res.companions[index - 1]?.name || `Invitada de ${res.holderName.split(' ')[0]}`;
        matOccupancyMap.set(matNum, { reservation: res, guestName });
      });
    });

  const mainMats = Array.from({ length: session.maxCapacity }, (_, i) => i + 1); // 1..40
  const reserveMats = Array.from(
    { length: session.reserveMats },
    (_, i) => session.maxCapacity + i + 1
  ); // 41..44

  const occupiedMainCount = mainMats.filter((m) => matOccupancyMap.has(m)).length;
  const availableMainCount = session.maxCapacity - occupiedMainCount;

  const renderMatButton = (matNumber: number, isReserve = false) => {
    const occupied = matOccupancyMap.get(matNumber);
    const isSelected = selectedMats.includes(matNumber);
    const isAlternateTint = matNumber % 2 === 0; // Alterna crema y verde suave como en el PDF

    if (occupied) {
      const status = occupied.reservation.status;
      const firstName = occupied.guestName.split(' ')[0];
      return (
        <button
          key={matNumber}
          type="button"
          onClick={() => {
            if (onSelectOccupiedMat) {
              onSelectOccupiedMat(occupied.reservation);
            }
          }}
          title={`Esterilla #${matNumber} · Reservada a nombre de: ${occupied.guestName} (${occupied.reservation.code})`}
          className={`group relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-lg border transition-all duration-300 ${
            status === 'checked_in'
              ? 'bg-wellness-deep text-wellness-cream border-wellness-deep shadow-sm'
              : status === 'confirmada'
              ? 'bg-wellness-olive/90 text-wellness-cream border-wellness-olive'
              : 'bg-wellness-sand/85 text-wellness-deep border-wellness-olive/40'
          } ${onSelectOccupiedMat ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
        >
          <span className="text-[9px] font-semibold tracking-wider opacity-80">
            #{matNumber.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] font-medium truncate max-w-full px-0.5 leading-tight my-0.5">
            {firstName}
          </span>
          <span className="w-4 h-0.5 rounded-full bg-current opacity-40" />
        </button>
      );
    }

    if (isSelected) {
      return (
        <button
          key={matNumber}
          type="button"
          onClick={() => onToggleMat(matNumber)}
          className="relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-lg border-2 border-wellness-deep bg-wellness-olive text-wellness-cream shadow-md scale-105 transition-all duration-300"
        >
          <span className="text-[9px] font-bold tracking-wider">
            #{matNumber.toString().padStart(2, '0')}
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 my-0.5 text-wellness-cream" />
          <span className="text-[8px] uppercase tracking-widest font-semibold">
            Tu plaza
          </span>
        </button>
      );
    }

    return (
      <button
        key={matNumber}
        type="button"
        onClick={() => onToggleMat(matNumber)}
        className={`group relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-lg border transition-all duration-300 hover:border-wellness-olive hover:shadow-sm hover:-translate-y-0.5 ${
          isReserve
            ? 'bg-wellness-sand/30 border-dashed border-wellness-olive/50 text-wellness-deep'
            : isAlternateTint
            ? 'bg-wellness-pale/85 border-wellness-sage/50 text-wellness-deep'
            : 'bg-wellness-cream border-wellness-sage/50 text-wellness-deep'
        }`}
      >
        <span className="text-[9px] font-semibold tracking-wider text-wellness-olive">
          #{matNumber.toString().padStart(2, '0')}
        </span>
        <span className="text-[9px] text-wellness-deep/60 group-hover:text-wellness-deep font-serif italic my-0.5">
          Libre
        </span>
        <span className="w-4 h-0.5 rounded-full bg-wellness-sage/60 group-hover:bg-wellness-olive" />
      </button>
    );
  };

  return (
    <div className="rounded-2xl bg-wellness-pale/55 border border-wellness-sage/40 p-4 sm:p-6">
      {/* Cabecera del Mapa del Parque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-wellness-sage/30">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-wellness-olive font-semibold block">
            04 · OPERACIONES · DISPOSICIÓN EN EL PARQUE
          </span>
          <h4 className="font-serif text-xl sm:text-2xl font-semibold text-wellness-deep">
            Mapa de las 40 Esterillas{' '}
            <span className="text-base font-normal text-wellness-olive italic">
              (Crema &amp; Verde Suave)
            </span>
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs bg-wellness-cream px-3.5 py-2 rounded-full border border-wellness-sage/40">
          <Sparkles className="w-3.5 h-3.5 text-wellness-olive" />
          <span>
            <strong className="text-wellness-deep">{availableMainCount}</strong> libres de{' '}
            {session.maxCapacity}
          </span>
        </div>
      </div>

      {/* Referencia de Escenario: Profesora + Estación Móvil de Brunch */}
      <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
        <div className="sm:col-span-2 py-2 px-4 rounded-xl bg-wellness-cream/90 border border-wellness-sage/50 flex items-center justify-center gap-2 text-xs text-wellness-deep">
          <span className="w-2 h-2 rounded-full bg-wellness-olive animate-ping" />
          <span className="uppercase tracking-[0.16em] font-semibold text-[11px]">
            TARIMA CENTRAL · PROFESORA YOGA / PILATES
          </span>
        </div>
        <div className="py-2 px-4 rounded-xl bg-wellness-olive text-wellness-cream flex items-center justify-center gap-2 text-xs">
          <span className="uppercase tracking-[0.14em] font-medium text-[10px]">
            CARRITO · ESTACIÓN BRUNCH
          </span>
        </div>
      </div>

      {/* Cuadrícula de 40 esterillas (8 columnas x 5 filas) */}
      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 my-3">
        {mainMats.map((matNumber) => renderMatButton(matNumber, false))}
      </div>

      {/* Fila adicional de 4 esterillas de reserva (solo interactivas en modo Staff o cuando se agotan las 40) */}
      {(isStaffMode || availableMainCount === 0) && (
        <div className="mt-4 pt-3 border-t border-dashed border-wellness-sage/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.15em] text-wellness-olive font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              + 4 Esterillas de Reserva Operativa (#41 – #44)
            </span>
            <span className="text-[11px] text-wellness-deep/70">
              Para imprevistos o grupos de última hora
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {reserveMats.map((matNumber) => renderMatButton(matNumber, true))}
          </div>
        </div>
      )}

      {/* Leyenda de colores */}
      <div className="mt-4 pt-3 border-t border-wellness-sage/30 flex flex-wrap items-center justify-between gap-3 text-[11px] text-wellness-deep/80">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-wellness-cream border border-wellness-sage" />
            Libre (Crema / Sage)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-wellness-olive" />
            Tu Selección ({selectedMats.length}/{partySize})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-wellness-sand border border-wellness-olive/40" />
            Pendiente pago
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-wellness-olive/90" />
            Confirmada
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-wellness-deep" />
            En el parque (Check-in)
          </span>
        </div>
        <span className="text-[11px] text-wellness-olive italic font-serif">
          Pulsa sobre una esterilla libre para elegir tu lugar a tu nombre
        </span>
      </div>
    </div>
  );
};
