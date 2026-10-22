# The Wellness Club · Malabo 2027 🌿

> **Health & Community** — *Una nueva forma de vivir el bienestar en Guinea Ecuatorial.*

Aplicación web oficial para la reserva y gestión nominal de plazas para las 3 sesiones de lanzamiento de **The Wellness Club** (Diciembre 2027 · Malabo).

---

## 🎨 Identidad Visual ("Quiet Luxury")

- **Paleta de colores oficial:**
  - `Warm Cream` (`#F8F6F0`) — Fondo base
  - `Pale Sage` (`#E9EBDD`) & `Sand` (`#D8CDBB`) — Superficies y acentos
  - `Soft Sage` (`#A9AD8D`) — Gráficos y apoyo
  - `Wellness Olive` (`#6F7550`) — Primario y llamadas a la acción
  - `Deep Olive` (`#4F5638`) — Cabeceras, tipografía de contraste y pie editorial
- **Tipografía:** *Cormorant Garamond* (Serif Editorial) + *Plus Jakarta Sans* (Sans limpia) + *Pinyon Script* (acento caligráfico de marca).

---

## ✨ Características Principales

1. **Flujo de Reserva Nominal:**
   - Selección entre las 3 sesiones oficiales (*Lanzamiento*, *Comunidad*, *Especial*).
   - Mapa interactivo de las **40 esterillas (+4 de reserva)** para elegir plaza nominal.
   - Datos de titular y acompañantes.
   - Pre-selección de menú Brunch (*Matcha Latte, Smoothie, Café, Yogur con granola, Croissants, Bagels*).
   - Métodos de pago locales (*Muni Dinero / Móvil, Efectivo XAF, Transferencia Local*).
   - Concierge inteligente con redirección a WhatsApp oficial.
2. **Pase de Invitación Digital:**
   - Generación instantánea de tarjeta de papelería fina descargable en **alta resolución PNG (Canvas)** lista para móvil o compartir.
   - Buscador público *"¿Estoy en la lista?"* para consultar por nombre o código `WC-...`.
3. **Modo Anfitriona / Staff (PIN: `2027`):**
   - Lista nominal en tiempo real con buscador instantáneo A-Z y filtros.
   - Check-in en 1 clic en la entrada del parque y control de entrega de bebida de bienvenida.
   - Calculadora de rentabilidad/costes por persona y previsión de brunch.
   - Checklist operativo oficial de 18 puntos.
   - Exportación de la lista a CSV.

---

## 🐳 Despliegue con Docker

### Con Docker Compose (Recomendado):
```bash
# Construir y levantar contenedor (puerto por defecto: 4178)
docker compose up -d --build
```

Si deseas cambiar el puerto expuesto en el servidor, define la variable de entorno `PORT`:
```bash
PORT=4500 docker compose up -d --build
```

### Con Docker directo:
```bash
docker build -t wellness-club-app .
docker run -d -p 4178:80 --name wellness-club-app --restart unless-stopped wellness-club-app
```

---

## 💻 Desarrollo Local

```bash
npm install
npm run dev
```
Acceso local por defecto: `http://localhost:4178`
