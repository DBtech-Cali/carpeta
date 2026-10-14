import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { TabId } from '../dominio/carpeta';
import { type Fecha, larga } from '../dominio/fechas';
import type { Usuario } from '../dominio/modelo';
import type { Datos, Repositorio } from '../datos/repositorio';

export interface Contexto {
  repo: Repositorio;
  datos: Datos;
  hoy: Fecha;
  usuario: (id: string | undefined) => Usuario | undefined;
}

export const Ctx = createContext<Contexto | null>(null);
export const useApp = () => useContext(Ctx)!;

/** Rutas con hash: #/, #/nino/ID, #/nino/ID/TAB, #/agenda, #/admin/SECCION. */
export function useRuta(): string[] {
  const leer = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [ruta, setRuta] = useState(leer);
  useEffect(() => {
    const f = () => setRuta(leer());
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return ruta;
}

export const ir = (ruta: string) => {
  window.location.hash = ruta;
};

export function banda(pct: number | null): string {
  if (pct === null) return 'banda-nada';
  if (pct < 50) return 'banda-rojo';
  if (pct < 90) return 'banda-ambar';
  return 'banda-verde';
}

export function Barra({ pct, gruesa, etiqueta }: { pct: number | null; gruesa?: boolean; etiqueta?: string }) {
  return (
    <span className={`progreso ${banda(pct)}`}>
      <span
        className={`pista ${gruesa ? 'pista--gruesa' : ''}`}
        role="progressbar"
        aria-label={etiqueta ?? 'Avance'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
      >
        <span className="pista__lleno" style={{ width: `${pct ?? 0}%` }} />
      </span>
      <span className="pct">{pct === null ? '—' : `${pct} %`}</span>
    </span>
  );
}

export function Brote({ tam = 44, feliz }: { tam?: number; feliz?: boolean }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 11c0-5 4-9 10-9 0 5-4 9-10 9z" fill="#2BB673" />
      <path d="M24 11v6" stroke="#16163A" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="7" y="17" width="34" height="27" rx="12" fill="#4338CA" />
      <rect x="12" y="23" width="24" height="14" rx="7" fill="#E9E7FF" />
      {feliz ? (
        <path d="M16 30.5l3-3 3 3M26 30.5l3-3 3 3" stroke="#16163A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <circle cx="19" cy="30" r="2.6" fill="#16163A" />
          <circle cx="29" cy="30" r="2.6" fill="#16163A" />
        </>
      )}
    </svg>
  );
}

export function Icono({ d, tam = 20, color = 'currentColor', grosor = 2 }: { d: string; tam?: number; color?: string; grosor?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export const ICONOS = {
  atras: 'M15 18l-6-6 6-6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  buscar: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-4-4',
  caja: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  reloj: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3 2',
  candado: 'M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3',
  descargar: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  correo: 'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3.5 7l8.5 6 8.5-6',
  escudo: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
};

export const ICONOS_TAB: Record<TabId, { d: string; fondo: string; tinta: string }> = {
  inicio: { d: 'M5 21V4M5 4h11l-2 4 2 4H5', fondo: '#EEECFF', tinta: '#4338CA' },
  preliminar: { d: 'M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M9 12h6M9 16h4', fondo: '#DDF6EF', tinta: '#0F7A5C' },
  pacto: { d: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3', fondo: '#FFE8DA', tinta: '#B4501E' },
  socio_legal: { d: 'M3 6h18v12H3zM7 10h4M7 14h6M15 10h3v4h-3z', fondo: '#E0F0FF', tinta: '#1D5FA8' },
  informes: { d: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7', fondo: '#FFF4CC', tinta: '#8A6400' },
  salud: { d: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', fondo: '#FCE4F1', tinta: '#A1306E' },
  nutricion: { d: 'M12 7c-3-2-7 0-7 5s3 9 5 9c1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-4 5-9s-4-7-7-5zM12 7c0-2 1-4 3-4', fondo: '#DDF6EF', tinta: '#0F7A5C' },
  trabajo_social: { d: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5', fondo: '#E0F0FF', tinta: '#1D5FA8' },
  psicologia: { d: 'M4 5h16v11H9l-5 4z', fondo: '#EEECFF', tinta: '#4338CA' },
  escuela: { d: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5', fondo: '#FFF4CC', tinta: '#8A6400' },
  pedagogia: { d: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5l-5.4 3 1.2-6-4.5-4.2 6.1-.7z', fondo: '#FFE8DA', tinta: '#B4501E' },
  proyecto_vida: { d: 'M12 21v-9M12 12c0-4 3-7 8-7 0 4-3 7-8 7zM12 14c0-3-2-5-6-5 0 3 2 5 6 5z', fondo: '#FCE4F1', tinta: '#A1306E' },
};

export function Encabezado({ activa }: { activa: 'carpetas' | 'agenda' | 'admin' }) {
  const { hoy } = useApp();
  const dia = new Date(`${hoy}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '');
  return (
    <header className="barra-sup no-imprimir">
      <div className="barra-sup__in">
        <a className="marca" href="#/">
          <Brote />
          <span>
            <span className="marca__nombre">Semillas Salesianas</span>
            <span className="etiqueta-mono">Revisor de carpetas</span>
          </span>
        </a>
        <nav className="nav" aria-label="Secciones">
          <a href="#/" aria-current={activa === 'carpetas' ? 'page' : undefined}>Carpetas</a>
          <a href="#/agenda" aria-current={activa === 'agenda' ? 'page' : undefined}>Agenda</a>
          <a href="#/admin" aria-current={activa === 'admin' ? 'page' : undefined}>Administración</a>
        </nav>
        <span className="fecha-hoy">{dia} {larga(hoy)}</span>
      </div>
    </header>
  );
}

export function Dialogo({ titulo, children, onCerrar }: { titulo: string; children: ReactNode; onCerrar: () => void }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [onCerrar]);
  return (
    <div className="velo" onClick={onCerrar}>
      <div className="dialogo" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <h2 className="subtitulo">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
