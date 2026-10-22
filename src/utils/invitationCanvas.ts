import { Reservation, WellnessSession } from '../types/wellness';

/**
 * Genera y descarga una tarjeta de invitación de alta resolución ("Quiet Luxury")
 * en formato PNG con la paleta oficial del Brand Book (#F8F6F0, #6F7550, #4F5638, #E9EBDD, #A9AD8D, #D8CDBB).
 */
export function downloadInvitationCardPNG(
  reservation: Reservation,
  session: WellnessSession
): void {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1350; // Formato vertical 4:5 ideal para móvil / Instagram Stories
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Fondo Warm Cream (#F8F6F0)
  ctx.fillStyle = '#F8F6F0';
  ctx.fillRect(0, 0, width, height);

  // Textura sutil de puntos (papel algodón)
  ctx.fillStyle = 'rgba(79, 86, 56, 0.04)';
  for (let x = 20; x < width; x += 28) {
    for (let y = 20; y < height; y += 28) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Marco exterior editorial en Soft Sage (#A9AD8D)
  ctx.strokeStyle = '#A9AD8D';
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, width - 112, height - 112);

  // Barra superior firma Wellness Olive (#6F7550) de 14px
  ctx.fillStyle = '#6F7550';
  ctx.fillRect(56, 56, width - 112, 14);

  // 3. Cabecera del Club (Logotipo Editorial)
  ctx.fillStyle = '#4F5638';
  ctx.textAlign = 'center';

  // Oval "THE"
  ctx.strokeStyle = '#6F7550';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(width / 2, 150, 44, 18, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = '500 18px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('THE', width / 2, 156);

  // "Wellness"
  ctx.font = '700 86px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Wellness', width / 2, 232);

  // "Club" en cursiva/script
  ctx.font = 'italic 64px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText('Club', width / 2, 288);

  // "Health & Community"
  ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText('H E A L T H   &   C O M M U N I T Y', width / 2, 326);

  // Línea divisoria fina
  ctx.strokeStyle = '#D8CDBB';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, 365);
  ctx.lineTo(width - 140, 365);
  ctx.stroke();

  // 4. Bloque Principal: "INVITACIÓN PERSONAL A NOMBRE DE"
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText('PASE DE RESERVA NOMINAL · MALABO 2027', width / 2, 420);

  // Caja Pale Sage (#E9EBDD) para el nombre de la invitada
  ctx.fillStyle = '#E9EBDD';
  roundRect(ctx, 110, 450, width - 220, 210, 20);
  ctx.fill();

  ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText('RESERVA A NOMBRE DE', width / 2, 498);

  ctx.font = '700 54px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#4F5638';
  ctx.fillText(reservation.holderName, width / 2, 565);

  if (reservation.companions.length > 0) {
    const compNames = reservation.companions.map((c) => c.name).join(' · ');
    ctx.font = '400 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#6F7550';
    ctx.fillText(`+ Acompañantes: ${compNames}`, width / 2, 618);
  } else {
    ctx.font = 'italic 24px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#6F7550';
    ctx.fillText('“Regálate unas horas para ti.”', width / 2, 618);
  }

  // 5. Detalles de la Sesión y Esterilla
  const detailsY = 720;
  ctx.textAlign = 'left';

  // Columna Izquierda: Sesión y Fecha
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#A9AD8D';
  ctx.fillText('EXPERIENCIA ELEGIDA', 120, detailsY);

  ctx.font = '700 38px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#4F5638';
  ctx.fillText(`${session.number} · ${session.title}`, 120, detailsY + 46);

  ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText(`${session.dateLabel} · ${session.timeLabel}`, 120, detailsY + 82);
  ctx.fillText(session.location, 120, detailsY + 114);

  // Separador horizontal
  ctx.strokeStyle = '#E9EBDD';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, detailsY + 152);
  ctx.lineTo(width - 120, detailsY + 152);
  ctx.stroke();

  // Tres cajas inferiores: Esterilla, Brunch, Código/Estado
  const boxY = detailsY + 185;
  const boxW = 260;
  const boxH = 155;

  // Caja 1: Esterillas
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 110, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.fillStyle = '#6F7550';
  ctx.fillRect(110, boxY, boxW, 6);

  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText('ESTERILLA(S) EN PARQUE', 134, boxY + 42);
  ctx.font = '700 44px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#4F5638';
  const matText =
    reservation.matNumbers.length > 0
      ? `#${reservation.matNumbers.join(', #')}`
      : 'Waitlist';
  ctx.fillText(matText, 134, boxY + 100);
  ctx.font = '400 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText(`${reservation.partySize} ${reservation.partySize === 1 ? 'plaza' : 'plazas'}`, 134, boxY + 132);

  // Caja 2: Selección Brunch
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 410, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.fillStyle = '#6F7550';
  ctx.fillRect(410, boxY, boxW, 6);

  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText('SELECCIÓN BRUNCH', 434, boxY + 42);
  ctx.font = '700 28px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#4F5638';
  ctx.fillText(reservation.drinkPreference, 434, boxY + 86);
  ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText(reservation.foodPreference, 434, boxY + 122);

  // Caja 3: Código y Estado
  ctx.fillStyle = '#4F5638';
  roundRect(ctx, 710, boxY, boxW, boxH, 16);
  ctx.fill();

  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#E9EBDD';
  ctx.fillText('CÓDIGO DE LISTA', 734, boxY + 42);
  ctx.font = '700 40px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#F8F6F0';
  ctx.fillText(reservation.code, 734, boxY + 95);

  const statusText =
    reservation.status === 'checked_in'
      ? 'CHECK-IN REALIZADO'
      : reservation.status === 'confirmada'
      ? 'PLAZA CONFIRMADA'
      : reservation.status === 'waitlist'
      ? 'LISTA PRIORIDAD 2028'
      : 'PENDIENTE VALIDACIÓN';
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#D8CDBB';
  ctx.fillText(statusText, 734, boxY + 130);

  // 6. Pie de página editorial
  ctx.textAlign = 'center';
  ctx.font = 'italic 30px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#4F5638';
  ctx.fillText('Mueve. Conecta. Disfruta.', width / 2, 1185);

  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#6F7550';
  ctx.fillText(
    'WELLNESS CLUB · HEALTH & COMMUNITY · MALABO, GUINEA ECUATORIAL',
    width / 2,
    1240
  );

  // Descargar PNG
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  const safeName = reservation.holderName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  link.download = `invitacion-wellness-club-${safeName}-${reservation.code}.png`;
  link.href = dataUrl;
  link.click();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
