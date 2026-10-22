import React, { useState, useEffect } from 'react';
import {
  Reservation,
  ReservationStatus,
  SessionId,
  ChecklistItem,
} from './types/wellness';
import {
  WELLNESS_SESSIONS,
  INITIAL_RESERVATIONS,
  INITIAL_CHECKLIST,
} from './data/initialData';
import { BrandLogo } from './components/BrandLogo';
import { PublicExperienceView } from './components/PublicExperienceView';
import { StaffHostessView } from './components/StaffHostessView';
import {
  ClipboardList,
  Sparkles,
  Lock,
  Unlock,
  MapPin,
  Heart,
} from 'lucide-react';

const STORAGE_KEY_RESERVATIONS = 'wellness_club_malabo_reservations_v1';
const STORAGE_KEY_CHECKLIST = 'wellness_club_malabo_checklist_v1';
const STAFF_PIN = '2027'; // PIN para Modo Anfitriona / Staff (Año de lanzamiento 2027)

export function App() {
  const [viewMode, setViewMode] = useState<'public' | 'staff'>('public');
  const [selectedSessionId, setSelectedSessionId] = useState<SessionId>('sesion-01');
  const [staffUnlocked, setStaffUnlocked] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Persistencia de Reservas Nominales
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESERVATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback a datos iniciales
    }
    return INITIAL_RESERVATIONS;
  });

  // Persistencia del Checklist de 18 puntos
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHECKLIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_CHECKLIST;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(reservations));
    } catch {
      // Ignore storage errors
    }
  }, [reservations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(checklist));
    } catch {
      // Ignore storage errors
    }
  }, [checklist]);

  // Crear nueva reserva a nombre de alguien
  const handleCreateReservation = (
    newResData: Omit<Reservation, 'id' | 'code' | 'createdAt'>
  ): Reservation => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newReservation: Reservation = {
      ...newResData,
      id: `res-${Date.now()}`,
      code: `WC-${randomNum}`,
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [newReservation, ...prev]);
    return newReservation;
  };

  // Cambiar estado (Pendiente -> Confirmada -> Check-in)
  const handleUpdateStatus = (id: string, status: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              checkedInAt:
                status === 'checked_in'
                  ? new Date().toLocaleTimeString('es-GQ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : r.checkedInAt,
            }
          : r
      )
    );
  };

  // Marcar bebida de bienvenida / brunch entregada
  const handleToggleWelcomeDrink = (id: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, welcomeDrinkServed: !r.welcomeDrinkServed } : r
      )
    );
  };

  // Eliminar reserva
  const handleDeleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  // Alternar punto del checklist
  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Restaurar datos de demostración
  const handleResetDemoData = () => {
    setReservations(INITIAL_RESERVATIONS);
    setChecklist(INITIAL_CHECKLIST);
    localStorage.removeItem(STORAGE_KEY_RESERVATIONS);
    localStorage.removeItem(STORAGE_KEY_CHECKLIST);
  };

  // Acceso al Modo Anfitriona / Staff
  const handleToggleStaffMode = () => {
    if (viewMode === 'staff') {
      setViewMode('public');
      return;
    }
    if (staffUnlocked) {
      setViewMode('staff');
    } else {
      setPinError(false);
      setPinInput('');
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === STAFF_PIN) {
      setStaffUnlocked(true);
      setShowPinModal(false);
      setViewMode('staff');
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-wellness-cream paper-texture text-wellness-deep">
      {/* BARRA DE NAVEGACIÓN SUPERIOR (Inspirada en la página 9 del Brand Book: Fondo Deep Olive #4F5638) */}
      <header className="no-print sticky top-0 z-40 px-3 sm:px-6 pt-3">
        <div className="max-w-7xl mx-auto rounded-2xl bg-wellness-deep text-wellness-cream px-4 sm:px-8 py-3.5 shadow-md flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setViewMode('public')}
            className="flex items-center gap-3 text-left group"
          >
            <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-wellness-cream group-hover:text-wellness-sand transition-colors">
              Wellness Club
            </span>
            <span className="hidden md:inline-block text-[10px] uppercase tracking-[0.2em] text-wellness-pale/75 border-l border-wellness-pale/30 pl-3">
              Health &amp; Community · Malabo
            </span>
          </button>

          {/* Enlaces de navegación (Inicio · Quiénes somos · Experiencias · Reserva · Mi Plaza) */}
          {viewMode === 'public' ? (
            <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-wellness-pale/90">
              <a href="#inicio" className="hover:text-white transition-colors">
                Inicio
              </a>
              <a href="#experiencia" className="hover:text-white transition-colors">
                Experiencia &amp; Brunch
              </a>
              <a href="#reservar" className="hover:text-white transition-colors">
                Reservar a mi nombre
              </a>
              <a href="#mi-reserva" className="hover:text-white transition-colors">
                ¿Estoy en la lista?
              </a>
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs text-wellness-sand">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modo Anfitriona &amp; Check-in en el Parque Activo</span>
            </div>
          )}

          {/* Conmutador Vista Invitada / Modo Anfitriona (Guest List) */}
          <div className="flex items-center gap-2.5">
            {viewMode === 'public' && (
              <a
                href="#reservar"
                className="hidden sm:inline-flex px-4 py-2 rounded-full bg-wellness-olive hover:bg-wellness-sage hover:text-wellness-deep text-wellness-cream text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors"
              >
                Reservar
              </a>
            )}

            <button
              type="button"
              onClick={handleToggleStaffMode}
              className={`px-3.5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] flex items-center gap-1.5 border transition-all ${
                viewMode === 'staff'
                  ? 'bg-wellness-cream text-wellness-deep border-wellness-cream'
                  : 'bg-wellness-deep/50 text-wellness-pale border-wellness-pale/35 hover:border-wellness-cream'
              }`}
            >
              {viewMode === 'staff' ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-wellness-olive" />
                  <span>Volver a Vista Pública</span>
                </>
              ) : (
                <>
                  <ClipboardList className="w-3.5 h-3.5 text-wellness-sand" />
                  <span>Lista &amp; Check-in ({reservations.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Acceso Rápido para Modo Anfitriona / Staff */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-wellness-deep/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="signature-card-cream max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-wellness-sage/35 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-wellness-olive" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-wellness-olive font-semibold">
                  ACCESO EQUIPO WELLNESS CLUB
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="text-xs font-semibold text-wellness-deep/70 hover:text-wellness-deep"
              >
                Cerrar ✕
              </button>
            </div>

            <div>
              <h3 className="font-serif text-3xl font-bold text-wellness-deep">
                Modo Anfitriona &amp; Check-in
              </h3>
              <p className="text-xs text-wellness-deep/80 mt-1">
                Gestiona la lista nominal de las 40 esterillas, confirma pagos locales por
                WhatsApp y pasa lista en la entrada del parque.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wellness-deep mb-1.5">
                  Introduce el PIN de Equipo (Demo: <strong>2027</strong>)
                </label>
                <input
                  type="password"
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="2027"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-wellness-sage focus:border-wellness-olive focus:outline-none text-center font-mono text-xl tracking-[0.4em] text-wellness-deep"
                />
                {pinError && (
                  <p className="text-xs text-wellness-deep font-semibold mt-1.5">
                    PIN incorrecto. Usa <strong>2027</strong> (año del primer lanzamiento).
                  </p>
                )}
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setStaffUnlocked(true);
                    setShowPinModal(false);
                    setViewMode('staff');
                  }}
                  className="flex-1 py-3 px-4 rounded-full bg-wellness-pale text-wellness-deep hover:bg-wellness-sage/40 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Entrar directo (Demo)
                </button>
                <button type="submit" className="flex-1 btn-wellness py-3 px-4">
                  Acceder con PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6">
        {viewMode === 'public' ? (
          <PublicExperienceView
            sessions={WELLNESS_SESSIONS}
            reservations={reservations}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            onCreateReservation={handleCreateReservation}
          />
        ) : (
          <StaffHostessView
            sessions={WELLNESS_SESSIONS}
            reservations={reservations}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            onUpdateStatus={handleUpdateStatus}
            onToggleWelcomeDrink={handleToggleWelcomeDrink}
            onDeleteReservation={handleDeleteReservation}
            onCreateReservation={handleCreateReservation}
            checklist={checklist}
            onToggleChecklist={handleToggleChecklist}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      {/* PIE DE PÁGINA EDITORIAL (Inspirado en la página 12 del Brand Book: Cierre en Deep Olive #4F5638) */}
      <footer className="no-print bg-wellness-deep text-wellness-cream mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            {/* Tarjeta Blanca con el Logotipo tal como en la página 12 del Brand Book */}
            <div className="md:col-span-5 flex justify-center md:justify-start">
              <div className="bg-white rounded-2xl px-10 py-8 shadow-sm inline-flex items-center justify-center">
                <BrandLogo variant="dark" size="lg" />
              </div>
            </div>

            {/* Divisor vertical y manifiesto */}
            <div className="md:col-span-7 md:border-l border-wellness-sage/40 md:pl-10 space-y-4">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-wellness-cream">
                WELLNESS CLUB
              </h3>
              <p className="text-xs uppercase tracking-[0.22em] text-wellness-sage font-semibold">
                HEALTH &amp; COMMUNITY · MALABO, GUINEA ECUATORIAL
              </p>
              <p className="text-sm sm:text-base text-wellness-pale/90 max-w-lg leading-relaxed">
                Una marca nacida en Guinea Ecuatorial para crear experiencias de
                bienestar, comunidad y conexión.
              </p>
              <p className="font-serif italic text-lg sm:text-xl text-wellness-sand pt-2">
                “El objetivo no es organizar un evento. Es construir algo que las
                personas quieran volver a vivir.”
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-wellness-sage/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-wellness-pale/70 tracking-wider uppercase">
            <span>WELLNESS CLUB · HEALTH &amp; COMMUNITY · BRAND BOOK &amp; LANZAMIENTO 2027</span>
            <span className="flex items-center gap-1.5">
              <span>Mueve · Conecta · Disfruta</span>
              <Heart className="w-3.5 h-3.5 text-wellness-sand" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
