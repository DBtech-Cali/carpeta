// Modo demostración: datos de ejemplo guardados solo en este navegador.
import { evaluarCarpeta } from '../dominio/carpeta';
import { hoy, partes, sumarDias } from '../dominio/fechas';
import type { Marca, Nino, Usuario } from '../dominio/modelo';
import { ahoraISO, type Datos, type Repositorio } from './repositorio';

const CLAVE = 'semillas-demo-v1';

const USUARIOS: Usuario[] = [
  { id: 'u-psico', nombre: 'Psicóloga', cargo: 'psicologia', pin: '1111', email: '', activo: true },
  { id: 'u-ts', nombre: 'Trabajadora social', cargo: 'trabajo_social', pin: '2222', email: '', activo: true },
  { id: 'u-nutri', nombre: 'Nutricionista', cargo: 'nutricion', pin: '3333', email: '', activo: true },
  { id: 'u-ped', nombre: 'Pedagoga', cargo: 'pedagogia', pin: '4444', email: '', activo: true },
  { id: 'u-coord', nombre: 'Coordinador', cargo: 'coordinacion', pin: '9999', email: '', activo: true },
  { id: 'u-gestor', nombre: 'Gestor de caso', cargo: 'gestion_caso', pin: '8888', email: '', activo: true },
];

/** Niños de ejemplo: días desde el ingreso y qué proporción de su carpeta está al día. */
const EJEMPLOS: [string, string, string, number, number, number][] = [
  ['Mateo', 'Álvarez', 'Rincón', 2, 420, 0.95],
  ['Valentina', 'Cárdenas', 'Mosquera', 3, 85, 0.7],
  ['Lady', 'Gómez', 'Pérez', 6, 160, 0.75],
  ['Samuel', 'Hurtado', 'Lozano', 6, 230, 0.4],
  ['Isabella', 'Mina', 'Caicedo', 8, 300, 1],
  ['Juan José', 'Ospina', 'Valencia', 9, 120, 0.55],
  ['Sofía', 'Restrepo', 'Arango', 11, 360, 0.88],
  ['Emmanuel', 'Zúñiga', 'Torres', 13, 40, 0.5],
];

function semilla(): Datos {
  const h = hoy();
  const ninos: Nino[] = EJEMPLOS.map(([nombres, a1, a2, caja, dias, avance], i) => {
    const n: Nino = {
      id: `n${i + 1}`, nombres, primerApellido: a1, segundoApellido: a2, caja, activo: true,
      fechaIngreso: sumarDias(h, -dias), responsableRiesgo: i % 2 ? 'trabajo_social' : 'psicologia', marcas: {},
      nutricion: i === 7 ? { desde: sumarDias(h, -10) } : null,
      prestamo: i === 5 ? { por: 'u-ped', desde: `${sumarDias(h, -9)}T09:00:00.000Z` } : i === 2 ? { por: 'u-ts', desde: `${sumarDias(h, -2)}T10:30:00.000Z` } : null,
    };
    // Marca todo lo exigible y deja sin marcar una parte, de forma estable.
    const usuarios = USUARIOS.map((u) => u.id);
    let k = 0;
    for (const tab of evaluarCarpeta(n, h).tabs) {
      for (const it of tab.items) {
        if (!it.exigible) continue;
        k++;
        if (((k * 37 + i * 11) % 100) / 100 >= avance) continue;
        const marca: Marca = { por: usuarios[(k + i) % usuarios.length], en: `${it.fecha ?? sumarDias(h, -k)}T15:00:00.000Z` };
        if (it.pide === 'fecha') marca.fecha = sumarDias(h, -20 - (k % 30));
        if (it.pide === 'anio') marca.anio = partes(h).y;
        n.marcas[it.id] = marca;
      }
    }
    return n;
  });
  return { ninos, usuarios: USUARIOS, movimientos: [], revisiones: [] };
}

export class RepositorioDemo implements Repositorio {
  modo = 'demo' as const;
  private datos: Datos;
  private oyentes = new Set<(d: Datos) => void>();

  constructor() {
    let guardado: Datos | null = null;
    try {
      const txt = localStorage.getItem(CLAVE);
      guardado = txt ? (JSON.parse(txt) as Datos) : null;
    } catch {
      guardado = null;
    }
    this.datos = guardado ?? semilla();
  }

  private emitir(cambio: (d: Datos) => Datos) {
    this.datos = cambio(this.datos);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(this.datos));
    } catch {
      // Sin almacenamiento: los cambios duran hasta recargar.
    }
    this.oyentes.forEach((cb) => cb(this.datos));
  }

  private nino(id: string, f: (n: Nino) => Nino) {
    this.emitir((d) => ({ ...d, ninos: d.ninos.map((n) => (n.id === id ? f(n) : n)) }));
  }

  suscribir(cb: (d: Datos) => void) {
    this.oyentes.add(cb);
    cb(this.datos);
    return () => void this.oyentes.delete(cb);
  }

  async marcar(ninoId: string, itemId: string, marca: Marca | null) {
    this.nino(ninoId, (n) => {
      const marcas = { ...n.marcas };
      if (marca) marcas[itemId] = marca;
      else delete marcas[itemId];
      return { ...n, marcas };
    });
  }

  async actualizarNino(ninoId: string, cambios: Partial<Nino>) {
    this.nino(ninoId, (n) => ({ ...n, ...cambios }));
  }

  async crearNino(n: Omit<Nino, 'id'>) {
    this.emitir((d) => ({ ...d, ninos: [...d.ninos, { ...n, id: `n${Date.now()}` }] }));
  }

  async guardarUsuario(u: Usuario) {
    this.emitir((d) => ({ ...d, usuarios: d.usuarios.map((x) => (x.id === u.id ? u : x)) }));
  }

  async crearUsuario(u: Omit<Usuario, 'id'>) {
    this.emitir((d) => ({ ...d, usuarios: [...d.usuarios, { ...u, id: `u${Date.now()}` }] }));
  }

  async moverCarpeta(ninoId: string, tipo: 'retiro' | 'devolucion', por: string) {
    const en = ahoraISO();
    this.emitir((d) => ({
      ...d,
      movimientos: [{ id: `m${Date.now()}`, ninoId, tipo, por, en }, ...d.movimientos].slice(0, 200),
      ninos: d.ninos.map((n) => (n.id === ninoId ? { ...n, prestamo: tipo === 'retiro' ? { por, desde: en } : null } : n)),
    }));
  }

  async agregarRevision(texto: string, por: string) {
    this.emitir((d) => ({ ...d, revisiones: [{ id: `r${Date.now()}`, texto, por, en: ahoraISO() }, ...d.revisiones] }));
  }
}

export function reiniciarDemo() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // nada que borrar
  }
}

