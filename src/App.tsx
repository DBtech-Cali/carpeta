import { useCallback, useEffect, useMemo, useState } from 'react';
import { TABS, type TabId } from './dominio/carpeta';
import { hoy as hoyFecha } from './dominio/fechas';
import { esAdmin, nombreCompleto, type Usuario } from './dominio/modelo';
import { reiniciarDemo } from './datos/demo';
import type { Datos, Repositorio } from './datos/repositorio';
import { Admin } from './ui/Admin';
import { Agenda } from './ui/Agenda';
import { Carpeta } from './ui/Carpeta';
import { Brote, Ctx, ir, useRuta } from './ui/comunes';
import { Lista } from './ui/Lista';
import { Pin } from './ui/Pin';
import { PrimerAdmin } from './ui/PrimerAdmin';

/** Sesión de PIN: vale solo dentro de una carpeta (o del panel de administración). */
interface Sesion {
  ambito: string; // id del niño o 'admin'
  usuario: Usuario;
}

export function App({ repo }: { repo: Repositorio }) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [hoy, setHoy] = useState(hoyFecha);
  const ruta = useRuta();

  useEffect(() => repo.suscribir(setDatos), [repo]);
  // La tablet puede quedar encendida varios días: actualiza "hoy" cada minuto.
  useEffect(() => {
    const t = setInterval(() => setHoy(hoyFecha()), 60_000);
    return () => clearInterval(t);
  }, []);

  const ambito = ruta[0] === 'nino' ? ruta[1] : ruta[0] === 'admin' ? 'admin' : null;
  // Salir de la carpeta (o del panel) cierra la sesión de PIN.
  useEffect(() => {
    if (sesion && sesion.ambito !== ambito) setSesion(null);
  }, [ambito, sesion]);

  const ctx = useMemo(() => {
    if (!datos) return null;
    const porId = new Map(datos.usuarios.map((u) => [u.id, u]));
    return { repo, datos, hoy, usuario: (id: string | undefined) => (id ? porId.get(id) : undefined) };
  }, [repo, datos, hoy]);

  const entrar = useCallback((u: Usuario) => ambito && setSesion({ ambito, usuario: u }), [ambito]);
  const soloAdmin = useCallback((u: Usuario) => (esAdmin(u) ? null : 'Solo coordinación o gestión de caso.'), []);

  if (!ctx) {
    return (
      <div className="pin-fondo">
        <div className="pin"><Brote tam={72} /><p>Cargando carpetas…</p></div>
      </div>
    );
  }

  let pantalla;
  if (repo.modo === 'firebase' && ctx.datos.usuarios.length === 0) {
    pantalla = <PrimerAdmin />;
  } else if (ruta[0] === 'nino') {
    const nino = ctx.datos.ninos.find((n) => n.id === ruta[1] && n.activo);
    const tab = TABS.some((t) => t.id === ruta[2]) ? (ruta[2] as TabId) : undefined;
    if (!nino) pantalla = <Lista />;
    else if (sesion?.ambito !== nino.id) {
      pantalla = <Pin contexto={`Carpeta · caja ${nino.caja}`} titulo={nombreCompleto(nino)} onOk={entrar} onCancelar={() => ir('/')} />;
    } else pantalla = <Carpeta key={nino.id} nino={nino} sesion={sesion.usuario} tab={tab} />;
  } else if (ruta[0] === 'agenda') {
    pantalla = <Agenda />;
  } else if (ruta[0] === 'admin') {
    pantalla = sesion?.ambito === 'admin'
      ? <Admin seccion={ruta[1]} sesion={sesion.usuario} />
      : <Pin contexto="Administración" titulo="Coordinación y gestión de caso" onOk={entrar} validar={soloAdmin} onCancelar={() => ir('/')} />;
  } else {
    pantalla = <Lista />;
  }

  return (
    <Ctx.Provider value={ctx}>
      {repo.modo === 'demo' && (
        <div className="aviso-demo no-imprimir">
          Modo demostración: los datos se guardan solo en este navegador. PIN de prueba: 1111 Psicóloga · 2222 TS · 3333 Nutrición · 4444 Pedagoga · 9999 Coordinador.{' '}
          <button type="button" onClick={() => { reiniciarDemo(); window.location.reload(); }}>Reiniciar datos</button>
        </div>
      )}
      {pantalla}
    </Ctx.Provider>
  );
}
