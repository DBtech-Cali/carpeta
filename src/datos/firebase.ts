// Datos en Firebase (Firestore). Colecciones: ninos, usuarios, movimientos, revisiones, historial.
import { type FirebaseApp, initializeApp } from 'firebase/app';
import { type Auth, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import {
  addDoc, collection, deleteField, doc, type Firestore, getFirestore, limit, onSnapshot, orderBy, query,
  setDoc, updateDoc, FieldPath, writeBatch,
} from 'firebase/firestore';
import type { Marca, Movimiento, Nino, Revision, Usuario } from '../dominio/modelo';
import { ahoraISO, type Datos, type Repositorio } from './repositorio';

export const configFirebase = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const hayFirebase = !!(configFirebase.apiKey && configFirebase.projectId);

/** Quita los campos undefined, que Firestore no acepta. */
function limpio<T extends object>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

export class RepositorioFirebase implements Repositorio {
  modo = 'firebase' as const;
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;

  constructor() {
    this.app = initializeApp(configFirebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
  }

  /** Acceso general de la tablet (cuenta Gmail de la aplicación). */
  observarSesion(cb: (u: User | null) => void) {
    return onAuthStateChanged(this.auth, cb);
  }

  entrar(email: string, clave: string) {
    return signInWithEmailAndPassword(this.auth, email, clave);
  }

  cerrarAcceso() {
    return signOut(this.auth);
  }

  suscribir(cb: (d: Datos) => void) {
    const datos: Datos = { ninos: [], usuarios: [], movimientos: [], revisiones: [] };
    const listos = new Set<string>();
    const avisar = (clave: string) => {
      listos.add(clave);
      if (listos.size === 4) cb({ ...datos });
    };
    const subs = [
      onSnapshot(collection(this.db, 'ninos'), (s) => {
        datos.ninos = s.docs.map((d) => ({ marcas: {}, ...d.data(), id: d.id }) as Nino);
        avisar('ninos');
      }),
      onSnapshot(collection(this.db, 'usuarios'), (s) => {
        datos.usuarios = s.docs.map((d) => ({ ...d.data(), id: d.id }) as Usuario);
        avisar('usuarios');
      }),
      onSnapshot(query(collection(this.db, 'movimientos'), orderBy('en', 'desc'), limit(200)), (s) => {
        datos.movimientos = s.docs.map((d) => ({ ...d.data(), id: d.id }) as Movimiento);
        avisar('movimientos');
      }),
      onSnapshot(query(collection(this.db, 'revisiones'), orderBy('en', 'desc'), limit(200)), (s) => {
        datos.revisiones = s.docs.map((d) => ({ ...d.data(), id: d.id }) as Revision);
        avisar('revisiones');
      }),
    ];
    return () => subs.forEach((u) => u());
  }

  async marcar(ninoId: string, itemId: string, marca: Marca | null, por: string) {
    const lote = writeBatch(this.db);
    // Los ids llevan puntos (p. ej. 'socio.adres'): se usa FieldPath para no anidarlos.
    lote.update(doc(this.db, 'ninos', ninoId), new FieldPath('marcas', itemId), marca ? limpio(marca) : deleteField());
    lote.set(doc(collection(this.db, 'historial')), { ninoId, itemId, accion: marca ? 'marcar' : 'desmarcar', por, en: ahoraISO() });
    await lote.commit();
  }

  async actualizarNino(ninoId: string, cambios: Partial<Nino>) {
    const datos: Record<string, ReturnType<typeof deleteField> | object | string | number | boolean | null> = {};
    for (const [k, v] of Object.entries(cambios)) datos[k] = v === undefined ? deleteField() : (v as object);
    await updateDoc(doc(this.db, 'ninos', ninoId), datos);
  }

  async crearNino(n: Omit<Nino, 'id'>) {
    await addDoc(collection(this.db, 'ninos'), limpio(n));
  }

  async guardarUsuario(u: Usuario) {
    const { id, ...resto } = u;
    await setDoc(doc(this.db, 'usuarios', id), limpio(resto));
  }

  async crearUsuario(u: Omit<Usuario, 'id'>) {
    await addDoc(collection(this.db, 'usuarios'), limpio(u));
  }

  async moverCarpeta(ninoId: string, tipo: Movimiento['tipo'], por: string) {
    const en = ahoraISO();
    const lote = writeBatch(this.db);
    lote.set(doc(collection(this.db, 'movimientos')), { ninoId, tipo, por, en });
    lote.update(doc(this.db, 'ninos', ninoId), { prestamo: tipo === 'retiro' ? { por, desde: en } : null });
    await lote.commit();
  }

  async agregarRevision(texto: string, por: string) {
    await addDoc(collection(this.db, 'revisiones'), { texto, por, en: ahoraISO() });
  }
}
