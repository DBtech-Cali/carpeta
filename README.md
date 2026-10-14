# Revisor de carpetas · Semillas Salesianas

Aplicación web para llevar el control de las carpetas físicas de la modalidad
Semillas Salesianas: qué documentos tiene cada niño, qué atenciones y seguimientos
tocan y qué está vencido.

Las reglas del negocio están en `docs/`:

- `reglas-atencion.md`: calendario de plan de caso, seguimientos y atenciones.
- `contenido-carpeta.md`: las 12 pestañas, comodines, excepciones y porcentajes.
- `roles-y-permisos.md`: PIN, roles, préstamos, cajas y correo semanal.
- `vista-general.md`: pantallas y diseño.

## Desarrollo

```bash
npm install
npm run dev        # abre la app en modo demostración
npm test           # pruebas del calendario y de las reglas
npm run build      # versión para publicar (carpeta dist/)
```

Sin configuración de Firebase la app arranca en **modo demostración**: datos de
ejemplo guardados solo en el navegador. PIN de prueba: 1111 Psicóloga, 2222 Trabajo
social, 3333 Nutrición, 4444 Pedagoga, 9999 Coordinador, 8888 Gestor de caso.

## Código

- `src/dominio/`: reglas puras y probadas (fechas, calendario, evaluación de la
  carpeta, agenda). Aquí vive toda la lógica de negocio.
- `src/datos/`: acceso a datos. `firebase.ts` (Firestore) y `demo.ts` (navegador).
- `src/ui/`: pantallas (lista, PIN, carpeta, pestaña, agenda, administración).

## Puesta en marcha con Firebase

1. Crear una cuenta Gmail propia de la aplicación.
2. Con esa cuenta, crear un proyecto en <https://console.firebase.google.com>
   (plan gratuito Spark) y registrar una app web.
3. Activar **Authentication → Correo/contraseña** y crear un usuario con el correo
   de la aplicación. Es el acceso general de la tablet.
4. Activar **Firestore Database**.
5. Copiar `.env.example` a `.env.local` y completar los datos de la app web.
6. Publicar las reglas y la app:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # elegir el proyecto
   npm run build
   firebase deploy
   ```

7. Crear el primer administrador a mano en Firestore: colección `usuarios`, con los
   campos `nombre`, `cargo: "coordinacion"`, `pin` (4 dígitos), `email` y
   `activo: true`. Los demás usuarios se crean desde
   **Administración → Usuarios y PIN**.
