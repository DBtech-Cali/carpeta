// Agenda y reportes: qué está vencido y qué viene. Ver docs/vista-general.md.
import { evaluarCarpeta, type TabId } from './carpeta';
import { diasEntre, type Fecha, sumarDias } from './fechas';
import { type Nino, nombreCompleto, type Responsable } from './modelo';

export type Urgencia = 'vencido' | 'semana' | 'mes';

export interface Evento {
  ninoId: string;
  nino: string;
  tab: TabId;
  itemId?: string;
  que: string;
  fecha: Fecha;
  urgencia: Urgencia;
  responsable: Responsable;
}

export interface Pendiente {
  ninoId: string;
  nino: string;
  tab: TabId;
  que: string;
  fecha?: Fecha;
  responsable: Responsable;
}

export const DIAS_ALERTA_PRESTAMO = 7;

function urgencia(fecha: Fecha, hoy: Fecha): Urgencia | null {
  if (fecha < hoy) return 'vencido';
  if (fecha <= sumarDias(hoy, 7)) return 'semana';
  if (fecha <= sumarDias(hoy, 30)) return 'mes';
  return null;
}

export function diasFuera(nino: Nino, hoy: Fecha): number | null {
  return nino.prestamo ? diasEntre(nino.prestamo.desde.slice(0, 10), hoy) : null;
}

/** Eventos con fecha: vencidos y los próximos 30 días. */
export function agenda(ninos: Nino[], hoy: Fecha): Evento[] {
  const out: Evento[] = [];
  for (const n of ninos.filter((x) => x.activo)) {
    const nombre = nombreCompleto(n);
    const ev = evaluarCarpeta(n, hoy);
    for (const tab of ev.tabs) {
      for (const it of tab.items) {
        const base = { ninoId: n.id, nino: nombre, tab: tab.id, itemId: it.id, responsable: it.responsable };
        if (it.tipo === 'programada' && it.fecha && !it.marca) {
          // Se exige desde el día siguiente: vence "hoy" si hoy ya pasó la fecha.
          const u = it.exigible ? 'vencido' : urgencia(it.fecha, hoy);
          if (u) out.push({ ...base, que: it.etiqueta, fecha: it.fecha, urgencia: u });
        } else if (it.vence && it.marca && (it.tipo === 'doc' || it.estado === 'ok')) {
          const u = it.estado === 'vencido' && it.exigible ? 'vencido' : urgencia(it.vence, hoy);
          if (u) out.push({ ...base, que: `${u === 'vencido' ? 'Venció' : 'Vence'}: ${it.etiqueta}`, fecha: it.vence, urgencia: u });
        }
      }
    }
    const fuera = diasFuera(n, hoy);
    if (fuera !== null && fuera > DIAS_ALERTA_PRESTAMO) {
      out.push({ ninoId: n.id, nino: nombre, tab: 'inicio', que: `Carpeta fuera hace ${fuera} días`, fecha: n.prestamo!.desde.slice(0, 10), urgencia: 'vencido', responsable: 'general' });
    }
  }
  return out.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.nino.localeCompare(b.nino, 'es'));
}

/** Todo lo exigible que no se cumple (con o sin fecha). */
export function pendientes(ninos: Nino[], hoy: Fecha): Pendiente[] {
  const out: Pendiente[] = [];
  for (const n of ninos.filter((x) => x.activo)) {
    const nombre = nombreCompleto(n);
    for (const tab of evaluarCarpeta(n, hoy).tabs) {
      for (const it of tab.items) {
        if (it.exigible && !it.cumple) {
          out.push({ ninoId: n.id, nino: nombre, tab: tab.id, que: it.etiqueta + (it.estado === 'vencido' && it.vence ? ' (vencido)' : ''), fecha: it.fecha, responsable: it.responsable });
        }
      }
    }
  }
  return out.sort((a, b) => a.nino.localeCompare(b.nino, 'es') || (a.fecha ?? '').localeCompare(b.fecha ?? ''));
}
