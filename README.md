# HOLOVIDA

**Un simulador de vida estilo BitLife ambientado en una galaxia muy, muy lejana, con estética retrofuturista de terminal holográfica.**

Naces, creces, eliges, te equivocas y mueres. Al final te llevas una tarjeta con tu vida entera y un enlace para pasársela a quien quieras.

---

## Jugar

- **En local:** abre `index.html` con doble clic. No necesita servidor, ni build, ni dependencias.
- **En la web:** una vez publicado en GitHub Pages, la URL del repositorio (ver más abajo).

## Qué tiene

| | |
|---|---|
| Decisiones posibles | **~1.470 millones** de nodos de decisión |
| Escenarios únicos | ~370 millones |
| Especies jugables | 61 (incluido el clon de Kamino) |
| Mundos | 117, con dato real de cada uno al llegar |
| Carreras | 51 |
| Poderes de la Fuerza | 30 |
| Personajes conocidos | 54, cada uno solo en su época |

El número sale de combinar **199 plantillas de evento escritas a mano** con los *slots* variables de cada una (mundo, criatura, lugar, objeto, facción, rumor…) más **ocho generadores procedurales** (contratos, rutas de carga, encuentros de acción, combates espaciales, ofertas de empleo, misiones militares, encargos de facción y dilemas morales). La cifra exacta se calcula en tiempo de ejecución y se muestra en la portada.

Un mismo evento no se repite: hay memoria de los últimos catorce y el peso de cada plantilla baja cada vez que sale.

### Creación de personaje
Nombre, tratamiento, especie (con esperanza de vida y bonos propios), era galáctica (8, de la Alta República a la Primera Orden), mundo natal, origen social y un **retrato holográfico** generado en SVG que puedes ajustar pieza a pieza: piel, ojos, pelo, marcas, tocado, ropa y forma del cráneo.

### Ciclo de juego
Cada año pasan cosas por su cuenta **y además tienes tres acciones** (una de crío, dos de adolescente) para gastar en las vías disponibles. Entrar en un menú a mirar **no consume la acción**: todos tienen salida (`◂ Volver`) y solo se gasta cuando decides algo de verdad.

Como hay tres acciones por año, las subidas tienen **rendimientos decrecientes**: cuanto más alta está una estadística, menos aporta cada acierto. Subir de 20 a 30 es fácil; de 80 a 90, mucho menos.

Las vías:

`Trabajo` · `Formación` · `Social` · `Bajos fondos` · `Hangar` · `Viajar` · `La Fuerza` · `Mercado` · `Acción` · `Cuerpo y mente` · `Escuadrón` · `Política` · `Exploración`

### Cómo crecen las estadísticas
Naces con casi nada (físico 5, intelecto 5…). Cada año subes un poco por pura edad, con una curva que acelera en la infancia, se estanca sobre los 25 y decae a partir de los 55. Ese crecimiento pasivo tiene un **techo propio de cada personaje** (unos 55 ± 12): de ahí para arriba solo se sube decidiendo. Los bonos de especie, era y origen no se aplican de golpe al nacer, sino que se van expresando mientras creces.

### Objetos que importan
Los objetos no son una lista decorativa. Sin un arma de fuego no puedes batirte en un duelo de blásters —la opción aparece bloqueada—, la armadura resta daño de verdad y pelear con las manos desnudas penaliza. Se consiguen comprando en la armería, robándolas del mostrador, ganándolas en combate, fabricándolas si tienes el oficio, o heredándolas.

Cada vez que consigues algo importante —un arma, una nave, un cristal, un sable— se abre una **vitrina con su pixel art**: el sable sale del color de tu cristal, la nave con la silueta de su clase.

### Cristales kyber y el Sable Oscuro
**El cristal elige, no tú.** El color depende de quién eres: azul y verde son lo común, el amarillo es de los centinelas, el púrpura solo canta para quien camina por el filo, el blanco exige un cristal purificado y el rojo hay que sangrarlo con odio (solo con alineamiento oscuro).

El **negro no es un color de kyber**: el Sable Oscuro es una pieza única forjada por Tarre Vizsla, va unida al gobierno de Mandalore y, según el Credo, solo cambia de manos ganándola en combate. No se construye ni se compra.

### Personajes conocidos
Con muy poca probabilidad —sube algo si eres famoso o infame— te cruzas con alguien de la saga: 54 personajes, cada uno **solo en las épocas en que estuvo activo**. Encontrarte a Obi-Wan durante las Guerras Clon puede pasar; en la Nueva República, no. Y el encuentro cambia según quién seas: un sith y un civil no tienen la misma conversación con un jedi.

Los maestros también tienen nombre: al entrar en la Orden (o al arrodillarte ante un sith) hay ~30% de que te toque alguien canónico de tu era, y si no, uno generado del mismo estilo.

### El camino de la Fuerza
No es una carrera más. Un jedi **no puede casarse** (o lo hace en secreto, y eso tiene su propio evento), **no acumula posesiones**, recibe misiones del Consejo y **no se alista en ningún ejército** — ni siquiera en las Guerras Clon, donde el rango de general se lo dan sin preguntarle. Un sith tampoco se alista: manipula. Y llegado el momento se topa con la **Regla de los Dos**, que solo tiene una salida limpia y ninguna cómoda.

### La Orden 66
No es un evento con cuatro botones: es **una noche entera encadenada dentro del mismo año**. Cae en el año que le toca —**19 ABY**, calculado sobre el calendario galáctico, no sobre tu edad— y lo que te pasa depende de **lo que eres** cuando suena la orden.

- **Caballero o maestro jedi**: la orden, el pasillo a la carrera desviando disparos (minijuego de sable), la salida del cerco y la **baliza del Templo**, que llama a todos los supervivientes a volver a casa y ha sido reescrita hace seis horas. Sobrevivir ronda el **43%** con decisiones al azar; jugando bien sube por encima del 75% y jugando mal baja del 5%.
- **Padawan**: es más duro (**~39%**) y depende de **tu maestro** —su pericia y lo que os tengáis—, que puede **quedarse atrás para que tú subas a la lanzadera**. Y después, un control de salida imperial que un crío con trenza no sabe cruzar.
- **Clon**: la orden entra por debajo del casco y resistirse es un minijuego de concentración contra tu propio chip. Matar a tu general **no es un botón**: es un jedi a doce metros con la hoja encendida, y hay cuatro formas de intentarlo, todas caras.
- **Civil**: la Purga desde una ventana, y a la mañana siguiente el registro puerta por puerta.

Si llegas a la Purga con el alineamiento neutro o tirando a oscuro, **puede** aparecer una mujer con una capa sin insignias y una oferta. Es raro y no siempre pasa.

### La Inquisición y el casco
Si aceptas, tienes pestaña propia y **años de cacería**: rastrear (Fuerza, presión, papeleo o hacer de cebo), cercar y cerrar. Cada jedi que cierras llena **una barra junto a un casco negro en la cabecera**. Cuando se llena, alguien decide que has crecido demasiado y baja a verlo en persona.

La pelea con **Darth Vader** tiene dos fases. La primera es dura y se puede ganar. Después se para, ladea la cabeza y dice una frase; a partir de ahí una parada limpia ya no le hace nada —solo cuentan las que le abren la guardia— y cada hueco que dejas se paga entero. Ganar es **casi imposible**: menos del 1% jugando muy bien, y no llega al 7% jugando de forma prácticamente perfecta con la forma adecuada.

El **casco de Vader** no se gana matándole: se gana **por plantarte delante de él**. En cuanto baja de la rampa queda desbloqueado, ganes, pierdas, huyas o te mate — si dependiera de vencerle no lo vería nadie nunca. Se guarda entre partidas y se equipa en el creador de cualquier vida futura: la fama cuenta casi el doble y algo tira de ti hacia abajo un poco cada año. Matarle es otra cosa, y tiene su propia entrada en el salón de tus vidas.

Y si sobreviviste a la Purga y **no** aceptaste, son ellos los que vienen: escondido bien, tres de cada cuatro reciben al menos una visita en veinte años; buscando a otros supervivientes, todos.

### Las pruebas de Caballero
Un padawan no pasa a jedi por acumular años. Hay **cinco pruebas y se hacen seguidas en el mismo día**: Pericia (duelo contra un miembro del Consejo), Valor, la Carne (esta no se aprueba, se paga: un apego, un brazo o el miedo a morir), el Espíritu y la Perspicacia. Con tres superadas te cortan la trenza. Con menos, «dentro de unos años» — y eso es literal: vuelve a tocar a los tres.

### Duelos de sable
Cuando los dos lleváis sable, *jugártela* deja de ser un botón y pasa a ser **cruzar hojas**: varios intercambios seguidos en los que el rival anuncia por dónde entra —alto, medio o bajo— y hay que responder en la línea correcta y **lo más ajustado posible**. Parar pronto solo te cubre; parar al filo le abre la guardia. Hay estocadas que no se paran (se esquivan) y huecos por los que hay que entrar.

**La forma importa**, y mucho:

| Forma | Margen | Intercambios | Contra | Encajas |
|---|---|---|---|---|
| I · Shii-Cho | normal | 5 | — | poco |
| II · Makashi | amplio | 5 | alta | normal |
| III · Soresu | el más amplio | 7 | baja | casi nada |
| IV · Ataru | estrecho | 6 | muy alta | mucho |
| V · Shien/Djem So | justo | 5 | alta, crece con los golpes recibidos | bastante |
| VI · Niman | normal | 5 | media | poco |
| VII · Juyo/Vaapad | el más estrecho | 6 | brutal | mucho, y te arrastra al lado oscuro |

Contra disparos de bláster el reparto cambia: Makashi casi no sirve y Soresu es un muro. Contra Vader en su segunda fase, Soresu te mantiene vivo y no le mata; hace falta una forma que devuelva de verdad.

### Heridas
Un golpe fuerte no baja la salud y ya: abre una **herida** que reduce tu salud máxima mientras siga abierta y tarda años en cerrar sola. Se puede acelerar en una clínica pagando. La salud, mientras tanto, se regenera lentamente hasta el techo que dejen las heridas.

### La carrera política
Un solo escalafón, con el vocabulario y el techo de cada época. Cinco escalones desde *aprendiz de despacho* hasta *figura del Senado*, y en las épocas donde existe de verdad, un sexto: **la jefatura**.

| época | techo | |
|---|---|---|
| Alta República · República Tardía | **Canciller Supremo** | 400.000 cr |
| Nueva República | **Canciller de la Nueva República** | 400.000 cr |
| Guerras Clon | figura del Senado | la Cancillería la ocupa Palpatine y no sale a concurso |
| Imperio Temprano | portavoz de comité | por encima está el Emperador, y eso no se vota |
| Era de la Rebelión | enlace con el Moff | el Senado está disuelto |
| Primera Orden | gobernador general | no hay Senado: voló con Hosnian Prime |

La jefatura **no es un ascenso más**: hace falta intelecto > 84, carisma > 88, reputación > 84 y **cuatro años en la cumbre**, y aun cumpliéndolo es una elección con rivales que se puede perder. Campaña limpia, gastarte la fortuna o sacar los trapos de los otros — y si lo segundo sale mal, sale a la luz.

### Mundos que dejan de existir
Seis planetas tienen **fecha exacta de destrucción** en años galácticos, no «a partir de tal época»: Mandalore (19 ABY), Kamino (18 ABY), Alderaan, Jedha y Scarif (los tres el año 0) y Hosnian Prime (34 DBY). Antes de esa fecha se puede vivir allí y viajar allí con normalidad; después, el mapa te desvía a un refugio.

Y si te pilla dentro, **el día es una escena de la que se puede no salir**:

- Los finales que avisan —un desmantelamiento, una campaña— te dan uno o tres años de margen y una escena de evacuación con buenas probabilidades. En Kamino, con tiempo, sale el 84%.
- Los que no avisan son un disparo desde la órbita. En Alderaan, a pie, **sobrevive el 15%**; con nave propia en el hangar, el 51%; quedándote, ninguno. Sacar a otra gente primero baja tus posibilidades a propósito.
- Si no lo consigues, **mueres allí**: «Estaba en Alderaan el día que dejó de existir».

Tampoco se puede *nacer* en un mundo que ya no existe: el creador filtra las cunas por el año en el que naces, así que Alderaan desaparece de la lista si eliges la Primera Orden.

Hay un auditor para todo esto: `node tools/auditar-tiempo.js` cruza especies × épocas × mundos × años y saca lo que no cuadra.

### La época manda
- Solo puedes presentarte al Templo Jedi en las eras en que la Orden existe. Durante la Purga, ser sensible a la Fuerza es un delito con recompensa.
- El **Gran Ejército de la República** admite clones y jedi al mando. Un civil que se aliste en las Guerras Clon va a una fuerza de defensa planetaria, a la Confederación o al contrabando: al alistarte **eliges bando explícitamente** entre los que existen en tu era.
- Cada era tiene sus propias carreras, facciones, estudios y eventos.

### Ser un clon
No es una especie con otras estadísticas: es **otra forma de jugar**. Naces en Kamino con una designación CT-, envejeces al doble, tienes hermanos de lote idénticos y un chip en la cabeza — y naces **ya con el oficio puesto**, porque eres propiedad del Gran Ejército de la República.

Mientras estés en filas:

- **No puedes tener otro trabajo.** Nadie puede contratarte y tú no puedes firmar nada.
- **No puedes viajar.** No compras billetes: te despliegan. La pestaña de Viajar te enseña la pared y la única puerta que hay.
- **No hay Gremio, ni nave propia, ni negocios, ni política.** Media galaxia no existe para ti.
- **Te asignan un destino** —infantería, piloto, médico de campaña o comando ARC— y puedes pedir, no elegir. Se pide por escrito y consta.
- Tu vida pasa en la pestaña de **Escuadrón**: entrenar, presentarte voluntario, estar con los tuyos, pedir traslado.

La única salida es **desertar**: irse en una lanzadera de madrugada, hacerse pasar por muerto en el próximo despliegue o llevarse a un hermano. En cuanto lo haces se abre la galaxia entera… y sale detrás un equipo de recuperación con tu misma cara. Cambiar de sistema ya no te limpia el rastro: tu designación viaja más rápido que tú.

**El clon defectuoso** (`clon_nulo`) no es un clon con más intelecto. Su designación acaba en **-N**, de «no conforme», el chip inhibidor no le prendió bien y lleva una marca roja en el expediente desde el primer año. Eso significa revisiones periódicas, una barra de **vigilancia** que sube sola y que se ve en «Entre manos», y una retirada de la unidad esperando al final del camino si llega a 70. A cambio, el chip manda menos sobre él: cuando llega la **Orden 66**, obedece un 70% de las veces frente al 86% de un clon normal.

### Sistemas
- **11 estadísticas** (salud, Fuerza, destreza, intelecto, carisma, suerte, cordura, reputación, notoriedad, alineamiento y créditos).
- **Carreras con escalera de ascensos**, rendimiento, sueldos, despidos y chantajes de oficina.
- **La Fuerza**: sensibilidad de nacimiento o despertar tardío, poderes de luz y oscuridad, cristales kyber, construcción de sable (8 colores) y formas de combate.
- **Naves**: compra, mejoras, estado del casco, rutas de carga legales y no tanto, polizones y averías.
- **Combate por lectura, no por fuerza bruta**: el rival telegrafía su postura (embestida, guardia o finta) y hay un triángulo — agresivo rompe fintas, defensa castiga embestidas, la maniobra astuta abre guardias. Medido sobre 1.000 combates: leer la postura gana el **91%**; ir siempre a saco, el 60% y a costa de salud y aguante; elegir siempre mal, el 1%.
- **Minijuegos de reflejos**: en cualquier asalto puedes *jugártela*. Con arma de fuego es un duelo al desenfundar (esperas la señal y disparas; si te adelantas, pierdes); sin sable, detener el filo dentro de la guardia abierta. La ventana depende de tu destreza y de la dificultad. **Si los dos lleváis sable es otra cosa**: ver «Duelos de sable» más arriba.
- **Escenas encadenadas**: una decisión puede empujar a la siguiente escena dentro del mismo año, sin pasar por el menú. Es lo que convierte la Orden 66 en una noche seguida y las pruebas de Caballero en un solo día.
- **Relaciones**: familia, amistades, parejas, rivales, socios, aprendices, hijos, droides y mascotas, con nivel de afecto.
- **Facciones**: Imperio, Rebelión, Orden Jedi, Sith, cárteles Hutt, mandalorianos, Sol Negro y más, con reputación propia.
- **Prisión, deudas, adicciones, guerra, epidemias, herencias, legado y vejez.**
- **Semilla determinista**: la misma semilla da la misma vida. Sirve para retar a alguien a jugar tu partida.

### El mapa de la galaxia
Una carta estelar navegable con la estructura real de la galaxia: anillos del Núcleo Profundo al Borde Exterior, el Espacio Hutt en su sector y las Regiones Desconocidas al oeste. Se arrastra, se hace zoom y se pulsa cualquier mundo para ver sus datos, su distancia en saltos y el precio del pasaje. Los planetas se dibujan por código —atmósfera, nubes, casquetes polares, luces de ciudad en el lado nocturno, venas de lava, anillos— y si pulsas el mundo en el que estás se abre en **pixel art grande**, distinto para cada planeta.

Viajar dejó de ser un menú: es el mapa. Y tiene consecuencias — si dejas asuntos pendientes en un mundo, te avisa antes de irte; si hay gente buscándote, cambiar de sistema los despista; y si llevas mercancía en bodega, te dice cuánto se paga en cada destino.

### Cómo se ve
La interfaz **cambia de color según el planeta**: el desierto la tiñe de ámbar, el hielo de cian pálido, los mundos volcánicos de rojo, las ciudades-planeta de violeta. Se nota dónde estás sin leer nada.

La gente que conoces se muestra con **quién es y a qué se dedica** («Mirus Kryze — hermano, cocinero de puerto»), los personajes canónicos van marcados en oro, y no aparecen dos parejas a la vez ni se duplica a nadie: si vuelves a encontrarte con alguien, el vínculo se refuerza en lugar de crear una persona nueva.

### Compartir
Al morir tienes tres opciones:
1. **Enlace** — la vida entera va comprimida (LZW + base64url) dentro del `#hash` de la URL. Quien lo abra ve tu tarjeta sin instalar nada y sin servidor de por medio.
2. **Texto** — un resumen ASCII listo para pegar en un chat.
3. **Descargar** la tarjeta como `.html`.

---

## Publicar en GitHub Pages

El repositorio ya trae todo lo necesario: el workflow (`.github/workflows/pages.yml`), un `.nojekyll` y la tarjeta de previsualización (`assets/og.png`). Quedan dos pasos:

1. **Fusionar la rama de trabajo en `main`.** El workflow se dispara con cada push a `main`.
2. **Settings → Pages → Source: GitHub Actions.** Una sola vez, y tiene que hacerlo una persona: GitHub no deja crear el sitio con el token de Actions aunque el workflow tenga `pages: write` (falla con *Resource not accessible by integration*). Después de guardarlo, en **Actions** hay que volver a lanzar el último despliegue —botón *Re-run jobs*— porque el que se ejecutó antes de activarlo falló.

En un par de minutos la web queda en:

**https://gonzaloaa20.github.io/bitlife/**

Después de eso, cada push a `main` la actualiza solo. En la pestaña **Actions** se ve el despliegue en marcha.

> Alternativa sin Actions: en **Settings → Pages** elegir *Deploy from a branch* → `main` → `/ (root)`. Funciona igual, porque el juego es HTML estático puro. Con esta opción, ignora el paso 2.

> Si el repositorio es **privado**, Pages solo funciona con una cuenta de pago. Con el repositorio público es gratis.

### Pasárselo a alguien

- **El enlace de siempre:** `https://gonzaloaa20.github.io/bitlife/`. Al pegarlo en WhatsApp, Discord o Telegram sale una tarjeta con el logo y las cifras, porque el `index.html` lleva las etiquetas Open Graph apuntando a `assets/og.png`.
- **Un solo archivo, sin internet:** `dist/holovida.html` es el juego entero —CSS y los 58 scripts incrustados— en un fichero. Se puede mandar por correo y se abre con doble clic. También queda servido en `https://gonzaloaa20.github.io/bitlife/dist/holovida.html`.
- **Una partida concreta:** desde la tarjeta de fin de vida, el botón de compartir genera un enlace con el resumen comprimido en el `#`. Quien lo abra ve esa vida, no la suya.
- **Retar a alguien:** la semilla es determinista. Misma semilla, misma vida: se la pasas y jugáis la misma partida.

> Si cambias el nombre del repositorio o el usuario, hay que tocar las cuatro URL absolutas del `<head>` de `index.html` (`og:url`, `og:image`, `twitter:image`): los rastreadores de enlaces no resuelven rutas relativas.

---

## Estructura

```
index.html                   punto de entrada
assets/style.css             estética retrofuturista (CRT, fósforo cian, art déco)
src/rng.js                   aleatoriedad determinista + compresión de enlaces
src/data-world.js            especies, mundos, facciones, nombres, objetos, naves
src/data-careers.js          carreras, estudios, poderes, actividades
src/data-world-ext.js        expansión del universo + bandos y eras
src/pixelart.js              sprites en rejilla de caracteres y su renderizador
src/pixelart2.js             motor de pixel art de 48×48 (objetos, naves, mejoras)
src/pixelart-retrato.js      retratos de 64×64 con anatomía propia por especie
src/galaxia.js               mapa de la galaxia, planetas dibujados por código, viajes
src/fondo.js                 fondo en pixel art por planeta (tramado Bayer y horizontes)
src/data-mundos-local.js     lugares y oficios propios de cada mundo
src/data-mundos-dosier.js    dosier de los 117 mundos: fauna, bandas, hitos, comida
src/data-equipo.js           fichas de combate de los objetos y la armería
src/data-canon.js            personajes conocidos, datos de mundo, reglas del kyber
src/data-careers-ext.js      más carreras y ramas profesionales
src/data-events-vida.js      eventos del ciclo anual (infancia → vejez)
src/data-events-vida2.js     segunda tanda de eventos de vida
src/data-events-vida3.js     eventos de vida por franja de edad
src/data-eventos-mundo.js    eventos escritos a mano para planetas concretos
src/data-eventos-locales.js  plantillas que se adaptan al dosier del planeta
src/data-events-cuna.js      los primeros años (0–6), para que no se repita el arranque
src/data-events-actos.js     eventos por actividad + generadores procedurales
src/data-events-actos2.js    más eventos por actividad
src/data-events-actos3.js    tercera tanda de eventos por actividad
src/data-events-clon.js      la vida de un clon, de Kamino a la Orden 66
src/data-events-era.js       eventos atados a cada época
src/data-riesgo.js           peligro acumulado, consecuencias de perder y muerte en guerra
src/data-nave-taller.js      taller: mejoras de nave que desbloquean decisiones
src/data-events-nave.js      eventos que exigen una mejora concreta montada
src/data-carrera.js          carreras de naves: circuitos, trazadas y accidentes
src/data-fuerza.js           el camino jedi y sith, con sus renuncias
src/data-fuerza-atencion.js  quién se fija en ti: reclutamiento, amenaza o cacería
src/duelo-sable.js           las siete formas, el duelo por intercambios y las reliquias
src/data-orden66.js          la Purga encadenada por rama y las pruebas de Caballero
src/data-inquisidor.js       cacerías, la barra de Vader y el jefe final en dos fases
src/engine.js                estado, ciclo anual, efectos, combate, muerte
src/summary.js               tarjeta de vida, enlaces para compartir, métricas
src/ui.js                    interfaz completa
```

El orden de carga lo manda `index.html`, y `tools/build-single.js` lee esa misma
lista para empaquetar: no hay dos sitios que mantener.

Sin frameworks, sin build, sin dependencias: JavaScript de navegador con etiquetas `<script>` clásicas, para que `index.html` funcione también desde `file://`.

## Añadir contenido

Un evento nuevo es un objeto en `src/data-events-vida.js`:

```js
{
  id: 'mi_evento', min: 18, max: 60, w: 7,
  req: function (s) { return s.stats.creditos > 5000; },
  slots: { p: 'mundo', n: 'nombre' },
  t: 'En {p} alguien llamado {n} te propone algo raro.',
  c: [
    { t: 'Aceptar', fx: { creditos: 9000, alineamiento: -5 }, out: 'Sale bien.' },
    { t: 'Negarte', r: [
      { p: 0.5, t: 'Lo respeta.', fx: { reputacion: 5 } },
      { p: 0.5, t: 'No lo respeta.', fx: { salud: -10 } }
    ] }
  ]
}
```

Los `slots` disponibles son `mundo`, `criatura`, `lugar`, `objeto`, `nombre`, `faccion`, `rumor` y `nave`. Cada uno multiplica el número de escenarios distintos que produce esa plantilla.

---

Proyecto de fan sin ánimo de lucro. No está afiliado ni respaldado por Lucasfilm ni por Disney.
