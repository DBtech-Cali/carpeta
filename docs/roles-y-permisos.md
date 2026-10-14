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

### Sesión de PIN por carpeta

- El PIN se pide **al entrar a la carpeta de un niño**.
- La sesión vale **solo dentro de esa carpeta**: al volver a la lista general se
  cierra, y entrar a otra carpeta pide el PIN de nuevo (aunque sea la misma persona).
- **No** hay sesiones por tiempo: así nunca queda registrado a nombre de alguien lo que
  marcó la siguiente persona en la tablet.

### Correo de cada usuario

- Cada usuario tiene registrado, además del PIN, su **correo Gmail** personal.

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

## 6. Registro de niños

Lo hacen solo los **administradores** (también el egreso y la baja).

| Dato | Obligatorio |
|---|---|
| Nombres | Sí |
| Primer apellido (orden de la lista) | Sí |
| Segundo apellido | No |
| Fecha de ingreso (base de todo el calendario) | Sí |
| Caja | Sí |
| Fecha de nacimiento | No (si está, permite avisar cuando cumpla 7 años y falte la tarjeta de identidad) |

Volumen aproximado: **60 niños** activos.

## 7. Préstamo de carpetas

Registro de cuándo alguien **retira** una carpeta física y cuándo la **devuelve**, para
saber si todas las carpetas están en su lugar.

- **Retirar:** la persona ingresa su PIN; la app guarda quién y la fecha y hora.
- **Devolver:** la persona ingresa su PIN; la app guarda quién y la fecha y hora.
- Sin motivo.
- **Alerta** si una carpeta lleva **más de 7 días fuera** (y el niño no ha egresado).
- Con la carpeta fuera **se pueden seguir marcando ítems** (a menudo se retira
  justamente para ponerla al día).

## 8. Ubicación física (cajas)

- Las carpetas se guardan en **cajas numeradas** (hoy 13, máximo 15).
- Cada niño tiene su caja para encontrarlo rápido (ej.: "Lady → caja 6").
- **Cualquier usuario** puede asignar o cambiar la caja, porque el orden se mueve
  según la llegada de los niños.

## 9. Correo semanal automático

- Se crea **una cuenta Gmail propia de la aplicación** (ej.: archivo de Semillas). Sirve
  como dueña del proyecto Firebase, como acceso general de la tablet y como remitente.
- Un **script de Google (Apps Script)** en esa cuenta, programado **cada lunes
  temprano**, envía a cada profesional su reporte: pendientes (vencidos) y próximos
  30 días. Los administradores reciben el reporte general.
- Gratis; funciona con cuentas Gmail normales (no requiere Google Workspace). El límite
  diario de Gmail (~100 destinatarios) sobra para ~6 usuarios.
