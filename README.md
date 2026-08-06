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
| Decisiones posibles | **~13,5 millones** de nodos de decisión |
| Escenarios únicos | ~3,5 millones |
| Especies jugables | 61 (incluido el clon de Kamino) |
| Mundos | 113 |
| Carreras | 50 |
| Poderes de la Fuerza | 30 |

El número sale de combinar **199 plantillas de evento escritas a mano** con los *slots* variables de cada una (mundo, criatura, lugar, objeto, facción, rumor…) más **ocho generadores procedurales** (contratos, rutas de carga, encuentros de acción, combates espaciales, ofertas de empleo, misiones militares, encargos de facción y dilemas morales). La cifra exacta se calcula en tiempo de ejecución y se muestra en la portada.

Un mismo evento no se repite: hay memoria de los últimos catorce y el peso de cada plantilla baja cada vez que sale.

### Creación de personaje
Nombre, tratamiento, especie (con esperanza de vida y bonos propios), era galáctica (8, de la Alta República a la Primera Orden), mundo natal, origen social y un **retrato holográfico** generado en SVG que puedes ajustar pieza a pieza: piel, ojos, pelo, marcas, tocado, ropa y forma del cráneo.

### Ciclo de juego
Cada año pasan cosas por su cuenta **y además eliges una actividad**:

`Trabajo` · `Formación` · `Social` · `Bajos fondos` · `Hangar` · `Viajar` · `La Fuerza` · `Mercado` · `Acción` · `Cuerpo y mente` · `Escuadrón` · `Política` · `Exploración`

### Cómo crecen las estadísticas
Naces con casi nada (físico 5, intelecto 5…). Cada año subes un poco por pura edad, con una curva que acelera en la infancia, se estanca sobre los 25 y decae a partir de los 55. Ese crecimiento pasivo tiene un **techo propio de cada personaje** (unos 55 ± 12): de ahí para arriba solo se sube decidiendo. Los bonos de especie, era y origen no se aplican de golpe al nacer, sino que se van expresando mientras creces.

### Heridas
Un golpe fuerte no baja la salud y ya: abre una **herida** que reduce tu salud máxima mientras siga abierta y tarda años en cerrar sola. Se puede acelerar en una clínica pagando. La salud, mientras tanto, se regenera lentamente hasta el techo que dejen las heridas.

### La época manda
- Solo puedes presentarte al Templo Jedi en las eras en que la Orden existe. Durante la Purga, ser sensible a la Fuerza es un delito con recompensa.
- El **Gran Ejército de la República** admite clones y jedi al mando. Un civil que se aliste en las Guerras Clon va a una fuerza de defensa planetaria, a la Confederación o al contrabando: al alistarte **eliges bando explícitamente** entre los que existen en tu era.
- Cada era tiene sus propias carreras, facciones, estudios y eventos.

### Ser un clon
Una especie jugable con guion propio: naces en Kamino con una designación CT-, **envejeces al doble**, tienes hermanos de lote idénticos y un chip en la cabeza. Instrucción, asignación de especialidad, primer despliegue, apodo de unidad, pintar la armadura, deserción… y la **Orden 66**, que llega sí o sí y cuya resolución depende de si descubriste el chip a tiempo.

### Sistemas
- **11 estadísticas** (salud, Fuerza, destreza, intelecto, carisma, suerte, cordura, reputación, notoriedad, alineamiento y créditos).
- **Carreras con escalera de ascensos**, rendimiento, sueldos, despidos y chantajes de oficina.
- **La Fuerza**: sensibilidad de nacimiento o despertar tardío, poderes de luz y oscuridad, cristales kyber, construcción de sable (8 colores) y formas de combate.
- **Naves**: compra, mejoras, estado del casco, rutas de carga legales y no tanto, polizones y averías.
- **Combate por lectura, no por fuerza bruta**: el rival telegrafía su postura (embestida, guardia o finta) y hay un triángulo — agresivo rompe fintas, defensa castiga embestidas, la maniobra astuta abre guardias. Medido sobre 1.000 combates: leer la postura gana el **91%**; ir siempre a saco, el 60% y a costa de salud y aguante; elegir siempre mal, el 1%.
- **Minijuegos de reflejos**: en cualquier asalto puedes *jugártela*. Con arma de fuego es un duelo al desenfundar (esperas la señal y disparas; si te adelantas, pierdes); con sable, detener el filo dentro de la guardia abierta. La ventana depende de tu destreza y de la dificultad.
- **Relaciones**: familia, amistades, parejas, rivales, socios, aprendices, hijos, droides y mascotas, con nivel de afecto.
- **Facciones**: Imperio, Rebelión, Orden Jedi, Sith, cárteles Hutt, mandalorianos, Sol Negro y más, con reputación propia.
- **Prisión, deudas, adicciones, guerra, epidemias, herencias, legado y vejez.**
- **Semilla determinista**: la misma semilla da la misma vida. Sirve para retar a alguien a jugar tu partida.

### Compartir
Al morir tienes tres opciones:
1. **Enlace** — la vida entera va comprimida (LZW + base64url) dentro del `#hash` de la URL. Quien lo abra ve tu tarjeta sin instalar nada y sin servidor de por medio.
2. **Texto** — un resumen ASCII listo para pegar en un chat.
3. **Descargar** la tarjeta como `.html`.

---

## Publicar en GitHub Pages

El repositorio ya trae el workflow (`.github/workflows/pages.yml`) y un `.nojekyll`. Solo hay que:

1. Fusionar esta rama en `main`.
2. Ir a **Settings → Pages** del repositorio.
3. En **Source**, elegir **GitHub Actions**.

En un minuto la web queda en `https://<usuario>.github.io/<repo>/`.

> Alternativa sin Actions: en **Settings → Pages** elegir *Deploy from a branch* → `main` → `/ (root)`. Funciona igual, porque el juego es HTML estático puro.

---

## Estructura

```
index.html                    punto de entrada
assets/style.css              estética retrofuturista (CRT, fósforo cian, art déco)
src/rng.js                    aleatoriedad determinista + compresión de enlaces
src/data-world.js             especies, mundos, facciones, nombres, objetos, naves
src/data-careers.js           carreras, estudios, poderes, actividades
src/data-events-vida.js       eventos del ciclo anual (infancia → vejez)
src/data-events-actos.js      eventos por actividad + generadores procedurales
src/engine.js                 estado, ciclo anual, efectos, combate, muerte
src/summary.js                retrato SVG, tarjeta de vida, enlaces, métricas
src/ui.js                     interfaz completa
```

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
