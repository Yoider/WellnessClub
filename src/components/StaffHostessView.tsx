import React, { useState, useMemo } from 'react';
import {
  Reservation,
  ReservationStatus,
  WellnessSession,
  SessionId,
  ChecklistItem,
  DrinkPreference,
  FoodPreference,
  PaymentMethod,
} from '../types/wellness';
import { MatGridSelector } from './MatGridSelector';
import { InvitationPassCard } from './InvitationPassCard';
import { buildStaffToGuestWhatsAppUrl } from '../utils/whatsapp';
import {
  Search,
  CheckCircle2,
  Clock,
  Users,
  MessageCircle,
  Plus,
  Coffee,
  ClipboardCheck,
  BarChart3,
  LayoutGrid,
  Sparkles,
  Trash2,
  Eye,
  RotateCcw,
  UserCheck,
  Filter,
  Download,
} from 'lucide-react';

interface StaffHostessViewProps {
  sessions: WellnessSession[];
  reservations: Reservation[];
  selectedSessionId: SessionId;
  onSelectSession: (id: SessionId) => void;
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onToggleWelcomeDrink: (id: string) => void;
  onDeleteReservation: (id: string) => void;
  onCreateReservation: (newRes: Omit<Reservation, 'id' | 'code' | 'createdAt'>) => Reservation;
  checklist: ChecklistItem[];
  onToggleChecklist: (id: string) => void;
  onResetDemoData: () => void;
}

export const StaffHostessView: React.FC<StaffHostessViewProps> = ({
  sessions,
  reservations,
  selectedSessionId,
  onSelectSession,
  onUpdateStatus,
  onToggleWelcomeDrink,
  onDeleteReservation,
  onCreateReservation,
  checklist,
  onToggleChecklist,
  onResetDemoData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'guestlist' | 'matmap' | 'metrics' | 'checklist'
  >('guestlist');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [sessionFilter, setSessionFilter] = useState<SessionId | 'all'>(selectedSessionId);
  const [inspectedPass, setInspectedPass] = useState<Reservation | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Estado del formulario de Alta Rápida para la Anfitriona
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('+240 222 ');
  const [quickPartySize, setQuickPartySize] = useState(1);
  const [quickCompanion, setQuickCompanion] = useState('');
  const [quickDrink, setQuickDrink] = useState<DrinkPreference>('Matcha Latte');
  const [quickFood, setQuickFood] = useState<FoodPreference>('Yogur & Granola Artesanal');
  const [quickPayment, setQuickPayment] = useState<PaymentMethod>('Efectivo (XAF)');
  const [quickStatus, setQuickStatus] = useState<ReservationStatus>('confirmada');
  const [useReserveMats, setUseReserveMats] = useState(false);

  // Coste estimado por asistente para la calculadora de rentabilidad (Pág. 8 Plan Estratégico)
  const [costPerGuestXAF, setCostPerGuestXAF] = useState<number>(6500);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || sessions[0],
    [sessions, selectedSessionId]
  );

  // Reservas filtradas para la tabla nominal
  const filteredReservations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reservations
      .filter((r) => (sessionFilter === 'all' ? true : r.sessionId === sessionFilter))
      .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
      .filter((r) => {
        if (!q) return true;
        const inHolder = r.holderName.toLowerCase().includes(q);
        const inCode = r.code.toLowerCase().includes(q);
        const inPhone = r.whatsapp.toLowerCase().includes(q);
        const inCompanions = r.companions.some((c) => c.name.toLowerCase().includes(q));
        return inHolder || inCode || inPhone || inCompanions;
      })
      .sort((a, b) => a.holderName.localeCompare(b.holderName));
  }, [reservations, sessionFilter, statusFilter, searchQuery]);

  // Métricas de la sesión seleccionada
  const sessionReservations = useMemo(
    () => reservations.filter((r) => r.sessionId === activeSession.id),
    [reservations, activeSession.id]
  );

  const sessionStats = useMemo(() => {
    const active = sessionReservations.filter((r) => r.status !== 'waitlist');
    const totalSeats = active.reduce((acc, r) => acc + r.partySize, 0);
    const checkedInSeats = active
      .filter((r) => r.status === 'checked_in')
      .reduce((acc, r) => acc + r.partySize, 0);
    const confirmedSeats = active
      .filter((r) => r.status === 'confirmada' || r.status === 'checked_in')
      .reduce((acc, r) => acc + r.partySize, 0);
    const pendingSeats = active
      .filter((r) => r.status === 'pendiente')
      .reduce((acc, r) => acc + r.partySize, 0);
    const waitlistCount = sessionReservations
      .filter((r) => r.status === 'waitlist')
      .reduce((acc, r) => acc + r.partySize, 0);

    return {
      totalSeats,
      checkedInSeats,
      confirmedSeats,
      pendingSeats,
      waitlistCount,
      remainingMats: Math.max(0, activeSession.maxCapacity - totalSeats),
    };
  }, [sessionReservations, activeSession.maxCapacity]);

  // Desglose de Brunch para el Carrito Móvil (Tú + tu madre)
  const brunchBreakdown = useMemo(() => {
    const drinks: Record<string, number> = {
      'Matcha Latte': 0,
      'Smoothie Tropical': 0,
      'Café de Especialidad': 0,
      'Limonada Botánica': 0,
    };
    const foods: Record<string, number> = {
      'Yogur & Granola Artesanal': 0,
      'Mini Croissant & Fruta': 0,
      'Bagel Vegetariano': 0,
      'Sin preferencia': 0,
    };

    const targetList =
      sessionFilter === 'all'
        ? reservations.filter((r) => r.status !== 'waitlist')
        : sessionReservations.filter((r) => r.status !== 'waitlist');

    targetList.forEach((r) => {
      drinks[r.drinkPreference] = (drinks[r.drinkPreference] || 0) + r.partySize;
      foods[r.foodPreference] = (foods[r.foodPreference] || 0) + r.partySize;
    });

    return { drinks, foods };
  }, [reservations, sessionReservations, sessionFilter]);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const occupiedSet = new Set<number>();
    sessionReservations
      .filter((r) => r.status !== 'waitlist')
      .forEach((r) => r.matNumbers.forEach((m) => occupiedSet.add(m)));

    const startMat = useReserveMats ? activeSession.maxCapacity + 1 : 1;
    const endMat = useReserveMats
      ? activeSession.maxCapacity + activeSession.reserveMats
      : activeSession.maxCapacity;

    const assignedMats: number[] = [];
    for (let m = startMat; m <= endMat; m++) {
      if (!occupiedSet.has(m) && assignedMats.length < quickPartySize) {
        assignedMats.push(m);
      }
    }

    const companions =
      quickPartySize > 1
        ? Array.from({ length: quickPartySize - 1 }, (_, i) => ({
            name:
              i === 0 && quickCompanion.trim()
                ? quickCompanion.trim()
                : `Acompañante ${i + 1} (${quickName.trim().split(' ')[0]})`,
            matNumber: assignedMats[i + 1],
            drink: quickDrink,
          }))
        : [];

    onCreateReservation({
      holderName: quickName.trim(),
      whatsapp: quickPhone.trim(),
      sessionId: activeSession.id,
      partySize: quickPartySize,
      companions,
      matNumbers: quickStatus === 'waitlist' ? [] : assignedMats,
      drinkPreference: quickDrink,
      foodPreference: quickFood,
      paymentMethod: quickPayment,
      status: quickStatus,
      notes: useReserveMats ? 'Asignada en esterilla de reserva (#41-#44)' : undefined,
    });

    setQuickName('');
    setQuickCompanion('');
    setShowQuickAdd(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'Codigo',
      'Reserva a Nombre de',
      'Acompanantes',
      'WhatsApp',
      'Sesion',
      'Plazas',
      'Esterillas',
      'Bebida Brunch',
      'Comida Brunch',
      'Metodo Pago',
      'Estado',
    ];
    const rows = filteredReservations.map((r) => [
      r.code,
      `"${r.holderName}"`,
      `"${r.companions.map((c) => c.name).join(' / ')}"`,
      `"${r.whatsapp}"`,
      r.sessionId,
      r.partySize,
      `"${r.matNumbers.join(', ')}"`,
      `"${r.drinkPreference}"`,
      `"${r.foodPreference}"`,
      `"${r.paymentMethod}"`,
      r.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lista-reservas-wellness-club-${sessionFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20 pt-4">
      {/* Cabecera de Gestión & Check-in */}
      <div className="rounded-3xl bg-wellness-deep text-wellness-cream p-6 sm:p-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wellness-olive text-wellness-cream text-[10px] font-semibold uppercase tracking-[0.2em]">
              <span>05 · ORGANIZACIÓN &amp; CONTROL DE ACCESO · MALABO 2027</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold mt-2">
              Lista de Reserva &amp; Modo Anfitriona
            </h1>
            <p className="text-xs sm:text-sm text-wellness-pale/85 mt-1 max-w-2xl">
              Gestión nominal de las 40 esterillas (+ 4 de reserva), validación humana por
              WhatsApp, control de estación móvil de Brunch y check-in en el parque.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="px-4 py-2.5 rounded-full bg-wellness-cream text-wellness-deep hover:bg-wellness-pale text-xs font-semibold uppercase tracking-[0.12em] flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir Reserva a Nombre de...
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-full bg-wellness-olive text-wellness-cream hover:bg-wellness-sage hover:text-wellness-deep text-xs font-semibold uppercase tracking-[0.12em] flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar Lista (CSV)
            </button>
          </div>
        </div>

        {/* Selector de Sesión Activa + KPIs rápidos */}
        <div className="mt-6 pt-6 border-t border-wellness-olive/40 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-5 flex flex-wrap gap-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelectSession(s.id);
                  setSessionFilter(s.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSession.id === s.id
                    ? 'bg-wellness-cream text-wellness-deep shadow-sm'
                    : 'bg-wellness-olive/40 text-wellness-pale hover:bg-wellness-olive/70'
                }`}
              >
                {s.number} · {s.title}
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl bg-wellness-olive/35 p-3 border border-wellness-sage/20">
              <span className="text-[10px] uppercase tracking-wider text-wellness-pale block">
                Ocupación Parque
              </span>
              <span className="font-serif text-2xl font-bold text-wellness-cream">
                {sessionStats.totalSeats} / {activeSession.maxCapacity}
              </span>
            </div>
            <div className="rounded-xl bg-wellness-olive/35 p-3 border border-wellness-sage/20">
              <span className="text-[10px] uppercase tracking-wider text-wellness-pale block">
                En el Parque (Check-in)
              </span>
              <span className="font-serif text-2xl font-bold text-wellness-cream">
                {sessionStats.checkedInSeats} plazas
              </span>
            </div>
            <div className="rounded-xl bg-wellness-olive/35 p-3 border border-wellness-sage/20">
              <span className="text-[10px] uppercase tracking-wider text-wellness-pale block">
                Pendientes Pago
              </span>
              <span className="font-serif text-2xl font-bold text-wellness-sand">
                {sessionStats.pendingSeats} plazas
              </span>
            </div>
            <div className="rounded-xl bg-wellness-olive/35 p-3 border border-wellness-sage/20">
              <span className="text-[10px] uppercase tracking-wider text-wellness-pale block">
                Waitlist 2028
              </span>
              <span className="font-serif text-2xl font-bold text-wellness-cream">
                {sessionStats.waitlistCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario Desplegable de Alta Rápida Nominal */}
      {showQuickAdd && (
        <form
          onSubmit={handleQuickAddSubmit}
          className="signature-card p-6 space-y-4 border-2 border-wellness-olive"
        >
          <div className="flex items-center justify-between border-b border-wellness-pale pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-wellness-olive font-semibold">
                REGISTRO MANUAL EN LISTA ({activeSession.number} · {activeSession.title})
              </span>
              <h3 className="font-serif text-2xl font-bold text-wellness-deep">
                Nueva reserva a nombre de una invitada
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="text-xs text-wellness-olive hover:text-wellness-deep font-semibold"
            >
              Cerrar ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-wellness-deep mb-1">
                Nombre de la Titular *
              </label>
              <input
                type="text"
                required
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="Nombre y apellidos"
                className="w-full px-3 py-2 rounded-xl bg-wellness-cream border border-wellness-sage/60 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-wellness-deep mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-wellness-cream border border-wellness-sage/60 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-wellness-deep mb-1">
                Plazas y Estado Inicial
              </label>
              <div className="flex gap-2">
                <select
                  value={quickPartySize}
                  onChange={(e) => setQuickPartySize(Number(e.target.value))}
                  className="w-24 px-2 py-2 rounded-xl bg-wellness-cream border border-wellness-sage/60 text-xs"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'plaza' : 'plazas'}
                    </option>
                  ))}
                </select>
                <select
                  value={quickStatus}
                  onChange={(e) => setQuickStatus(e.target.value as ReservationStatus)}
                  className="flex-1 px-2 py-2 rounded-xl bg-wellness-cream border border-wellness-sage/60 text-xs"
                >
                  <option value="confirmada">Confirmada (Pagado)</option>
                  <option value="pendiente">Pendiente validación</option>
                  <option value="checked_in">Check-in en parque</option>
                  <option value="waitlist">Lista 2028 (Waitlist)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-wellness-deep mb-1">
                Bebida Brunch &amp; Pago
              </label>
              <div className="flex gap-2">
                <select
                  value={quickDrink}
                  onChange={(e) => setQuickDrink(e.target.value as DrinkPreference)}
                  className="flex-1 px-2 py-2 rounded-xl bg-wellness-cream border border-wellness-sage/60 text-xs"
                >
                  <option value="Matcha Latte">Matcha Latte</option>
                  <option value="Smoothie Tropical">Smoothie</option>
                  <option value="Café de Especialidad">Café</option>
                  <option value="Limonada Botánica">Limonada</option>
                </select>
                <select
                  value={quickPayment}
                  onChange={(e) => setQuickPayment(e.target.value as PaymentMethod)}
                  className="flex-1 px-2 py-2 rounded-xl bg-wellness-cream border border-wellness-sage/60 text-xs"
                >
                  <option value="Efectivo (XAF)">Efectivo</option>
                  <option value="Muni Dinero / Móvil">Muni Dinero</option>
                  <option value="Transferencia Local">Transferencia</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="inline-flex items-center gap-2 text-xs text-wellness-deep cursor-pointer">
              <input
                type="checkbox"
                checked={useReserveMats}
                onChange={(e) => setUseReserveMats(e.target.checked)}
                className="rounded border-wellness-olive text-wellness-olive focus:ring-wellness-olive"
              />
              <span>
                Usar las <strong>4 esterillas de reserva (#41–#44)</strong>
              </span>
            </label>

            <button type="submit" className="btn-wellness px-6 py-2.5 text-xs">
              Guardar en la Lista Nominal
            </button>
          </div>
        </form>
      )}

      {/* Pestañas de Navegación del Modo Anfitriona */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-wellness-sage/40 pb-3">
        <div className="flex flex-wrap gap-2">
          {[
            {
              id: 'guestlist',
              label: '1. Lista Nominal & Check-in',
              icon: Users,
            },
            {
              id: 'matmap',
              label: '2. Mapa de 40+4 Esterillas',
              icon: LayoutGrid,
            },
            {
              id: 'metrics',
              label: '3. Estación Brunch & Aprendizaje',
              icon: BarChart3,
            },
            {
              id: 'checklist',
              label: '4. Checklist Final (18 puntos)',
              icon: ClipboardCheck,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-wellness-olive text-wellness-cream shadow-sm'
                    : 'bg-wellness-pale/70 text-wellness-deep hover:bg-wellness-pale'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onResetDemoData}
          title="Restaurar los datos de demostración originales"
          className="text-[11px] text-wellness-olive hover:text-wellness-deep inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar datos demo
        </button>
      </div>

      {/* Modal de Pase de Invitación si se inspecciona una fila */}
      {inspectedPass && (
        <div className="py-2">
          <InvitationPassCard
            reservation={inspectedPass}
            session={
              sessions.find((s) => s.id === inspectedPass.sessionId) || activeSession
            }
            onClose={() => setInspectedPass(null)}
          />
        </div>
      )}

      {/* TAB 1: LISTA NOMINAL INTERACTIVA Y CHECK-IN EN PUERTA */}
      {activeTab === 'guestlist' && (
        <div className="space-y-5">
          {/* Barra de Búsqueda y Filtros */}
          <div className="signature-card p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-wellness-olive absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre de titular, acompañante, código WC o teléfono..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-wellness-cream border border-wellness-sage/50 text-xs sm:text-sm text-wellness-deep focus:outline-none focus:border-wellness-olive"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-wellness-olive hidden sm:block" />
              <select
                value={sessionFilter}
                onChange={(e) =>
                  setSessionFilter(e.target.value as SessionId | 'all')
                }
                className="px-3 py-2.5 rounded-xl bg-wellness-cream border border-wellness-sage/50 text-xs font-medium text-wellness-deep"
              >
                <option value="all">Todas las sesiones (01, 02, 03)</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.number} · {s.title}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ReservationStatus | 'all')
                }
                className="px-3 py-2.5 rounded-xl bg-wellness-cream border border-wellness-sage/50 text-xs font-medium text-wellness-deep"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes de validar</option>
                <option value="confirmada">Confirmadas (Pagadas)</option>
                <option value="checked_in">En el parque (Check-in)</option>
                <option value="waitlist">Lista Prioridad 2028</option>
              </select>
            </div>
          </div>

          {/* Lista Nominal de Reservas */}
          <div className="space-y-3">
            {filteredReservations.length === 0 ? (
              <div className="signature-card p-10 text-center text-wellness-deep/70">
                No se encontraron reservas con ese nombre o filtro.
              </div>
            ) : (
              filteredReservations.map((res) => {
                const resSession =
                  sessions.find((s) => s.id === res.sessionId) || activeSession;
                return (
                  <div
                    key={res.id}
                    className="signature-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Información Nominal de la Reserva */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-wellness-pale text-wellness-deep">
                          {res.code}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-wellness-olive">
                          {resSession.number} · {resSession.title}
                        </span>
                        <span className="text-xs font-semibold text-wellness-deep bg-wellness-cream px-2.5 py-0.5 rounded-full border border-wellness-sage/40">
                          {res.matNumbers.length > 0
                            ? `Esterilla(s) #${res.matNumbers.join(', #')}`
                            : 'Waitlist 2028'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-wellness-olive font-semibold">
                          A nombre de:
                        </span>
                        <h4 className="font-serif text-2xl font-bold text-wellness-deep">
                          {res.holderName}
                        </h4>
                        <span className="text-xs text-wellness-olive font-medium">
                          ({res.partySize} {res.partySize === 1 ? 'plaza' : 'plazas'})
                        </span>
                      </div>

                      {res.companions.length > 0 && (
                        <p className="text-xs text-wellness-deep/80">
                          <strong className="text-wellness-olive">Acompañantes:</strong>{' '}
                          {res.companions.map((c) => c.name).join(' · ')}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-wellness-deep/75 pt-1">
                        <span>WhatsApp: {res.whatsapp}</span>
                        <span>·</span>
                        <span>
                          Brunch: <strong>{res.drinkPreference}</strong> +{' '}
                          {res.foodPreference}
                        </span>
                        <span>·</span>
                        <span>Pago: {res.paymentMethod}</span>
                      </div>

                      {res.notes && (
                        <p className="text-xs italic text-wellness-olive bg-wellness-pale/50 px-3 py-1 rounded-lg inline-block mt-1">
                          “{res.notes}”
                        </p>
                      )}
                    </div>

                    {/* Controles de Estado, Check-in y Concierge WhatsApp */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-wellness-pale">
                      {/* Selector rápido de Estado */}
                      <div className="flex rounded-xl bg-wellness-pale p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(res.id, 'pendiente')}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            res.status === 'pendiente'
                              ? 'bg-wellness-sand text-wellness-deep shadow-sm'
                              : 'text-wellness-deep/65 hover:text-wellness-deep'
                          }`}
                        >
                          Pendiente
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(res.id, 'confirmada')}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            res.status === 'confirmada'
                              ? 'bg-wellness-olive text-wellness-cream shadow-sm'
                              : 'text-wellness-deep/65 hover:text-wellness-deep'
                          }`}
                        >
                          Confirmada
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(res.id, 'checked_in')}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                            res.status === 'checked_in'
                              ? 'bg-wellness-deep text-wellness-cream shadow-sm'
                              : 'text-wellness-deep/65 hover:text-wellness-deep'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Check-in
                        </button>
                      </div>

                      {/* Botón de Bebida de Bienvenida servida */}
                      <button
                        type="button"
                        onClick={() => onToggleWelcomeDrink(res.id)}
                        title="Marcar bebida de bienvenida / brunch entregada"
                        className={`px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1.5 ${
                          res.welcomeDrinkServed
                            ? 'bg-wellness-olive/20 border-wellness-olive text-wellness-deep'
                            : 'bg-wellness-cream border-wellness-sage/50 text-wellness-deep/60 hover:text-wellness-deep'
                        }`}
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>{res.welcomeDrinkServed ? 'Brunch OK' : 'Brunch'}</span>
                      </button>

                      {/* Concierge WhatsApp Humano */}
                      <a
                        href={buildStaffToGuestWhatsAppUrl(
                          res,
                          resSession,
                          res.status === 'pendiente' ? 'confirmacion' : 'recordatorio'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Escribir por WhatsApp con mensaje personalizado de The Wellness Club"
                        className="px-3 py-2 rounded-xl bg-wellness-olive text-wellness-cream hover:bg-wellness-deep text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Ver Pase Digital */}
                      <button
                        type="button"
                        onClick={() => setInspectedPass(res)}
                        title="Ver o descargar tarjeta de invitación"
                        className="p-2 rounded-xl border border-wellness-sage/50 text-wellness-deep hover:bg-wellness-pale"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => onDeleteReservation(res.id)}
                        title="Eliminar reserva"
                        className="p-2 rounded-xl border border-wellness-sage/40 text-wellness-deep/50 hover:text-wellness-deep hover:bg-wellness-sand/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MAPA COMPLETO DE LAS 40 ESTERILLAS + 4 DE RESERVA */}
      {activeTab === 'matmap' && (
        <div className="space-y-4">
          <div className="signature-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl font-bold text-wellness-deep">
                Disposición en el Parque · {activeSession.number} ({activeSession.title})
              </h3>
              <p className="text-xs text-wellness-deep/75">
                Pulsa sobre cualquier esterilla ocupada para abrir la ficha e invitación a
                nombre de esa asistente. Incluye las 4 esterillas extra de reserva (#41–#44).
              </p>
            </div>
          </div>

          <MatGridSelector
            session={activeSession}
            sessionReservations={sessionReservations}
            selectedMats={[]}
            partySize={1}
            onToggleMat={() => {}}
            isStaffMode={true}
            onSelectOccupiedMat={(res) => setInspectedPass(res)}
          />
        </div>
      )}

      {/* TAB 3: ESTACIÓN BRUNCH, RENTABILIDAD Y OBJETIVOS DE APRENDIZAJE (Pág. 5 y 8 Plan Estratégico) */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna 1: Estación Móvil de Brunch (Previsión de Consumo) */}
          <div className="signature-card p-6 space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-wellness-olive font-semibold">
                04 · OPERACIONES · CARRITO MÓVIL
              </span>
              <h3 className="font-serif text-2xl font-bold text-wellness-deep mt-1">
                Previsión de Brunch
              </h3>
              <p className="text-xs text-wellness-deep/75 mt-0.5">
                Productos más solicitados por las asistentes registradas para preparar las
                2 batidoras, cafetera y termos sin desperdicio.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-wellness-olive">
                Bebidas Seleccionadas
              </h4>
              {Object.entries(brunchBreakdown.drinks).map(([drink, count]) => (
                <div key={drink} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-wellness-deep">{drink}</span>
                    <span className="font-bold text-wellness-olive">{count} uds.</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-wellness-pale overflow-hidden">
                    <div
                      className="h-full bg-wellness-olive rounded-full"
                      style={{
                        width: `${Math.min(100, (count / 40) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t border-wellness-pale">
              <h4 className="text-xs font-bold uppercase tracking-wider text-wellness-olive">
                Alimentos &amp; Bowls
              </h4>
              {Object.entries(brunchBreakdown.foods).map(([food, count]) => (
                <div key={food} className="flex items-center justify-between text-xs py-1">
                  <span className="text-wellness-deep">{food}</span>
                  <span className="font-semibold px-2.5 py-0.5 rounded-full bg-wellness-pale text-wellness-deep">
                    {count} raciones
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna 2: Calculadora de Aprendizaje y Rentabilidad (Pág. 8 Plan Estratégico) */}
          <div className="signature-card p-6 space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-wellness-olive font-semibold">
                07 · CRECIMIENTO · APRENDER
              </span>
              <h3 className="font-serif text-2xl font-bold text-wellness-deep mt-1">
                Coste por Persona &amp; Margen
              </h3>
              <p className="text-xs text-wellness-deep/75 mt-0.5">
                “La primera edición no tiene que ser perfecta. Tiene que ser memorable,
                rentable y repetible.”
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-wellness-pale/70 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-wellness-deep">
                  Precio entrada ({activeSession.number}):
                </span>
                <strong className="text-wellness-deep">
                  {activeSession.priceXAF.toLocaleString('es-GQ')} XAF
                </strong>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-wellness-olive mb-1">
                  Coste estimado por asistente (Brunch + Profesora + Parque):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={500}
                    value={costPerGuestXAF}
                    onChange={(e) => setCostPerGuestXAF(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-wellness-cream border border-wellness-sage/60 text-xs font-bold text-wellness-deep"
                  />
                  <span className="text-xs font-semibold text-wellness-deep">XAF</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-2">
              <div className="flex justify-between py-1.5 border-b border-wellness-pale">
                <span className="text-wellness-deep/80">
                  Ingresos previstos ({sessionStats.totalSeats} plazas):
                </span>
                <strong className="text-wellness-deep">
                  {(sessionStats.totalSeats * activeSession.priceXAF).toLocaleString(
                    'es-GQ'
                  )}{' '}
                  XAF
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-wellness-pale">
                <span className="text-wellness-deep/80">
                  Coste operativo ({sessionStats.totalSeats} plazas):
                </span>
                <strong className="text-wellness-olive">
                  {(sessionStats.totalSeats * costPerGuestXAF).toLocaleString('es-GQ')} XAF
                </strong>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="font-bold text-wellness-deep">
                  Resultado Neto Estimado:
                </span>
                <strong className="font-serif text-xl text-wellness-deep">
                  {(
                    sessionStats.totalSeats *
                    (activeSession.priceXAF - costPerGuestXAF)
                  ).toLocaleString('es-GQ')}{' '}
                  XAF
                </strong>
              </div>
            </div>
          </div>

          {/* Columna 3: Fidelización, Testimonios y Lista 2028 */}
          <div className="signature-card p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-wellness-olive font-semibold">
                COMUNIDAD &amp; ENCUESTA POST-EVENTO
              </span>
              <h3 className="font-serif text-2xl font-bold text-wellness-deep">
                Valoración e Intención de Repetir
              </h3>
              <p className="text-xs text-wellness-deep/75 leading-relaxed">
                Al finalizar cada sesión, envía el mensaje de agradecimiento y encuesta
                rápida por WhatsApp a las asistentes con Check-in para recopilar
                testimonios reales y construir la lista de interesadas 2028.
              </p>

              <div className="space-y-2 pt-2">
                {sessionReservations.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-wellness-cream border border-wellness-sage/35 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-wellness-deep">{r.holderName}</p>
                      <p className="text-[10px] text-wellness-olive">
                        {r.drinkPreference}
                      </p>
                    </div>
                    <a
                      href={buildStaffToGuestWhatsAppUrl(r, activeSession, 'post_evento')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-full bg-wellness-pale hover:bg-wellness-olive hover:text-wellness-cream text-wellness-deep text-[10px] font-semibold transition-colors"
                    >
                      Pedir Testimonio
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-wellness-deep text-wellness-cream text-xs">
              <span className="text-[10px] uppercase tracking-[0.18em] text-wellness-sand font-semibold block">
                VISIÓN 2028 – 2029
              </span>
              <p className="font-serif italic text-base mt-1">
                “El objetivo no es organizar un evento. Es construir algo que las personas
                quieran volver a vivir.”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CHECKLIST FINAL DE 18 PUNTOS (Pág. 9 del Plan Estratégico) */}
      {activeTab === 'checklist' && (
        <div className="signature-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wellness-pale pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-wellness-olive font-semibold">
                08 · LANZAMIENTO · DICIEMBRE 2027
              </span>
              <h3 className="font-serif text-3xl font-bold text-wellness-deep mt-1">
                Checklist Final Operativo
              </h3>
            </div>
            <div className="px-4 py-2 rounded-full bg-wellness-pale text-wellness-deep text-xs font-semibold">
              {checklist.filter((c) => c.completed).length} de {checklist.length}{' '}
              completados
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleChecklist(item.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  item.completed
                    ? 'bg-wellness-pale/60 border-wellness-olive/50 text-wellness-deep'
                    : 'bg-wellness-cream border-wellness-sage/40 text-wellness-deep/80 hover:border-wellness-olive'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    item.completed
                      ? 'bg-wellness-olive text-wellness-cream'
                      : 'border-2 border-wellness-sage bg-white'
                  }`}
                >
                  {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.16em] text-wellness-olive font-semibold block">
                    {item.category}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      item.completed ? 'line-through opacity-75' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-wellness-deep text-wellness-cream px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-semibold tracking-[0.16em] uppercase">
              DICIEMBRE 2027 · PRIMER LANZAMIENTO WELLNESS CLUB
            </span>
            <span className="text-wellness-sand font-serif italic text-base">
              Malabo · Guinea Ecuatorial
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
