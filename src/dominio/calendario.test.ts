import { describe, expect, it } from 'vitest';
import { atenciones, atencionesNutricion, hito, informes, nivelRiesgo, planDeCaso } from './calendario';
import { sumarMeses } from './fechas';

const fechas = (xs: { fecha: string }[]) => xs.map((x) => x.fecha);

describe('día ancla y fin de mes', () => {
  it('lleva al último día cuando el mes no tiene el día', () => {
    expect(sumarMeses('2027-01-31', 1)).toBe('2027-02-28');
    expect(sumarMeses('2028-01-31', 1)).toBe('2028-02-29');
    expect(sumarMeses('2026-03-31', 1)).toBe('2026-04-30');
  });
});

describe('ingreso 7 de mayo de 2026', () => {
  const ing = '2026-05-07';
  it('plan y seguimientos', () => {
    expect(planDeCaso(ing)).toBe('2026-06-07');
    expect([1, 2, 3, 4].map((k) => hito(ing, k))).toEqual(['2026-09-07', '2026-12-07', '2027-03-07', '2027-06-07']);
  });
  it('atenciones por periodo', () => {
    expect(fechas(atenciones(ing, '2027-06-01'))).toEqual([
      '2026-06-22', '2026-07-07', '2026-07-22', '2026-08-07', '2026-08-22',
      '2026-10-07', '2026-11-07', '2026-12-02',
      '2027-01-21', '2027-04-21',
    ]);
  });
  it('nutrición activada en el 1er seguimiento', () => {
    expect(fechas(atencionesNutricion(ing, '2026-09-07', '2027-06-01'))).toEqual(['2026-10-22', '2027-01-21', '2027-04-21']);
  });
  it('nutrición activada después de la fecha del bloque usa el seguimiento que lo cierra', () => {
    expect(fechas(atencionesNutricion(ing, '2026-11-20', '2027-02-01'))).toEqual(['2026-12-07', '2027-01-21']);
  });
  it('nivel de riesgo mensual', () => {
    expect(fechas(nivelRiesgo(ing, '2026-10-31'))).toEqual(['2026-07-07', '2026-08-07', '2026-09-07', '2026-10-07']);
  });
  it('informes crecen con el tiempo', () => {
    expect(informes(ing, '2026-07-15').map((i) => i.id)).toEqual(['eval_integradora', 'acta_integradora', 'plan', 'correo_plan']);
    expect(informes(ing, '2026-10-15').map((i) => i.id)).toContain('correo_seg_1');
    expect(informes(ing, '2026-07-15')[0].fecha).toBe('2026-05-29');
  });
});

describe('ingreso 31 de enero de 2027', () => {
  const ing = '2027-01-31';
  it('ancla 28', () => {
    expect(planDeCaso(ing)).toBe('2027-02-28');
    expect(fechas(atenciones(ing, '2027-10-31'))).toEqual([
      '2027-03-15', '2027-03-28', '2027-04-12', '2027-04-28', '2027-05-13',
      '2027-06-28', '2027-07-28', '2027-08-23',
      '2027-10-12',
    ]);
    expect([1, 2, 3].map((k) => hito(ing, k))).toEqual(['2027-05-28', '2027-08-28', '2027-11-28']);
  });
});

describe('ingreso 30 de octubre de 2026', () => {
  const ing = '2026-10-30';
  it('el ancla vuelve después de febrero', () => {
    expect(planDeCaso(ing)).toBe('2026-11-30');
    expect([1, 2, 3].map((k) => hito(ing, k))).toEqual(['2027-02-28', '2027-05-30', '2027-08-30']);
    expect(fechas(atenciones(ing, '2027-07-31'))).toEqual([
      '2026-12-15', '2026-12-30', '2027-01-14', '2027-01-30', '2027-02-14',
      '2027-03-30', '2027-04-30', '2027-05-25',
      '2027-07-14',
    ]);
  });
});
