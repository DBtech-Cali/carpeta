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

/** Ítems que se pueden consultar uno a uno en el reporte por ítem (documentos, no atenciones). */
export interface ItemCatalogo {
  id: string;
  etiqueta: string;
  tab: TabId;
  tabNombre: string;
}

const NINO_MODELO: Nino = {
  id: 'modelo', nombres: '', primerApellido: '', fechaIngreso: '2000-01-01', caja: 0, activo: true, marcas: {},
  responsableRiesgo: 'psicologia', nutricion: null,
};

export function catalogoItems(hoy: Fecha): ItemCatalogo[] {
  const out: ItemCatalogo[] = [];
  for (const tab of evaluarCarpeta(NINO_MODELO, hoy).tabs) {
    for (const it of tab.items) {
      const documento = it.tipo === 'doc' || it.tipo === 'opcional';
      const fijo = it.tipo === 'programada' && !it.grupo && !/_\d+$/.test(it.id); // sin seguimientos numerados
      if (documento || fijo) out.push({ id: it.id, etiqueta: it.etiqueta, tab: tab.id, tabNombre: tab.nombre });
    }
  }
  return out;
}

export type EstadoReporte = 'falta' | 'vencido' | 'cubierto' | 'exonerado' | 'al_dia' | 'no_aplica';

export interface FilaReporteItem {
  ninoId: string;
  nino: string;
  caja: number;
  estado: EstadoReporte;
  nota?: string;
}

/** Estado de un ítem en cada niño activo. Solo lee: no cambia ningún dato. */
export function reportePorItem(ninos: Nino[], hoy: Fecha, itemId: string): FilaReporteItem[] {
  const out: FilaReporteItem[] = [];
  for (const n of ninos.filter((x) => x.activo)) {
    const it = evaluarCarpeta(n, hoy).tabs.flatMap((t) => t.items).find((i) => i.id === itemId);
    const base = { ninoId: n.id, nino: nombreCompleto(n), caja: n.caja };
    if (!it) {
      out.push({ ...base, estado: 'no_aplica' });
      continue;
    }
    const estado: EstadoReporte =
      it.estado === 'exonerado' ? 'exonerado'
      : it.estado === 'cubierto' ? 'cubierto'
      : it.estado === 'vencido' ? 'vencido'
      : it.estado === 'pendiente' ? 'falta'
      : it.marca ? 'al_dia'
      : it.exigible ? 'falta' : 'no_aplica';
    out.push({ ...base, estado, nota: it.nota });
  }
  return out.sort((a, b) => a.nino.localeCompare(b.nino, 'es'));
}
