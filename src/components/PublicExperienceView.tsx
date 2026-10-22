import React, { useState, useMemo, useEffect } from 'react';
import {
  Reservation,
  WellnessSession,
  SessionId,
  DrinkPreference,
  FoodPreference,
  PaymentMethod,
} from '../types/wellness';
import { BRAND_PILLARS, EXPERIENCE_JOURNEY } from '../data/initialData';
import { MatGridSelector } from './MatGridSelector';
import { InvitationPassCard } from './InvitationPassCard';
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Coffee,
  Phone,
  UserCheck,
  HeartHandshake,
  Clock,
  Eye,
} from 'lucide-react';

interface PublicExperienceViewProps {
  sessions: WellnessSession[];
  reservations: Reservation[];
  selectedSessionId: SessionId;
  onSelectSession: (id: SessionId) => void;
  onCreateReservation: (newRes: Omit<Reservation, 'id' | 'code' | 'createdAt'>) => Reservation;
}

const DRINK_OPTIONS: DrinkPreference[] = [
  'Matcha Latte',
  'Smoothie Tropical',
  'Café de Especialidad',
  'Limonada Botánica',
];

const FOOD_OPTIONS: FoodPreference[] = [
  'Yogur & Granola Artesanal',
  'Mini Croissant & Fruta',
  'Bagel Vegetariano',
  'Sin preferencia',
];

const PAYMENT_OPTIONS: PaymentMethod[] = [
  'Muni Dinero / Móvil',
  'Efectivo (XAF)',
  'Transferencia Local',
  'Por definir en WhatsApp',
];

export const PublicExperienceView: React.FC<PublicExperienceViewProps> = ({
  sessions,
  reservations,
  selectedSessionId,
  onSelectSession,
  onCreateReservation,
}) => {
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || sessions[0],
    [sessions, selectedSessionId]
  );

  const sessionReservations = useMemo(
    () => reservations.filter((r) => r.sessionId === activeSession.id),
    [reservations, activeSession.id]
  );

  // Esterillas ocupadas en la sesión activa
  const occupiedMats = useMemo(() => {
    const set = new Set<number>();
    sessionReservations
      .filter((r) => r.status !== 'waitlist')
      .forEach((r) => r.matNumbers.forEach((m) => set.add(m)));
    return set;
  }, [sessionReservations]);

  const availableMatsList = useMemo(() => {
    const list: number[] = [];
    for (let i = 1; i <= activeSession.maxCapacity; i++) {
      if (!occupiedMats.has(i)) list.push(i);
    }
    return list;
  }, [activeSession.maxCapacity, occupiedMats]);

  const isSessionFull = availableMatsList.length === 0;

  // Estado del formulario de reserva nominal
  const [holderName, setHolderName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+240 222 ');
  const [partySize, setPartySize] = useState<number>(1);
  const [companionNames, setCompanionNames] = useState<string[]>(['', '', '']);
  const [selectedMats, setSelectedMats] = useState<number[]>([]);
  const [drinkPreference, setDrinkPreference] = useState<DrinkPreference>('Matcha Latte');
  const [foodPreference, setFoodPreference] = useState<FoodPreference>(
    'Yogur & Granola Artesanal'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Muni Dinero / Móvil');
  const [notes, setNotes] = useState('');
  const [forceWaitlistMode, setForceWaitlistMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Pase de invitación recién creado o consultado en el buscador
  const [createdPass, setCreatedPass] = useState<Reservation | null>(null);
  const [lookupQuery, setLookupQuery] = useState('');
  const [selectedLookupPass, setSelectedLookupPass] = useState<Reservation | null>(null);

  // Auto-asignar primeras esterillas libres cuando cambia la sesión o el número de plazas
  useEffect(() => {
    if (isSessionFull || forceWaitlistMode) {
      setSelectedMats([]);
      return;
    }
    const autoMats = availableMatsList.slice(0, partySize);
    setSelectedMats(autoMats);
  }, [activeSession.id, partySize, isSessionFull, forceWaitlistMode, availableMatsList.length]);

  const handleToggleMat = (matNumber: number) => {
    if (occupiedMats.has(matNumber)) return;
    if (selectedMats.includes(matNumber)) {
      if (selectedMats.length > 1) {
        setSelectedMats(selectedMats.filter((m) => m !== matNumber));
      }
      return;
    }
    if (selectedMats.length < partySize) {
      setSelectedMats([...selectedMats, matNumber].sort((a, b) => a - b));
    } else {
      // Reemplaza la última esterilla seleccionada para mantener el mismo partySize
      const updated = [...selectedMats.slice(0, partySize - 1), matNumber].sort(
        (a, b) => a - b
      );
      setSelectedMats(updated);
    }
  };

  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedHolder = holderName.trim();
    if (trimmedHolder.length < 3) {
      setFormError('Por favor, escribe el nombre y apellido a nombre de quién queda la reserva.');
      return;
    }

    const trimmedPhone = whatsapp.trim();
    if (trimmedPhone.replace(/\D/g, '').length < 6) {
      setFormError('Por favor, indica un número de WhatsApp válido para confirmar tu plaza.');
      return;
    }

    const effectiveWaitlist = isSessionFull || forceWaitlistMode;
    const finalMats = effectiveWaitlist
      ? []
      : selectedMats.length === partySize
      ? selectedMats
      : availableMatsList.slice(0, partySize);

    const companions = Array.from({ length: partySize - 1 }, (_, idx) => ({
      name:
        companionNames[idx]?.trim() ||
        `Acompañante ${idx + 1} (${trimmedHolder.split(' ')[0]})`,
      matNumber: finalMats[idx + 1],
      drink: drinkPreference,
    }));

    const newRes = onCreateReservation({
      holderName: trimmedHolder,
      whatsapp: trimmedPhone,
      sessionId: activeSession.id,
      partySize,
      companions,
      matNumbers: finalMats,
      drinkPreference,
      foodPreference,
      paymentMethod,
      status: effectiveWaitlist ? 'waitlist' : 'pendiente',
      notes: notes.trim() || undefined,
    });

    setCreatedPass(newRes);
    setHolderName('');
    setNotes('');
    setCompanionNames(['', '', '']);
  };

  // Resultados del buscador "¿Estoy en la lista?"
  const filteredGuestList = useMemo(() => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) {
      return sessionReservations.slice(0, 8);
    }
    return reservations.filter((r) => {
      const matchHolder = r.holderName.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchCompanion = r.companions.some((c) => c.name.toLowerCase().includes(q));
      return matchHolder || matchCode || matchCompanion;
    });
  }, [lookupQuery, reservations, sessionReservations]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO EDITORIAL (Réplica exacta de la página 9 del Brand Book: "08 · EXPERIENCIA DIGITAL") */}
      <section id="inicio" className="pt-4 sm:pt-8">
        <div className="rounded-3xl bg-white/90 border border-wellness-sage/35 p-5 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Columna Izquierda en Pale Sage (#E9EBDD) */}
            <div className="lg:col-span-7 rounded-2xl bg-wellness-pale p-7 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wellness-cream text-wellness-deep text-[10px] font-semibold tracking-[0.2em] uppercase mb-6 border border-wellness-sage/40">
                  <span>MALABO · GUINEA ECUATORIAL · DICIEMBRE 2027</span>
                </div>

                <h1 className="font-serif font-bold text-5xl sm:text-6xl md:text-7xl text-wellness-deep leading-[0.98] tracking-tight">
                  MOVE.
                  <br />
                  CONNECT.
                  <br />
                  ENJOY.
                </h1>

                <p className="mt-6 text-base sm:text-lg text-wellness-deep/85 font-medium tracking-wide">
                  Yoga · Pilates · Brunch
                </p>
                <p className="mt-2 text-sm text-wellness-deep/75 max-w-md leading-relaxed">
                  Nace de una necesidad sencilla: tener un lugar donde podamos parar,
                  respirar, movernos y compartir. Una experiencia cercana, social y llena
                  de identidad.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-wellness-sage/30 flex flex-wrap items-center gap-4">
                <a
                  href="#reservar"
                  className="btn-wellness px-8 py-4 inline-flex items-center gap-3 shadow-sm"
                >
                  <span>RESERVAR</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#mi-reserva"
                  className="px-6 py-3.5 rounded-full border border-wellness-olive/50 text-wellness-deep hover:bg-wellness-cream transition-colors text-xs font-semibold uppercase tracking-[0.14em]"
                >
                  ¿Estoy en la lista?
                </a>
              </div>
            </div>

            {/* Columna Derecha en Soft Sage (#A9AD8D) con composición orgánica y el círculo Warm Cream del PDF */}
            <div className="lg:col-span-5 rounded-2xl bg-wellness-sage relative overflow-hidden p-7 sm:p-10 flex flex-col justify-between min-h-[320px] text-wellness-deep">
              {/* Arco fino y sol en Warm Cream como en la página 9 del Brand Book */}
              <div className="absolute -top-12 -left-12 w-96 h-96 rounded-full border border-wellness-cream/45 pointer-events-none" />
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-wellness-cream shadow-inner ml-auto animate-breath flex flex-col items-center justify-center text-center p-3">
                <span className="text-[9px] uppercase tracking-[0.2em] text-wellness-olive font-semibold">
                  AFORO CUIDADO
                </span>
                <span className="font-serif text-3xl font-bold text-wellness-deep leading-none mt-1">
                  40
                </span>
                <span className="text-[10px] text-wellness-olive font-medium">
                  Esterillas máx.
                </span>
              </div>

              <div className="relative z-10 mt-auto bg-wellness-cream/95 backdrop-blur-sm rounded-2xl p-5 border border-wellness-pale shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.2em] text-wellness-olive font-semibold block">
                  PRIMER LANZAMIENTO · 3 SESIONES
                </span>
                <p className="font-serif text-2xl font-bold text-wellness-deep mt-1">
                  “No somos solamente una clase. Somos una experiencia.”
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-wellness-pale text-[10px] font-semibold tracking-wider uppercase text-wellness-deep">
                    MOVIMIENTO
                  </span>
                  <span className="px-3 py-1 rounded-full bg-wellness-sand/80 text-[10px] font-semibold tracking-wider uppercase text-wellness-deep">
                    BRUNCH
                  </span>
                  <span className="px-3 py-1 rounded-full bg-wellness-pale text-[10px] font-semibold tracking-wider uppercase text-wellness-deep">
                    COMUNIDAD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LOS 4 PILARES DE IDENTIDAD + RECORRIDO DE LA EXPERIENCIA */}
      <section id="experiencia" className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-wellness-sage/35 pb-5">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-wellness-olive font-semibold">
              04 · PILARES &amp; RECORRIDO
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-wellness-deep mt-1">
              Así se vive la experiencia
            </h2>
          </div>
          <p className="font-serif italic text-xl text-wellness-olive">
            Mueve. Conecta. Disfruta.
          </p>
        </div>

        {/* 4 Pilares: MOVE, NOURISH, CONNECT, GROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BRAND_PILLARS.map((pillar) => (
            <div key={pillar.number} className="signature-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-wellness-olive tracking-widest">
                  {pillar.number}
                </span>
                <h3 className="font-serif text-2xl font-bold text-wellness-deep mt-3">
                  {pillar.title}
                </h3>
                <p className="text-sm font-medium text-wellness-deep mt-1">
                  {pillar.description}
                </p>
              </div>
              <p className="text-xs text-wellness-deep/70 mt-4 pt-3 border-t border-wellness-pale leading-relaxed">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Los 5 momentos de la mañana (Pág. 4 del Plan Estratégico) */}
        <div className="rounded-2xl bg-wellness-pale/60 border border-wellness-sage/35 p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {EXPERIENCE_JOURNEY.map((item) => (
              <div key={item.step} className="flex flex-col items-start">
                <div className="w-11 h-11 rounded-full bg-wellness-cream border border-wellness-sage/50 flex items-center justify-center font-serif font-bold text-base text-wellness-deep shadow-sm">
                  {item.step}
                </div>
                <span className="mt-3 text-[10px] font-semibold tracking-[0.18em] text-wellness-olive uppercase">
                  {item.time}
                </span>
                <h4 className="font-serif text-lg font-bold text-wellness-deep mt-0.5">
                  {item.title}
                </h4>
                <p className="text-xs text-wellness-deep/75 mt-0.5">{item.subtitle}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-wellness-sage/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="uppercase tracking-[0.18em] text-wellness-olive font-semibold">
              OBJETIVO DE CADA SESIÓN
            </span>
            <span className="font-serif italic text-lg text-wellness-deep font-semibold">
              Que cada asistente se vaya pensando: “Quiero volver”.
            </span>
          </div>
        </div>
      </section>

      {/* 3. FLUJO DE RESERVA A NOMBRE DE ALGUIEN (Pág. 10 del Brand Book + Pág. 7 del Plan Estratégico) */}
      <section id="reservar" className="space-y-10 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-wellness-sage/35 pb-5">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-wellness-olive font-semibold">
              09 · WEB + CONVERSIÓN · LISTA NOMINAL
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-wellness-deep mt-1">
              La reserva debe sentirse fácil
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-wellness-deep/80 max-w-md">
            Formulario corto a tu nombre + WhatsApp + confirmación humana. Selecciona tu
            sesión y tu esterilla en el parque.
          </p>
        </div>

        {/* Los 4 pasos visuales del Brand Book (01 ELIGE · 02 RESERVA · 03 PAGA · 04 CONFIRMA) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: '01', title: 'ELIGE', desc: 'Experiencia + fecha + esterilla' },
            { num: '02', title: 'RESERVA', desc: 'A tu nombre + WhatsApp' },
            { num: '03', title: 'PAGA', desc: 'Método local disponible' },
            { num: '04', title: 'CONFIRMA', desc: 'Wellness Club valida tu plaza' },
          ].map((step) => (
            <div
              key={step.num}
              className="rounded-2xl bg-wellness-pale/50 border border-wellness-sage/30 p-4 flex items-center gap-3.5"
            >
              <div className="w-11 h-11 shrink-0 rounded-full bg-wellness-pale border border-wellness-sage/60 flex items-center justify-center font-serif font-bold text-wellness-deep">
                {step.num}
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-wellness-deep leading-none">
                  {step.title}
                </h4>
                <p className="text-xs text-wellness-deep/75 mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Selector de las 3 Sesiones de Diciembre 2027 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sessions.map((session) => {
            const isSelected = session.id === activeSession.id;
            const sessionRes = reservations.filter(
              (r) => r.sessionId === session.id && r.status !== 'waitlist'
            );
            const occupied = sessionRes.reduce((acc, r) => acc + r.partySize, 0);
            const remaining = Math.max(0, session.maxCapacity - occupied);
            const percent = Math.min(100, Math.round((occupied / session.maxCapacity) * 100));

            return (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  onSelectSession(session.id);
                  setCreatedPass(null);
                }}
                className={`text-left signature-card p-6 transition-all relative ${
                  isSelected
                    ? 'ring-2 ring-wellness-deep bg-white shadow-md'
                    : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-wellness-olive">
                    <span className="w-2.5 h-2.5 rounded-full bg-wellness-olive" />
                    {session.number}
                  </span>
                  <span className="text-xs font-semibold text-wellness-deep bg-wellness-pale px-2.5 py-0.5 rounded-full">
                    {session.priceXAF.toLocaleString('es-GQ')} XAF
                  </span>
                </div>

                <h3 className="font-serif text-3xl font-bold text-wellness-deep mt-2">
                  {session.title}
                </h3>
                <p className="text-xs text-wellness-olive font-medium mt-0.5">
                  {session.subtitle}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-wellness-deep/80">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-wellness-olive shrink-0" />
                    <span>{session.dateLabel}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-wellness-olive shrink-0" />
                    <span>{session.timeLabel}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-wellness-olive shrink-0" />
                    <span className="truncate">{session.location}</span>
                  </p>
                </div>

                {/* Barra de ocupación de las 40 esterillas */}
                <div className="mt-5 pt-4 border-t border-wellness-pale">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-medium text-wellness-deep">
                      {occupied} / {session.maxCapacity} esterillas reservadas
                    </span>
                    <span className="font-bold text-wellness-olive">
                      {remaining > 0 ? `${remaining} libres` : 'Completa (Waitlist)'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-wellness-pale overflow-hidden">
                    <div
                      className="h-full bg-wellness-olive rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Contenedor Principal: Mapa de Esterillas + Formulario de Reserva Nominal */}
        {createdPass ? (
          <div className="py-6 space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-wellness-olive text-wellness-cream text-[10px] uppercase tracking-[0.18em] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Solicitud Registrada en la Lista
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-wellness-deep mt-2">
                ¡Gracias, {createdPass.holderName.split(' ')[0]}!
              </h3>
              <p className="text-xs sm:text-sm text-wellness-deep/80 mt-1">
                Aquí tienes tu Pase de Invitación Personal. Descárgalo en tu teléfono o
                pulsa en <strong>Confirmar por WhatsApp</strong> para finalizar la validación
                humana con nuestro equipo.
              </p>
            </div>

            <InvitationPassCard
              reservation={createdPass}
              session={activeSession}
              onClose={() => setCreatedPass(null)}
            />

            <div className="text-center">
              <button
                type="button"
                onClick={() => setCreatedPass(null)}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-wellness-olive hover:text-wellness-deep underline underline-offset-4"
              >
                + Realizar otra reserva a nombre de otra persona
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Izquierda (7 cols): Mapa Interactivo de las 40 Esterillas */}
            <div className="lg:col-span-7 space-y-4">
              <MatGridSelector
                session={activeSession}
                sessionReservations={sessionReservations}
                selectedMats={selectedMats}
                partySize={partySize}
                onToggleMat={handleToggleMat}
                onSelectOccupiedMat={(res) => setSelectedLookupPass(res)}
              />

              {/* Nota de Estación Móvil de Brunch (Pág. 5 Plan Estratégico) */}
              <div className="rounded-2xl bg-white/80 border border-wellness-sage/35 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-wellness-pale flex items-center justify-center text-wellness-olive shrink-0 mt-0.5">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-lg text-wellness-deep">
                      Estación Móvil de Brunch incluida en tu plaza
                    </h5>
                    <p className="text-xs text-wellness-deep/75">
                      Smoothies recién hechos, matcha latte, café, fruta fresca, yogur con
                      granola y mini croissants / bagels vegetarianos.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.16em] font-semibold px-3 py-1.5 rounded-full bg-wellness-pale text-wellness-deep shrink-0">
                  Incluido
                </span>
              </div>
            </div>

            {/* Derecha (5 cols): Formulario Corto a Nombre de Alguien */}
            <form
              onSubmit={handleSubmitReservation}
              className="lg:col-span-5 signature-card p-6 sm:p-8 space-y-5"
            >
              <div className="border-b border-wellness-pale pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-wellness-olive font-semibold block">
                    01 · RESERVA NOMINAL
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-wellness-deep">
                    Reserva tu experiencia
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-wellness-olive block">
                    {activeSession.number}
                  </span>
                  <span className="font-serif font-bold text-lg text-wellness-deep">
                    {activeSession.title}
                  </span>
                </div>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-wellness-sand/60 border border-wellness-deep/30 text-xs text-wellness-deep font-medium">
                  {formError}
                </div>
              )}

              {/* Selector de modo Lista de Prioridad 2028 si la usuaria quiere apuntarse a la lista de interesadas */}
              <div className="flex items-center justify-between bg-wellness-pale/60 px-3.5 py-2.5 rounded-xl border border-wellness-sage/30 text-xs">
                <span className="text-wellness-deep font-medium">
                  {isSessionFull
                    ? 'Sesión completa · Lista Prioritaria 2028 activa'
                    : '¿No puedes asistir en esta fecha?'}
                </span>
                {!isSessionFull && (
                  <button
                    type="button"
                    onClick={() => setForceWaitlistMode(!forceWaitlistMode)}
                    className="text-[11px] font-semibold text-wellness-olive hover:text-wellness-deep underline"
                  >
                    {forceWaitlistMode
                      ? 'Volver a reservar plaza'
                      : 'Unirme a Lista 2028'}
                  </button>
                )}
              </div>

              {/* Campo 1: A nombre de quién */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-wellness-deep mb-1.5">
                  A nombre de quién queda la reserva *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder="Ej. Elena Nchama Obiang"
                    className="w-full px-4 py-3 rounded-xl bg-wellness-cream border border-wellness-sage/60 focus:border-wellness-olive focus:outline-none text-sm text-wellness-deep placeholder:text-wellness-deep/40"
                  />
                </div>
              </div>

              {/* Campo 2: Teléfono / WhatsApp (+240) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-wellness-deep mb-1.5">
                  Teléfono / WhatsApp (Confirmación humana) *
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-wellness-olive absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+240 222 000 000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-wellness-cream border border-wellness-sage/60 focus:border-wellness-olive focus:outline-none text-sm text-wellness-deep"
                  />
                </div>
              </div>

              {/* Campo 3: Número de personas y nombres de acompañantes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-wellness-deep">
                    Número de personas
                  </label>
                  {!forceWaitlistMode && !isSessionFull && (
                    <span className="text-[11px] text-wellness-olive font-medium">
                      Esterilla(s):{' '}
                      <strong>
                        {selectedMats.length > 0
                          ? `#${selectedMats.join(', #')}`
                          : 'Auto'}
                      </strong>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPartySize(num)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        partySize === num
                          ? 'bg-wellness-olive text-wellness-cream border-wellness-olive shadow-sm'
                          : 'bg-wellness-cream text-wellness-deep border-wellness-sage/50 hover:bg-wellness-pale'
                      }`}
                    >
                      {num} {num === 1 ? 'Plaza' : 'Plazas'}
                    </button>
                  ))}
                </div>

                {/* Nombres opcionales de acompañantes para que aparezcan en la lista de puerta */}
                {partySize > 1 && (
                  <div className="mt-3 p-3.5 rounded-xl bg-wellness-pale/60 border border-wellness-sage/35 space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-wellness-olive font-semibold block">
                      Nombres de acompañantes (Para la lista de entrada)
                    </span>
                    {Array.from({ length: partySize - 1 }, (_, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={companionNames[idx] || ''}
                        onChange={(e) => {
                          const next = [...companionNames];
                          next[idx] = e.target.value;
                          setCompanionNames(next);
                        }}
                        placeholder={`Nombre de acompañante ${idx + 1} (Esterilla #${
                          selectedMats[idx + 1] || '...'
                        })`}
                        className="w-full px-3 py-2 rounded-lg bg-wellness-cream border border-wellness-sage/40 text-xs text-wellness-deep focus:outline-none focus:border-wellness-olive"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Campo 4: Pre-selección de Brunch (Para el carrito móvil y métricas de aprendizaje) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-wellness-olive mb-1">
                    Bebida de Brunch
                  </label>
                  <select
                    value={drinkPreference}
                    onChange={(e) =>
                      setDrinkPreference(e.target.value as DrinkPreference)
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-wellness-cream border border-wellness-sage/60 text-xs text-wellness-deep focus:outline-none focus:border-wellness-olive"
                  >
                    {DRINK_OPTIONS.map((drink) => (
                      <option key={drink} value={drink}>
                        {drink}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-wellness-olive mb-1">
                    Bocado / Bowl
                  </label>
                  <select
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value as FoodPreference)}
                    className="w-full px-3 py-2.5 rounded-xl bg-wellness-cream border border-wellness-sage/60 text-xs text-wellness-deep focus:outline-none focus:border-wellness-olive"
                  >
                    {FOOD_OPTIONS.map((food) => (
                      <option key={food} value={food}>
                        {food}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campo 5: Vía de pago local preferida (Pág. 7 Plan Estratégico) */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-wellness-olive mb-1">
                  03 · PAGO LOCAL PREFERIDO (Sin tarjeta bancaria)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_OPTIONS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`px-3 py-2 rounded-xl text-[11px] font-medium border text-left transition-all ${
                        paymentMethod === method
                          ? 'bg-wellness-deep text-wellness-cream border-wellness-deep'
                          : 'bg-wellness-cream text-wellness-deep border-wellness-sage/50 hover:bg-wellness-pale'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas opcionales */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nota opcional (alergias, primera vez en pilates, grupo...)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-wellness-cream border border-wellness-sage/40 text-xs text-wellness-deep placeholder:text-wellness-deep/45 focus:outline-none focus:border-wellness-olive"
                />
              </div>

              {/* Botón Principal del Brand Book */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-wellness py-4 px-6 flex items-center justify-center gap-2.5 shadow-md"
                >
                  <span>
                    {forceWaitlistMode || isSessionFull
                      ? 'UNIRME A LA LISTA DE PRIORIDAD 2028'
                      : 'RESERVA TU EXPERIENCIA'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-wellness-deep/70 mt-2.5">
                  Total estimado:{' '}
                  <strong className="text-wellness-deep">
                    {(activeSession.priceXAF * partySize).toLocaleString('es-GQ')} XAF
                  </strong>{' '}
                  · Recibirás tu invitación digital al instante.
                </p>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* 4. BUSCADOR PÚBLICO "¿ESTOY EN LA LISTA?" (Consulta de Reserva a Nombre de Alguien) */}
      <section id="mi-reserva" className="scroll-mt-24">
        <div className="rounded-3xl bg-wellness-pale/75 border border-wellness-sage/45 p-6 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.22em] text-wellness-olive font-semibold">
                LISTA DE RESERVAS NOMINAL · VERIFICACIÓN DE PLAZA
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-wellness-deep mt-1">
                ¿Estoy en la lista de reserva?
              </h2>
              <p className="text-xs sm:text-sm text-wellness-deep/80 mt-1">
                Busca tu nombre, el de tu acompañante o tu código (`WC-...`) para abrir y
                descargar tu Pase de Invitación Digital.
              </p>
            </div>

            {/* Buscador instantáneo */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-wellness-olive absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Buscar por nombre (ej. Elena, Gabriela...)"
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-wellness-cream border border-wellness-sage/70 text-xs sm:text-sm text-wellness-deep focus:outline-none focus:border-wellness-olive shadow-sm"
              />
            </div>
          </div>

          {/* Tarjeta modal si la usuaria seleccionó ver su invitación */}
          {selectedLookupPass && (
            <div className="py-4">
              <InvitationPassCard
                reservation={selectedLookupPass}
                session={
                  sessions.find((s) => s.id === selectedLookupPass.sessionId) ||
                  activeSession
                }
                onClose={() => setSelectedLookupPass(null)}
              />
            </div>
          )}

          {/* Lista de reservas registradas a nombre de las asistentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {filteredGuestList.map((res) => {
              const resSession =
                sessions.find((s) => s.id === res.sessionId) || activeSession;
              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedLookupPass(res)}
                  className="cursor-pointer group rounded-2xl bg-wellness-cream/95 hover:bg-white p-4 border border-wellness-sage/40 hover:border-wellness-olive transition-all flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="font-mono font-bold text-wellness-olive bg-wellness-pale px-2 py-0.5 rounded">
                        {res.code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          res.status === 'checked_in'
                            ? 'bg-wellness-deep text-wellness-cream'
                            : res.status === 'confirmada'
                            ? 'bg-wellness-olive text-wellness-cream'
                            : res.status === 'waitlist'
                            ? 'bg-wellness-pale text-wellness-deep'
                            : 'bg-wellness-sand text-wellness-deep'
                        }`}
                      >
                        {res.status === 'checked_in'
                          ? 'En el parque'
                          : res.status === 'confirmada'
                          ? 'Confirmada'
                          : res.status === 'waitlist'
                          ? 'Lista 2028'
                          : 'Pendiente'}
                      </span>
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.14em] text-wellness-olive mt-3">
                      A nombre de:
                    </p>
                    <h4 className="font-serif text-xl font-bold text-wellness-deep group-hover:text-wellness-olive transition-colors">
                      {res.holderName}
                    </h4>

                    {res.companions.length > 0 && (
                      <p className="text-[11px] text-wellness-deep/75 mt-1 truncate">
                        + {res.companions.map((c) => c.name).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-wellness-pale flex items-center justify-between text-[11px] text-wellness-deep/80">
                    <span>
                      {resSession.number} ·{' '}
                      <strong>
                        {res.matNumbers.length > 0
                          ? `Est. #${res.matNumbers.join(', #')}`
                          : 'Waitlist'}
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-wellness-olive font-semibold group-hover:translate-x-0.5 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                      Ver pase
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
