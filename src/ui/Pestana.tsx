import { useState } from 'react';
import type { ItemEval, TabEval } from '../dominio/carpeta';
import { corta, partes } from '../dominio/fechas';
import { type Marca, type Nino, RESPONSABLES, type Usuario } from '../dominio/modelo';
import { ahoraISO } from '../datos/repositorio';
import { Barra, Dialogo, Icono, ICONOS, ICONOS_TAB, useApp } from './comunes';

const ESTADO_PASTILLA: Partial<Record<ItemEval['estado'], [string, string]>> = {
  vencido: ['Vencido', 'pastilla--rojo'],
  pendiente: ['Pendiente', 'pastilla--rojo'],
  cubierto: ['Comodín', 'pastilla--violeta'],
  exonerado: ['Exonerado', 'pastilla--ambar'],
};

export function Pestana({ nino, tab, sesion }: { nino: Nino; tab: TabEval; sesion: Usuario }) {
  const { repo, hoy, usuario } = useApp();
  const [editando, setEditando] = useState<ItemEval | null>(null);
  const ic = ICONOS_TAB[tab.id];

  const marcar = (it: ItemEval, extra: Partial<Marca> = {}) =>
    repo.marcar(nino.id, it.id, { por: sesion.id, en: ahoraISO(), ...extra }, sesion.id);
  const desmarcar = (it: ItemEval) => repo.marcar(nino.id, it.id, null, sesion.id);
  const cubiertos = tab.items.some((i) => i.estado === 'cubierto');

  const alternar = (it: ItemEval) => {
    if (it.pide) return setEditando(it);
    if (it.marca) return desmarcar(it);
    return marcar(it);
  };

  const docs = tab.items.filter((i) => i.tipo === 'doc' || i.tipo === 'opcional' || (i.tipo === 'programada' && !i.grupo));
  const comodines = tab.items.filter((i) => i.tipo === 'comodin');
  const excepciones = tab.items.filter((i) => i.tipo === 'excepcion');
  const grupos = [...new Set(tab.items.filter((i) => i.tipo === 'programada' && i.grupo).map((i) => i.grupo!))];
  const marcadoPor = (m?: Marca) => (m ? `Marcado por ${usuario(m.por)?.nombre ?? '—'} · ${corta(m.en.slice(0, 10), hoy)}` : '');

  return (
    <>
      <section className="fila-wrap" style={{ gap: '16px 24px' }}>
        <span className="icono-tab" style={{ width: 64, height: 64, borderRadius: 20, background: ic.fondo }}><Icono d={ic.d} tam={32} color={ic.tinta} /></span>
        <div style={{ flex: '1 1 260px' }}>
          <h1 className="titulo">{tab.nombre}</h1>
          <p className="bajada">Reporte: {RESPONSABLES[tab.responsable]} · lo que tiene fecha se exige desde el día siguiente.</p>
        </div>
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="txt-tenue">{tab.pct === null ? 'Nada exigible aún' : `${tab.cumplidos} de ${tab.exigibles} exigibles`}</span>
          <Barra pct={tab.pct} gruesa etiqueta={tab.nombre} />
        </div>
      </section>

      {tab.avisos.map((a) => <div key={a} className="aviso" role="note">{a}</div>)}

      {tab.id === 'nutricion' && <CasoEspecial nino={nino} />}
      {(tab.id === 'psicologia' || tab.id === 'trabajo_social') && <ResponsableRiesgo nino={nino} tab={tab.id} />}

      {docs.length > 0 && (
        <section className="tarjeta items" aria-label="Documentos">
          {docs.map((it) => {
            const pastilla = ESTADO_PASTILLA[it.estado];
            const conFecha = it.tipo === 'programada';
            return (
              <div key={it.id} className="item">
                <button
                  type="button" role="checkbox" aria-checked={!!it.marca} aria-label={it.etiqueta}
                  className={`casilla ${it.estado === 'vencido' && it.marca ? 'casilla--alerta' : ''}`}
                  disabled={it.estado === 'exonerado'}
                  onClick={() => alternar(it)}
                >
                  {it.marca && <Icono d={ICONOS.check} tam={22} color="#fff" grosor={3} />}
                </button>
                <span className="item__texto">
                  <span className={`item__nombre ${it.estado === 'exonerado' ? 'item__nombre--tachado' : ''}`}>{it.etiqueta}</span>
                  {conFecha && it.fecha && !it.fechaOculta && <span className="item__nota">Fecha: {corta(it.fecha, hoy)}</span>}
                  {it.nota && <span className={`item__nota ${it.estado === 'vencido' ? 'txt-rojo' : ''}`}>{it.nota}</span>}
                  {it.marca && <span className="item__nota">{marcadoPor(it.marca)}{it.marca.anio ? ` · año ${it.marca.anio}` : ''}</span>}
                </span>
                {it.tipo === 'opcional' && <span className="pastilla">Opcional</span>}
                {pastilla && <span className={`pastilla ${pastilla[1]}`}>{pastilla[0]}</span>}
                {it.tipo === 'programada' && !it.marca && it.estado === 'futuro' && <span className="pastilla">Programado</span>}
              </div>
            );
          })}
        </section>
      )}

      {grupos.map((g) => (
        <section key={g} className="tarjeta tarjeta--pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 className="subtitulo">{g}</h2>
          <div className="linea">
            {tab.items.filter((i) => i.grupo === g).map((it) => {
              const clase = it.marca ? 'nodo--ok' : it.estado === 'vencido' ? 'nodo--vencido' : '';
              const estado = it.marca ? `Hecha · ${usuario(it.marca.por)?.nombre ?? '—'}` : it.estado === 'vencido' ? 'Vencida' : 'Programada';
              return (
                <button key={it.id} type="button" className={`nodo ${clase}`} aria-pressed={!!it.marca} aria-label={`${it.etiqueta}, ${corta(it.fecha!, hoy)}: ${estado}`} onClick={() => alternar(it)}>
                  <span className="nodo__punto">{it.marca && <Icono d={ICONOS.check} tam={18} color="#fff" grosor={3.2} />}</span>
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="nodo__fecha">{corta(it.fecha!, hoy).toUpperCase()}</span>
                    <span className="nodo__estado">{estado}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {tab.id === 'pedagogia' && <Vinculaciones nino={nino} />}

      {(comodines.length > 0 || excepciones.length > 0) && (
        <div className="fila-wrap" style={{ alignItems: 'stretch', gap: 16 }}>
          {comodines.length > 0 && (
            <section className="tarjeta tarjeta--pad seccion-comodin" style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 12 }} aria-label="Solicitudes">
              <span className="etiqueta-mono" style={{ color: 'var(--primario)' }}>Comodín · solicitud de documentos</span>
              {comodines.map((it) => (
                <div key={it.id} className="fila-wrap" style={{ flexWrap: 'nowrap' }}>
                  <button type="button" role="checkbox" aria-checked={!!it.marca} aria-label={it.etiqueta} className={`casilla ${it.estado === 'vencido' ? 'casilla--alerta' : ''}`} onClick={() => alternar(it)}>
                    {it.marca && <Icono d={ICONOS.check} tam={22} color="#fff" grosor={3} />}
                  </button>
                  <span className="item__texto">
                    <span className="item__nombre">{it.etiqueta}</span>
                    <span className={`item__nota ${it.estado === 'vencido' ? 'txt-rojo' : it.estado === 'ok' ? 'txt-ambar' : ''}`}>{it.nota}</span>
                  </span>
                </div>
              ))}
            </section>
          )}
          {excepciones.length > 0 && (
            <section className="tarjeta tarjeta--pad" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 12 }} aria-label="Excepciones">
              <span className="etiqueta-mono" style={{ color: 'var(--ambar-tinta)' }}>Excepción</span>
              {excepciones.map((it) => (
                <div key={it.id} className="fila-wrap" style={{ flexWrap: 'nowrap' }}>
                  <button type="button" role="checkbox" aria-checked={!!it.marca} aria-label={it.etiqueta} className="casilla casilla--excepcion" onClick={() => alternar(it)}>
                    {it.marca && <Icono d={ICONOS.check} tam={22} color="#fff" grosor={3} />}
                  </button>
                  <span className="item__texto">
                    <span className="item__nombre">{it.etiqueta}</span>
                    <span className="item__nota">{it.nota}</span>
                  </span>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      {editando && (
        <DialogoDato
          it={editando}
          bloqueaDesmarcar={editando.tipo === 'comodin' && cubiertos ? 'No se puede desmarcar mientras falte algún documento que cubre. Actualiza la fecha si reiteraste la solicitud.' : null}
          onGuardar={(extra) => marcar(editando, extra).then(() => setEditando(null))}
          onDesmarcar={() => desmarcar(editando).then(() => setEditando(null))}
          onCerrar={() => setEditando(null)}
        />
      )}
    </>
  );
}

function DialogoDato({ it, bloqueaDesmarcar, onGuardar, onDesmarcar, onCerrar }: {
  it: ItemEval;
  bloqueaDesmarcar: string | null;
  onGuardar: (extra: Partial<Marca>) => void;
  onDesmarcar: () => void;
  onCerrar: () => void;
}) {
  const { hoy } = useApp();
  const [fecha, setFecha] = useState(it.marca?.fecha ?? hoy);
  const [anio, setAnio] = useState(it.marca?.anio ?? partes(hoy).y);
  const [texto, setTexto] = useState(it.marca?.texto ?? '');
  const valido = it.pide === 'fecha' ? !!fecha && fecha <= hoy : it.pide === 'anio' ? anio > 2000 : true;
  return (
    <Dialogo titulo={it.etiqueta} onCerrar={onCerrar}>
      {it.pide === 'fecha' && (
        <label className="campo">
          {it.tipo === 'comodin' ? 'Fecha de envío' : 'Fecha del documento'}
          <input type="date" value={fecha} max={hoy} onChange={(e) => setFecha(e.target.value)} />
        </label>
      )}
      {it.pide === 'anio' && (
        <label className="campo">
          Año de la constancia
          <input type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))} />
        </label>
      )}
      {it.pide === 'texto' && (
        <label className="campo">
          Motivo
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej.: 13 años, extranjero, no tiene el documento" />
        </label>
      )}
      {it.marca && bloqueaDesmarcar && <p className="txt-ambar" style={{ margin: 0 }}>{bloqueaDesmarcar}</p>}
      <div className="fila-wrap">
        <button type="button" className="btn btn--primario" disabled={!valido} onClick={() => onGuardar(it.pide === 'fecha' ? { fecha } : it.pide === 'anio' ? { anio } : { texto: texto.trim() })}>
          {it.marca ? 'Guardar cambios' : 'Marcar'}
        </button>
        {it.marca && <button type="button" className="btn btn--peligro" disabled={!!bloqueaDesmarcar} onClick={onDesmarcar}>Desmarcar</button>}
        <button type="button" className="btn btn--suave" onClick={onCerrar}>Cancelar</button>
      </div>
    </Dialogo>
  );
}

function CasoEspecial({ nino }: { nino: Nino }) {
  const { repo, hoy } = useApp();
  const activo = !!nino.nutricion;
  return (
    <section className="tarjeta tarjeta--pad fila-wrap" style={{ gap: 16 }}>
      <button
        type="button" role="switch" aria-checked={activo} aria-label="Caso especial de nutrición"
        className="casilla casilla--excepcion"
        onClick={() => repo.actualizarNino(nino.id, { nutricion: activo ? null : { desde: hoy } })}
      >
        {activo && <Icono d={ICONOS.check} tam={22} color="#fff" grosor={3} />}
      </button>
      <span className="item__texto">
        <span className="item__nombre">Caso especial (exceso o déficit de peso)</span>
        <span className="item__nota">
          {activo
            ? `Marcado el ${corta(nino.nutricion!.desde, hoy)}: una atención por trimestre desde el plan de caso y tallaje cada 3 meses. Al desactivarlo deja de exigirse todo lo de nutrición.`
            : 'Al activarlo se exige una atención por trimestre desde el plan de caso.'}
        </span>
      </span>
    </section>
  );
}

function ResponsableRiesgo({ nino, tab }: { nino: Nino; tab: 'psicologia' | 'trabajo_social' }) {
  const { repo } = useApp();
  const actual = nino.responsableRiesgo;
  if (actual && actual !== tab) {
    return <p className="txt-tenue" style={{ margin: 0 }}>El seguimiento de nivel de riesgo lo lleva {RESPONSABLES[actual]}.</p>;
  }
  return (
    <section className="tarjeta tarjeta--pad fila-wrap" style={{ gap: 16 }}>
      <button
        type="button" role="switch" aria-checked={actual === tab} aria-label={`Nivel de riesgo a cargo de ${RESPONSABLES[tab]}`}
        className="casilla"
        onClick={() => repo.actualizarNino(nino.id, { responsableRiesgo: actual === tab ? null : tab })}
      >
        {actual === tab && <Icono d={ICONOS.check} tam={22} color="#fff" grosor={3} />}
      </button>
      <span className="item__texto">
        <span className="item__nombre">Llevo el seguimiento de nivel de riesgo</span>
        <span className="item__nota">Mensual desde el plan de caso. Se registra en la pestaña de quien lo lleva.</span>
      </span>
    </section>
  );
}

function Vinculaciones({ nino }: { nino: Nino }) {
  const { repo, hoy } = useApp();
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const lista = nino.vinculaciones ?? [];
  const agregar = () => {
    if (!nombre.trim()) return;
    repo.actualizarNino(nino.id, { vinculaciones: [...lista, { id: String(Date.now()), nombre: nombre.trim(), ...(fecha ? { fecha } : {}) }] });
    setNombre('');
    setFecha('');
  };
  return (
    <section className="tarjeta tarjeta--pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }} aria-label="Vinculaciones">
      <div className="fila-wrap">
        <h2 className="subtitulo">Vinculaciones</h2>
        <span className="pastilla">Opcional · no suma</span>
      </div>
      {lista.length === 0 && <p className="txt-tenue" style={{ margin: 0 }}>Sin vinculaciones registradas.</p>}
      {lista.map((v) => (
        <div key={v.id} className="fila-wrap" style={{ justifyContent: 'space-between', padding: '10px 14px', borderRadius: 14, background: '#f8f9fd' }}>
          <span><strong>{v.nombre}</strong>{v.fecha && <span className="txt-tenue"> · {corta(v.fecha, hoy)}</span>}</span>
          <button type="button" className="btn btn--suave" onClick={() => repo.actualizarNino(nino.id, { vinculaciones: lista.filter((x) => x.id !== v.id) })}>Quitar</button>
        </div>
      ))}
      <div className="fila-wrap" style={{ alignItems: 'flex-end' }}>
        <label className="campo" style={{ flex: '2 1 220px' }}>Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Fútbol, escuela del barrio" /></label>
        <label className="campo" style={{ flex: '1 1 160px' }}>Fecha (opcional)<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>
        <button type="button" className="btn btn--oscuro" disabled={!nombre.trim()} onClick={agregar}>Agregar</button>
      </div>
    </section>
  );
}
