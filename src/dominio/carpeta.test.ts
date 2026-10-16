import { describe, expect, it } from 'vitest';
import { agenda } from './agenda';
import { evaluarCarpeta } from './carpeta';
import type { Marca, Nino } from './modelo';

const m = (extra: Partial<Marca> = {}): Marca => ({ por: 'u1', en: '2026-05-10T10:00:00Z', ...extra });

function nino(marcas: Record<string, Marca> = {}, extra: Partial<Nino> = {}): Nino {
  return { id: 'n1', nombres: 'Lady', primerApellido: 'Gómez', fechaIngreso: '2026-05-07', caja: 6, activo: true, marcas, ...extra };
}

const tab = (n: Nino, hoy: string, id: string) => evaluarCarpeta(n, hoy).tabs.find((t) => t.id === id)!;

describe('Inicio y comodín simple', () => {
  const base = { 'inicio.boleta': m(), 'inicio.pard': m(), 'inicio.val_ts': m() };
  it('sin comodín, los faltantes cuentan', () => {
    expect(tab(nino(base), '2026-06-01', 'inicio').pct).toBe(60);
  });
  it('comodín vigente lleva al 100 %', () => {
    const n = nino({ ...base, 'inicio.comodin': m({ fecha: '2026-05-07' }) });
    expect(tab(n, '2026-07-07', 'inicio').pct).toBe(100);
  });
  it('comodín vencido cuenta como si no existiera', () => {
    const n = nino({ ...base, 'inicio.comodin': m({ fecha: '2026-05-07' }) });
    expect(tab(n, '2026-07-08', 'inicio').pct).toBe(60);
  });
});

describe('Socio legal', () => {
  const docs = { 'socio.ti': m(), 'socio.rc': m(), 'socio.cedula': m() };
  it('ADRES vencido no cuenta y el comodín no lo cubre', () => {
    const n = nino({ ...docs, 'socio.adres': m({ fecha: '2026-07-12' }), 'socio.comodin': m({ fecha: '2026-10-01' }) });
    expect(tab(n, '2026-10-13', 'socio_legal').pct).toBe(75);
    expect(tab(n, '2026-10-12', 'socio_legal').pct).toBe(100);
  });
  it('menor de 7 años exonera la tarjeta de identidad', () => {
    const n = nino({ 'socio.rc': m(), 'socio.cedula': m(), 'socio.adres': m({ fecha: '2026-10-01' }), 'socio.menor7': m() });
    expect(tab(n, '2026-10-13', 'socio_legal').pct).toBe(100);
  });
});

describe('Informes y exigencia desde el día siguiente', () => {
  it('el plan de caso no falta el mismo día, sí al siguiente', () => {
    const n = nino({ 'informes.eval_integradora': m(), 'informes.acta_integradora': m() });
    expect(tab(n, '2026-06-07', 'informes').pct).toBe(100);
    expect(tab(n, '2026-06-08', 'informes').pct).toBe(50);
  });
  it('a los 5 meses exige el 1er seguimiento', () => {
    expect(tab(nino(), '2026-10-15', 'informes').exigibles).toBe(6);
  });
});

describe('Salud: escalera de cartas', () => {
  it('carta vigente cubre, vencida no, y el correo a Defensoría no vence', () => {
    const n = nino({ 'salud.vacunas': m(), 'salud.carta1': m({ fecha: '2026-06-01' }) });
    expect(tab(n, '2026-06-20', 'salud').pct).toBe(100);
    expect(tab(n, '2026-07-02', 'salud').pct).toBe(33);
    const n2 = nino({ ...n.marcas, 'salud.defensoria': m({ fecha: '2026-09-01' }) });
    expect(tab(n2, '2027-09-01', 'salud').pct).toBe(100);
  });
});

describe('Nutrición', () => {
  it('sin caso especial no hay atenciones; tallaje vence a los 6 meses', () => {
    const n = nino({ 'nutricion.valoracion_inicial': m(), 'nutricion.tallaje': m({ fecha: '2026-05-13' }) });
    expect(tab(n, '2026-11-13', 'nutricion').pct).toBe(100);
    expect(tab(n, '2026-11-14', 'nutricion').pct).toBe(50);
  });
  it('caso especial: tallaje a 3 meses y atenciones desde el plan de caso aunque se marque tarde', () => {
    const n = nino({ 'nutricion.valoracion_inicial': m(), 'nutricion.tallaje': m({ fecha: '2026-09-01' }) }, { nutricion: { desde: '2026-10-20' } });
    const t = tab(n, '2026-10-23', 'nutricion');
    expect(t.items.find((i) => i.id === 'ate.nutricion.b0')?.fecha).toBe('2026-07-22');
    expect(t.items.find((i) => i.id === 'ate.nutricion.b1')?.estado).toBe('vencido');
    expect(t.pct).toBe(50);
  });
});

describe('Escuela', () => {
  it('exige boletín y constancia del año; la carta cubre ambos', () => {
    expect(tab(nino({ 'escuela.constancia': m({ anio: 2026 }) }), '2026-10-15', 'escuela').pct).toBe(50);
    expect(tab(nino({ 'escuela.boletin': m(), 'escuela.constancia': m({ anio: 2026 }) }), '2026-10-15', 'escuela').pct).toBe(100);
    expect(tab(nino({ 'escuela.comodin': m({ fecha: '2026-10-01' }) }), '2026-10-15', 'escuela').pct).toBe(100);
  });
});

describe('Nivel de riesgo y promedio general', () => {
  it('va en la pestaña de la responsable', () => {
    const n = nino({}, { responsableRiesgo: 'psicologia' });
    const ids = (id: string) => tab(n, '2026-10-14', id).items.map((i) => i.id);
    expect(ids('psicologia')).toContain('riesgo.1');
    expect(ids('trabajo_social')).not.toContain('riesgo.1');
  });
  it('el general es el promedio de pestañas con algo exigible', () => {
    const ev = evaluarCarpeta(nino(), '2026-05-08');
    const conPct = ev.tabs.filter((t) => t.pct !== null);
    expect(ev.pct).toBe(Math.round(conPct.reduce((s, t) => s + t.pct!, 0) / conPct.length));
  });
});

describe('Agenda', () => {
  it('clasifica vencidos, semana y mes', () => {
    const ev = agenda([nino({}, { responsableRiesgo: 'psicologia' })], '2026-06-20');
    const plan = ev.find((e) => e.itemId === 'informes.plan');
    expect(plan?.urgencia).toBe('vencido');
    expect(ev.find((e) => e.itemId === 'ate.psicologia.1')?.urgencia).toBe('semana');
    expect(ev.find((e) => e.itemId === 'ate.psicologia.2')?.urgencia).toBe('mes');
  });
  it('alerta de carpeta fuera más de 7 días', () => {
    const n = nino({}, { prestamo: { por: 'u1', desde: '2026-06-01T09:00:00Z' } });
    expect(agenda([n], '2026-06-09').some((e) => e.que.startsWith('Carpeta fuera'))).toBe(true);
    expect(agenda([n], '2026-06-08').some((e) => e.que.startsWith('Carpeta fuera'))).toBe(false);
  });
});

describe('Reporte por ítem', () => {
  it('lista a quién le falta o tiene vencido un documento sin cambiar datos', async () => {
    const { catalogoItems, reportePorItem } = await import('./agenda');
    expect(catalogoItems('2026-10-16').map((i) => i.id)).toEqual(expect.arrayContaining(['socio.adres', 'escuela.boletin', 'escuela.constancia']));
    const a = nino({ 'socio.adres': m({ fecha: '2026-09-01' }) }, { id: 'a', nombres: 'Ana' });
    const b = nino({ 'socio.adres': m({ fecha: '2026-05-01' }) }, { id: 'b', nombres: 'Beto' });
    const c = nino({}, { id: 'c', nombres: 'Caro' });
    const copia = JSON.stringify([a, b, c]);
    const filas = reportePorItem([a, b, c], '2026-10-16', 'socio.adres');
    expect(Object.fromEntries(filas.map((f) => [f.ninoId, f.estado]))).toEqual({ a: 'al_dia', b: 'vencido', c: 'falta' });
    expect(JSON.stringify([a, b, c])).toBe(copia);
  });
});
