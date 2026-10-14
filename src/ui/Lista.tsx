import { useMemo, useState } from 'react';
import { agenda, DIAS_ALERTA_PRESTAMO, diasFuera } from '../dominio/agenda';
import { evaluarCarpeta } from '../dominio/carpeta';
import { corta, diasEntre } from '../dominio/fechas';
import { ordenarNinos } from '../dominio/modelo';
import { Barra, Encabezado, Icono, ICONOS, useApp } from './comunes';

type Filtro = 'todos' | 'bajo' | 'fuera' | 'caja';

export function Lista() {
  const { datos, hoy } = useApp();
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [caja, setCaja] = useState<number | ''>('');

  const filas = useMemo(() => {
    const activos = ordenarNinos(datos.ninos.filter((n) => n.activo));
    const eventos = agenda(activos, hoy);
    return activos.map((n) => {
      const propios = eventos.filter((e) => e.ninoId === n.id);
      const vencidos = propios.filter((e) => e.urgencia === 'vencido').length;
      const siguiente = propios.find((e) => e.urgencia !== 'vencido');
      return { n, pct: evaluarCarpeta(n, hoy).pct, vencidos, siguiente, fuera: diasFuera(n, hoy) };
    });
  }, [datos.ninos, hoy]);

  const cajas = [...new Set(filas.map((f) => f.n.caja))].sort((a, b) => a - b);
  const texto = q.trim().toLowerCase();
  const visibles = filas.filter(({ n, pct, fuera }) => {
    const nombre = `${n.primerApellido} ${n.segundoApellido ?? ''} ${n.nombres}`.toLowerCase();
    if (texto && !nombre.includes(texto)) return false;
    if (filtro === 'bajo') return pct !== null && pct < 70;
    if (filtro === 'fuera') return fuera !== null;
    if (filtro === 'caja') return caja === '' || n.caja === caja;
    return true;
  });

  const conPct = filas.filter((f) => f.pct !== null);
  const promedio = conPct.length ? Math.round(conPct.reduce((s, f) => s + f.pct!, 0) / conPct.length) : null;
  const fuera = filas.filter((f) => f.fuera !== null);
  const fueraTarde = fuera.filter((f) => f.fuera! > DIAS_ALERTA_PRESTAMO).length;
  const totalVencidos = filas.reduce((s, f) => s + f.vencidos, 0);

  return (
    <>
      <Encabezado activa="carpetas" />
      <main className="pagina">
        <div>
          <h1 className="titulo">Carpetas activas</h1>
          <p className="bajada">Ordenadas por primer apellido. Toca un niño para abrir su carpeta.</p>
        </div>

        <div className="stats">
          <div className="stat"><span className="etiqueta-mono">Niños activos</span><span className="stat__num">{filas.length}</span></div>
          <div className="stat"><span className="etiqueta-mono">Promedio general</span><span className="stat__num">{promedio === null ? '—' : `${promedio} %`}</span></div>
          <div className="stat">
            <span className="etiqueta-mono">Carpetas fuera</span>
            <span className="stat__num">{fuera.length}</span>
            {fueraTarde > 0 && <span className="txt-rojo">{fueraTarde} hace más de {DIAS_ALERTA_PRESTAMO} días</span>}
          </div>
          <a className="stat stat--oscuro" href="#/agenda">
            <span className="etiqueta-mono">Vencidos · ver agenda</span>
            <span className="stat__num">{totalVencidos}</span>
          </a>
        </div>

        <div className="fila-wrap">
          <label className="buscador">
            <Icono d={ICONOS.buscar} color="#5A5F7A" />
            <span className="oculto">Buscar niño</span>
            <input type="search" placeholder="Buscar por nombre o apellido" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="fila-wrap" role="group" aria-label="Filtros">
            {([['todos', 'Todos'], ['bajo', 'Menos de 70 %'], ['fuera', 'Carpetas fuera'], ['caja', 'Por caja']] as [Filtro, string][]).map(([id, txt]) => (
              <button key={id} type="button" className="chip" aria-pressed={filtro === id} onClick={() => setFiltro(id)}>{txt}</button>
            ))}
            {filtro === 'caja' && (
              <label className="campo" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <span className="oculto">Caja</span>
                <select value={caja} onChange={(e) => setCaja(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Todas las cajas</option>
                  {cajas.map((c) => <option key={c} value={c}>Caja {c}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>

        <section className="tarjeta lista" aria-label="Lista de niños">
          <div className="lista__cab etiqueta-mono">
            <span className="col-nombre">Niño</span>
            <span className="col-caja">Caja</span>
            <span className="col-prog">Carpeta al día</span>
            <span className="col-ubic">Ubicación</span>
            <span className="col-prox">Próximo</span>
          </div>
          {visibles.map(({ n, pct, vencidos, siguiente, fuera }) => (
            <a key={n.id} className="lista__fila" href={`#/nino/${n.id}`}>
              <span className="col-nombre">
                <strong style={{ fontSize: 17 }}>{[n.primerApellido, n.segundoApellido].filter(Boolean).join(' ')},</strong>
                <span className="txt-tenue">{n.nombres}</span>
              </span>
              <span className="col-caja"><span className="caja"><Icono d={ICONOS.caja} tam={14} grosor={2.2} />{n.caja}</span></span>
              <span className="col-prog"><Barra pct={pct} etiqueta={`Carpeta al día de ${n.nombres}`} /></span>
              <span className="col-ubic">
                {fuera === null ? <span className="pastilla">En su caja</span>
                  : <span className={`pastilla ${fuera > DIAS_ALERTA_PRESTAMO ? 'pastilla--rojo' : 'pastilla--ambar'}`}>Fuera · {fuera === 1 ? '1 día' : `${fuera} días`}</span>}
              </span>
              <span className="col-prox fila-wrap" style={{ gap: 8 }}>
                <Icono d={ICONOS.reloj} tam={16} color="#5A5F7A" />
                {vencidos > 0 ? <span className="txt-rojo">{vencidos === 1 ? '1 vencido' : `${vencidos} vencidos`}</span>
                  : siguiente ? <span className={diasEntre(hoy, siguiente.fecha) <= 7 ? 'txt-ambar' : ''}>{siguiente.que} · {corta(siguiente.fecha, hoy)}</span>
                  : <span className="txt-tenue">Nada en 30 días</span>}
              </span>
            </a>
          ))}
          {visibles.length === 0 && <p style={{ padding: 28, textAlign: 'center', margin: 0 }} className="txt-tenue">Ningún niño coincide con la búsqueda.</p>}
        </section>
      </main>
    </>
  );
}
