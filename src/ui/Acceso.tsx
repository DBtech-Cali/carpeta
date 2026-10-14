import { type FormEvent, useState } from 'react';
import { Brote } from './comunes';

/** Acceso general de la tablet con la cuenta de la aplicación (una sola vez por equipo). */
export function Acceso({ entrar }: { entrar: (email: string, clave: string) => Promise<unknown> }) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      await entrar(email.trim(), clave);
    } catch {
      setError('No se pudo entrar. Revisa el correo y la contraseña de la cuenta de la aplicación.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pin-fondo">
      <form className="pin" onSubmit={enviar}>
        <Brote tam={72} />
        <div>
          <span className="etiqueta-mono">Acceso general del equipo</span>
          <h1 className="titulo" style={{ fontSize: 28, marginTop: 4 }}>Semillas Salesianas</h1>
          <p className="bajada">Se hace una sola vez en cada tablet o computador.</p>
        </div>
        <label className="campo" style={{ width: '100%', textAlign: 'left' }}>Correo de la aplicación
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="campo" style={{ width: '100%', textAlign: 'left' }}>Contraseña
          <input type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} required />
        </label>
        <p className="pin__error" role="alert">{error}</p>
        <button type="submit" className="btn btn--primario" style={{ width: '100%' }} disabled={cargando}>{cargando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  );
}
