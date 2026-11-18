import type { Fecha } from './fechas';

export type Cargo = 'psicologia' | 'trabajo_social' | 'nutricion' | 'pedagogia' | 'coordinacion' | 'gestion_caso';
export type Responsable = 'psicologia' | 'trabajo_social' | 'nutricion' | 'pedagogia' | 'general';

export const CARGOS: Record<Cargo, string> = {
  psicologia: 'Psicóloga',
  trabajo_social: 'Trabajadora social',
  nutricion: 'Nutricionista',
  pedagogia: 'Pedagoga',
  coordinacion: 'Coordinador',
  gestion_caso: 'Gestor de caso',
};

export const RESPONSABLES: Record<Responsable, string> = {
  psicologia: 'Psicología',
  trabajo_social: 'Trabajo social',
  nutricion: 'Nutrición',
  pedagogia: 'Pedagogía',
  general: 'General',
};

export interface Usuario {
  id: string;
  nombre: string;
  cargo: Cargo;
  pin: string;
  email: string;
  activo: boolean;
}

export const esAdmin = (u: Usuario | null | undefined) => !!u && (u.cargo === 'coordinacion' || u.cargo === 'gestion_caso');

/** Un ítem marcado. Si no hay marca, el ítem no está marcado. */
export interface Marca {
  por: string; // id del usuario
  en: string; // fecha y hora ISO
  fecha?: Fecha; // fecha del documento (ADRES, tallaje, comodines)
  anio?: number; // año (constancia de estudio)
  texto?: string; // motivo (excepciones)
}

/** Frecuencia de atenciones de Nutrición que elige el nutricionista en un caso especial. */
export type FrecuenciaAtencion = 'quincenal' | 'mensual' | 'trimestral';

export const FRECUENCIAS_ATENCION: Record<FrecuenciaAtencion, string> = {
  quincenal: '2 al mes',
  mensual: '1 al mes',
  trimestral: '1 al trimestre',
};

/** Plan de un caso especial. Rige desde `desde` hasta el siguiente plan. */
export interface PlanNutricion {
  desde: Fecha;
  atencion: FrecuenciaAtencion;
  tallajeMeses: 1 | 2 | 3;
  creado: Fecha; // día en que se eligió (ese mismo día se corrige en lugar de agregar otro)
}

export interface Vinculacion {
  id: string;
  nombre: string;
  fecha?: Fecha;
}

export interface Prestamo {
  por: string;
  desde: string; // fecha y hora ISO
}

export interface Nino {
  id: string;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
  fechaIngreso: Fecha;
  fechaNacimiento?: Fecha;
  caja: number;
  activo: boolean;
  fechaEgreso?: Fecha;
  responsableRiesgo?: 'psicologia' | 'trabajo_social' | null;
  /** Caso especial de Nutrición activo desde esa fecha; null si no está activo. */
  nutricion?: { desde: Fecha; planes?: PlanNutricion[] } | null;
  prestamo?: Prestamo | null;
  marcas: Record<string, Marca>;
  vinculaciones?: Vinculacion[];
}

export interface Movimiento {
  id?: string;
  ninoId: string;
  tipo: 'retiro' | 'devolucion';
  por: string;
  en: string;
}

export interface Revision {
  id?: string;
  texto: string;
  por: string;
  en: string;
}

/** Planes del caso especial, en orden. Los casos anteriores a esta función quedan como trimestrales con tallaje a 3 meses. */
export function planesNutricion(n: Pick<Nino, 'fechaIngreso' | 'nutricion'>): PlanNutricion[] {
  if (!n.nutricion) return [];
  const planes = n.nutricion.planes?.length
    ? n.nutricion.planes
    : [{ desde: n.fechaIngreso, atencion: 'trimestral' as const, tallajeMeses: 3 as const, creado: n.nutricion.desde }];
  return [...planes].sort((a, b) => a.desde.localeCompare(b.desde));
}

export function nombreCompleto(n: Pick<Nino, 'nombres' | 'primerApellido' | 'segundoApellido'>): string {
  return `${[n.primerApellido, n.segundoApellido].filter(Boolean).join(' ')}, ${n.nombres}`;
}

export function ordenarNinos<T extends Pick<Nino, 'nombres' | 'primerApellido' | 'segundoApellido'>>(xs: T[]): T[] {
  const clave = (n: T) => `${n.primerApellido} ${n.segundoApellido ?? ''} ${n.nombres}`;
  return [...xs].sort((a, b) => clave(a).localeCompare(clave(b), 'es', { sensitivity: 'base' }));
}
