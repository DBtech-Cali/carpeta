# Roles, permisos y operación — Semillas Salesianas

Complementa [`reglas-atencion.md`](reglas-atencion.md) y
[`contenido-carpeta.md`](contenido-carpeta.md).

## 1. Contexto de uso

- Aplicación **interna**, de pequeña escala.
- Aplicación web con un **acceso general previo** para cargarla; no es solo local.
- Datos en **Firebase** (plan gratuito).
- Se usa principalmente desde un **computador o tablet en la entrada del archivo**,
  donde se depositan los documentos en las carpetas físicas.

## 2. Identificación de usuarios

- Cada persona tiene un **PIN de 4 dígitos**.
- El PIN **no restringe** acciones: sirve para dejar **historial** de quién marcó o
  desmarcó cada ítem y cuándo. Si algo falta, se sabe a quién preguntar.
- Sin bloqueo por intentos fallidos.

## 3. Roles

| Rol | Personas | Puede |
|---|---|---|
| Profesional | Psicóloga, Trabajadora social, Nutricionista, Pedagoga (una por cargo) | Marcar y desmarcar **cualquier ítem de cualquier pestaña**; registrar comodines, fechas y excepciones; marcar caso especial de Nutrición; asumir el nivel de riesgo |
| Administrador | Coordinador, Gestor de caso (mismos permisos) | Todo lo del profesional, más: registrar niños nuevos, corregir la fecha de ingreso, egresos y bajas, crear y dar de baja usuarios, reportes, revisión |

- **Responsable del nivel de riesgo:** lo marca la psicóloga o la trabajadora social
  que lo va a llevar.

## 4. Porcentaje y revisión

- El porcentaje se calcula **solo con lo que marcan los usuarios**. No existen estados
  de "verificado" ni "devuelto".
- **Revisión:** la hacen los administradores de forma **aleatoria**, sin fechas ni
  cumplimiento. Si en la carpeta física no está algo marcado, **se desmarca** y el ítem
  vuelve a estar pendiente (sin anotación especial).
- El revisor puede dejar un **registro libre** de lo que revisó.

## 5. Reportes (panel de administración)

Pendientes agrupados por responsable:

| Pendiente | Reporte |
|---|---|
| Pestaña Preliminar | Psicóloga |
| Pestaña Psicología y sus atenciones | Psicóloga |
| Pestaña Trabajo social y sus atenciones | Trabajadora social |
| Seguimientos de nivel de riesgo | La responsable (Psicóloga o Trabajadora social) |
| Pestañas Nutrición y Salud, atenciones de Nutrición | Nutricionista |
| Pestañas Pedagogía y Escuela, atenciones de Pedagogía | Pedagoga |
| Inicio, Pacto de convivencia, Socio legal, Informes, Proyecto de vida | General |

## 6. Préstamo de carpetas

Registro de cuándo alguien **retira** una carpeta física (por ejemplo, para revisar
algo) y cuándo la **devuelve**, para saber si todas las carpetas están en su lugar.
Detalle por definir.

## 7. Ubicación física (cajas)

Las carpetas se guardan en **cajas numeradas**. Cada niño tiene asignada su caja
para encontrarlo rápido (ej.: "Lady → caja 6"). Detalle por definir.

## 8. Pendientes por definir

- Datos que se registran de cada niño al ingresarlo.
- Préstamo: quién lo registra, si se anota motivo y si hay alerta por carpetas que
  llevan mucho tiempo fuera.
- Cajas: cantidad de cajas, quién asigna o cambia la caja de un niño.
- Volumen aproximado de niños activos a la vez.
