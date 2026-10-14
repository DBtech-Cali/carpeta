import { useEffect, useState } from 'react';
import type { Usuario } from '../dominio/modelo';
import { Brote, useApp } from './comunes';

/** Teclado de PIN. Identifica a la persona por su PIN (único). */
export function Pin({ contexto, titulo, onOk, onCancelar, validar }: {
  contexto: string;
  titulo: string;
  onOk: (u: Usuario) => void;
  onCancelar: () => void;
  validar?: (u: Usuario) => string | null;
}) {
  const { datos } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (pin.length < 4) return;
    const u = datos.usuarios.find((x) => x.activo && x.pin === pin);
    const problema = !u ? 'PIN no reconocido. Intenta de nuevo.' : validar?.(u) ?? null;
    if (problema || !u) {
      setError(problema ?? '');
      setPin('');
      return;
    }
    onOk(u);
  }, [pin, datos.usuarios, onOk, validar]);

  const pulsar = (d: string) => {
    setError('');
    setPin((p) => (p.length < 4 ? p + d : p));
  };

  return (
    <div className="pin-fondo">
      <section className="pin" aria-labelledby="pin-titulo">
        <Brote tam={72} />
        <div>
          <span className="etiqueta-mono">{contexto}</span>
          <h1 id="pin-titulo" className="titulo" style={{ fontSize: 28, marginTop: 4 }}>{titulo}</h1>
          <p className="bajada">Ingresa tu PIN de 4 dígitos</p>
        </div>
        <div className="pin__puntos" aria-live="polite" aria-label={`${pin.length} de 4 dígitos`}>
          {[0, 1, 2, 3].map((i) => <span key={i} className={`pin__punto ${i < pin.length ? 'pin__punto--lleno' : ''}`} />)}
        </div>
        <p className="pin__error" role="alert">{error}</p>
        <div className="pin__teclado">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" className="tecla" onClick={() => pulsar(d)}>{d}</button>
          ))}
          <button type="button" className="tecla tecla--texto" onClick={() => setPin('')}>Borrar todo</button>
          <button type="button" className="tecla" onClick={() => pulsar('0')}>0</button>
          <button type="button" className="tecla" aria-label="Borrar último dígito" onClick={() => setPin((p) => p.slice(0, -1))}>←</button>
        </div>
        <p className="txt-tenue" style={{ fontSize: 13, margin: 0 }}>Todo lo que marques quedará a tu nombre. La sesión se cierra al volver a la lista.</p>
        <button type="button" className="btn btn--suave" onClick={onCancelar}>Cancelar</button>
      </section>
    </div>
  );
}
