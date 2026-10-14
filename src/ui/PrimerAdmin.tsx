import { useState } from 'react';
import { type Cargo, CARGOS } from '../dominio/modelo';
import { Brote, useApp } from './comunes';

/** Primera vez con Firebase: no hay usuarios, se crea el primer administrador. */
export function PrimerAdmin() {
  const { repo } = useApp();
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState<Cargo>('coordinacion');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [guardando, setGuardando] = useState(false);
  const pinOk = /^\d{4}$/.test(pin) && pin === pin2;
  const soloDigitos = (v: string) => v.replace(/\D/g, '').slice(0, 4);

  const crear = async () => {
    setGuardando(true);
    await repo.crearUsuario({ nombre: nombre.trim(), cargo, email: email.trim(), pin, activo: true });
  };

  return (
    <div className="pin-fondo">
      <section className="pin" aria-labelledby="primer-titulo" style={{ maxWidth: 460 }}>
        <Brote tam={72} feliz />
        <div>
          <span className="etiqueta-mono">Primera vez</span>
          <h1 id="primer-titulo" className="titulo" style={{ fontSize: 28, marginTop: 4 }}>Crea el primer administrador</h1>
          <p className="bajada">Coordinación o gestión de caso. Después, desde Administración, se crean los demás usuarios.</p>
        </div>
        <label className="campo" style={{ width: '100%', textAlign: 'left' }}>Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
        <label className="campo" style={{ width: '100%', textAlign: 'left' }}>Cargo
          <select value={cargo} onChange={(e) => setCargo(e.target.value as Cargo)}>
            <option value="coordinacion">{CARGOS.coordinacion}</option>
            <option value="gestion_caso">{CARGOS.gestion_caso}</option>
          </select>
        </label>
        <label className="campo" style={{ width: '100%', textAlign: 'left' }}>Correo Gmail (opcional · solo para el correo de los lunes)<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <div className="fila-wrap" style={{ width: '100%', flexWrap: 'nowrap' }}>
          <label className="campo" style={{ flex: 1, textAlign: 'left' }}>PIN (4 dígitos)<input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(soloDigitos(e.target.value))} /></label>
          <label className="campo" style={{ flex: 1, textAlign: 'left' }}>Repite el PIN<input type="password" inputMode="numeric" value={pin2} onChange={(e) => setPin2(soloDigitos(e.target.value))} /></label>
        </div>
        {pin2.length === 4 && pin !== pin2 && <p className="pin__error" style={{ margin: 0 }}>Los PIN no coinciden.</p>}
        <button type="button" className="btn btn--primario" style={{ width: '100%' }} disabled={!nombre.trim() || !pinOk || guardando} onClick={crear}>
          {guardando ? 'Creando…' : 'Crear administrador'}
        </button>
      </section>
    </div>
  );
}
