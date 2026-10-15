// Evaluación de la carpeta: qué se exige hoy en cada pestaña y cuánto se cumple.
// Ver docs/contenido-carpeta.md.
import { atenciones, atencionesNutricion, informes, nivelRiesgo, type AreaAtencion } from './calendario';
import { corta, type Fecha, partes, sumarDias, sumarMeses } from './fechas';
import type { Marca, Nino, Responsable } from './modelo';

export type TabId =
  | 'inicio' | 'preliminar' | 'pacto' | 'socio_legal' | 'informes' | 'salud'
  | 'nutricion' | 'trabajo_social' | 'psicologia' | 'escuela' | 'pedagogia' | 'proyecto_vida';

export const TABS: { id: TabId; nombre: string; responsable: Responsable }[] = [
  { id: 'inicio', nombre: 'Inicio', responsable: 'general' },
  { id: 'preliminar', nombre: 'Preliminar', responsable: 'psicologia' },
  { id: 'pacto', nombre: 'Pacto de convivencia', responsable: 'general' },
  { id: 'socio_legal', nombre: 'Socio legal', responsable: 'general' },
  { id: 'informes', nombre: 'Informes', responsable: 'general' },
  { id: 'salud', nombre: 'Salud', responsable: 'nutricion' },
  { id: 'nutricion', nombre: 'Nutrición', responsable: 'nutricion' },
  { id: 'trabajo_social', nombre: 'Trabajo social', responsable: 'trabajo_social' },
  { id: 'psicologia', nombre: 'Psicología', responsable: 'psicologia' },
  { id: 'escuela', nombre: 'Escuela', responsable: 'pedagogia' },
  { id: 'pedagogia', nombre: 'Pedagogía', responsable: 'pedagogia' },
  { id: 'proyecto_vida', nombre: 'Proyecto de vida', responsable: 'general' },
];

/**
 * Cómo se presenta un ítem:
 * - doc: casilla; programada: fecha del calendario; opcional: no suma;
 * - excepcion: exonera otro ítem; comodin: cubre faltantes; interruptor: activa algo (caso especial).
 */
export type TipoItem = 'doc' | 'programada' | 'opcional' | 'excepcion' | 'comodin' | 'interruptor';
export type EstadoItem = 'ok' | 'pendiente' | 'vencido' | 'futuro' | 'cubierto' | 'exonerado' | 'neutro';

export interface ItemEval {
  id: string; // clave en Nino.marcas
  etiqueta: string;
  tipo: TipoItem;
  marca?: Marca;
  exigible: boolean;
  cumple: boolean;
  estado: EstadoItem;
  nota?: string;
  /** Dato que se pide al marcar. */
  pide?: 'fecha' | 'anio' | 'texto';
  grupo?: string;
  fecha?: Fecha; // fecha programada
  fechaOculta?: boolean; // se exige en `fecha`, pero el ítem no lleva fecha propia (actas, correos)
  vence?: Fecha; // fin de vigencia de un documento o comodín
  responsable: Responsable;
}

export interface TabEval {
  id: TabId;
  nombre: string;
  responsable: Responsable;
  items: ItemEval[];
  exigibles: number;
  cumplidos: number;
  pct: number | null; // null: nada exigible aún
  avisos: string[];
}

export interface CarpetaEval {
  tabs: TabEval[];
  pct: number | null;
}

/** Hasta dónde se generan fechas futuras para mostrar en líneas de tiempo y agenda. */
const HORIZONTE_DIAS = 120;

class Constructor {
  items: ItemEval[] = [];
  avisos: string[] = [];
  constructor(private nino: Nino, private hoy: Fecha, private responsable: Responsable) {}

  get exigeSinFecha() {
    return this.hoy >= this.nino.fechaIngreso;
  }

  marca(id: string) {
    return this.nino.marcas[id];
  }

  /** Documento sin fecha, que puede estar cubierto por un comodín. */
  doc(id: string, etiqueta: string, opts: { cubierto?: boolean; exonerado?: string; responsable?: Responsable } = {}) {
    const marca = this.marca(id);
    const resp = opts.responsable ?? this.responsable;
    if (opts.exonerado) {
      this.items.push({ id, etiqueta, tipo: 'doc', marca, exigible: false, cumple: false, estado: 'exonerado', nota: opts.exonerado, responsable: resp });
      return;
    }
    const exigible = this.exigeSinFecha;
    const cumple = !!marca || (!!opts.cubierto && exigible);
    const estado: EstadoItem = marca ? 'ok' : cumple ? 'cubierto' : exigible ? 'pendiente' : 'futuro';
    this.items.push({
      id, etiqueta, tipo: 'doc', marca, exigible, cumple, estado,
      nota: estado === 'cubierto' ? 'Cubierto por la solicitud enviada' : undefined,
      responsable: resp,
    });
  }

  /** Documento con fecha y vigencia en meses desde la fecha del documento. */
  vigente(id: string, etiqueta: string, meses: number) {
    const marca = this.marca(id);
    const exigible = this.exigeSinFecha;
    const vence = marca?.fecha ? sumarMeses(marca.fecha, meses) : undefined;
    const ok = !!vence && this.hoy <= vence;
    const nota = !marca ? undefined
      : !vence ? 'Falta la fecha del documento'
      : ok ? `Vigente hasta el ${corta(vence, this.hoy)}`
      : `Venció el ${corta(vence, this.hoy)}: no cuenta aunque esté marcado`;
    this.items.push({
      id, etiqueta, tipo: 'doc', marca, exigible, cumple: exigible && ok,
      estado: ok ? 'ok' : exigible ? (marca ? 'vencido' : 'pendiente') : 'futuro',
      nota, pide: 'fecha', vence, responsable: this.responsable,
    });
  }

  opcional(id: string, etiqueta: string) {
    const marca = this.marca(id);
    this.items.push({ id, etiqueta, tipo: 'opcional', marca, exigible: false, cumple: false, estado: 'neutro', nota: 'Opcional: no suma ni resta', responsable: this.responsable });
  }

  excepcion(id: string, etiqueta: string, nota: string, conMotivo = false) {
    const marca = this.marca(id);
    this.items.push({ id, etiqueta, tipo: 'excepcion', marca, exigible: false, cumple: false, estado: 'neutro', nota: marca?.texto ? `Motivo: ${marca.texto}` : nota, pide: conMotivo ? 'texto' : undefined, responsable: this.responsable });
    return !!marca;
  }

  /** Comodín simple: vale `meses` desde su fecha. Devuelve si está vigente. */
  comodin(id: string, etiqueta: string, meses: number, cubre: string) {
    const marca = this.marca(id);
    const vence = marca?.fecha ? sumarMeses(marca.fecha, meses) : undefined;
    const vigente = !!vence && this.hoy <= vence;
    const nota = !marca ? `Cubre ${cubre} mientras esté vigente (${meses === 1 ? '1 mes' : `${meses} meses`})`
      : vigente ? `Enviada el ${corta(marca.fecha!, this.hoy)} · vigente hasta el ${corta(vence!, this.hoy)}`
      : `Venció el ${corta(vence!, this.hoy)}: ya no cubre. Reitera la solicitud con la fecha nueva`;
    this.items.push({ id, etiqueta, tipo: 'comodin', marca, exigible: false, cumple: false, estado: !marca ? 'neutro' : vigente ? 'ok' : 'vencido', nota, pide: 'fecha', vence, responsable: this.responsable });
    return vigente;
  }

  programada(id: string, etiqueta: string, fecha: Fecha, grupo?: string, responsable?: Responsable, fechaVisible = true) {
    const marca = this.marca(id);
    const exigible = this.hoy > fecha;
    const estado: EstadoItem = marca ? 'ok' : exigible ? 'vencido' : 'futuro';
    this.items.push({
      id, etiqueta, tipo: 'programada', marca, exigible, cumple: exigible && !!marca, estado, grupo, fecha, fechaOculta: !fechaVisible,
      nota: fechaVisible ? undefined : `Se exige desde el ${corta(sumarDias(fecha, 1), this.hoy)}`,
      responsable: responsable ?? this.responsable,
    });
  }

  tab(id: TabId): TabEval {
    const def = TABS.find((t) => t.id === id)!;
    const exig = this.items.filter((i) => i.exigible);
    const ok = exig.filter((i) => i.cumple).length;
    return {
      id, nombre: def.nombre, responsable: def.responsable, items: this.items, avisos: this.avisos,
      exigibles: exig.length, cumplidos: ok, pct: exig.length ? Math.round((ok / exig.length) * 100) : null,
    };
  }
}

function grupoAtencion(n: number): string {
  if (n <= 5) return 'Periodo 1 · plan de caso → 1er seguimiento';
  if (n <= 8) return 'Periodo 2 · 1er → 2º seguimiento';
  return `Periodo ${n - 6} · ${n - 7}º → ${n - 6}º seguimiento`;
}

function atencionesDeArea(c: Constructor, nino: Nino, hasta: Fecha, area: AreaAtencion) {
  for (const a of atenciones(nino.fechaIngreso, hasta)) {
    c.programada(`ate.${area}.${a.id}`, a.etiqueta, a.fecha, grupoAtencion(Number(a.id)));
  }
}

function riesgo(c: Constructor, nino: Nino, hasta: Fecha, area: 'psicologia' | 'trabajo_social') {
  if (!nino.responsableRiesgo) {
    c.avisos.push('Falta definir quién lleva el seguimiento de nivel de riesgo (Psicología o Trabajo social).');
    return;
  }
  if (nino.responsableRiesgo !== area) return;
  for (const r of nivelRiesgo(nino.fechaIngreso, hasta)) {
    c.programada(`riesgo.${r.id}`, r.etiqueta, r.fecha, 'Seguimiento de nivel de riesgo');
  }
}

function edad(nacimiento: Fecha, hoy: Fecha): number {
  const n = partes(nacimiento);
  const h = partes(hoy);
  return h.y - n.y - (h.m < n.m || (h.m === n.m && h.d < n.d) ? 1 : 0);
}

export function evaluarCarpeta(nino: Nino, hoy: Fecha): CarpetaEval {
  const hasta = sumarDias(hoy, HORIZONTE_DIAS);
  const tabs: TabEval[] = [];
  const nuevo = (id: TabId) => new Constructor(nino, hoy, TABS.find((t) => t.id === id)!.responsable);

  // Inicio
  {
    const c = nuevo('inicio');
    const com = c.marca('inicio.comodin');
    const cubre = !!com?.fecha && sumarMeses(com.fecha, 2) >= hoy;
    c.doc('inicio.boleta', 'Boleta de ingreso', { cubierto: cubre });
    c.doc('inicio.pard', 'PARD (auto de apertura)', { cubierto: cubre });
    c.doc('inicio.val_ts', 'Valoración de Trabajo social', { cubierto: cubre });
    c.doc('inicio.val_psico', 'Valoración de Psicología', { cubierto: cubre });
    c.doc('inicio.val_nutri', 'Valoración de Nutrición', { cubierto: cubre });
    c.comodin('inicio.comodin', 'Correo de solicitud a la autoridad o Defensoría', 2, 'los documentos faltantes');
    tabs.push(c.tab('inicio'));
  }

  // Preliminar
  {
    const c = nuevo('preliminar');
    c.programada('preliminar.evaluacion', 'Evaluación preliminar', sumarDias(nino.fechaIngreso, 5));
    tabs.push(c.tab('preliminar'));
  }

  // Pacto de convivencia
  {
    const c = nuevo('pacto');
    c.doc('pacto.firmado', 'Pacto de convivencia firmado');
    tabs.push(c.tab('pacto'));
  }

  // Socio legal
  {
    const c = nuevo('socio_legal');
    const menor = !!c.marca('socio.menor7');
    const com = c.marca('socio.comodin');
    const cubre = !!com?.fecha && sumarMeses(com.fecha, 2) >= hoy;
    c.doc('socio.ti', 'Tarjeta de identidad del niño', { cubierto: cubre, exonerado: menor ? 'No se exige: menor de 7 años' : undefined });
    c.doc('socio.rc', 'Registro civil del niño', { cubierto: cubre });
    c.doc('socio.cedula', 'Cédula del acudiente', { cubierto: cubre });
    c.vigente('socio.adres', 'ADRES · afiliación en salud', 3);
    c.opcional('socio.recibo', 'Recibo de servicios (estrato)');
    c.comodin('socio.comodin', 'Carta o correo de solicitud', 2, 'todo menos el ADRES');
    c.excepcion('socio.menor7', 'Menor de 7 años', 'Exonera la tarjeta de identidad');
    if (menor && nino.fechaNacimiento && edad(nino.fechaNacimiento, hoy) >= 7) {
      c.avisos.push('Ya cumplió 7 años: desmarca la excepción y pide la tarjeta de identidad.');
    }
    tabs.push(c.tab('socio_legal'));
  }

  // Informes
  {
    const c = nuevo('informes');
    for (const i of informes(nino.fechaIngreso, hasta)) {
      const sinFecha = i.id.startsWith('correo') || i.id.startsWith('acta');
      c.programada(`informes.${i.id}`, i.etiqueta, i.fecha, undefined, undefined, !sinFecha);
    }
    tabs.push(c.tab('informes'));
  }

  // Salud
  {
    const c = nuevo('salud');
    const cartas = [1, 2, 3].map((k) => c.marca(`salud.carta${k}`));
    const defensoria = c.marca('salud.defensoria');
    const cartaVigente = cartas.some((m) => m?.fecha && sumarMeses(m.fecha, 1) >= hoy);
    const cubre = !!defensoria || cartaVigente;
    const exoCyd = !!c.marca('salud.exonera_cyd');
    c.doc('salud.vacunas', 'Vacunas', { cubierto: cubre });
    c.doc('salud.val_medica', 'Valoración médica general', { cubierto: cubre });
    c.doc('salud.cyd', 'Crecimiento y desarrollo', { cubierto: cubre, exonerado: exoCyd ? `Exonerado${c.marca('salud.exonera_cyd')?.texto ? `: ${c.marca('salud.exonera_cyd')!.texto}` : ''}` : undefined });
    [1, 2, 3].forEach((k) => c.comodin(`salud.carta${k}`, `Carta ${k} al acudiente`, 1, 'los documentos faltantes'));
    const marcadas = cartas.filter(Boolean).length;
    const correo = c.marca('salud.defensoria');
    c.items.push({
      id: 'salud.defensoria', etiqueta: 'Correo a Defensoría', tipo: 'comodin', marca: correo, exigible: false, cumple: false,
      estado: correo ? 'ok' : 'neutro', pide: 'fecha', responsable: 'nutricion',
      nota: correo ? `Enviado el ${corta(correo.fecha ?? hoy, hoy)} · no vence` : 'Tras 3 cartas sin respuesta. No vence',
    });
    const faltan = c.items.some((i) => i.tipo === 'doc' && i.estado === 'pendiente');
    if (faltan && !cubre && !defensoria) {
      c.avisos.push(marcadas < 3 ? `Siguiente paso: enviar la carta ${marcadas + 1} al acudiente.` : 'Pasó un mes desde la carta 3: enviar el correo a Defensoría.');
    }
    c.excepcion('salud.exonera_cyd', 'Exonerado de crecimiento y desarrollo', 'Para mayores sin ese documento. Escribe el motivo', true);
    tabs.push(c.tab('salud'));
  }

  // Nutrición
  {
    const c = nuevo('nutricion');
    const activa = !!nino.nutricion;
    c.doc('nutricion.valoracion_inicial', 'Valoración nutricional inicial');
    c.vigente('nutricion.tallaje', `Tallaje (peso y talla) · vigencia ${activa ? 3 : 6} meses`, activa ? 3 : 6);
    if (nino.nutricion) {
      // Se exigen desde el plan de caso, sin importar cuándo se marcó el caso especial:
      // al pasar carpetas antiguas a la app aparecen las atenciones que debieron hacerse.
      for (const a of atencionesNutricion(nino.fechaIngreso, nino.fechaIngreso, hasta)) {
        c.programada(`ate.nutricion.${a.id}`, a.etiqueta, a.fecha, 'Atenciones de caso especial');
      }
    }
    tabs.push(c.tab('nutricion'));
  }

  // Trabajo social
  {
    const c = nuevo('trabajo_social');
    c.doc('ts.pacto_familia', 'Pacto de familia');
    c.doc('ts.transporte', 'Análisis del auxilio de transporte');
    atencionesDeArea(c, nino, hasta, 'trabajo_social');
    riesgo(c, nino, hasta, 'trabajo_social');
    tabs.push(c.tab('trabajo_social'));
  }

  // Psicología
  {
    const c = nuevo('psicologia');
    atencionesDeArea(c, nino, hasta, 'psicologia');
    riesgo(c, nino, hasta, 'psicologia');
    tabs.push(c.tab('psicologia'));
  }

  // Escuela
  {
    const c = nuevo('escuela');
    const anio = partes(hoy).y;
    const com = c.marca('escuela.comodin');
    const cubre = !!com?.fecha && sumarMeses(com.fecha, 1) >= hoy;
    const m = c.marca('escuela.constancia');
    const deEsteAnio = m?.anio === anio;
    const exigible = c.exigeSinFecha;
    c.doc('escuela.boletin', 'Boletín', { cubierto: cubre });
    c.items.push({
      id: 'escuela.constancia', etiqueta: `Constancia de estudio ${anio}`, tipo: 'doc', marca: m, exigible,
      cumple: exigible && (deEsteAnio || cubre),
      estado: deEsteAnio ? 'ok' : cubre && exigible ? 'cubierto' : m ? 'vencido' : exigible ? 'pendiente' : 'futuro',
      nota: m && !deEsteAnio ? `La marcada es de ${m.anio}: se necesita la de ${anio}` : cubre && !deEsteAnio ? 'Cubierto por la carta de solicitud' : undefined,
      pide: 'anio', responsable: 'pedagogia',
    });
    c.comodin('escuela.comodin', 'Carta de solicitud', 1, 'el boletín y la constancia');
    tabs.push(c.tab('escuela'));
  }

  // Pedagogía
  {
    const c = nuevo('pedagogia');
    c.doc('pedagogia.ficha_inicial', 'Ficha inicial pedagógica');
    atencionesDeArea(c, nino, hasta, 'pedagogia');
    tabs.push(c.tab('pedagogia'));
  }

  // Proyecto de vida
  {
    const c = nuevo('proyecto_vida');
    c.doc('proyecto_vida.entregado', 'Proyecto de vida entregado');
    tabs.push(c.tab('proyecto_vida'));
  }

  const conPct = tabs.filter((t) => t.pct !== null);
  const pct = conPct.length ? Math.round(conPct.reduce((s, t) => s + (t.pct as number), 0) / conPct.length) : null;
  return { tabs, pct };
}
