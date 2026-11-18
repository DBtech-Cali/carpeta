// Calendario de atención de Semillas Salesianas. Ver docs/reglas-atencion.md.
import { Fecha, partes, sumarDias, sumarMeses } from './fechas';
import type { FrecuenciaAtencion, PlanNutricion } from './modelo';

export type AreaAtencion = 'trabajo_social' | 'psicologia' | 'pedagogia';

export interface Programada {
  id: string;
  fecha: Fecha;
  etiqueta: string;
}

export function planDeCaso(ingreso: Fecha): Fecha {
  return sumarMeses(ingreso, 1);
}

/** Hito k: 0 = plan de caso, k >= 1 = seguimiento k. Siempre en el día ancla del plan. */
export function hito(ingreso: Fecha, k: number): Fecha {
  const plan = planDeCaso(ingreso);
  return k === 0 ? plan : sumarMeses(plan, 3 * k, partes(plan).d);
}

export function nombreHito(k: number): string {
  return k === 0 ? 'Plan de caso' : `${k}º seguimiento`;
}

/** Índice del bloque (hito k → hito k+1) que contiene la fecha. Antes del plan cuenta como bloque 0. */
export function bloqueDe(ingreso: Fecha, f: Fecha): number {
  let k = 0;
  while (hito(ingreso, k + 1) <= f) k++;
  return k;
}

/** Atenciones de un área hasta la fecha límite (inclusive). */
export function atenciones(ingreso: Fecha, hasta: Fecha): Programada[] {
  const plan = planDeCaso(ingreso);
  const ancla = partes(plan).d;
  const fechas: Fecha[] = [
    sumarDias(plan, 15),
    sumarMeses(plan, 1, ancla),
    sumarDias(sumarMeses(plan, 1, ancla), 15),
    sumarMeses(plan, 2, ancla),
    sumarDias(sumarMeses(plan, 2, ancla), 15),
  ];
  const seg1 = hito(ingreso, 1);
  fechas.push(sumarMeses(seg1, 1, ancla), sumarMeses(seg1, 2, ancla), sumarDias(hito(ingreso, 2), -5));
  const out: Programada[] = [];
  fechas.forEach((fecha, i) => {
    if (fecha <= hasta) out.push({ id: String(i + 1), fecha, etiqueta: `Atención ${i + 1}` });
  });
  for (let k = 2, n = 9; ; k++, n++) {
    const fecha = sumarDias(hito(ingreso, k), 45);
    if (fecha > hasta) break;
    out.push({ id: String(n), fecha, etiqueta: `Atención ${n}` });
  }
  return out;
}

/** Seguimientos de nivel de riesgo: mensuales desde el plan de caso. */
export function nivelRiesgo(ingreso: Fecha, hasta: Fecha): Programada[] {
  const plan = planDeCaso(ingreso);
  const out: Programada[] = [];
  for (let m = 1; ; m++) {
    const fecha = sumarMeses(plan, m, partes(plan).d);
    if (fecha > hasta) break;
    out.push({ id: String(m), fecha, etiqueta: `Nivel de riesgo ${m}` });
  }
  return out;
}

/**
 * Atenciones de Nutrición para un caso especial activado en `desde`: una por bloque,
 * a los 45 días del hito que lo abre, empezando por el bloque donde se activó.
 * Si se activó después de esa fecha, el límite de la primera es el hito que cierra el bloque.
 */
export function atencionesNutricion(ingreso: Fecha, desde: Fecha, hasta: Fecha): Programada[] {
  const primero = bloqueDe(ingreso, desde);
  const out: Programada[] = [];
  for (let k = primero; ; k++) {
    let fecha = sumarDias(hito(ingreso, k), 45);
    if (k === primero && desde > fecha) fecha = hito(ingreso, k + 1);
    if (fecha > hasta) break;
    out.push({ id: `b${k}`, fecha, etiqueta: `Atención de Nutrición · bloque ${k + 1}` });
  }
  return out;
}

/** Fechas candidatas de atención de Nutrición según la frecuencia, desde el plan de caso. */
function candidatasNutricion(ingreso: Fecha, frecuencia: FrecuenciaAtencion, hasta: Fecha): Programada[] {
  const plan = planDeCaso(ingreso);
  const ancla = partes(plan).d;
  const out: Programada[] = [];
  if (frecuencia === 'trimestral') {
    for (let k = 0; ; k++) {
      const fecha = sumarDias(hito(ingreso, k), 45);
      if (fecha > hasta) break;
      out.push({ id: `b${k}`, fecha, etiqueta: `Atención trimestral · bloque ${k + 1}` });
    }
  } else {
    for (let n = 0; ; n++) {
      const base = sumarMeses(plan, n, ancla);
      if (base > hasta) break;
      if (frecuencia === 'mensual') {
        if (n >= 1) out.push({ id: `m${n}`, fecha: base, etiqueta: 'Atención mensual' });
      } else {
        if (n >= 1) out.push({ id: `q${n}a`, fecha: base, etiqueta: 'Atención quincenal' });
        const media = sumarDias(base, 15);
        if (media <= hasta) out.push({ id: `q${n}b`, fecha: media, etiqueta: 'Atención quincenal' });
      }
    }
  }
  return out.filter((p) => p.fecha <= hasta);
}

/**
 * Atenciones de Nutrición de un caso especial según los planes del nutricionista.
 * El primer plan rige desde el plan de caso; cada cambio rige desde su fecha, sin pedir
 * hacia atrás lo que no tocaba con el plan anterior.
 */
export function atencionesNutricionPlanes(ingreso: Fecha, planes: PlanNutricion[], hasta: Fecha): Programada[] {
  const out: Programada[] = [];
  planes.forEach((p, i) => {
    const desde = i === 0 ? null : p.desde;
    const hastaTramo = planes[i + 1]?.desde; // exclusivo
    for (const c of candidatasNutricion(ingreso, p.atencion, hasta)) {
      if (desde && c.fecha < desde) continue;
      if (hastaTramo && c.fecha >= hastaTramo) continue;
      out.push(c);
    }
  });
  return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Ítems de la pestaña Informes con su fecha de exigencia. */
export function informes(ingreso: Fecha, hasta: Fecha): Programada[] {
  const integradora = sumarDias(ingreso, 22);
  const plan = planDeCaso(ingreso);
  const out: Programada[] = [
    { id: 'eval_integradora', fecha: integradora, etiqueta: 'Evaluación integradora' },
    { id: 'acta_integradora', fecha: integradora, etiqueta: 'Acta de caso de la evaluación integradora' },
    { id: 'plan', fecha: plan, etiqueta: 'Plan de caso' },
    { id: 'correo_plan', fecha: plan, etiqueta: 'Correo de envío del plan de caso' },
  ];
  for (let k = 1; ; k++) {
    const fecha = hito(ingreso, k);
    if (fecha > hasta) break;
    out.push(
      { id: `seg_${k}`, fecha, etiqueta: `${k}º seguimiento` },
      { id: `correo_seg_${k}`, fecha, etiqueta: `Correo de envío del ${k}º seguimiento` },
    );
  }
  return out.filter((p) => p.fecha <= hasta);
}
