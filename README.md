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

Proyecto: `emj-archivo`. La configuración pública está en `.env.production`, así que
`npm run build` genera la versión conectada a Firebase (y `npm run dev` sigue en modo
demostración).

1. **Authentication**: método Correo/contraseña activo y un usuario con el correo de la
   aplicación. Es el acceso general de cada tablet o computador.
2. **Firestore**: base de datos creada y reglas de `firestore.rules` publicadas.
3. **Publicación automática en GitHub Pages**: el flujo `.github/workflows/publicar.yml`
   publica en <https://dbtech-cali.github.io/carpeta/> cada vez que cambia `main`.
   Requiere, una sola vez, **Settings → Pages → Source: GitHub Actions** en el
   repositorio. Firebase solo guarda los datos y el inicio de sesión.
4. La primera vez que se abre la app, pide crear el **primer administrador**; los demás
   usuarios se crean desde **Administración → Usuarios y PIN**.
