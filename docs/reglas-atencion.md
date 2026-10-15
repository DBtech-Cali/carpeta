# Reglas de atención — Semillas Salesianas

Fuente de verdad para calcular el calendario de cada niño o niña de la modalidad.
Toda la programación de fechas de la aplicación debe salir de estas reglas.

## 1. Principios generales

- **Todo se calcula desde la fecha de ingreso.** El calendario es fijo: nunca se
  recalcula aunque una actividad se haga tarde, porque se reporta a una autoridad.
- **Fechas exactas.** Sin márgenes de adelanto o atraso. Si una fecha cae en fin de
  semana o festivo se deja tal cual; es responsabilidad del profesional hacerla antes.
- **Programado vs. cumplido.** La aplicación separa:
  - lo **programado**: fechas calculadas, inmóviles;
  - lo **cumplido**: si el documento de esa actividad ya está en la carpeta.
  El detalle de estados (verde / rojo) se definirá más adelante.
- **Exigible desde el día siguiente.** Toda actividad con fecha cuenta como faltante
  a partir del día siguiente a su fecha; el mismo día todavía se puede entregar.

## 2. Día ancla y fin de mes

- **Plan de caso = fecha de ingreso + 1 mes calendario**, el mismo número de día.
- Si el mes siguiente no tiene ese día, el plan de caso cae en el **último día del mes**.
- **El día del plan de caso es el día ancla** de todos los hitos y atenciones mensuales.
- Cuando un mes no tiene el día ancla, **solo ese mes** usa su último día; el
  siguiente vuelve al día ancla.

Ejemplos:

| Ingreso | Plan de caso | Día ancla |
|---|---|---|
| 7 may | 7 jun | 7 |
| 31 ene | 28 feb (29 si es bisiesto) | 28 (o 29) |
| 31 mar | 30 abr | 30 |
| 30 oct | 30 nov | 30 |

## 3. Seguimientos

- **Seguimiento N = plan de caso + 3·N meses**, en el día ancla.
- Se repiten cada 3 meses de forma indefinida, hasta el egreso.

## 4. Áreas

| Área | Obligatoria |
|---|---|
| Trabajo Social | Sí |
| Psicología | Sí |
| Pedagogía | Sí |
| Nutrición | No — solo si se activa (ver sección 6) |

Cada área tiene su propio juego de atenciones con las mismas fechas.

## 5. Atenciones de Trabajo Social, Psicología y Pedagogía

### Periodo 1 — plan de caso → 1er seguimiento: 5 atenciones por área

Dos al mes, el día ancla y a mitad de mes (+15 días):

1. Plan de caso + 15 días
2. Plan de caso + 1 mes
3. Plan de caso + 1 mes + 15 días
4. Plan de caso + 2 meses
5. Plan de caso + 2 meses + 15 días

(La sexta coincidiría con el 1er seguimiento, por eso no existe.)

### Periodo 2 — 1er seguimiento → 2º seguimiento: 3 atenciones por área

1. 1er seguimiento + 1 mes
2. 1er seguimiento + 2 meses
3. 2º seguimiento − 5 días (fecha exacta)

### Periodo 3 en adelante — entre seguimientos consecutivos: 1 atención por área

- Seguimiento que abre el periodo + 45 días.
- Es decir, 3 atenciones por trimestre (una por cada área).

## 6. Nutrición

- Se activa **solo cuando el nutricionista incluye al niño o niña** por afectación
  nutricional (exceso o déficit de peso).
- Se activa marcando **"Caso especial"** en la pestaña Nutrición.
- Sin importar cuándo se marque, se exige **1 atención por bloque trimestral desde el
  plan de caso** (plan → 1er seguimiento, 1er → 2º, 2º → 3º, …), en la fecha
  **hito que abre el bloque + 45 días**. Así, al pasar carpetas antiguas a la app
  aparecen las atenciones que debieron hacerse.
- **No usa** las reglas de 15 días ni mensuales de las otras áreas.
- El nutricionista **puede desactivarla** cuando el niño recupera o estabiliza su peso.
  Al desactivarla **deja de exigirse todo** lo de Nutrición (incluidas atenciones ya
  vencidas) hasta que se vuelva a activar.
  Mientras no esté activa, no genera atenciones pendientes ni vencidas.

## 7. Seguimiento de nivel de riesgo

- **Todos** los niños lo tienen.
- **Mensual** desde el plan de caso, en el día ancla (misma regla de fin de mes):
  plan de caso + 1 mes, + 2 meses, + 3 meses… hasta el egreso.
  Ejemplo: plan 15 mar → 15 abr, 15 may, 15 jun, 15 jul…
- **Responsable** asignada por niño: Trabajo Social **o** Psicología. Se registra en
  la pestaña de la responsable. No cambia en el tiempo.

## 8. Egreso

- Al egresar, la carpeta física con todo su material se traslada a otro lugar.
- En la aplicación el niño o niña **deja de verse** en el panel (solo se muestran los
  activos) y deja de generar fechas y pendientes.
- Los datos **no se borran**: quedan guardados como histórico.

## 9. Ejemplos completos

### Ingreso 7 de mayo de 2026 (Nutrición como caso especial)

| Hito / bloque | TS / Psicología / Pedagogía (c/u) | Nutrición |
|---|---|---|
| **Plan de caso** — 7 jun 2026 | | |
| Periodo 1 | 22 jun · 7 jul · 22 jul · 7 ago · 22 ago | 22 jul |
| **1er seguimiento** — 7 sep 2026 | | |
| Periodo 2 | 7 oct · 7 nov · 2 dic | 22 oct |
| **2º seguimiento** — 7 dic 2026 | | |
| Periodo 3 | 21 ene 2027 | 21 ene 2027 |
| **3er seguimiento** — 7 mar 2027 | | |
| Periodo 4 | 21 abr 2027 | 21 abr 2027 |
| **4º seguimiento** — 7 jun 2027 | | |

### Ingreso 31 de enero de 2027 (fin de mes, año no bisiesto)

| Hito / bloque | Fechas |
|---|---|
| **Plan de caso** | 28 feb 2027 (día ancla: 28) |
| Periodo 1 | 15 mar · 28 mar · 12 abr · 28 abr · 13 may |
| **1er seguimiento** | 28 may 2027 |
| Periodo 2 | 28 jun · 28 jul · 23 ago |
| **2º seguimiento** | 28 ago 2027 |
| Periodo 3 | 12 oct 2027 |
| **3er seguimiento** | 28 nov 2027 |

### Ingreso 30 de octubre de 2026 (el ancla vuelve después de febrero)

| Hito / bloque | Fechas |
|---|---|
| **Plan de caso** | 30 nov 2026 (día ancla: 30) |
| Periodo 1 | 15 dic · 30 dic · 14 ene · 30 ene · 14 feb |
| **1er seguimiento** | **28 feb 2027** (febrero no tiene 30) |
| Periodo 2 | 30 mar · 30 abr · 25 may |
| **2º seguimiento** | **30 may 2027** (vuelve al ancla) |
| Periodo 3 | 14 jul 2027 |
| **3er seguimiento** | 30 ago 2027 |

## 10. Pendientes por definir

