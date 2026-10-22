import React from 'react';
import { Reservation, WellnessSession } from '../types/wellness';
import { BrandLogo } from './BrandLogo';
import { downloadInvitationCardPNG } from '../utils/invitationCanvas';
import { buildGuestToClubWhatsAppUrl } from '../utils/whatsapp';
import {
  Download,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Coffee,
  Users,
  X,
  Printer,
} from 'lucide-react';

interface InvitationPassCardProps {
  reservation: Reservation;
  session: WellnessSession;
  onClose?: () => void;
  compact?: boolean;
}

export const InvitationPassCard: React.FC<InvitationPassCardProps> = ({
  reservation,
  session,
  onClose,
  compact = false,
}) => {
  const statusConfig = {
    checked_in: {
      label: 'EN EL PARQUE · CHECK-IN VALIDADO',
      bg: 'bg-wellness-deep text-wellness-cream',
      icon: CheckCircle2,
    },
    confirmada: {
      label: 'PLAZA CONFIRMADA POR WELLNESS CLUB',
      bg: 'bg-wellness-olive text-wellness-cream',
      icon: CheckCircle2,
    },
    pendiente: {
      label: 'PENDIENTE DE VALIDACIÓN HUMANA (WHATSAPP)',
      bg: 'bg-wellness-sand text-wellness-deep',
      icon: Clock,
    },
    waitlist: {
      label: 'LISTA DE PRIORIDAD 2028',
      bg: 'bg-wellness-pale text-wellness-deep border border-wellness-olive/30',
      icon: Sparkles,
    },
  }[reservation.status];

  const StatusIcon = statusConfig.icon;
  const whatsappUrl = buildGuestToClubWhatsAppUrl(reservation, session);

  return (
    <div className="relative signature-card-cream paper-texture overflow-hidden shadow-xl max-w-xl mx-auto p-6 sm:p-8 border border-wellness-sage/50">
      {onClose && (
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 w-8 h-8 rounded-full bg-wellness-pale/80 hover:bg-wellness-olive hover:text-wellness-cream flex items-center justify-center transition-colors text-wellness-deep"
          aria-label="Cerrar invitación"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Cabecera de Papelería Fina */}
      <div className="flex flex-col items-center text-center pb-5 border-b border-wellness-sage/35">
        <BrandLogo size={compact ? 'sm' : 'md'} />
        <span className="mt-3 text-[10px] uppercase tracking-[0.22em] text-wellness-olive font-semibold">
          INVITACIÓN PERSONAL NOMINAL · MALABO 2027
        </span>
      </div>

      {/* Estado de la Reserva */}
      <div className="my-4 flex justify-center">
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.14em] uppercase ${statusConfig.bg}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.label}
        </span>
      </div>

      {/* Bloque Principal: Nombre de la Invitada Titular */}
      <div className="bg-wellness-pale/85 rounded-2xl p-5 text-center border border-wellness-sage/30 my-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-wellness-olive font-semibold block mb-1">
          RESERVA A NOMBRE DE
        </span>
        <h3 className="font-serif text-3xl sm:text-4xl font-bold text-wellness-deep leading-tight">
          {reservation.holderName}
        </h3>

        {reservation.companions.length > 0 ? (
          <div className="mt-3 pt-2.5 border-t border-wellness-sage/30 text-xs text-wellness-deep/85 flex flex-wrap items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-wellness-olive" />
            <span className="font-medium text-wellness-olive">Acompañantes en lista:</span>
            {reservation.companions.map((c, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full bg-wellness-cream text-wellness-deep font-medium border border-wellness-sage/40"
              >
                {c.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1.5 font-serif italic text-wellness-olive text-base">
            “Regálate unas horas para ti.”
          </p>
        )}
      </div>

      {/* Datos de la Sesión y Esterilla */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 text-xs">
        <div className="bg-white/90 rounded-xl p-3.5 border border-wellness-sage/30">
          <span className="text-[10px] uppercase tracking-[0.16em] text-wellness-olive font-semibold block mb-1">
            EXPERIENCIA ELEGIDA
          </span>
          <p className="font-serif text-lg font-bold text-wellness-deep">
            {session.number} · {session.title}
          </p>
          <p className="text-wellness-deep/80 flex items-center gap-1.5 mt-1">
            <Calendar className="w-3.5 h-3.5 text-wellness-olive shrink-0" />
            {session.dateLabel} ({session.timeLabel})
          </p>
          <p className="text-wellness-deep/75 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-wellness-olive shrink-0" />
            {session.location}
          </p>
        </div>

        <div className="bg-white/90 rounded-xl p-3.5 border border-wellness-sage/30 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.16em] text-wellness-olive font-semibold block mb-1">
              UBICACIÓN &amp; BRUNCH
            </span>
            <p className="font-serif text-xl font-bold text-wellness-deep">
              {reservation.matNumbers.length > 0
                ? `Esterilla(s) #${reservation.matNumbers.join(', #')}`
                : 'Lista Prioritaria 2028'}
            </p>
            <p className="text-wellness-deep/80 flex items-center gap-1.5 mt-1">
              <Coffee className="w-3.5 h-3.5 text-wellness-olive shrink-0" />
              {reservation.drinkPreference} · {reservation.foodPreference}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-wellness-pale flex items-center justify-between text-[11px]">
            <span className="text-wellness-olive font-medium">Código en puerta:</span>
            <span className="font-mono font-bold text-wellness-deep bg-wellness-pale px-2 py-0.5 rounded">
              {reservation.code}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones del Pase Digital */}
      <div className="no-print mt-5 pt-4 border-t border-wellness-sage/35 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => downloadInvitationCardPNG(reservation, session)}
          className="w-full sm:w-auto flex-1 btn-wellness py-3 px-4 flex items-center justify-center gap-2 text-xs"
        >
          <Download className="w-4 h-4" />
          Guardar Invitación (PNG)
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex-1 py-3 px-4 rounded-full bg-wellness-deep text-wellness-cream hover:bg-wellness-olive transition-colors text-xs font-semibold uppercase tracking-[0.12em] flex items-center justify-center gap-2 text-center"
        >
          <MessageCircle className="w-4 h-4" />
          Confirmar por WhatsApp
        </a>

        <button
          type="button"
          onClick={() => window.print()}
          title="Imprimir o guardar como PDF"
          className="p-3 rounded-full border border-wellness-sage/60 text-wellness-deep hover:bg-wellness-pale transition-colors"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-4 text-center font-serif italic text-sm text-wellness-olive">
        “Queremos que la marca se sienta como una invitación, nunca como una obligación.”
      </p>
    </div>
  );
};
