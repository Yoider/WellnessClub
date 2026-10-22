import { Reservation, WellnessSession } from '../types/wellness';
import { OFFICIAL_WHATSAPP_NUMBER } from '../data/initialData';

export function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('240')) return digits;
  return `240${digits}`;
}

/**
 * Enlace para que la invitada envíe su solicitud de reserva al equipo de The Wellness Club
 * tras completar el formulario rápido (Paso 02 -> Paso 03/04 del Brand Book).
 */
export function buildGuestToClubWhatsAppUrl(
  reservation: Reservation,
  session: WellnessSession
): string {
  const companionsText =
    reservation.companions.length > 0
      ? `\n• Acompañantes: ${reservation.companions.map((c) => c.name).join(', ')}`
      : '';

  const matsText =
    reservation.matNumbers.length > 0
      ? `Esterilla(s) #${reservation.matNumbers.join(', #')}`
      : 'Lista de Prioridad 2028';

  const message =
    `Hola The Wellness Club 🌿\n\n` +
    `Acabo de registrar mi reserva a nombre de *${reservation.holderName}* (Código: *${reservation.code}*).\n\n` +
    `• *Sesión:* ${session.number} · ${session.title} (${session.dateLabel})\n` +
    `• *Plazas:* ${reservation.partySize} ${reservation.partySize === 1 ? 'persona' : 'personas'}${companionsText}\n` +
    `• *Ubicación en el parque:* ${matsText}\n` +
    `• *Preferencia Brunch:* ${reservation.drinkPreference} + ${reservation.foodPreference}\n` +
    `• *Método de pago local:* ${reservation.paymentMethod}\n\n` +
    `Quedo atenta para confirmar mi plaza. ¡Gracias!`;

  return `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Enlace para que la Anfitriona / Staff contacte con la invitada desde la Guest List
 * siguiendo la Voz de Marca (Pág. 11 del Brand Book: Cálida, Segura, Inspiradora).
 */
export function buildStaffToGuestWhatsAppUrl(
  reservation: Reservation,
  session: WellnessSession,
  templateType: 'confirmacion' | 'recordatorio' | 'post_evento'
): string {
  const guestPhone = cleanPhone(reservation.whatsapp);
  const firstName = reservation.holderName.split(' ')[0];
  const matsLabel =
    reservation.matNumbers.length > 0
      ? `Esterilla(s) #${reservation.matNumbers.join(', #')}`
      : 'Lista Prioritaria';

  let text = '';

  if (templateType === 'confirmacion') {
    text =
      `Hola ${firstName} 🌿 Te escribimos desde *The Wellness Club*.\n\n` +
      `Hemos recibido tu reserva (*${reservation.code}*) a tu nombre para la *${session.number} · ${session.title}* el ${session.dateLabel} en Malabo.\n\n` +
      `✨ *Resumen de tu espacio:*\n` +
      `• Plazas: ${reservation.partySize} (${matsLabel})\n` +
      `• Tu selección de Brunch: ${reservation.drinkPreference}\n` +
      `• Vía de pago elegida: ${reservation.paymentMethod}\n\n` +
      `Te invitamos a confirmar tu plaza por esta vía. Regálate unas horas para ti: *Muévete. Conecta. Disfruta.*`;
  } else if (templateType === 'recordatorio') {
    text =
      `Hola ${firstName} 🤍 ¡Tu plaza en *The Wellness Club* está confirmada!\n\n` +
      `Te esperamos este *${session.dateLabel}* a las *08:30h* (Welcome & Check-in) en ${session.location}.\n\n` +
      `• Reserva a nombre de: *${reservation.holderName}*\n` +
      `• Tu espacio reservado: *${matsLabel}* (ya tendrás tu esterilla preparada al llegar)\n\n` +
      `Solo trae ropa cómoda y ganas de disfrutar. ¡Nos vemos en el parque!`;
  } else {
    text =
      `Hola ${firstName} 🌿 Gracias por haber sido parte de *The Wellness Club* en Malabo.\n\n` +
      `Fue muy especial compartir movimiento, brunch y comunidad contigo. Queremos seguir mejorando cada detalle para las próximas ediciones de 2028.\n\n` +
      `¿Qué fue lo que más disfrutaste hoy y qué bebida o bocado repetirías sin dudar? 🤍`;
  }

  return `https://wa.me/${guestPhone}?text=${encodeURIComponent(text)}`;
}
