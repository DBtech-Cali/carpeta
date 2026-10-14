// Fechas como texto 'AAAA-MM-DD' (sin horas ni zonas horarias): se comparan como texto.
export type Fecha = string;

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function partes(f: Fecha): { y: number; m: number; d: number } {
  const [y, m, d] = f.split('-').map(Number);
  return { y, m, d };
}

export function armar(y: number, m: number, d: number): Fecha {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function diasEnMes(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Suma meses calendario y cae en el día ancla; si el mes no lo tiene, en su último día. */
export function sumarMeses(f: Fecha, n: number, ancla = partes(f).d): Fecha {
  const { y, m } = partes(f);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return armar(ny, nm, Math.min(ancla, diasEnMes(ny, nm)));
}

export function sumarDias(f: Fecha, n: number): Fecha {
  const { y, m, d } = partes(f);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return armar(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export function diasEntre(desde: Fecha, hasta: Fecha): number {
  const a = partes(desde);
  const b = partes(hasta);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);
}

export function hoy(): Fecha {
  const t = new Date();
  return armar(t.getFullYear(), t.getMonth() + 1, t.getDate());
}

/** '22 jun' o '22 jun 2027' si el año es distinto al de referencia. */
export function corta(f: Fecha, ref?: Fecha): string {
  const { y, m, d } = partes(f);
  const base = `${d} ${MESES[m - 1]}`;
  return ref && partes(ref).y !== y ? `${base} ${y}` : base;
}

export function larga(f: Fecha): string {
  const { y, m, d } = partes(f);
  return `${d} ${MESES[m - 1]} ${y}`;
}
