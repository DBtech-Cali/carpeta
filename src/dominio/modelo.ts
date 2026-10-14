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
  nutricion?: { desde: Fecha } | null;
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

export function nombreCompleto(n: Pick<Nino, 'nombres' | 'primerApellido' | 'segundoApellido'>): string {
  return `${[n.primerApellido, n.segundoApellido].filter(Boolean).join(' ')}, ${n.nombres}`;
}

export function ordenarNinos<T extends Pick<Nino, 'nombres' | 'primerApellido' | 'segundoApellido'>>(xs: T[]): T[] {
  const clave = (n: T) => `${n.primerApellido} ${n.segundoApellido ?? ''} ${n.nombres}`;
  return [...xs].sort((a, b) => clave(a).localeCompare(clave(b), 'es', { sensitivity: 'base' }));
}
