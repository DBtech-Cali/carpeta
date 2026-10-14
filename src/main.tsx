import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { RepositorioDemo } from './datos/demo';
import { hayFirebase, RepositorioFirebase } from './datos/firebase';
import { Acceso } from './ui/Acceso';
import { Brote } from './ui/comunes';
import './estilos.css';

function ConFirebase({ repo }: { repo: RepositorioFirebase }) {
  const [estado, setEstado] = useState<'cargando' | 'fuera' | 'dentro'>('cargando');
  useEffect(() => repo.observarSesion((u) => setEstado(u ? 'dentro' : 'fuera')), [repo]);
  if (estado === 'cargando') return <div className="pin-fondo"><div className="pin"><Brote tam={72} /><p>Conectando…</p></div></div>;
  if (estado === 'fuera') return <Acceso entrar={(e, c) => repo.entrar(e, c)} />;
  return <App repo={repo} />;
}

const repo = hayFirebase ? new RepositorioFirebase() : new RepositorioDemo();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {repo instanceof RepositorioFirebase ? <ConFirebase repo={repo} /> : <App repo={repo} />}
  </StrictMode>,
);
