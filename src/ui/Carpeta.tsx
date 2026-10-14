import { useEffect, useMemo, useRef, useState } from 'react';
import { DIAS_ALERTA_PRESTAMO, diasFuera } from '../dominio/agenda';
import { planDeCaso } from '../dominio/calendario';
import { evaluarCarpeta, type TabId } from '../dominio/carpeta';
import { corta, larga } from '../dominio/fechas';
import { type Nino, nombreCompleto, RESPONSABLES, type Usuario } from '../dominio/modelo';
import { Barra, Brote, Dialogo, Icono, ICONOS, ICONOS_TAB, useApp } from './comunes';
import { Pestana } from './Pestana';

export function Carpeta({ nino, sesion, tab }: { nino: Nino; sesion: Usuario; tab?: TabId }) {
  const { repo, hoy, usuario } = useApp();
  const ev = useMemo(() => evaluarCarpeta(nino, hoy), [nino, hoy]);
  const [celebra, setCelebra] = useState<string | null>(null);
  const [cambiarCaja, setCambiarCaja] = useState(false);
  const previos = useRef<Record<string, number | null> | null>(null);

  // Celebra cuando una pestaña llega al 100 % durante esta sesión.
  useEffect(() => {
    const actual = Object.fromEntries(ev.tabs.map((t) => [t.id, t.pct]));
    if (previos.current) {
      const llego = ev.tabs.find((t) => t.pct === 100 && previos.current![t.id] !== 100);
      if (llego) setCelebra(`¡${llego.nombre} al 100 %!`);
    }
    previos.current = actual;
  }, [ev]);

  useEffect(() => {
    if (!celebra) return;
    const t = setTimeout(() => setCelebra(null), 6000);
    return () => clearTimeout(t);
  }, [celebra]);

  const fuera = diasFuera(nino, hoy);
  const tabActual = tab ? ev.tabs.find((t) => t.id === tab) : undefined;

  return (
    <>
      <header className="barra-sup">
        <div className="barra-sup__in">
          <a className="btn btn--suave" href={tab ? `#/nino/${nino.id}` : '#/'}>
            <Icono d={ICONOS.atras} tam={18} grosor={2.4} />
            {tab ? `Carpeta de ${nino.nombres}` : 'Todas las carpetas'}
          </a>
          <span className="txt-tenue" style={{ fontSize: 13 }}>
            {tab ? `${nombreCompleto(nino)} · caja ${nino.caja}` : 'Al volver se cierra tu sesión'}
          </span>
          <span className="sesion" style={{ marginLeft: 'auto' }}>
            <Icono d={ICONOS.candado} tam={16} grosor={2.2} />
            Sesión: {sesion.nombre}
          </span>
        </div>
      </header>

      <main className={`pagina ${tab ? 'pagina--angosta' : ''}`}>
        {celebra && (
          <div className="celebra" role="status">
            <Brote tam={40} feliz />
            <strong>{celebra}</strong>
          </div>
        )}

        {tabActual ? (
          <Pestana nino={nino} tab={tabActual} sesion={sesion} />
        ) : (
          <>
            <section className="cabecera-nino">
              <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span className="etiqueta-mono">Carpeta</span>
                <h1 className="titulo">{nombreCompleto(nino)}</h1>
                <div className="fila-wrap" style={{ gap: 8 }}>
                  <button type="button" className="dato-mono" style={{ border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setCambiarCaja(true)}>
                    Caja {nino.caja} · cambiar
                  </button>
                  <span className="dato-mono">Ingreso {larga(nino.fechaIngreso)}</span>
                  <span className="dato-mono">Plan de caso {corta(planDeCaso(nino.fechaIngreso), hoy)}</span>
                  <span className="dato-mono">Nivel de riesgo: {nino.responsableRiesgo ? RESPONSABLES[nino.responsableRiesgo] : 'sin asignar'}</span>
                  {nino.nutricion && <span className="dato-mono">Caso especial nutrición</span>}
                </div>
              </div>
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ color: 'var(--noche-texto)' }}>Carpeta al día</span>
                <Barra pct={ev.pct} gruesa etiqueta="Carpeta al día" />
                <span style={{ fontSize: 13, color: 'var(--noche-texto)' }}>Promedio de las pestañas con algo exigible a hoy</span>
              </div>
              <div style={{ flex: '0 1 240px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  className={`btn ${nino.prestamo ? 'btn-prestamo--fuera' : 'btn-prestamo'}`}
                  onClick={() => repo.moverCarpeta(nino.id, nino.prestamo ? 'devolucion' : 'retiro', sesion.id)}
                >
                  {nino.prestamo ? 'Devolver carpeta' : 'Retirar carpeta'}
                </button>
                <span style={{ fontSize: 13, color: fuera !== null && fuera > DIAS_ALERTA_PRESTAMO ? '#FFB4B7' : 'var(--noche-texto)', lineHeight: 1.4 }}>
                  {nino.prestamo
                    ? `Retirada por ${usuario(nino.prestamo.por)?.nombre ?? '—'} · ${new Date(nino.prestamo.desde).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}${fuera ? ` (hace ${fuera} días)` : ''}. Puedes seguir marcando.`
                    : `En la caja ${nino.caja}`}
                </span>
              </div>
            </section>

            <section className="rejilla-tabs" aria-label="Pestañas de la carpeta">
              {ev.tabs.map((t) => {
                const ic = ICONOS_TAB[t.id];
                const faltan = t.exigibles - t.cumplidos;
                return (
                  <a key={t.id} className="tab-card" href={`#/nino/${nino.id}/${t.id}`}>
                    <span className="tab-card__cab">
                      <span className="icono-tab" style={{ background: ic.fondo }}><Icono d={ic.d} tam={24} color={ic.tinta} /></span>
                      <span className="tab-card__nombre">{t.nombre}</span>
                    </span>
                    <Barra pct={t.pct} etiqueta={t.nombre} />
                    <span className={t.pct === null ? 'txt-tenue' : faltan ? (t.pct! < 50 ? 'txt-rojo' : 'txt-ambar') : 'txt-tenue'} style={{ fontSize: 14 }}>
                      {t.pct === null ? 'Sin pendientes aún' : faltan ? `${faltan} ${faltan === 1 ? 'pendiente' : 'pendientes'}` : 'Al día'}
                    </span>
                  </a>
                );
              })}
            </section>
          </>
        )}
      </main>

      {cambiarCaja && <DialogoCaja nino={nino} onCerrar={() => setCambiarCaja(false)} />}
    </>
  );
}

function DialogoCaja({ nino, onCerrar }: { nino: Nino; onCerrar: () => void }) {
  const { repo } = useApp();
  const [caja, setCaja] = useState(nino.caja);
  return (
    <Dialogo titulo="Cambiar caja" onCerrar={onCerrar}>
      <label className="campo">
        Caja
        <input type="number" min={1} max={30} value={caja} onChange={(e) => setCaja(Number(e.target.value))} />
      </label>
      <div className="fila-wrap">
        <button type="button" className="btn btn--primario" disabled={!caja} onClick={() => repo.actualizarNino(nino.id, { caja }).then(onCerrar)}>Guardar</button>
        <button type="button" className="btn btn--suave" onClick={onCerrar}>Cancelar</button>
      </div>
    </Dialogo>
  );
}

