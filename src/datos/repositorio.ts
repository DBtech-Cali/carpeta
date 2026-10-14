import type { Marca, Movimiento, Nino, Revision, Usuario } from '../dominio/modelo';

export interface Datos {
  ninos: Nino[];
  usuarios: Usuario[];
  movimientos: Movimiento[];
  revisiones: Revision[];
}

export interface EntradaHistorial {
  ninoId: string;
  itemId: string;
  accion: 'marcar' | 'desmarcar';
  por: string;
  en: string;
}

/** Acceso a los datos. Hay dos implementaciones: Firebase y demostración local. */
export interface Repositorio {
  modo: 'demo' | 'firebase';
  suscribir(cb: (d: Datos) => void): () => void;
  marcar(ninoId: string, itemId: string, marca: Marca | null, por: string): Promise<void>;
  actualizarNino(ninoId: string, cambios: Partial<Omit<Nino, 'id' | 'marcas'>>): Promise<void>;
  crearNino(n: Omit<Nino, 'id'>): Promise<void>;
  guardarUsuario(u: Usuario): Promise<void>;
  crearUsuario(u: Omit<Usuario, 'id'>): Promise<void>;
  /** Retira o devuelve la carpeta física: guarda el movimiento y actualiza el préstamo del niño. */
  moverCarpeta(ninoId: string, tipo: Movimiento['tipo'], por: string): Promise<void>;
  agregarRevision(texto: string, por: string): Promise<void>;
  /** Cierra el acceso general de este equipo (solo con Firebase). */
  cerrarAcceso?(): Promise<void>;
}

export const ahoraISO = () => new Date().toISOString();
