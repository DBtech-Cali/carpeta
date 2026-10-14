import { useMemo, useState } from 'react';
import { agenda, type Evento, type Urgencia } from '../dominio/agenda';
import { corta, diasEnMes, partes, sumarDias } from '../dominio/fechas';
import { type Responsable, RESPONSABLES } from '../dominio/modelo';
import { Encabezado, useApp } from './comunes';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const COLOR_PUNTO: Record<Urgencia, string> = { vencido: '#FF7A7F', semana: '#FFD66B', mes: '#A9A3FF' };
const ETIQUETA_AREA: Record<Responsable, string> = { psicologia: 'pastilla--violeta', trabajo_social: '', nutricion: 'pastilla--verde', pedagogia: 'pastilla--ambar', general: '' };

export function Agenda() {
  const { datos, hoy } = useApp();
  const [area, setArea] = useState<Responsable | 'todos'>('todos');
  const todos = useMemo(() => agenda(datos.ninos, hoy), [datos.ninos, hoy]);
  const eventos = todos.filter((e) => area === 'todos' || e.responsable === area);
  const de = (u: Urgencia) => eventos.filter((e) => e.urgencia === u);

  const { y, m } = partes(hoy);
  const primerDia = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // lunes = 0
  const porDia = new Map<number, Urgencia>();
  const prioridad: Urgencia[] = ['mes', 'semana', 'vencido'];
  for (const e of eventos) {
    const f = partes(e.fecha);
    if (f.y !== y || f.m !== m) continue;
    const prev = porDia.get(f.d);
    if (!prev || prioridad.indexOf(e.urgencia) > prioridad.indexOf(prev)) porDia.set(f.d, e.urgencia);
  }

  return (
    <>
      <Encabezado activa="agenda" />
      <main className="pagina">
        <div>
          <h1 className="titulo">¿Qué toca hacer?</h1>
          <p className="bajada">Vencidos, próximos 7 días y hasta el {corta(sumarDias(hoy, 30), hoy)}. Toca un evento para abrir la carpeta en esa pestaña.</p>
        </div>
        <div className="fila-wrap" role="group" aria-label="Filtrar por profesional">
          {(['todos', 'psicologia', 'trabajo_social', 'nutricion', 'pedagogia', 'general'] as const).map((a) => (
            <button key={a} type="button" className="chip" aria-pressed={area === a} onClick={() => setArea(a)}>
              {a === 'todos' ? 'Todos' : RESPONSABLES[a]}
            </button>
          ))}
        </div>
        <div className="agenda">
          <div className="agenda__listas">
            <Bloque titulo="Vencidos" clase="bloque--rojo" color="var(--rojo)" eventos={de('vencido')} vacio="Nada vencido para este filtro." />
            <Bloque titulo="Próximos 7 días" clase="bloque--ambar" color="var(--ambar)" eventos={de('semana')} vacio="Nada esta semana para este filtro." />
            <Bloque titulo={`Hasta el ${corta(sumarDias(hoy, 30), hoy)}`} clase="bloque--violeta" color="var(--primario)" eventos={de('mes')} vacio="Nada más en los próximos 30 días." />
          </div>
          <aside className="calendario" aria-label={`Calendario de ${MESES[m - 1]}`}>
            <div className="fila-wrap" style={{ justifyContent: 'space-between' }}>
              <h2 className="subtitulo">{MESES[m - 1]} {y}</h2>
              <span className="etiqueta-mono" style={{ color: 'var(--noche-texto)' }}>{area === 'todos' ? 'Todas las áreas' : RESPONSABLES[area]}</span>
            </div>
            <div className="cal-rejilla etiqueta-mono" style={{ color: 'var(--noche-texto)' }}>
              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="cal-rejilla">
              {Array.from({ length: primerDia }, (_, i) => <span key={`v${i}`} />)}
              {Array.from({ length: diasEnMes(y, m) }, (_, i) => {
                const d = i + 1;
                const u = porDia.get(d);
                return (
                  <span key={d} className={`cal-dia ${d === partes(hoy).d ? 'cal-dia--hoy' : d < partes(hoy).d ? 'cal-dia--pasado' : ''}`}>
                    {d}
                    <span className="cal-punto" style={{ background: u ? COLOR_PUNTO[u] : 'transparent' }} />
                  </span>
                );
              })}
            </div>
            <div className="fila-wrap" style={{ fontSize: 13, color: 'var(--noche-texto)', borderTop: '1px solid #2f2f66', paddingTop: 10 }}>
              {(['vencido', 'semana', 'mes'] as Urgencia[]).map((u) => (
                <span key={u} className="fila-wrap" style={{ gap: 6 }}>
                  <span className="punto" style={{ background: COLOR_PUNTO[u], width: 10, height: 10 }} />
                  {u === 'vencido' ? 'Vencido' : u === 'semana' ? 'Esta semana' : 'Próximos'}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function Bloque({ titulo, clase, color, eventos, vacio }: { titulo: string; clase: string; color: string; eventos: Evento[]; vacio: string }) {
  const { hoy } = useApp();
  return (
    <section className={`tarjeta bloque ${clase}`} aria-label={titulo}>
      <div className="bloque__cab">
        <span className="punto" style={{ background: color }} />
        <h2>{titulo}</h2>
        <span className="pct" style={{ marginLeft: 'auto' }}>{eventos.length}</span>
      </div>
      {eventos.map((e, i) => (
        <a key={`${e.ninoId}-${e.itemId ?? i}-${e.fecha}`} className="evento" href={`#/nino/${e.ninoId}/${e.tab}`}>
          <span className="evento__fecha" style={{ color }}>{corta(e.fecha, hoy)}</span>
          <span className="evento__que">
            <strong>{e.que}</strong>
            <span className="txt-tenue" style={{ fontSize: 14 }}>{e.nino}</span>
          </span>
          <span className={`pastilla ${ETIQUETA_AREA[e.responsable]}`}>{RESPONSABLES[e.responsable]}</span>
        </a>
      ))}
      {eventos.length === 0 && <p style={{ margin: 0, padding: '16px 20px' }} className="txt-tenue">{vacio}</p>}
    </section>
  );
}
