/* ============================================================
   HOLOVIDA :: EVENTOS QUE SE ADAPTAN AL MUNDO
   Cada plantilla de aquí saca sus nombres propios del dosier del
   planeta en el que estás (data-mundos-dosier.js). La misma
   plantilla en Tatooine habla de moradores y vaporizadores; en
   Csilla, de Familias Gobernantes y hielo. 117 mundos × estas
   plantillas = decenas de miles de eventos concretos distintos.

   Slots disponibles:
     {bicho}    un animal de aquí        {peligro} lo que mata aquí
     {banda}    una facción de aquí      {hito}    un sitio famoso
     {mercancia} lo que se vende aquí    {mandamas} quién manda
     {tiempo}   el clima de aquí         {comida}  lo que se come
     {paisanos} cómo es la gente de aquí {sitio}   un lugar corriente
     {curro}    un oficio de aquí        {aqui}    el nombre del mundo
   ============================================================ */
(function (global) {
  'use strict';
  const SW = (global.SW = global.SW || {});
  SW.EVENTOS_LOCALES = [];

  /* atajo: todos los slots del dosier, siempre disponibles */
  const S = {
    bicho: 'bicho', peligro: 'peligro', banda: 'banda', hito: 'hito',
    mercancia: 'mercancia', mandamas: 'mandamas', tiempo: 'tiempo',
    comida: 'comida', paisanos: 'paisanos', sitio: 'lugar',
    curro: 'oficio', aqui: 'mundoAqui', n: 'nombre', lejos: 'mundoCerca'
  };

  const E = function (o) { o.slots = o.slots || S; o.local = true; SW.EVENTOS_LOCALES.push(o); };

  /* ══════════════════════════════════════════════════════════
     INFANCIA (3–7)
     ══════════════════════════════════════════════════════════ */

  E({ id: 'lo_inf_bicho', min: 3, max: 8, w: 10,
    t: 'Ves de cerca {bicho} por primera vez. Te quedas quieto sin saber por qué.',
    c: [{ t: 'Acercarte más', r: [
            { p: 0.6, t: 'Te deja. Vuelves a casa contándolo a gritos.', fx: { cordura: 8, carisma: 4 } },
            { p: 0.4, t: 'No te deja. Aprendes rápido lo que es un susto.', fx: { salud: -4, intelecto: 5 } }] },
        { t: 'Ir corriendo a contárselo a alguien', fx: { carisma: 6, cordura: 5 }, out: 'Nadie te cree del todo. Da igual.' },
        { t: 'Quedarte mirando hasta que se va', fx: { intelecto: 7, cordura: 6 }, out: 'Recuerdas cómo se movía años después.' }] });

  E({ id: 'lo_inf_tiempo', min: 3, max: 9, w: 10,
    t: 'Hoy cae sobre {aqui} {tiempo}. Los mayores lo dicen con una cara rara.',
    c: [{ t: 'Salir a verlo igual', fx: { salud: -3, cordura: 9, fisico: 3 }, out: 'Te acordarás de esto toda la vida.' },
        { t: 'Quedarte dentro y preguntar por qué pasa', fx: { intelecto: 8 }, out: 'Te dan una explicación mala pero te vale.' },
        { t: 'Ayudar a asegurar la casa', fx: { fisico: 5, destreza: 4, cordura: 4 }, out: 'Te dejan hacer algo de verdad por primera vez.' }] });

  E({ id: 'lo_inf_comida', min: 3, max: 10, w: 9,
    t: 'Hoy en casa hay {comida}. En {aqui} no todos los días hay.',
    c: [{ t: 'Comer sin preguntar', fx: { salud: 5, cordura: 4 } },
        { t: 'Guardar la mitad para mañana', fx: { intelecto: 6, cordura: 5 }, flag: 'previsor', out: 'Aprendes a contar los días antes que a contar números.' },
        { t: 'Darle la mitad a otro crío que no tiene', fx: { alineamiento: 14, carisma: 7, salud: -2 }, out: 'No lo olvida.' }] });

  E({ id: 'lo_inf_hito', min: 4, max: 10, w: 9,
    t: 'Te llevan por primera vez a {hito}. Es mucho más grande de lo que te habían contado.',
    c: [{ t: 'No soltarte de la mano de nadie', fx: { cordura: 5 } },
        { t: 'Escaparte a mirar por tu cuenta', r: [
            { p: 0.55, t: 'Vuelves solo y nadie se ha enterado.', fx: { destreza: 7, intelecto: 5, cordura: 6 } },
            { p: 0.45, t: 'Te pierdes una hora. La hora más larga de tu vida.', fx: { cordura: -8, intelecto: 6 } }] },
        { t: 'Preguntar quién lo construyó', fx: { intelecto: 9 }, out: 'La respuesta te deja pensando más de lo normal.' }] });

  E({ id: 'lo_inf_paisano', min: 4, max: 11, w: 8,
    t: 'Alguien de {paisanos} te para en {sitio} y te pregunta de quién eres hijo.',
    c: [{ t: 'Decirlo todo', fx: { carisma: 6 }, out: 'Resulta que conocía a tu familia. Te da algo de comer.' },
        { t: 'Mentir por gusto', fx: { carisma: 8, alineamiento: -5 }, flag: 'mentiroso_temprano', out: 'Funciona. Eso es lo peligroso.' },
        { t: 'Salir corriendo', fx: { destreza: 6, cordura: -3 } }] });

  E({ id: 'lo_inf_curro', min: 5, max: 12, w: 9,
    t: 'Te dejan ayudar a alguien que trabaja de {curro} en {aqui}. Solo a mirar, dicen.',
    c: [{ t: 'Mirar y aprender', fx: { intelecto: 8, destreza: 5 }, out: 'Retienes más de lo que ellos creen.' },
        { t: 'Tocar algo que no debías', r: [
            { p: 0.5, t: 'Sale bien y te dejan seguir.', fx: { destreza: 9, carisma: 4 } },
            { p: 0.5, t: 'Sale mal y te echan.', fx: { destreza: 4, cordura: -5, reputacion: -4 } }] },
        { t: 'Aburrirte y largarte', fx: { cordura: 3 } }] });

  E({ id: 'lo_inf_miedo', min: 4, max: 11, w: 8,
    t: 'De noche los mayores hablan de {peligro} en voz baja. Tú lo oyes desde la cama.',
    c: [{ t: 'Taparte hasta la cabeza', fx: { cordura: -5, intelecto: 3 } },
        { t: 'Levantarte y preguntar', fx: { carisma: 5, intelecto: 6, cordura: 4 }, out: 'Te lo explican mal para que no tengas miedo. Tienes más.' },
        { t: 'Decidir que de mayor no vas a tener miedo de eso', fx: { cordura: 8, fisico: 3 }, flag: 'sin_miedo', out: 'Es una promesa infantil. A veces se cumplen.' }] });

  E({ id: 'lo_inf_juego', min: 4, max: 12, w: 10,
    t: 'Los críos de {aqui} juegan a algo que aquí se juega y en ningún otro sitio.',
    c: [{ t: 'Jugar y ganar', fx: { destreza: 7, carisma: 6, cordura: 5 } },
        { t: 'Jugar y perder', fx: { destreza: 4, cordura: -3, fisico: 3 }, out: 'Pierdes. Vuelves mañana.' },
        { t: 'Cambiar las reglas a tu favor', fx: { intelecto: 7, carisma: 5, alineamiento: -6 }, out: 'Nadie te lo dice a la cara, pero se dan cuenta.' }] });

  /* ══════════════════════════════════════════════════════════
     NIÑEZ (7–13)
     ══════════════════════════════════════════════════════════ */

  E({ id: 'lo_nin_banda', min: 8, max: 15, w: 10,
    t: 'Los chavales que andan con {banda} te dicen que puedes ir con ellos si haces una cosa.',
    c: [{ t: 'Hacerlo', fx: { destreza: 7, notoriedad: 6, alineamiento: -8, carisma: 5 }, flag: 'crio_de_banda', out: 'Ahora te saludan por la calle. También los que no deberían.' },
        { t: 'Decir que no y aguantar', fx: { cordura: 9, alineamiento: 8, reputacion: -5 }, out: 'Te lo hacen pasar mal seis meses. Luego se cansan.' },
        { t: 'Contárselo a un adulto', fx: { alineamiento: 10, reputacion: -10, cordura: -4 }, out: 'Se arregla. Nadie te lo perdona.' }] });

  E({ id: 'lo_nin_mercancia', min: 8, max: 16, w: 10,
    t: 'Descubres que en {aqui} se puede sacar dinero con {mercancia} si sabes a quién ir.',
    c: [{ t: 'Empezar poco a poco', fx: { creditos: 900, intelecto: 7, carisma: 5 }, habilidad: 'comerciante', out: 'Tu primer dinero propio.' },
        { t: 'Meterte de golpe con lo que tengas', r: [
            { p: 0.45, t: 'Sale redondo.', fx: { creditos: 3500, carisma: 8, suerte: 5 } },
            { p: 0.55, t: 'Te la juegan por ser crío.', fx: { creditos: -600, intelecto: 8, cordura: -5 } }] },
        { t: 'Dejarlo estar', fx: { cordura: 4 } }] });

  E({ id: 'lo_nin_bicho2', min: 8, max: 16, w: 9,
    t: 'Se ha metido {bicho} donde no debía y nadie sabe cómo sacarlo.',
    c: [{ t: 'Sacarlo tú', r: [
            { p: 0.55, t: 'Lo consigues y te miran distinto.', fx: { destreza: 9, reputacion: 8, cordura: 6 } },
            { p: 0.45, t: 'Te muerde.', fx: { salud: -12, destreza: 5 }, herida: { n: 'mordisco', sev: 8 } }] },
        { t: 'Ir a buscar a alguien que sepa', fx: { intelecto: 6, carisma: 4 } },
        { t: 'Quedártelo', fx: { cordura: 10, alineamiento: 4 }, mascota: true }] });

  E({ id: 'lo_nin_hito2', min: 9, max: 17, w: 9,
    t: 'Hay una apuesta entre los chavales: llegar hasta {hito} y volver antes de que anochezca.',
    c: [{ t: 'Ir', r: [
            { p: 0.6, t: 'Llegas y vuelves. Te lo van a recordar años.', fx: { fisico: 9, cordura: 8, reputacion: 10 } },
            { p: 0.4, t: 'Te pilla la noche a medio camino.', fx: { salud: -10, cordura: -6, fisico: 6 } }] },
        { t: 'Ir pero con alguien más', fx: { fisico: 6, carisma: 8, cordura: 5 }, nuevaRel: true, out: 'Volvéis juntos. Eso pesa.' },
        { t: 'No ir y aguantar las risas', fx: { cordura: -5, intelecto: 4, reputacion: -6 } }] });

  E({ id: 'lo_nin_escuela', min: 7, max: 15, w: 10,
    t: 'En {aqui} la enseñanza es lo que es. Alguien te ofrece aprender de verdad, aunque sea a su manera.',
    c: [{ t: 'Aceptar y estudiar', fx: { intelecto: 14, cordura: 4 }, out: 'Te cuesta. Sirve.' },
        { t: 'Aprender el oficio en la calle en vez de eso', fx: { destreza: 10, carisma: 8, intelecto: 4 }, habilidad: 'callejeo' },
        { t: 'Ni una cosa ni otra', fx: { cordura: 6, fisico: 5 }, out: 'Te pasas la infancia fuera de casa. No es lo peor.' }] });

  E({ id: 'lo_nin_peligro', min: 8, max: 16, w: 9,
    t: 'Se cuenta en {aqui} que alguien de tu edad no volvió por culpa de {peligro}.',
    c: [{ t: 'Ir a ver el sitio', fx: { cordura: -6, intelecto: 8, fisico: 4 }, out: 'No hay nada que ver. Eso es lo que te impresiona.' },
        { t: 'Aprender todo lo que puedas sobre eso', fx: { intelecto: 12 }, habilidad: 'supervivencia', out: 'Te sabes las señales antes que nadie de tu quinta.' },
        { t: 'No pensar en ello', fx: { cordura: 6 } }] });

  E({ id: 'lo_nin_mandamas', min: 9, max: 17, w: 9,
    t: 'Entiendes por primera vez que en {aqui} manda {mandamas}, y que eso te afecta a ti.',
    c: [{ t: 'Aceptarlo como es', fx: { cordura: 7, intelecto: 4 } },
        { t: 'Decidir que algún día no será así', fx: { intelecto: 8, carisma: 6, alineamiento: 6 }, flag: 'quiere_cambiarlo', out: 'Una idea de crío. Algunas duran.' },
        { t: 'Decidir que algún día ese serás tú', fx: { intelecto: 8, carisma: 8, alineamiento: -6 }, flag: 'quiere_mandar', out: 'Otra idea de crío. Algunas también duran.' }] });

  E({ id: 'lo_nin_paisanos', min: 8, max: 16, w: 8,
    t: 'Alguien de fuera se ríe de cómo hablan {paisanos} de aquí. Tú también hablas así.',
    c: [{ t: 'Partirle la cara', fx: { fisico: 7, reputacion: 6, alineamiento: -4, salud: -5 } },
        { t: 'Dejar de hablar así', fx: { carisma: 8, cordura: -7 }, flag: 'reniega_del_acento', out: 'Funciona fuera. Duele dentro.' },
        { t: 'Hablar más fuerte todavía', fx: { carisma: 6, cordura: 9, reputacion: 5 }, out: 'A partir de ahí, nunca lo escondes.' }] });

  /* ══════════════════════════════════════════════════════════
     ADOLESCENCIA (13–19)
     ══════════════════════════════════════════════════════════ */

  E({ id: 'lo_ado_curro2', min: 13, max: 22, w: 11,
    t: 'Te ofrecen tu primer trabajo de verdad: {curro} en {sitio}. Pagan poco y se nota en las manos.',
    c: [{ t: 'Aceptar y aguantar', fx: { creditos: 3200, fisico: 8, destreza: 8, salud: -5 }, habilidad: 'oficio', out: 'Un año. Aprendes más de lo que crees.' },
        { t: 'Aceptar y robar por debajo', r: [
            { p: 0.55, t: 'Nadie se entera.', fx: { creditos: 7000, notoriedad: 8, alineamiento: -12 } },
            { p: 0.45, t: 'Se enteran.', fx: { creditos: -1000, reputacion: -14, alineamiento: -10 }, buscado: 12 }] },
        { t: 'Buscar algo mejor', fx: { carisma: 6, cordura: -4 }, out: 'No hay nada mejor este año.' }] });

  E({ id: 'lo_ado_banda2', min: 14, max: 24, w: 11,
    t: 'Hay reclutamiento abierto en {banda}. En {aqui} eso significa comer todos los días, y otras cosas.',
    c: [{ t: 'Entrar', fx: { creditos: 6000, notoriedad: 14, alineamiento: -12, fisico: 8 }, flag: 'con_{banda}', out: 'Te dan un sitio y una lista de gente a la que no saludar.' },
        { t: 'Entrar para saber cómo funcionan por dentro', req: function (s) { return s.stats.intelecto > 40; }, fx: { intelecto: 12, notoriedad: 8, alineamiento: -4 }, flag: 'infiltrado', out: 'Escuchas mucho y hablas poco.' },
        { t: 'Decir que no', fx: { cordura: 8, alineamiento: 10, reputacion: -6 } },
        { t: 'Denunciarlo ante {mandamas}', fx: { alineamiento: 12, reputacion: 8 }, buscado: 20, out: 'Se hace algo. Y ahora te conocen por el nombre.' }] });

  E({ id: 'lo_ado_amor', min: 14, max: 26, w: 11,
    t: 'Alguien de {aqui} te gusta. Se llama {n} y trabaja de {curro}.',
    c: [{ t: 'Decírselo de frente', r: [
            { p: 0.55, t: 'Sale bien.', fx: { carisma: 10, cordura: 14 }, nuevaRel: true },
            { p: 0.45, t: 'No sale.', fx: { cordura: -8, carisma: 6 } }] },
        { t: 'Esperar a que se dé cuenta', fx: { cordura: -5, intelecto: 4 }, out: 'No se da cuenta. O sí, y no le interesa.' },
        { t: 'Impresionarle haciendo algo estúpido', r: [
            { p: 0.4, t: 'Funciona, contra todo pronóstico.', fx: { carisma: 12, reputacion: 8 }, nuevaRel: true },
            { p: 0.6, t: 'Acabas en {sitio} con algo roto.', fx: { salud: -14, cordura: -6 }, herida: { n: 'fractura', sev: 10 } }] }] });

  E({ id: 'lo_ado_irse', min: 15, max: 25, w: 11,
    t: 'Sale una plaza en un carguero que va a {lejos}. En {aqui} nadie se va y vuelve igual.',
    c: [{ t: 'Irte', fx: { cordura: 6, intelecto: 8, carisma: 6, creditos: -400 }, mover: 'cerca', motivo: 'buscando otra cosa', out: 'Te vas sin despedirte bien de nadie.' },
        { t: 'Quedarte por tu familia', fx: { alineamiento: 10, relTodas: 12, cordura: -4 }, out: 'Es una decisión, aunque no lo parezca.' },
        { t: 'Quedarte y montar algo aquí', fx: { intelecto: 8, carisma: 8, creditos: 1500 }, flag: 'raices_en_{aqui}', out: 'Si algo va a cambiar aquí, que lo cambies tú.' }] });

  E({ id: 'lo_ado_peligro2', min: 14, max: 26, w: 10,
    t: 'Esta vez es {peligro}, y te toca de cerca por primera vez, no de oídas.',
    c: [{ t: 'Reaccionar y ayudar', r: [
            { p: 0.6, t: 'Sacas a alguien de ahí.', fx: { reputacion: 14, alineamiento: 14, fisico: 8, salud: -8 } },
            { p: 0.4, t: 'Llegas tarde.', fx: { cordura: -14, alineamiento: 6, intelecto: 6 } }] },
        { t: 'Salvarte tú y ya', fx: { destreza: 8, cordura: -8, alineamiento: -8 }, out: 'No se lo cuentas a nadie.' },
        { t: 'Quedarte helado', fx: { cordura: -12, intelecto: 5 }, out: 'Piensas en eso durante años.' }] });

  E({ id: 'lo_ado_hito3', min: 14, max: 30, w: 9,
    t: 'En {hito} pasa algo esta semana que solo pasa en {aqui}.',
    c: [{ t: 'Ir y meterte hasta el fondo', fx: { carisma: 10, cordura: 10, reputacion: 8, creditos: -500 }, out: 'De esas noches que se cuentan mal porque no se pueden contar bien.' },
        { t: 'Ir a trabajar allí esos días', fx: { creditos: 2800, destreza: 6, carisma: 5 } },
        { t: 'Aprovechar que todo el mundo está allí', fx: { creditos: 4500, notoriedad: 10, alineamiento: -10 }, buscado: 10, out: 'Las casas vacías no se cierran solas.' }] });

  E({ id: 'lo_ado_arma', min: 15, max: 30, w: 10,
    t: 'En {aqui} a tu edad ya se lleva algo encima. {paisanos} lo dan por hecho.',
    c: [{ t: 'Conseguir algo y llevarlo', fx: { creditos: -800, fisico: 5, cordura: 5 }, armeria: true },
        { t: 'Aprender a pelear sin nada', fx: { fisico: 12, destreza: 8 }, habilidad: 'cuerpo a cuerpo', out: 'Más lento de aprender. Nadie te lo quita.' },
        { t: 'Confiar en no necesitarlo', fx: { cordura: 6, alineamiento: 6 }, out: 'Estadísticamente arriesgado en un sitio como este.' }] });

  E({ id: 'lo_ado_mandamas2', min: 16, max: 32, w: 9,
    t: 'Busca gente joven {mandamas}, para algo que no explica del todo.',
    c: [{ t: 'Apuntarte', fx: { creditos: 5000, reputacion: 8, alineamiento: -4 }, faccion: 'auto+15', out: 'El sueldo llega puntual. Las preguntas, no.' },
        { t: 'Apuntarte y averiguar qué es', req: function (s) { return s.stats.intelecto > 45; }, fx: { intelecto: 12, notoriedad: 6 }, flag: 'sabe_algo_de_{aqui}', out: 'Lo que descubres no lo puedes decir en voz alta.' },
        { t: 'Pasar', fx: { cordura: 5 } }] });

  /* ══════════════════════════════════════════════════════════
     JOVEN ADULTO (18–35)
     ══════════════════════════════════════════════════════════ */

  E({ id: 'lo_jov_negocio', min: 18, max: 45, w: 11,
    t: 'Hay hueco en {aqui} para quien sepa mover {mercancia}. Nadie lo está haciendo bien.',
    c: [{ t: 'Montarlo legal', fx: { creditos: -4000, intelecto: 10, carisma: 8 }, flag: 'negocio_en_{aqui}',
          r: [{ p: 0.55, t: 'Al tercer año va solo.', fx: { creditos: 32000, reputacion: 14 } },
              { p: 0.45, t: 'Te come la burocracia y un competidor.', fx: { creditos: -6000, cordura: -8, intelecto: 8 } }] },
        { t: 'Montarlo por debajo', r: [
            { p: 0.5, t: 'Ganas mucho más y mucho antes.', fx: { creditos: 55000, notoriedad: 18, alineamiento: -14 }, buscado: 18 },
            { p: 0.5, t: 'Te lo quita {banda}.', fx: { creditos: -3000, notoriedad: 10, alineamiento: -8 }, herida: { n: 'aviso', sev: 10 } }] },
        { t: 'Vender la idea a alguien con dinero', fx: { creditos: 12000, carisma: 8 }, out: 'Cobras una vez. Ellos cobran siempre.' },
        { t: 'Dejarlo', volver: true }] });

  E({ id: 'lo_jov_banda3', min: 18, max: 50, w: 10,
    t: 'Te llega un encargo de {banda} que paga demasiado bien para lo que parece.',
    c: [{ t: 'Aceptarlo sin preguntar', r: [
            { p: 0.5, t: 'Era transporte. Cobras y te olvidas.', fx: { creditos: 18000, notoriedad: 8, alineamiento: -6 } },
            { p: 0.5, t: 'No era transporte.', fx: { creditos: 18000, notoriedad: 20, alineamiento: -22, cordura: -12 }, buscado: 25 }] },
        { t: 'Preguntar antes qué es', fx: { intelecto: 8, carisma: 6 }, out: 'Te lo cuentan. Ahora la decisión es tuya de verdad.', generar: 'dilema' },
        { t: 'Rechazarlo', fx: { alineamiento: 10, cordura: 6, reputacion: -8 }, out: 'En {aqui} decir que no tiene precio.' },
        { t: 'Aceptarlo y avisar a {mandamas}', fx: { alineamiento: 16, reputacion: 12 }, buscado: 30, faccion: 'auto+20', out: 'Los cogen. A ti te conocen.' }] });

  E({ id: 'lo_jov_bicho3', min: 18, max: 55, w: 9,
    t: 'Hay dinero puesto por {bicho}. Alguien lo quiere vivo y paga por encima de lo razonable.',
    c: [{ t: 'Ir a por él tú solo', combate: { dif: 55, botin: 20000 }, fx: { fisico: 8 } },
        { t: 'Montar una cuadrilla', fx: { carisma: 10, creditos: 9000, reputacion: 8 }, out: 'Se reparte menos. Vuelven todos.' },
        { t: 'Vender la información de dónde está', fx: { creditos: 4500, intelecto: 6, alineamiento: -4 } },
        { t: 'Avisar a quien vive cerca', fx: { alineamiento: 14, reputacion: 10 }, out: 'Nadie te paga. Alguien te lo devuelve años después.' }] });

  E({ id: 'lo_jov_peligro3', min: 18, max: 60, w: 10,
    t: 'Lo de siempre en {aqui}: {peligro}. Esta vez deja el planeta tocado y hace falta gente.',
    c: [{ t: 'Organizar la ayuda', fx: { carisma: 14, reputacion: 18, alineamiento: 16, cordura: -6 }, habilidad: 'liderazgo', out: 'Te sale sin saber que sabías.' },
        { t: 'Trabajar de sol a sol sin que nadie te vea', fx: { fisico: 10, alineamiento: 12, salud: -8, cordura: 8 } },
        { t: 'Comprar barato lo que ahora nadie quiere', fx: { creditos: 26000, alineamiento: -18, reputacion: -14 }, out: 'Es legal. Se te va a recordar igual.' },
        { t: 'Marcharte de {aqui}', fx: { cordura: -6 }, mover: 'cerca', motivo: 'huyendo del desastre' }] });

  E({ id: 'lo_jov_mandamas3', min: 20, max: 60, w: 10,
    t: 'Te llama por tu nombre {mandamas}. Eso en {aqui} no es buena señal ni mala; es una señal.',
    c: [{ t: 'Ir y escuchar', fx: { intelecto: 8, carisma: 8 }, out: 'Te ofrecen algo. Y algo se te pide.', generar: 'dilema' },
        { t: 'Ir con condiciones', req: function (s) { return s.stats.carisma > 45; }, fx: { carisma: 14, reputacion: 10, creditos: 15000 }, out: 'Te las aceptan. Eso significa que necesitaban más de ti de lo que creías.' },
        { t: 'No ir', fx: { cordura: -6, reputacion: -10 }, buscado: 12, out: 'No ir también es una respuesta.' }] });

  E({ id: 'lo_jov_hito4', min: 18, max: 60, w: 9,
    t: 'Se puede entrar en {hito} si sabes por dónde. Muy poca gente sabe por dónde.',
    c: [{ t: 'Entrar solo', r: [
            { p: 0.45, t: 'Sales con algo que no debería estar en manos de nadie.', fx: { creditos: 30000, notoriedad: 12 }, item: true },
            { p: 0.35, t: 'Sales sin nada pero sales.', fx: { destreza: 10, cordura: 6 } },
            { p: 0.2, t: 'No sales solo. Te sacan.', fx: { salud: -25, creditos: -3000 }, herida: { n: 'caída', sev: 16 }, buscado: 15 }] },
        { t: 'Vender lo que sabes a quien quiera entrar', fx: { creditos: 11000, intelecto: 6, notoriedad: 6 } },
        { t: 'Contárselo a alguien que debe saberlo', fx: { alineamiento: 12, reputacion: 10 } },
        { t: 'Olvidarlo', volver: true }] });

  E({ id: 'lo_jov_paisanos2', min: 18, max: 65, w: 9,
    t: 'Fuera de {aqui} se ríen de {paisanos}. Ahora lo oyes tú, delante.',
    c: [{ t: 'Contestar con la cabeza', fx: { carisma: 12, intelecto: 8, reputacion: 8 }, out: 'Le dejas sin argumentos y sin ganas.' },
        { t: 'Contestar con las manos', fx: { fisico: 8, reputacion: 6, salud: -10, alineamiento: -6 }, herida: { n: 'nudillos partidos', sev: 6 } },
        { t: 'Reírte tú también', fx: { carisma: 6, cordura: -10 }, out: 'Se te queda dentro más de lo que esperabas.' },
        { t: 'Dejarlo pasar', fx: { cordura: 4 } }] });

  E({ id: 'lo_jov_mercancia2', min: 18, max: 60, w: 10,
    t: 'Se ha ido al doble el precio de {mercancia} en {aqui}. Todo el mundo tiene una opinión.',
    c: [{ t: 'Comprar todo lo que puedas ahora', r: [
            { p: 0.5, t: 'Sube otro tanto. Vendes arriba.', fx: { creditos: 40000, intelecto: 8 } },
            { p: 0.5, t: 'Se desploma en tres meses.', fx: { creditos: -14000, intelecto: 10, cordura: -6 } }] },
        { t: 'Vender lo que tengas ya', fx: { creditos: 12000, intelecto: 6 }, out: 'Ni el techo ni el suelo. Se duerme mejor.' },
        { t: 'Averiguar quién está moviendo el precio', req: function (s) { return s.stats.intelecto > 45; }, fx: { intelecto: 14, notoriedad: 8 }, flag: 'sabe_quien_manda_en_{aqui}', out: 'Lo averiguas. Ahora tienes un problema y una oportunidad.' },
        { t: 'No meterte', volver: true }] });

  E({ id: 'lo_jov_tiempo2', min: 16, max: 70, w: 9,
    t: 'Esta temporada en {aqui} aprieta {tiempo} y no da tregua. Se para casi todo.',
    c: [{ t: 'Trabajar igual', fx: { creditos: 8000, salud: -12, fisico: 8, reputacion: 8 }, out: 'El que trabaja cuando nadie trabaja cobra distinto.' },
        { t: 'Aprovechar para aprender algo', fx: { intelecto: 12, cordura: 8 } },
        { t: 'Ayudar a los que lo llevan peor', fx: { alineamiento: 14, reputacion: 10, carisma: 6, creditos: -1500 } },
        { t: 'Encerrarte y esperar', fx: { cordura: -5, salud: 5 } }] });

  E({ id: 'lo_jov_comida2', min: 18, max: 70, w: 8,
    t: 'Alguien te invita a {comida} en {sitio} y quiere hablar contigo mientras comes.',
    c: [{ t: 'Escuchar la propuesta', fx: { carisma: 6, intelecto: 6 }, out: 'Es más interesante de lo que esperabas.', generar: 'dilema' },
        { t: 'Comer y no comprometerte a nada', fx: { salud: 5, carisma: 8, cordura: 4 } },
        { t: 'Levantarte antes del segundo plato', fx: { reputacion: -6, cordura: 6, alineamiento: 4 } }] });

  E({ id: 'lo_jov_curro3', min: 20, max: 60, w: 10,
    t: 'Los que trabajan de {curro} en {aqui} se plantan. O estás con ellos o estás trabajando mientras ellos no.',
    c: [{ t: 'Ir con ellos', fx: { reputacion: 14, alineamiento: 12, creditos: -3000, carisma: 8 }, flag: 'sindicalista',
          r: [{ p: 0.5, t: 'Ganáis. Se nota en la nómina de todos.', fx: { creditos: 6000, reputacion: 10 } },
              { p: 0.5, t: 'Pierden. Y hay listas.', fx: { creditos: -2000, reputacion: 6 }, buscado: 10 }] },
        { t: 'Trabajar igual', fx: { creditos: 9000, reputacion: -18, alineamiento: -10 }, out: 'Cobras el doble. En el bar no te sientas con nadie.' },
        { t: 'Mediar entre las dos partes', req: function (s) { return s.stats.carisma > 50; }, fx: { carisma: 16, reputacion: 14, alineamiento: 8, creditos: 5000 }, habilidad: 'negociador' },
        { t: 'Irte a otro sitio esos meses', fx: { cordura: 4 }, mover: 'cerca', motivo: 'esperando a que pase' }] });

  /* ══════════════════════════════════════════════════════════
     ADULTO (25–60)
     ══════════════════════════════════════════════════════════ */

  E({ id: 'lo_adu_casa', min: 25, max: 70, w: 10,
    t: 'Se vende una casa en {sitio}. En {aqui} es lo más parecido a echar raíces.',
    c: [{ t: 'Comprarla', coste: 28000, fx: { cordura: 14, reputacion: 8 }, flag: 'casa_en_{aqui}', out: 'Tienes una dirección. No es poco.' },
        { t: 'Comprarla para alquilarla', coste: 28000, fx: { creditos: 3000, intelecto: 6, alineamiento: -4 }, out: 'La renta entra sola. La gente que vive ahí no te conoce.' },
        { t: 'No atarte a este planeta', fx: { cordura: -4, intelecto: 4 }, out: 'Te queda el dinero y la sensación.' }] });

  E({ id: 'lo_adu_banda4', min: 25, max: 70, w: 10,
    t: 'Algo de lo que dependes lo controla {banda}, y han subido lo que cobran.',
    c: [{ t: 'Pagar y callar', fx: { creditos: -9000, cordura: -8 } },
        { t: 'Negociar cara a cara', req: function (s) { return s.stats.carisma > 45; }, r: [
            { p: 0.6, t: 'Te bajan el porcentaje. Te miran distinto.', fx: { carisma: 14, reputacion: 10, creditos: -3000 } },
            { p: 0.4, t: 'Aprenden que puedes hablar, y suben más.', fx: { creditos: -14000, cordura: -6 } }] },
        { t: 'Organizar a los que están igual que tú', fx: { carisma: 16, reputacion: 16, alineamiento: 12 }, buscado: 18, habilidad: 'liderazgo', out: 'Ahora sois un problema para ellos y no al revés.' },
        { t: 'Ir a por ellos', combate: { dif: 62, botin: 15000 }, fx: { alineamiento: -6, notoriedad: 14 } }] });

  E({ id: 'lo_adu_hijo', min: 26, max: 60, w: 9, req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'hijo'; }); },
    t: 'Tu hijo quiere hacer en {aqui} lo mismo que hiciste tú, y tú sabes cómo acaba eso.',
    c: [{ t: 'Dejarle', fx: { relHijos: 16, cordura: -6, alineamiento: 4 }, out: 'Se equivocará solo. Como tú.' },
        { t: 'Prohibírselo', fx: { relHijos: -18, cordura: 6 }, out: 'Lo hace igual, pero sin contártelo.' },
        { t: 'Enseñarle a hacerlo bien', fx: { relHijos: 22, intelecto: 8, carisma: 8, cordura: 10 }, out: 'La única salida decente y también la más difícil.' },
        { t: 'Sacarle de {aqui}', fx: { relHijos: -8, creditos: -12000, alineamiento: 8 }, out: 'Te lo agradecerá dentro de veinte años.' }] });

  E({ id: 'lo_adu_mandamas4', min: 28, max: 75, w: 10,
    t: 'Se nota débil {mandamas}. En {aqui} eso significa que alguien va a ocupar ese sitio.',
    c: [{ t: 'Intentarlo tú', req: function (s) { return s.stats.carisma > 50 || s.notoriedad > 40; }, r: [
            { p: 0.4, t: 'Lo consigues. Ahora eres lo que criticabas o lo que admirabas.', fx: { reputacion: 25, carisma: 14, creditos: 45000, notoriedad: 20 }, flag: 'manda_en_{aqui}' },
            { p: 0.6, t: 'No lo consigues, y ahora lo saben.', fx: { reputacion: -14, cordura: -10 }, buscado: 25 }] },
        { t: 'Apoyar a alguien que te convenga', fx: { carisma: 10, creditos: 18000, alineamiento: -6 }, out: 'Le debe el puesto. Eso vale más que el puesto.' },
        { t: 'Apoyar a quien lo haría mejor', fx: { alineamiento: 16, reputacion: 14 }, out: 'No sacas nada. {aqui} sí.' },
        { t: 'Quitarte de en medio esta temporada', fx: { cordura: 6 }, volver: true }] });

  E({ id: 'lo_adu_peligro4', min: 25, max: 75, w: 10,
    t: 'Sabes que {peligro} va a pasar otra vez, y sabes cuándo. Nadie más te cree.',
    c: [{ t: 'Insistir hasta que te escuchen', r: [
            { p: 0.5, t: 'Te hacen caso a tiempo.', fx: { reputacion: 24, alineamiento: 18, carisma: 10 } },
            { p: 0.5, t: 'Te toman por loco. Pasa. Luego se acuerdan.', fx: { reputacion: 14, cordura: -12, alineamiento: 12 } }] },
        { t: 'Preparar solo a los tuyos', fx: { relTodas: 16, alineamiento: -4, intelecto: 8 } },
        { t: 'Ganar dinero con lo que sabes', fx: { creditos: 35000, alineamiento: -22, reputacion: -16 } },
        { t: 'Callarte y equivocarte a gusto', fx: { cordura: -8 } }] });

  E({ id: 'lo_adu_mercancia3', min: 25, max: 70, w: 9,
    t: 'Te llega un cargamento de {mercancia} que no es tuyo y nadie viene a reclamarlo.',
    c: [{ t: 'Venderlo', fx: { creditos: 26000, alineamiento: -10, notoriedad: 8 }, buscado: 12 },
        { t: 'Buscar al dueño', r: [
            { p: 0.6, t: 'Aparece. Te lo agradece de una forma que no esperabas.', fx: { alineamiento: 16, reputacion: 14, creditos: 8000 }, rel: { tipo: 'contacto', afecto: 40 } },
            { p: 0.4, t: 'Aparece {banda} diciendo que era suyo.', fx: { cordura: -8, notoriedad: 6 }, herida: { n: 'aviso', sev: 8 } }] },
        { t: 'Guardarlo y esperar', fx: { intelecto: 6, cordura: -5 }, flag: 'carga_ajena', out: 'Un año. Nadie. Dos. Sigue ahí.' },
        { t: 'Repartirlo entre {paisanos}', fx: { alineamiento: 20, reputacion: 22, carisma: 10 }, buscado: 15, out: 'Se te recuerda por esto más que por nada.' }] });

  E({ id: 'lo_adu_curro4', min: 28, max: 70, w: 9,
    t: 'Te ofrecen enseñar el oficio a los jóvenes de {aqui}. Pagan mal.',
    c: [{ t: 'Aceptar', fx: { creditos: 2500, reputacion: 16, alineamiento: 12, carisma: 10, cordura: 12 }, habilidad: 'maestro', out: 'Diez años después, media plaza sabe hacer algo por ti.' },
        { t: 'Aceptar solo si pagan lo justo', fx: { creditos: 9000, carisma: 8, reputacion: 6 }, out: 'Regateas bien. Enseñas igual.' },
        { t: 'No tener tiempo para eso', fx: { creditos: 5000, cordura: -4 } }] });

  E({ id: 'lo_adu_bicho4', min: 25, max: 75, w: 8,
    t: 'Ya no se ve {bicho} como antes en {aqui}. Los viejos dicen que hace veinte años era distinto.',
    c: [{ t: 'Investigar por qué', fx: { intelecto: 14, alineamiento: 8 }, out: 'La respuesta tiene que ver con {mandamas}, casi siempre.' },
        { t: 'Montar algo para protegerlo', fx: { alineamiento: 18, reputacion: 12, creditos: -6000 }, flag: 'protector_de_{aqui}' },
        { t: 'Cazar lo que queda mientras haya', fx: { creditos: 16000, alineamiento: -16, reputacion: -8 } },
        { t: 'No es tu problema', volver: true }] });

  E({ id: 'lo_adu_hito5', min: 26, max: 80, w: 8,
    t: 'Quieren derribar {hito}. En {aqui} lleva ahí más tiempo que cualquiera de vosotros.',
    c: [{ t: 'Pelearlo públicamente', fx: { carisma: 14, reputacion: 18, alineamiento: 12 }, buscado: 10,
          r: [{ p: 0.5, t: 'Se queda en pie.', fx: { reputacion: 16, cordura: 14 } },
              { p: 0.5, t: 'Lo tiran igual, pero todo el mundo sabe quién dijo que no.', fx: { reputacion: 10, cordura: -8 } }] },
        { t: 'Sacar lo que puedas antes de que caiga', fx: { creditos: 12000, cordura: -6, alineamiento: -8 } },
        { t: 'Documentarlo entero antes', fx: { intelecto: 12, alineamiento: 10, reputacion: 8 }, legado: 'dejó constancia de {hito}' },
        { t: 'Mirar para otro lado', fx: { cordura: -5 } }] });

  E({ id: 'lo_adu_forastero', min: 25, max: 75, w: 9,
    t: 'Llega gente de fuera a {aqui} y compra lo que puede comprar. {paisanos} no están contentos.',
    c: [{ t: 'Hacer de puente entre unos y otros', fx: { carisma: 16, creditos: 14000, reputacion: 8, alineamiento: 4 }, habilidad: 'negociador' },
        { t: 'Ponerte del lado de los de aquí', fx: { reputacion: 18, alineamiento: 10, creditos: -3000 }, faccion: 'auto-10' },
        { t: 'Venderles lo tuyo y salir ganando', fx: { creditos: 34000, reputacion: -18, alineamiento: -10 } },
        { t: 'Irte tú también', mover: 'cerca', motivo: 'porque esto ya no es lo que era', fx: { cordura: -6 } }] });

  E({ id: 'lo_adu_deuda', min: 25, max: 75, w: 9,
    t: 'Alguien de {aqui} te debe dinero y no puede pagarte. Tiene familia.',
    c: [{ t: 'Perdonárselo', fx: { creditos: -8000, alineamiento: 18, reputacion: 14, cordura: 10 }, rel: { tipo: 'contacto', afecto: 60 } },
        { t: 'Darle plazo', fx: { carisma: 8, alineamiento: 8 }, r: [
            { p: 0.6, t: 'Paga. Tarde, pero paga.', fx: { creditos: 8000, reputacion: 8 } },
            { p: 0.4, t: 'Desaparece de {aqui}.', fx: { creditos: -8000, cordura: -6 } }] },
        { t: 'Cobrarte con lo que tenga', fx: { creditos: 6000, alineamiento: -16, reputacion: -14 } },
        { t: 'Vender la deuda a {banda}', fx: { creditos: 5000, alineamiento: -24, reputacion: -20 }, out: 'Lo que le pase después no lo ves. Lo sabes.' }] });

  /* ══════════════════════════════════════════════════════════
     MADUREZ Y VEJEZ (45+)
     ══════════════════════════════════════════════════════════ */

  E({ id: 'lo_mad_balance', min: 45, max: 90, w: 10,
    t: 'Llevas media vida en {aqui}. Alguien te pregunta si volverías a quedarte.',
    c: [{ t: 'Decir que sí sin dudar', fx: { cordura: 16, reputacion: 6 }, out: 'Y es verdad.' },
        { t: 'Decir que no', fx: { cordura: -8, intelecto: 6 }, out: 'También es verdad. Las dos lo son.' },
        { t: 'Decir que ya no importa', fx: { cordura: 6, carisma: 6 } }] });

  E({ id: 'lo_mad_ensenar', min: 45, max: 95, w: 10,
    t: 'Un joven de {aqui} te busca porque le han dicho que tú sabes cosas.',
    c: [{ t: 'Enseñarle todo', fx: { reputacion: 16, alineamiento: 14, cordura: 14 }, rel: { tipo: 'discípulo', afecto: 55 }, legado: 'enseñó a los de {aqui}' },
        { t: 'Enseñarle lo justo', fx: { carisma: 6, cordura: 5 } },
        { t: 'Decirle que se vaya de {aqui} mientras pueda', fx: { alineamiento: 8, cordura: -8 }, out: 'Es el mejor consejo que le puedes dar y lo sabes.' }] });

  E({ id: 'lo_mad_mandamas5', min: 45, max: 95, w: 9,
    t: 'Has visto pasar a tres que mandaban en {aqui}. Ahora te preguntan a ti qué opinas.',
    c: [{ t: 'Decir la verdad', fx: { reputacion: 14, alineamiento: 12, cordura: 8 }, buscado: 8 },
        { t: 'Decir lo que conviene', fx: { creditos: 12000, carisma: 8, alineamiento: -8 } },
        { t: 'No opinar', fx: { cordura: 6 } },
        { t: 'Contar lo que sabes de los tres', fx: { notoriedad: 16, reputacion: 10, alineamiento: 6 }, buscado: 25, out: 'A partir de ahora duermes con la puerta cerrada.' }] });

  E({ id: 'lo_vej_hito6', min: 58, max: 110, w: 9,
    t: 'Vuelves a {hito} después de mucho tiempo. Está igual y no está igual.',
    c: [{ t: 'Quedarte todo el día', fx: { cordura: 18, salud: -3 } },
        { t: 'Llevar a alguien de la familia', fx: { relTodas: 18, cordura: 14 }, out: 'Le cuentas cosas que no habías contado.' },
        { t: 'No entrar', fx: { cordura: -6, intelecto: 4 } }] });

  E({ id: 'lo_vej_paisanos3', min: 60, max: 115, w: 9,
    t: 'Los jóvenes de {aqui} ya no saben lo que pasó aquí cuando tú tenías su edad.',
    c: [{ t: 'Contarlo entero, sin adornar', fx: { reputacion: 14, cordura: 12, alineamiento: 10 }, legado: 'contó lo que pasó en {aqui}' },
        { t: 'Contarlo mejor de lo que fue', fx: { carisma: 12, cordura: 6, alineamiento: -4 } },
        { t: 'Dejar que se olvide', fx: { cordura: -10 }, out: 'Se olvida. Es más rápido de lo que crees.' }] });

  E({ id: 'lo_vej_final', min: 65, max: 120, w: 9,
    t: 'Piensas dónde quieres que te entierren. En {aqui} o en otra parte.',
    c: [{ t: 'Aquí, donde has vivido', fx: { cordura: 16 }, flag: 'descansa_en_{aqui}' },
        { t: 'En el sitio donde naciste', fx: { cordura: 12 }, out: 'Hay que avisar a alguien. Lo haces.' },
        { t: 'Que te tiren al espacio', fx: { cordura: 10, carisma: 6 }, out: 'Es más caro. Merece la pena.' },
        { t: 'No pensar en eso todavía', fx: { cordura: -4 } }] });

  /* ══════════════════════════════════════════════════════════
     CUALQUIER EDAD ADULTA — situaciones fuertes
     ══════════════════════════════════════════════════════════ */

  E({ id: 'lo_any_juicio', min: 18, max: 90, w: 9,
    t: 'Hay un juicio en {aqui} y te llaman a declarar. Sabes algo que puede cambiarlo.',
    c: [{ t: 'Decir la verdad', fx: { alineamiento: 18, reputacion: 12, cordura: 8 }, buscado: 15, out: 'Se hace justicia. Y alguien te lo va a cobrar.' },
        { t: 'Mentir a favor del acusado', fx: { alineamiento: -12, notoriedad: 8, creditos: 14000 }, buscado: 10 },
        { t: 'No acordarte de nada', fx: { cordura: -10, reputacion: -6 } },
        { t: 'Negarte a declarar', fx: { cordura: 6, carcel: 1, alineamiento: 4 } }] });

  E({ id: 'lo_any_rescate', min: 16, max: 85, w: 10,
    t: 'Alguien se ha quedado atrapado en {hito} por {peligro}. Nadie va a llegar a tiempo salvo quien esté cerca.',
    c: [{ t: 'Ir', r: [
            { p: 0.55, t: 'Lo sacas.', fx: { reputacion: 22, alineamiento: 20, fisico: 8, salud: -12 }, rel: { tipo: 'contacto', afecto: 70 } },
            { p: 0.3, t: 'Lo sacas, y te cuesta.', fx: { reputacion: 24, alineamiento: 22, salud: -30 }, herida: { n: 'quemadura grave', sev: 22 } },
            { p: 0.15, t: 'No llegas a tiempo.', fx: { cordura: -22, alineamiento: 10 } }] },
        { t: 'Organizar a otros para que vayan', fx: { carisma: 14, reputacion: 12, alineamiento: 10 } },
        { t: 'No ir', fx: { cordura: -14, alineamiento: -10 }, out: 'Nadie te lo reprocha. Tú sí.' }] });

  E({ id: 'lo_any_secreto', min: 20, max: 90, w: 9,
    t: 'Descubres algo sobre {mandamas} que en {aqui} no sabe nadie.',
    c: [{ t: 'Publicarlo', fx: { reputacion: 20, alineamiento: 16, notoriedad: 18 }, buscado: 35, out: 'Se lía. Estabas en lo cierto y eso no te protege.' },
        { t: 'Usarlo para conseguir algo', fx: { creditos: 40000, alineamiento: -20, notoriedad: 14 }, buscado: 20 },
        { t: 'Guardártelo', fx: { intelecto: 8, cordura: -8 }, flag: 'sabe_lo_de_{mandamas}' },
        { t: 'Contárselo a la persona correcta', fx: { alineamiento: 12, carisma: 10, reputacion: 8 }, rel: { tipo: 'contacto', afecto: 45 } }] });

  E({ id: 'lo_any_traicion', min: 20, max: 90, w: 9,
    t: 'Alguien con quien contabas en {aqui} te ha vendido a {banda}.',
    c: [{ t: 'Ir a hablar con esa persona', fx: { carisma: 10, cordura: -8 }, r: [
            { p: 0.45, t: 'Tenía un motivo. No lo justifica, pero lo entiendes.', fx: { intelecto: 10, cordura: 8, alineamiento: 6 } },
            { p: 0.55, t: 'No tenía motivo. Solo se le pagó mejor.', fx: { cordura: -12, alineamiento: -6 } }] },
        { t: 'Devolvérsela', fx: { notoriedad: 14, alineamiento: -14, cordura: 6 }, out: 'Quedas en paz. Sabes con qué.' },
        { t: 'Irte de {aqui} sin decir nada', mover: 'cerca', motivo: 'porque aquí ya no te fías de nadie', fx: { cordura: -10, intelecto: 6 } },
        { t: 'Perdonarlo', fx: { alineamiento: 18, cordura: 12, reputacion: -6 } }] });

  E({ id: 'lo_any_enfermedad', min: 22, max: 95, w: 8,
    t: 'Hay una enfermedad de {aqui}, de las de aquí de siempre, y esta temporada va fuerte.',
    c: [{ t: 'Ayudar a cuidar', fx: { alineamiento: 18, reputacion: 14, salud: -14, cordura: 8 } },
        { t: 'Conseguir medicinas como sea', fx: { creditos: -12000, alineamiento: 14, reputacion: 16 }, buscado: 10 },
        { t: 'Encerrarte hasta que pase', fx: { salud: 6, cordura: -8, reputacion: -8 } },
        { t: 'Vender lo que haga falta al precio que sea', fx: { creditos: 45000, alineamiento: -26, reputacion: -24 } }] });

  E({ id: 'lo_any_musica', min: 12, max: 95, w: 8,
    t: 'Suena la música de {aqui} en {sitio}. No suena así en ningún otro planeta.',
    c: [{ t: 'Quedarte hasta el final', fx: { cordura: 14, carisma: 6 } },
        { t: 'Aprender a tocarlo', fx: { destreza: 10, carisma: 12, cordura: 10 }, habilidad: 'música' },
        { t: 'Llevártelo fuera de {aqui}', fx: { carisma: 10, creditos: 9000, reputacion: 8 }, out: 'Fuera gusta. Aquí dicen que lo has estropeado.' }] });

  E({ id: 'lo_any_apuesta', min: 16, max: 90, w: 9,
    t: 'En {sitio} se apuesta a lo que se apuesta en {aqui}. Hoy hay mucho encima de la mesa.',
    c: [{ t: 'Apostar fuerte', r: [
            { p: 0.42, t: 'Ganas.', fx: { suerte: 6, carisma: 6 }, apuesta: 'gana' },
            { p: 0.58, t: 'Pierdes.', fx: { cordura: -8 }, apuesta: 'pierde' }] },
        { t: 'Apostar poco y mirar', fx: { intelecto: 8, carisma: 5, creditos: 800 } },
        { t: 'Amañarlo', req: function (s) { return s.stats.intelecto > 45; }, r: [
            { p: 0.5, t: 'Cuela.', fx: { creditos: 28000, notoriedad: 12, alineamiento: -14 } },
            { p: 0.5, t: 'No cuela y en {aqui} eso se paga con el cuerpo.', fx: { salud: -22, reputacion: -18 }, herida: { n: 'paliza', sev: 16 } }] },
        { t: 'No jugar', volver: true }] });

  E({ id: 'lo_any_ruina', min: 18, max: 95, w: 8,
    t: 'Encuentras algo antiguo en {hito}. En {aqui} nadie recuerda quién lo puso ahí.',
    c: [{ t: 'Estudiarlo', fx: { intelecto: 16, cordura: 8 }, out: 'Tardas años. Merece la pena.', legado: 'descifró lo de {hito}' },
        { t: 'Venderlo', fx: { creditos: 24000, alineamiento: -8 }, out: 'Acaba en la vitrina de alguien que no sabe de dónde salió.' },
        { t: 'Dejarlo donde estaba', fx: { alineamiento: 12, cordura: 8 } },
        { t: 'Quedártelo', fx: { cordura: 6 }, item: true }] });

  E({ id: 'lo_any_nave', min: 18, max: 85, w: 8,
    t: 'Cae una nave cerca de {hito}. En {aqui} eso lo oye todo el mundo.',
    c: [{ t: 'Llegar el primero', r: [
            { p: 0.5, t: 'Hay supervivientes.', fx: { alineamiento: 16, reputacion: 14 }, rel: { tipo: 'contacto', afecto: 50 } },
            { p: 0.5, t: 'No hay nadie. Hay carga.', fx: { creditos: 22000, alineamiento: -6, notoriedad: 6 } }] },
        { t: 'Dar parte a {mandamas}', fx: { alineamiento: 10, reputacion: 8, faccion: 'auto+10' } },
        { t: 'Ir a por las piezas cuando se vaya todo el mundo', fx: { creditos: 9000, destreza: 6, intelecto: 5 } },
        { t: 'No ir', volver: true }] });

  E({ id: 'lo_any_frontera', min: 18, max: 85, w: 8,
    t: 'Hay gente entrando en {aqui} desde {lejos} sin papeles y sin nada.',
    c: [{ t: 'Ayudarles', fx: { alineamiento: 20, reputacion: 8, creditos: -4000 }, buscado: 12 },
        { t: 'Darles trabajo por menos de lo justo', fx: { creditos: 20000, alineamiento: -18, reputacion: -10 } },
        { t: 'Denunciarles', fx: { alineamiento: -14, faccion: 'auto+15', creditos: 3000, reputacion: -12 } },
        { t: 'Mirar y no hacer nada', fx: { cordura: -6 } }] });

  E({ id: 'lo_any_fiesta', min: 12, max: 100, w: 9,
    t: 'Toca la fiesta grande de {aqui}. Se para todo y hay {comida} hasta reventar.',
    c: [{ t: 'Meterte de lleno', fx: { cordura: 16, carisma: 10, salud: -3, creditos: -1200 } },
        { t: 'Ir a trabajar mientras todos están fuera', fx: { creditos: 7000, cordura: -8, reputacion: -6 } },
        { t: 'Buscar a alguien en la fiesta', fx: { carisma: 10, cordura: 8 }, nuevaRel: true },
        { t: 'Quedarte en casa', fx: { cordura: 4, salud: 3 } }] });

  E({ id: 'lo_any_cicatriz', min: 20, max: 95, w: 8,
    t: 'Se te nota que eres de {aqui}: por cómo andas, por una marca, por algo que dices sin querer.',
    c: [{ t: 'Llevarlo con orgullo', fx: { cordura: 12, carisma: 8, reputacion: 6 } },
        { t: 'Disimularlo fuera', fx: { carisma: 10, cordura: -8 } },
        { t: 'Convertirlo en tu marca', fx: { carisma: 14, notoriedad: 8, reputacion: 8 }, apodo: true }] });

  E({ id: 'lo_any_favor', min: 20, max: 90, w: 9,
    t: 'Te debe un favor de hace años {banda}. Puedes cobrarlo ahora o guardarlo.',
    c: [{ t: 'Cobrarlo en dinero', fx: { creditos: 22000, notoriedad: 4 } },
        { t: 'Cobrarlo en protección', fx: { reputacion: 10, cordura: 10 }, flag: 'protegido_en_{aqui}', out: 'En {aqui} nadie te toca durante años.' },
        { t: 'Cobrarlo para sacar a alguien de un lío', fx: { alineamiento: 18, relTodas: 14, reputacion: 8 } },
        { t: 'Guardarlo', fx: { intelecto: 6 }, flag: 'favor_pendiente', out: 'Un favor guardado vale más que uno gastado. Hasta que caduca.' }] });

  E({ id: 'lo_any_ley', min: 18, max: 90, w: 9,
    t: 'Cambia una ley en {aqui} y de golpe lo que hacías ayer es ilegal hoy.',
    c: [{ t: 'Dejar de hacerlo', fx: { creditos: -8000, cordura: -6, alineamiento: 6 } },
        { t: 'Seguir a escondidas', fx: { creditos: 16000, notoriedad: 10, alineamiento: -8 }, buscado: 18 },
        { t: 'Pelear la ley', fx: { carisma: 12, reputacion: 12, alineamiento: 10 }, r: [
            { p: 0.4, t: 'La tumban.', fx: { reputacion: 18, creditos: 6000 } },
            { p: 0.6, t: 'No la tumban, pero se sabe quién dio la cara.', fx: { reputacion: 10, cordura: -6 } }] },
        { t: 'Comprar una excepción', coste: 15000, fx: { alineamiento: -10, notoriedad: 6 }, out: 'En {aqui} eso se puede.' }] });

  E({ id: 'lo_any_guia', min: 18, max: 85, w: 8,
    t: 'Unos forasteros pagan bien por alguien que conozca {aqui} de verdad.',
    c: [{ t: 'Guiarles', fx: { creditos: 12000, intelecto: 6, carisma: 6 }, habilidad: 'guía' },
        { t: 'Guiarles y llevarles por donde no deben', fx: { creditos: 20000, alineamiento: -18, notoriedad: 10 }, out: 'No vuelven. Nadie pregunta.' },
        { t: 'Guiarles bien y hacer contactos', fx: { creditos: 8000, carisma: 10 }, rel: { tipo: 'contacto', afecto: 40 } },
        { t: 'Decirles que se vayan', fx: { alineamiento: 6, reputacion: 6 } }] });

  E({ id: 'lo_any_perdida', min: 25, max: 100, w: 9,
    t: 'Se muere alguien muy conocido en {aqui}. Media plaza va al entierro.',
    c: [{ t: 'Ir y hablar', fx: { carisma: 10, cordura: 8, reputacion: 8, relTodas: 8 } },
        { t: 'Ir y callarte', fx: { cordura: 6 } },
        { t: 'No ir', fx: { reputacion: -10, cordura: -6 } },
        { t: 'Ocuparte de lo que deja pendiente', fx: { alineamiento: 16, reputacion: 14, creditos: -5000 } }] });

  E({ id: 'lo_any_agua', min: 14, max: 95, w: 8,
    t: 'Falla lo básico en {aqui}: lo que hace que se pueda vivir aquí y no en el planeta de al lado.',
    c: [{ t: 'Arreglarlo tú', req: function (s) { return s.stats.intelecto > 40; }, fx: { intelecto: 12, reputacion: 20, alineamiento: 14 }, habilidad: 'ingeniero' },
        { t: 'Pagar a quien sepa', coste: 12000, fx: { reputacion: 10, carisma: 6 } },
        { t: 'Racionar y aguantar', fx: { salud: -10, cordura: 8, fisico: 5 } },
        { t: 'Aprovechar la escasez', fx: { creditos: 30000, alineamiento: -24, reputacion: -22 }, buscado: 12 }] });

  E({ id: 'lo_any_rival_local', min: 18, max: 85, w: 9,
    t: 'En {aqui} hay alguien que hace lo mismo que tú y lo hace bien. Se llama {n}.',
    c: [{ t: 'Competir de frente', fx: { fisico: 6, intelecto: 8, carisma: 6 }, rel: { tipo: 'rival', afecto: -40 }, out: 'Os hacéis mejores a los dos, con el tiempo.' },
        { t: 'Proponerle trabajar juntos', r: [
            { p: 0.55, t: 'Acepta.', fx: { creditos: 20000, carisma: 12, reputacion: 10 }, rel: { tipo: 'socio', afecto: 50 } },
            { p: 0.45, t: 'Lo toma como debilidad.', fx: { reputacion: -6 }, rel: { tipo: 'rival', afecto: -55 } }] },
        { t: 'Hundirle por debajo', fx: { creditos: 14000, alineamiento: -20, notoriedad: 10 }, buscado: 12 },
        { t: 'Cambiar de oficio', fx: { intelecto: 6, cordura: -4 } }] });

  E({ id: 'lo_any_promesa', min: 18, max: 95, w: 8,
    t: 'Prometiste algo en {aqui} hace años y ahora te lo recuerdan.',
    c: [{ t: 'Cumplirlo', fx: { alineamiento: 18, reputacion: 18, cordura: 12, creditos: -8000 } },
        { t: 'Cumplirlo a medias', fx: { reputacion: 4, cordura: -6, carisma: 6 } },
        { t: 'Decir que ya no eres esa persona', fx: { reputacion: -16, cordura: -8, intelecto: 6 }, out: 'Es verdad. No sirve.' }] });

  E({ id: 'lo_any_solidaridad', min: 16, max: 95, w: 8,
    t: 'A una familia de {aqui} se le ha ido todo por culpa de {peligro}. En {sitio} se hace una colecta.',
    c: [{ t: 'Dar más de lo que puedes', fx: { creditos: -6000, alineamiento: 18, reputacion: 14, cordura: 10 } },
        { t: 'Dar lo normal', fx: { creditos: -1200, alineamiento: 6, reputacion: 4 } },
        { t: 'Organizar la colecta tú', fx: { carisma: 16, reputacion: 18, alineamiento: 14 } },
        { t: 'No dar nada', fx: { reputacion: -10, cordura: -4 } }] });

  E({ id: 'lo_any_contrabando', min: 18, max: 80, w: 9,
    t: 'Sacar {mercancia} de {aqui} sin declarar da dinero. Meterlo también.',
    c: [{ t: 'Hacerlo una vez', r: [
            { p: 0.65, t: 'Sale.', fx: { creditos: 15000, notoriedad: 6, alineamiento: -6 } },
            { p: 0.35, t: 'No sale.', fx: { creditos: -5000, carcel: 1 }, buscado: 20 }] },
        { t: 'Montarlo en serio', fx: { creditos: 45000, notoriedad: 22, alineamiento: -16 }, buscado: 30, habilidad: 'contrabandista' },
        { t: 'Declararlo todo', fx: { creditos: 4000, alineamiento: 10, reputacion: 8 } },
        { t: 'Ni tocarlo', volver: true }] });

  E({ id: 'lo_any_reputacion', min: 20, max: 90, w: 8,
    t: 'En {aqui} se habla de ti. No todo lo que se dice es verdad.',
    c: [{ t: 'Desmentirlo', fx: { carisma: 10, reputacion: 6, cordura: 6 } },
        { t: 'Dejar que crezca', fx: { notoriedad: 14, carisma: 8, reputacion: 4 }, out: 'La leyenda trabaja para ti mientras no la contradigas.' },
        { t: 'Hacerlo verdad', fx: { notoriedad: 18, fisico: 6, alineamiento: -8, reputacion: 8 } },
        { t: 'Buscar a quien lo empezó', fx: { intelecto: 8, notoriedad: 6 }, rel: { tipo: 'rival', afecto: -35 } }] });

  E({ id: 'lo_any_puesto', min: 22, max: 85, w: 8,
    t: 'Queda libre un puesto en {aqui} que da poder de verdad, poco pero de verdad.',
    c: [{ t: 'Presentarte', r: [
            { p: 0.5, t: 'Te lo dan.', fx: { reputacion: 16, creditos: 12000, carisma: 8 }, flag: 'cargo_en_{aqui}' },
            { p: 0.5, t: 'Se lo dan a otro con más contactos.', fx: { cordura: -8, intelecto: 6 } }] },
        { t: 'Comprarlo', coste: 22000, fx: { reputacion: 8, alineamiento: -10, notoriedad: 6 }, flag: 'cargo_en_{aqui}' },
        { t: 'Apoyar a otro', fx: { carisma: 10, alineamiento: 6 }, rel: { tipo: 'contacto', afecto: 45 } },
        { t: 'No querer nada de eso', fx: { cordura: 8 } }] });

  E({ id: 'lo_any_naturaleza', min: 14, max: 100, w: 8,
    t: 'Sales de todo y te pasas unos días donde no hay nadie en {aqui}.',
    c: [{ t: 'Estar solo del todo', fx: { cordura: 18, salud: 6, intelecto: 6 } },
        { t: 'Cazar y vivir de lo que haya', fx: { fisico: 10, destreza: 8, salud: 4 }, habilidad: 'supervivencia' },
        { t: 'Volver antes de tiempo', fx: { cordura: 4 } },
        { t: 'Cruzarte con {bicho} y quedarte a mirar', fx: { cordura: 14, intelecto: 6 } }] });

  E({ id: 'lo_any_gremio', min: 20, max: 85, w: 8,
    t: 'El gremio de los de tu oficio en {aqui} te quiere dentro. Tiene sus normas.',
    c: [{ t: 'Entrar y cumplirlas', fx: { creditos: 9000, reputacion: 12, carisma: 6 }, flag: 'gremio_de_{aqui}', out: 'Trabajo asegurado y un techo que no puedes pasar.' },
        { t: 'Entrar y cambiarlas desde dentro', fx: { carisma: 12, intelecto: 10, reputacion: 6 }, r: [
            { p: 0.45, t: 'Consigues cambiar una.', fx: { reputacion: 16, alineamiento: 10 } },
            { p: 0.55, t: 'Te dejan fuera de todo.', fx: { reputacion: -12, creditos: -4000 } }] },
        { t: 'Trabajar por libre', fx: { creditos: 5000, cordura: 8, reputacion: -8 }, out: 'Cobras cuando cobras.' }] });

  E({ id: 'lo_any_hijo_lugar', min: 24, max: 70, w: 8, req: function (s) { return s.relaciones.some(function (r) { return r.tipo === 'hijo'; }); },
    t: 'Tu hijo pregunta por qué vivís en {aqui} y no en otro sitio mejor.',
    c: [{ t: 'Contarle la verdad', fx: { relHijos: 14, cordura: 8, intelecto: 4 } },
        { t: 'Enseñarle lo bueno de aquí', fx: { relHijos: 18, cordura: 12, carisma: 6 }, out: 'Funciona. De momento.' },
        { t: 'Decirle que algún día os iréis', fx: { relHijos: 10, cordura: -6 }, flag: 'promesa_de_irse' },
        { t: 'Empezar a ahorrar para irse de verdad', fx: { creditos: -6000, relHijos: 12, intelecto: 6 } }] });

  E({ id: 'lo_any_animal_pareja', min: 14, max: 95, w: 8,
    t: 'Te ofrecen quedarte con una cría de {bicho}. En {aqui} eso significa una cosa u otra según quién seas.',
    c: [{ t: 'Quedártelo', fx: { cordura: 14, alineamiento: 6 }, mascota: true },
        { t: 'Venderlo', fx: { creditos: 6000, alineamiento: -8 } },
        { t: 'Soltarlo donde debe estar', fx: { alineamiento: 14, cordura: 8 } }] });

  E({ id: 'lo_any_veterano', min: 30, max: 95, w: 8, req: function (s) { return !!s.flags.veterano; },
    t: 'Alguien en {sitio} reconoce que estuviste en la guerra. En {aqui} eso pesa distinto que fuera.',
    c: [{ t: 'Hablarlo', fx: { cordura: 10, carisma: 8, reputacion: 6 } },
        { t: 'Cambiar de tema', fx: { cordura: -6 } },
        { t: 'Levantarte e irte', fx: { cordura: -10, reputacion: -4 } },
        { t: 'Contar lo que pasó de verdad', fx: { cordura: 14, reputacion: 10, alineamiento: 8 }, out: 'Es la primera vez que lo cuentas entero.' }] });

  E({ id: 'lo_any_mercado_negro', min: 18, max: 85, w: 8,
    t: 'En {sitio} hay un mercado que no aparece en ningún registro de {aqui}.',
    c: [{ t: 'Comprar algo', armeria: true, fx: { notoriedad: 4 } },
        { t: 'Vender algo tuyo', fx: { creditos: 8000, notoriedad: 6 } },
        { t: 'Memorizar quién compra qué', fx: { intelecto: 12, notoriedad: 8 }, flag: 'conoce_el_mercado_de_{aqui}' },
        { t: 'Irte antes de que te vean', fx: { cordura: 4 }, volver: true }] });

  E({ id: 'lo_any_frio_calor', min: 16, max: 95, w: 8,
    t: 'Te pilla lejos de todo en {aqui} y encima cae {tiempo}.',
    c: [{ t: 'Seguir adelante', r: [
            { p: 0.55, t: 'Llegas. Tardas el doble.', fx: { fisico: 10, cordura: 8, salud: -8 } },
            { p: 0.45, t: 'No llegas. Te encuentran.', fx: { salud: -25 }, herida: { n: 'exposición', sev: 14 } }] },
        { t: 'Refugiarte y esperar', fx: { intelecto: 8, cordura: 5, salud: -3 } },
        { t: 'Buscar a alguien que sepa moverse con esto', fx: { carisma: 8, creditos: -1500, cordura: 6 }, rel: { tipo: 'contacto', afecto: 35 } }] });

  E({ id: 'lo_any_arte', min: 16, max: 100, w: 7,
    t: 'Lo que se hace con las manos en {aqui} no se hace igual en ninguna parte.',
    c: [{ t: 'Aprenderlo', fx: { destreza: 12, intelecto: 8, cordura: 10 }, habilidad: 'artesano' },
        { t: 'Comprar una pieza buena', coste: 6000, fx: { cordura: 10, carisma: 4 }, item: true },
        { t: 'Exportarlo', fx: { creditos: 18000, carisma: 8, reputacion: 6 }, out: 'Se vende bien fuera. Aquí opinan.' }] });

  E({ id: 'lo_any_educar', min: 22, max: 90, w: 8,
    t: 'En {aqui} no hay escuela decente. Alguien tiene que hacer algo o nadie lo hace.',
    c: [{ t: 'Montarla tú', fx: { creditos: -15000, alineamiento: 22, reputacion: 24, intelecto: 8 }, legado: 'montó la escuela de {aqui}' },
        { t: 'Dar clase donde se pueda', fx: { alineamiento: 14, reputacion: 12, cordura: 10 } },
        { t: 'Pagar a alguien que la monte', coste: 20000, fx: { alineamiento: 14, reputacion: 12 } },
        { t: 'No es tu trabajo', fx: { cordura: -5 } }] });

  E({ id: 'lo_any_sabotaje', min: 20, max: 80, w: 8,
    t: 'Alguien quiere que pares algo que {mandamas} está haciendo en {aqui}.',
    c: [{ t: 'Hacerlo limpio', req: function (s) { return s.stats.intelecto > 45; }, r: [
            { p: 0.6, t: 'Se para. Nadie sabe cómo.', fx: { intelecto: 12, alineamiento: 12, notoriedad: 8 } },
            { p: 0.4, t: 'Se para. Y saben cómo.', fx: { alineamiento: 10, notoriedad: 16 }, buscado: 35 }] },
        { t: 'Hacerlo a lo bruto', fx: { notoriedad: 20, alineamiento: 4, fisico: 6 }, buscado: 40, herida: { n: 'quemadura', sev: 10 } },
        { t: 'Dar parte a {mandamas} de que alguien lo intenta', fx: { faccion: 'auto+20', creditos: 12000, alineamiento: -12, reputacion: -14 } },
        { t: 'No meterte', volver: true }] });

  E({ id: 'lo_any_recuerdo', min: 30, max: 110, w: 8,
    t: 'Vuelves a pasar por {sitio} y te acuerdas de golpe de algo de hace mucho.',
    c: [{ t: 'Quedarte con el recuerdo bueno', fx: { cordura: 12 } },
        { t: 'Ir a buscar a esa persona', r: [
            { p: 0.5, t: 'Sigue aquí.', fx: { cordura: 16, carisma: 6 }, rel: { tipo: 'contacto', afecto: 50 } },
            { p: 0.5, t: 'Ya no está.', fx: { cordura: -10, intelecto: 4 } }] },
        { t: 'No pararte', fx: { cordura: -4 } }] });

  E({ id: 'lo_any_desconocido', min: 18, max: 90, w: 8,
    t: 'Un desconocido llega a {aqui} preguntando por gente que ya no vive.',
    c: [{ t: 'Ayudarle a buscar', fx: { alineamiento: 12, carisma: 8, intelecto: 6 }, rel: { tipo: 'contacto', afecto: 40 } },
        { t: 'Preguntarle a qué viene', fx: { intelecto: 10 }, out: 'La respuesta es más larga y más triste de lo que esperabas.' },
        { t: 'Avisar a {banda} de que hay alguien preguntando', fx: { creditos: 4000, alineamiento: -14, notoriedad: 8 } },
        { t: 'No decirle nada', fx: { cordura: -4 } }] });

  E({ id: 'lo_any_construir', min: 22, max: 85, w: 8,
    t: 'Falta algo en {aqui} que todo el mundo dice que hace falta y nadie construye.',
    c: [{ t: 'Construirlo tú', fx: { creditos: -18000, reputacion: 22, alineamiento: 14, fisico: 8 }, legado: 'construyó lo que faltaba en {aqui}' },
        { t: 'Convencer a {mandamas} para que lo pague', req: function (s) { return s.stats.carisma > 50; }, fx: { carisma: 16, reputacion: 18, alineamiento: 10 } },
        { t: 'Construirlo y cobrar por usarlo', fx: { creditos: 25000, reputacion: -6, intelecto: 8 } },
        { t: 'Seguir quejándote como todos', fx: { cordura: -3 } }] });

  E({ id: 'lo_any_ultimo', min: 25, max: 100, w: 7,
    t: 'Eres de los últimos en {aqui} que sabe hacer una cosa que se está perdiendo.',
    c: [{ t: 'Enseñarlo a quien quiera', fx: { reputacion: 16, alineamiento: 14, cordura: 12 }, legado: 'salvó un oficio en {aqui}' },
        { t: 'Cobrar caro por hacerlo', fx: { creditos: 22000, carisma: 6 } },
        { t: 'Dejar que se pierda contigo', fx: { cordura: -12, intelecto: 4 } },
        { t: 'Escribirlo todo', fx: { intelecto: 12, alineamiento: 10 }, legado: 'dejó escrito el oficio de {aqui}' }] });

  /* ---- se enchufan al pozo global de eventos ---- */
  SW.EVENTOS = SW.EVENTOS || [];
  for (let i = 0; i < SW.EVENTOS_LOCALES.length; i++) SW.EVENTOS.push(SW.EVENTOS_LOCALES[i]);

})(typeof window !== 'undefined' ? window : globalThis);
