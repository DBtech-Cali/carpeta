import { useMemo, useState } from 'react';
import { agenda, catalogoItems, DIAS_ALERTA_PRESTAMO, diasFuera, type EstadoReporte, pendientes, reportePorItem } from '../dominio/agenda';
import { TABS } from '../dominio/carpeta';
import { corta, larga } from '../dominio/fechas';
import { type Cargo, CARGOS, type Nino, nombreCompleto, ordenarNinos, type Responsable, RESPONSABLES, type Usuario } from '../dominio/modelo';
import { Dialogo, Encabezado, Icono, ICONOS, useApp } from './comunes';

type Seccion = 'reportes' | 'ninos' | 'usuarios' | 'prestamos' | 'revisiones';
const SECCIONES: [Seccion, string][] = [
  ['reportes', 'Reportes'],
  ['ninos', 'Niños · ingresos y egresos'],
  ['usuarios', 'Usuarios y PIN'],
  ['prestamos', 'Préstamos de carpetas'],
  ['revisiones', 'Registro de revisiones'],
];

export function Admin({ seccion, sesion }: { seccion: string | undefined; sesion: Usuario }) {
  const actual = (SECCIONES.find(([id]) => id === seccion)?.[0] ?? 'reportes') as Seccion;
  return (
    <>
      <Encabezado activa="admin" />
      <main className="pagina">
        <div className="admin">
          <nav className="tarjeta admin__menu no-imprimir" aria-label="Administración">
            {SECCIONES.map(([id, txt]) => (
              <a key={id} href={`#/admin/${id}`} aria-current={actual === id ? 'page' : undefined}>{txt}</a>
            ))}
            <span className="sesion" style={{ marginTop: 8, alignSelf: 'flex-start' }}><Icono d={ICONOS.escudo} tam={16} />{sesion.nombre}</span>
            <CerrarAcceso />
          </nav>
          <div className="admin__cuerpo">
            {actual === 'reportes' && <Reportes />}
            {actual === 'ninos' && <Ninos />}
            {actual === 'usuarios' && <Usuarios />}
            {actual === 'prestamos' && <Prestamos />}
            {actual === 'revisiones' && <Revisiones sesion={sesion} />}
          </div>
        </div>
      </main>
    </>
  );
}

function CerrarAcceso() {
  const { repo } = useApp();
  const [confirmar, setConfirmar] = useState(false);
  if (!repo.cerrarAcceso) return null;
  return (
    <>
      <button type="button" className="btn btn--suave" style={{ marginTop: 8 }} onClick={() => setConfirmar(true)}>Cerrar acceso de este equipo</button>
      {confirmar && (
        <Dialogo titulo="Cerrar acceso de este equipo" onCerrar={() => setConfirmar(false)}>
          <p style={{ margin: 0 }}>Para volver a usar la app en esta tablet o computador habrá que escribir de nuevo el correo y la contraseña de la aplicación.</p>
          <div className="fila-wrap">
            <button type="button" className="btn btn--peligro" onClick={() => repo.cerrarAcceso!()}>Cerrar acceso</button>
            <button type="button" className="btn btn--suave" onClick={() => setConfirmar(false)}>Cancelar</button>
          </div>
        </Dialogo>
      )}
    </>
  );
}

function Reportes() {
  const [modo, setModo] = useState<'profesional' | 'item'>('profesional');
  return (
    <>
      <div className="fila-wrap no-imprimir" role="group" aria-label="Tipo de reporte">
        <button type="button" className="chip" aria-pressed={modo === 'profesional'} onClick={() => setModo('profesional')}>Por profesional</button>
        <button type="button" className="chip" aria-pressed={modo === 'item'} onClick={() => setModo('item')}>Por ítem de la carpeta</button>
      </div>
      {modo === 'profesional' ? <ReportesProfesional /> : <ReporteItem />}
    </>
  );
}

const ESTADOS_REPORTE: Record<EstadoReporte, [string, string]> = {
  falta: ['Falta', 'pastilla--rojo'],
  vencido: ['Vencido', 'pastilla--rojo'],
  cubierto: ['Cubierto por solicitud', 'pastilla--violeta'],
  exonerado: ['Exonerado', 'pastilla--ambar'],
  al_dia: ['Al día', 'pastilla--verde'],
  no_aplica: ['Aún no se exige', ''],
};

function ReporteItem() {
  const { datos, hoy } = useApp();
  const catalogo = useMemo(() => catalogoItems(hoy), [hoy]);
  const [itemId, setItemId] = useState('socio.adres');
  const [verTodos, setVerTodos] = useState(false);
  const filas = useMemo(() => reportePorItem(datos.ninos, hoy, itemId), [datos.ninos, hoy, itemId]);
  const item = catalogo.find((i) => i.id === itemId);
  const problema = filas.filter((f) => f.estado === 'falta' || f.estado === 'vencido');
  const visibles = verTodos ? filas : problema;
  const cuenta = (e: EstadoReporte) => filas.filter((f) => f.estado === e).length;
  const pestanas = [...new Set(catalogo.map((i) => i.tabNombre))];

  return (
    <>
      <div className="no-imprimir">
        <h1 className="titulo">Reporte por ítem</h1>
        <p className="bajada">Elige un documento y mira a qué niños les falta o lo tienen vencido. Solo consulta: no cambia ningún dato.</p>
      </div>
      <div className="fila-wrap no-imprimir" style={{ alignItems: 'flex-end' }}>
        <label className="campo" style={{ flex: '2 1 320px' }}>Ítem
          <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
            {pestanas.map((p) => (
              <optgroup key={p} label={p}>
                {catalogo.filter((i) => i.tabNombre === p).map((i) => <option key={i.id} value={i.id}>{i.etiqueta}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <button type="button" className="chip" aria-pressed={verTodos} onClick={() => setVerTodos(!verTodos)}>Ver también los que están al día</button>
      </div>

      <section className="tarjeta" aria-label="Reporte por ítem">
        <div className="fila-wrap" style={{ padding: '18px 22px', borderBottom: '1px solid var(--borde)', justifyContent: 'space-between' }}>
          <div>
            <span className="etiqueta-mono">Semillas Salesianas · reporte del {larga(hoy)} · {item?.tabNombre}</span>
            <h2 className="subtitulo" style={{ marginTop: 2 }}>{item?.etiqueta}</h2>
            <p className="txt-tenue" style={{ margin: '6px 0 0', fontSize: 14 }}>
              {cuenta('falta')} faltan · {cuenta('vencido')} vencidos · {cuenta('cubierto')} cubiertos por solicitud · {cuenta('exonerado')} exonerados · {cuenta('al_dia')} al día
            </p>
          </div>
          <button type="button" className="btn btn--primario no-imprimir" onClick={() => window.print()}>
            <Icono d={ICONOS.descargar} color="#fff" /> Descargar PDF
          </button>
        </div>
        <div className="desborde">
          <table className="tabla">
            <thead><tr><th>Niño</th><th>Caja</th><th>Estado</th><th>Detalle</th></tr></thead>
            <tbody>
              {visibles.map((f) => (
                <tr key={f.ninoId}>
                  <td><a href={`#/nino/${f.ninoId}/${item?.tab ?? ''}`} style={{ color: 'var(--tinta)' }}><strong>{f.nino}</strong></a></td>
                  <td className="pct" style={{ textAlign: 'left' }}>{f.caja}</td>
                  <td><span className={`pastilla ${ESTADOS_REPORTE[f.estado][1]}`}>{ESTADOS_REPORTE[f.estado][0]}</span></td>
                  <td className="txt-tenue" style={{ fontSize: 14 }}>{f.nota ?? ''}</td>
                </tr>
              ))}
              {visibles.length === 0 && <tr><td colSpan={4} className="txt-tenue">Ningún niño tiene este ítem faltante o vencido. ¡Bien!</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function ReportesProfesional() {
  const { datos, hoy } = useApp();
  const [quien, setQuien] = useState<Responsable>('psicologia');
  const pend = useMemo(() => pendientes(datos.ninos, hoy), [datos.ninos, hoy]);
  const prox = useMemo(() => agenda(datos.ninos, hoy).filter((e) => e.urgencia !== 'vencido'), [datos.ninos, hoy]);
  const nombreTab = (id: string) => TABS.find((t) => t.id === id)?.nombre ?? id;
  const p = pend.filter((x) => x.responsable === quien);
  const q = prox.filter((x) => x.responsable === quien);

  return (
    <>
      <div className="no-imprimir">
        <h1 className="titulo">Reportes por profesional</h1>
        <p className="bajada">Elige a quién y descarga sus pendientes y lo próximo a ejecutar.</p>
      </div>
      <div className="form-rejilla no-imprimir" role="group" aria-label="Responsable">
        {(Object.keys(RESPONSABLES) as Responsable[]).map((r) => {
          const n = pend.filter((x) => x.responsable === r).length;
          return (
            <button key={r} type="button" className="persona" aria-pressed={quien === r} onClick={() => setQuien(r)}>
              <span style={{ fontFamily: 'var(--titulo)', fontWeight: 700, fontSize: 19 }}>{RESPONSABLES[r]}</span>
              <span style={{ fontSize: 14 }}>{n} pendientes · {prox.filter((x) => x.responsable === r).length} próximos</span>
            </button>
          );
        })}
      </div>

      <section className="tarjeta" aria-label="Reporte">
        <div className="fila-wrap" style={{ padding: '18px 22px', borderBottom: '1px solid var(--borde)', justifyContent: 'space-between' }}>
          <div>
            <span className="etiqueta-mono">Semillas Salesianas · reporte del {larga(hoy)}</span>
            <h2 className="subtitulo" style={{ marginTop: 2 }}>{RESPONSABLES[quien]}</h2>
          </div>
          <button type="button" className="btn btn--primario no-imprimir" onClick={() => window.print()}>
            <Icono d={ICONOS.descargar} color="#fff" /> Descargar PDF
          </button>
        </div>
        <div className="fila-wrap" style={{ alignItems: 'flex-start', gap: 0 }}>
          <div style={{ flex: '1 1 320px', padding: '18px 22px' }}>
            <h3 className="etiqueta-mono" style={{ color: 'var(--rojo-tinta)', fontSize: 13, margin: '0 0 10px' }}>Pendientes ({p.length})</h3>
            {p.length === 0 && <p className="txt-tenue">Nada pendiente. ¡Bien!</p>}
            <table className="tabla">
              <tbody>
                {p.map((x, i) => (
                  <tr key={i}>
                    <td style={{ width: 70 }} className="pct banda-rojo">{x.fecha ? corta(x.fecha, hoy) : '—'}</td>
                    <td><strong>{x.que}</strong><br /><span className="txt-tenue" style={{ fontSize: 14 }}>{x.nino} · {nombreTab(x.tab)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ flex: '1 1 320px', padding: '18px 22px' }}>
            <h3 className="etiqueta-mono" style={{ color: 'var(--primario)', fontSize: 13, margin: '0 0 10px' }}>Próximos 30 días ({q.length})</h3>
            {q.length === 0 && <p className="txt-tenue">Nada programado.</p>}
            <table className="tabla">
              <tbody>
                {q.map((x, i) => (
                  <tr key={i}>
                    <td style={{ width: 70, color: 'var(--primario)' }} className="pct">{corta(x.fecha, hoy)}</td>
                    <td><strong>{x.que}</strong><br /><span className="txt-tenue" style={{ fontSize: 14 }}>{x.nino} · {nombreTab(x.tab)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

const NINO_VACIO = { nombres: '', primerApellido: '', segundoApellido: '', fechaIngreso: '', fechaNacimiento: '', caja: '' as number | '' };

function Ninos() {
  const { repo, datos, hoy } = useApp();
  const [f, setF] = useState(NINO_VACIO);
  const [editar, setEditar] = useState<Nino | null>(null);
  const [egresar, setEgresar] = useState<Nino | null>(null);
  const activos = ordenarNinos(datos.ninos.filter((n) => n.activo));
  const egresados = datos.ninos.filter((n) => !n.activo).length;
  const valido = f.nombres.trim() && f.primerApellido.trim() && f.fechaIngreso && f.caja;

  const registrar = async () => {
    if (!valido) return;
    await repo.crearNino({
      nombres: f.nombres.trim(),
      primerApellido: f.primerApellido.trim(),
      ...(f.segundoApellido.trim() ? { segundoApellido: f.segundoApellido.trim() } : {}),
      fechaIngreso: f.fechaIngreso,
      ...(f.fechaNacimiento ? { fechaNacimiento: f.fechaNacimiento } : {}),
      caja: Number(f.caja),
      activo: true,
      responsableRiesgo: null,
      nutricion: null,
      prestamo: null,
      marcas: {},
    });
    setF(NINO_VACIO);
  };

  return (
    <>
      <h1 className="titulo">Niños</h1>
      <section className="tarjeta tarjeta--pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 className="subtitulo">Registrar ingreso</h2>
        <div className="form-rejilla">
          <label className="campo">Nombres *<input value={f.nombres} onChange={(e) => setF({ ...f, nombres: e.target.value })} /></label>
          <label className="campo">Primer apellido *<input value={f.primerApellido} onChange={(e) => setF({ ...f, primerApellido: e.target.value })} /></label>
          <label className="campo">Segundo apellido<input value={f.segundoApellido} onChange={(e) => setF({ ...f, segundoApellido: e.target.value })} /></label>
          <label className="campo">Fecha de ingreso *<input type="date" value={f.fechaIngreso} onChange={(e) => setF({ ...f, fechaIngreso: e.target.value })} /></label>
          <label className="campo">Fecha de nacimiento<input type="date" value={f.fechaNacimiento} max={hoy} onChange={(e) => setF({ ...f, fechaNacimiento: e.target.value })} /></label>
          <label className="campo">Caja *<input type="number" min={1} max={30} value={f.caja} onChange={(e) => setF({ ...f, caja: e.target.value ? Number(e.target.value) : '' })} /></label>
        </div>
        <div><button type="button" className="btn btn--primario" disabled={!valido} onClick={registrar}>Registrar niño</button></div>
      </section>

      <section className="tarjeta desborde" aria-label="Niños activos">
        <table className="tabla">
          <thead><tr><th>Niño</th><th>Ingreso</th><th>Caja</th><th /></tr></thead>
          <tbody>
            {activos.map((n) => (
              <tr key={n.id}>
                <td><strong>{nombreCompleto(n)}</strong></td>
                <td>{larga(n.fechaIngreso)}</td>
                <td>{n.caja}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button type="button" className="btn btn--suave" onClick={() => setEditar(n)}>Editar</button>{' '}
                  <button type="button" className="btn btn--peligro" onClick={() => setEgresar(n)}>Egreso</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {egresados > 0 && <p className="txt-tenue" style={{ padding: '0 14px 14px', margin: 0 }}>{egresados} egresados guardados como histórico (no se muestran).</p>}
      </section>

      {editar && <EditarNino nino={editar} onCerrar={() => setEditar(null)} />}
      {egresar && (
        <Dialogo titulo="Confirmar egreso" onCerrar={() => setEgresar(null)}>
          <p style={{ margin: 0 }}><strong>{nombreCompleto(egresar)}</strong> dejará de verse en la app. Sus datos quedan guardados como histórico.</p>
          <div className="fila-wrap">
            <button type="button" className="btn btn--peligro" onClick={() => repo.actualizarNino(egresar.id, { activo: false, fechaEgreso: hoy }).then(() => setEgresar(null))}>Dar egreso</button>
            <button type="button" className="btn btn--suave" onClick={() => setEgresar(null)}>Cancelar</button>
          </div>
        </Dialogo>
      )}
    </>
  );
}

function EditarNino({ nino, onCerrar }: { nino: Nino; onCerrar: () => void }) {
  const { repo } = useApp();
  const [f, setF] = useState({ nombres: nino.nombres, primerApellido: nino.primerApellido, segundoApellido: nino.segundoApellido ?? '', fechaIngreso: nino.fechaIngreso, fechaNacimiento: nino.fechaNacimiento ?? '' });
  const guardar = () =>
    repo.actualizarNino(nino.id, {
      nombres: f.nombres.trim(),
      primerApellido: f.primerApellido.trim(),
      segundoApellido: f.segundoApellido.trim() || undefined,
      fechaIngreso: f.fechaIngreso,
      fechaNacimiento: f.fechaNacimiento || undefined,
    }).then(onCerrar);
  return (
    <Dialogo titulo="Editar datos del niño" onCerrar={onCerrar}>
      <label className="campo">Nombres<input value={f.nombres} onChange={(e) => setF({ ...f, nombres: e.target.value })} /></label>
      <label className="campo">Primer apellido<input value={f.primerApellido} onChange={(e) => setF({ ...f, primerApellido: e.target.value })} /></label>
      <label className="campo">Segundo apellido<input value={f.segundoApellido} onChange={(e) => setF({ ...f, segundoApellido: e.target.value })} /></label>
      <label className="campo">Fecha de ingreso<input type="date" value={f.fechaIngreso} onChange={(e) => setF({ ...f, fechaIngreso: e.target.value })} /></label>
      {f.fechaIngreso !== nino.fechaIngreso && <p className="txt-ambar" style={{ margin: 0 }}>Cambiar la fecha de ingreso recalcula todo su calendario.</p>}
      <label className="campo">Fecha de nacimiento<input type="date" value={f.fechaNacimiento} onChange={(e) => setF({ ...f, fechaNacimiento: e.target.value })} /></label>
      <div className="fila-wrap">
        <button type="button" className="btn btn--primario" disabled={!f.nombres.trim() || !f.primerApellido.trim() || !f.fechaIngreso} onClick={guardar}>Guardar</button>
        <button type="button" className="btn btn--suave" onClick={onCerrar}>Cancelar</button>
      </div>
    </Dialogo>
  );
}

function Usuarios() {
  const { repo, datos } = useApp();
  const [f, setF] = useState({ nombre: '', cargo: 'psicologia' as Cargo, email: '', pin: '' });
  const [verPin, setVerPin] = useState(false);
  const pinUsado = (pin: string, excepto?: string) => datos.usuarios.some((u) => u.pin === pin && u.id !== excepto && u.activo);
  const pinValido = /^\d{4}$/.test(f.pin) && !pinUsado(f.pin);
  const valido = f.nombre.trim() && pinValido;

  return (
    <>
      <h1 className="titulo">Usuarios y PIN</h1>
      <section className="tarjeta desborde">
        <table className="tabla">
          <thead><tr><th>Nombre</th><th>Cargo</th><th>Correo</th><th>PIN</th><th>Estado</th></tr></thead>
          <tbody>
            {datos.usuarios.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.nombre}</strong></td>
                <td>{CARGOS[u.cargo]}</td>
                <td>{u.email || <span className="txt-tenue">—</span>}</td>
                <td className="pct" style={{ textAlign: 'left' }}>{verPin ? u.pin : '••••'}</td>
                <td>
                  <button type="button" className={`btn ${u.activo ? 'btn--suave' : 'btn--borde'}`} onClick={() => repo.guardarUsuario({ ...u, activo: !u.activo })}>
                    {u.activo ? 'Activo · dar de baja' : 'De baja · reactivar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: 14 }}><button type="button" className="btn btn--borde" onClick={() => setVerPin(!verPin)}>{verPin ? 'Ocultar PIN' : 'Mostrar PIN'}</button></div>
      </section>
      <section className="tarjeta tarjeta--pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 className="subtitulo">Nuevo usuario</h2>
        <div className="form-rejilla">
          <label className="campo">Nombre<input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></label>
          <label className="campo">Cargo
            <select value={f.cargo} onChange={(e) => setF({ ...f, cargo: e.target.value as Cargo })}>
              {(Object.keys(CARGOS) as Cargo[]).map((c) => <option key={c} value={c}>{CARGOS[c]}</option>)}
            </select>
          </label>
          <label className="campo">Correo Gmail (opcional · solo para el correo de los lunes)<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          <label className="campo">PIN (4 dígitos)<input inputMode="numeric" maxLength={4} value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, '') })} /></label>
        </div>
        {f.pin.length === 4 && pinUsado(f.pin) && <p className="txt-rojo" style={{ margin: 0 }}>Ese PIN ya lo usa otra persona.</p>}
        <div>
          <button type="button" className="btn btn--primario" disabled={!valido} onClick={() => repo.crearUsuario({ nombre: f.nombre.trim(), cargo: f.cargo, email: f.email.trim(), pin: f.pin, activo: true }).then(() => setF({ nombre: '', cargo: 'psicologia', email: '', pin: '' }))}>
            Crear usuario
          </button>
        </div>
      </section>
    </>
  );
}

function Prestamos() {
  const { datos, hoy, usuario } = useApp();
  const fuera = ordenarNinos(datos.ninos.filter((n) => n.activo && n.prestamo));
  const nino = (id: string) => datos.ninos.find((n) => n.id === id);
  return (
    <>
      <h1 className="titulo">Préstamos de carpetas</h1>
      <section className="tarjeta tarjeta--pad" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="subtitulo">Carpetas fuera ({fuera.length})</h2>
        {fuera.length === 0 && <p className="txt-tenue" style={{ margin: 0 }}>Todas las carpetas están en su caja.</p>}
        {fuera.map((n) => {
          const d = diasFuera(n, hoy) ?? 0;
          return (
            <a key={n.id} href={`#/nino/${n.id}`} className="fila-wrap" style={{ justifyContent: 'space-between', padding: '10px 14px', borderRadius: 14, textDecoration: 'none', color: 'var(--tinta)', background: d > DIAS_ALERTA_PRESTAMO ? 'var(--rojo-fondo)' : 'var(--ambar-fondo)' }}>
              <span><strong>{nombreCompleto(n)}</strong><br /><span className="txt-tenue" style={{ fontSize: 14 }}>Retirada por {usuario(n.prestamo!.por)?.nombre ?? '—'} · caja {n.caja}</span></span>
              <span className={`pct ${d > DIAS_ALERTA_PRESTAMO ? 'banda-rojo' : 'banda-ambar'}`}>{d === 1 ? '1 DÍA' : `${d} DÍAS`}</span>
            </a>
          );
        })}
      </section>
      <section className="tarjeta desborde" aria-label="Movimientos recientes">
        <table className="tabla">
          <thead><tr><th>Fecha y hora</th><th>Movimiento</th><th>Niño</th><th>Quién</th></tr></thead>
          <tbody>
            {datos.movimientos.slice(0, 50).map((m) => {
              const n = nino(m.ninoId);
              return (
                <tr key={m.id ?? m.en}>
                  <td>{new Date(m.en).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{m.tipo === 'retiro' ? 'Retiro' : 'Devolución'}</td>
                  <td>{n ? nombreCompleto(n) : '—'}</td>
                  <td>{usuario(m.por)?.nombre ?? '—'}</td>
                </tr>
              );
            })}
            {datos.movimientos.length === 0 && <tr><td colSpan={4} className="txt-tenue">Sin movimientos todavía.</td></tr>}
          </tbody>
        </table>
      </section>
    </>
  );
}

function Revisiones({ sesion }: { sesion: Usuario }) {
  const { repo, datos, usuario } = useApp();
  const [texto, setTexto] = useState('');
  return (
    <>
      <h1 className="titulo">Registro de revisiones</h1>
      <p className="bajada" style={{ marginTop: -10 }}>Anota lo que revisaste en las carpetas físicas. Si algo marcado no estaba, desmárcalo en la carpeta del niño.</p>
      <section className="tarjeta tarjeta--pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label className="campo">Revisión<textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej.: Revisé la caja 6 completa. Faltaba el ADRES de Lady; lo desmarqué." /></label>
        <div><button type="button" className="btn btn--primario" disabled={!texto.trim()} onClick={() => repo.agregarRevision(texto.trim(), sesion.id).then(() => setTexto(''))}>Guardar revisión</button></div>
      </section>
      {datos.revisiones.map((r) => (
        <section key={r.id ?? r.en} className="tarjeta tarjeta--pad">
          <span className="etiqueta-mono">{new Date(r.en).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })} · {usuario(r.por)?.nombre ?? '—'}</span>
          <p style={{ margin: '6px 0 0', whiteSpace: 'pre-line' }}>{r.texto}</p>
        </section>
      ))}
    </>
  );
}
