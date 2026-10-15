# Contenido de la carpeta — Semillas Salesianas

Qué debe contener cada pestaña de la carpeta física y cómo se calcula su cumplimiento.
Las fechas de plan de caso, seguimientos y atenciones están en
[`reglas-atencion.md`](reglas-atencion.md).

## 1. Reglas generales

### Porcentaje de cumplimiento por pestaña

- **% = ítems cumplidos / ítems exigibles a la fecha.**
- Los ítems **opcionales** no suman ni restan.
- Un ítem **con fecha** se exige desde el **día siguiente** a su fecha (el mismo día
  todavía se puede entregar sin que cuente como faltante).
- Un ítem **sin fecha** se exige desde el **día del ingreso**.
- Si una pestaña aún no tiene ítems exigibles, se muestra como "sin pendientes aún".
- Un ítem marcado pero **vencido** (por ejemplo, ADRES fuera de vigencia) cuenta
  como no cumplido.

### Porcentaje general del niño

- **Promedio de los porcentajes de las pestañas** que tienen ítems exigibles
  (las pestañas "sin pendientes aún" no entran en el promedio).

### Comodines (solicitudes de documentos que dependen de terceros)

Un comodín vigente hace que los documentos faltantes que cubre **cuenten como
cumplidos**. Un comodín vencido cuenta **como si no existiera**: los faltantes vuelven
a contar como faltantes.

- Una sola solicitud cubre **todos** los faltantes de su pestaña.
- Se registra la **fecha del último envío**; al reiterar se reemplaza (sin historial).
- **No se puede desmarcar** mientras falte algún documento que cubre.

| Tipo | Vigencia | Pestañas |
|---|---|---|
| Simple | 2 meses calendario | Inicio, Socio legal |
| Simple | 1 mes calendario | Escuela |
| Escalera | Carta 1 → Carta 2 → Carta 3 (1 mes c/u) → Correo a Defensoría (sin vencimiento) | Salud |

Ejemplo de vigencia de 2 meses: correo del 7 de mayo vale hasta el 7 de julio;
desde el 8 de julio está vencido.

Ejemplo de cálculo (Inicio, 5 requeridos, 2 faltan):

| Situación | Resultado |
|---|---|
| Comodín vigente | 100 % |
| Comodín vencido | 3/5 = 60 % |
| Sin comodín | 3/5 = 60 % |

### Excepciones

Casillas que exoneran un ítem. Si se marcan, ese ítem deja de exigirse.

| Excepción | Pestaña | Exonera | Motivo escrito |
|---|---|---|---|
| Menor de 7 años | Socio legal | Tarjeta de identidad | No |
| Exonerado de crecimiento y desarrollo | Salud | Crecimiento y desarrollo | Sí (texto libre) |

## 2. Pestañas

### 2.1 Inicio

Documentos remitidos por la Defensoría.

| Ítem | Tipo | Comodín |
|---|---|---|
| Boleta de ingreso | Requerido | Sí |
| PARD (auto de apertura) | Requerido | Sí |
| Valoración de Trabajo Social | Requerido | Sí |
| Valoración de Psicología | Requerido | Sí |
| Valoración de Nutrición | Requerido (siempre, aunque Nutrición no se active) | Sí |
| Correo de solicitud a autoridad / Defensoría | Comodín simple, 2 meses | — |

### 2.2 Preliminar

| Ítem | Tipo | Fecha | Comodín |
|---|---|---|---|
| Evaluación preliminar | Requerido | Ingreso + 5 días | No |

### 2.3 Pacto de convivencia

| Ítem | Tipo | Fecha | Comodín |
|---|---|---|---|
| Pacto de convivencia firmado | Requerido | Sin fecha | No |

### 2.4 Socio legal

| Ítem | Tipo | Comodín |
|---|---|---|
| Tarjeta de identidad del niño | Requerido (exonerable: menor de 7 años) | Sí |
| Registro civil del niño | Requerido | Sí |
| Cédula del acudiente | Requerido | Sí |
| ADRES (afiliación en salud) | Requerido, **vigencia 3 meses** desde la fecha del documento | **No** |
| Recibo de servicios (estrato) | Opcional | Sí |
| Carta / correo de solicitud | Comodín simple, 2 meses | — |

ADRES: al marcarlo se registra su fecha. Ejemplo con hoy 13 oct: ADRES del 13 jul es
válido (último día); del 12 jul está vencido.

### 2.5 Informes

Pestaña que **crece con el tiempo**. Solo se exige lo que ya debió existir.

| Ítem | Se exige desde |
|---|---|
| Evaluación integradora (distinta a la preliminar) | Ingreso + 22 días |
| Acta de caso de la evaluación integradora | Misma fecha que la evaluación integradora |
| Plan de caso | Ingreso + 1 mes (día ancla) |
| Correo de envío del plan de caso | Misma fecha que el plan de caso |
| Seguimiento N | Plan de caso + 3·N meses |
| Correo de envío del seguimiento N | Misma fecha que el seguimiento N |

Sin comodín. Ejemplo (ingreso 7 may): el 15 jul se exigen 4 ítems; el 15 oct, 6.

### 2.6 Salud

Documentos que se piden al acudiente.

| Ítem | Tipo |
|---|---|
| Vacunas | Requerido, sin vigencia |
| Valoración médica general | Requerido, sin vigencia |
| Crecimiento y desarrollo | Requerido (exonerable con motivo) |
| Carta 1 / 2 / 3 al acudiente | Comodín escalera, 1 mes cada una |
| Correo a Defensoría | Comodín final, sin vencimiento |

Escalera: falta un documento → carta 1 (vale 1 mes) → si vence sin respuesta,
carta 2 → carta 3 → 1 mes después de la carta 3 se exige el correo a Defensoría.
Una vez enviado ese correo, la pestaña queda al 100 %.

### 2.7 Nutrición

| Ítem | Tipo |
|---|---|
| Valoración nutricional inicial (del nutricionista de la modalidad, distinta a la de Inicio) | Requerido |
| Tallaje (peso y talla) con fecha completa | Requerido, con vigencia |
| Casilla "Caso especial" (exceso / déficit de peso) | Activa atenciones |
| Atenciones de Nutrición | Solo si es caso especial (ver `reglas-atencion.md`) |

Vigencia del tallaje desde su fecha: **6 meses** (peso adecuado) o **3 meses**
(caso especial). Al desmarcar el caso especial vuelve a 6 meses.

Sin comodín.

### 2.8 Trabajo social

| Ítem | Tipo |
|---|---|
| Pacto de familia | Requerido, sin fecha |
| Análisis del auxilio de transporte | Requerido, sin fecha (no importa si se aprueba) |
| Atenciones de Trabajo Social | Según calendario |
| Seguimientos de nivel de riesgo | Si TS es la responsable |

Sin comodín.

### 2.9 Psicología

| Ítem | Tipo |
|---|---|
| Atenciones de Psicología | Según calendario |
| Seguimientos de nivel de riesgo | Si Psicología es la responsable |

Sin comodín.

### 2.10 Escuela

| Ítem | Tipo |
|---|---|
| Boletín | Requerido, sin periodicidad (está o no está) |
| Constancia de estudio del año en curso (se registra el año) | Requerido |
| Carta de solicitud | Comodín simple, 1 mes (cubre boletín y constancia) |

Desde el 1 de enero se exige la constancia del nuevo año (o la carta).
Sin excepciones: todo niño debe estar escolarizado.

### 2.11 Pedagogía

| Ítem | Tipo |
|---|---|
| Ficha inicial pedagógica | Requerido, sin fecha |
| Atenciones de Pedagogía | Según calendario |
| Vinculaciones (deporte, arte, etc.) | Opcional, lista libre (nombre + fecha opcional), no afecta el % |

Sin comodín.

### 2.12 Proyecto de vida

| Ítem | Tipo |
|---|---|
| Proyecto de vida entregado | Requerido, sin fecha |

Sin comodín.

## 3. Pendientes por definir

- Fecha de nacimiento del niño: si se registra, avisar cuando cumpla 7 años y falte
  la tarjeta de identidad.
- Vistas: ver `vista-general.md`.
