# Vista general y diseño — Semillas Salesianas

Cómo se ve y se navega la aplicación. Complementa
[`contenido-carpeta.md`](contenido-carpeta.md) y
[`roles-y-permisos.md`](roles-y-permisos.md).

## 1. Dirección visual

- **Futurista e infantil, pero profesional.** Nada de apariencia genérica de plantilla:
  identidad propia, cuidada y coherente.
- Pensada primero para **tablet** en la entrada del archivo (también computador).
- Toque infantil: una **mascota** pequeña que celebra cuando una pestaña llega al 100 %
  (con confeti suave), sin estorbar el trabajo. Respetar `prefers-reduced-motion`.

### Colores de progreso

Siempre con el número visible además del color.

| Porcentaje | Color |
|---|---|
| 0–49 % | Rojo |
| 50–89 % | Amarillo |
| 90–100 % | Verde |

## 2. Pantalla 1 — Lista de niños (inicio)

- Solo niños **activos** (los egresados no aparecen).
- Ordenados por **primer apellido**: "Gómez Pérez, Lady".
- Cada fila:
  - nombre;
  - **barra de progreso** con el porcentaje general (promedio de pestañas);
  - **caja** (📦 6);
  - indicador de **carpeta fuera** (en rojo si lleva más de 7 días);
  - **próximo vencimiento** (ej.: "Seguimiento en 3 días").
- **Buscador** por nombre.
- **Filtros rápidos:** menos de 70 %, carpetas fuera, por caja.

## 3. Pantalla 2 — Carpeta del niño

- Al tocar un niño se pide el **PIN** (ver `roles-y-permisos.md`). La sesión dura
  mientras se esté dentro de esa carpeta.
- Encabezado: nombre, caja, porcentaje general, botón **retirar / devolver carpeta**.
- **Cuadrícula de 12 tarjetas**, una por pestaña, cada una con ícono, nombre y su
  barra de progreso (como abrir la carpeta física).
- Volver a la lista **cierra la sesión de PIN**.

## 4. Pantalla 3 — Pestaña

- Título de la pestaña con su **barra de progreso**.
- **Casillas grandes**, cómodas para tocar en tablet.
- Ítems con fecha (ADRES, tallaje, comodines, constancia de estudio): al marcarlos
  **se abre el selector de fecha** (o año).
- Comodines muestran su vigencia: "Vence en 12 días".
- Excepciones como casillas propias; la de crecimiento y desarrollo con campo de motivo.
- **Atenciones y seguimientos como línea de tiempo**: cumplidas en verde, vencidas en
  rojo, futuras en gris con su fecha.
- Debajo de cada ítem marcado, en pequeño: "Marcado por Psicóloga · 14 oct".

## 5. Agenda (próximos eventos)

Visible para **todos**. Responde a "¿qué toca hacer?".

- **Arriba, lo urgente:**
  - 🔴 **Vencidos:** pasó su fecha y no está marcado.
  - 🟡 **Próximos 7 días.**
- **Debajo:** calendario con puntos por día + lista agrupada por día de los
  **próximos 30 días**.
- **Eventos incluidos:**
  - atenciones por área (TS, Psicología, Pedagogía, Nutrición en casos especiales);
  - plan de caso, seguimientos y sus correos de envío;
  - evaluación preliminar e integradora;
  - seguimientos de nivel de riesgo;
  - **vencimientos de documentos:** ADRES, tallaje, cartas y comodines;
  - carpetas fuera.
- **Filtros:** por profesional (mismo reparto que los reportes) y por tipo.
- Tocar un evento abre la carpeta del niño **en esa pestaña** (pide PIN).

## 6. Panel de administración (coordinador y gestor de caso)

- Registro de niños, egresos y usuarios.
- **Reportes descargables** por profesional y generales: **pendientes** (vencidos) y
  **próximos a ejecutar** (siguientes 30 días).
- **Reporte por ítem**: se elige un documento de la carpeta (ADRES, boletín, etc.) y
  lista los niños a los que les falta o lo tienen vencido (opcionalmente también los
  que están al día). Solo consulta: no cambia datos.
- **Correo semanal automático** (cada lunes temprano) a cada profesional con sus
  pendientes y lo próximo a ejecutar. Ver `roles-y-permisos.md`, sección de correo.
- Préstamos de carpetas y alertas.
- Registro libre de revisiones.

Detalle por definir.
