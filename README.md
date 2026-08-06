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
| Decisiones posibles | **~2,25 millones** de nodos de decisión |
| Escenarios únicos | ~580.000 |
| Especies jugables | 30 |
| Mundos | 56 |
| Carreras | 24 |
| Poderes de la Fuerza | 14 |

El número sale de combinar **105 plantillas de evento escritas a mano** con los *slots* variables de cada una (mundo, criatura, lugar, objeto, facción, rumor…) más **cinco generadores procedurales** (contratos, rutas de carga, encuentros de acción, combates espaciales y ofertas de empleo). La cifra exacta se calcula en tiempo de ejecución y se muestra en la portada.

### Creación de personaje
Nombre, tratamiento, especie (con esperanza de vida y bonos propios), era galáctica (8, de la Alta República a la Primera Orden), mundo natal, origen social y un **retrato holográfico** generado en SVG que puedes ajustar pieza a pieza: piel, ojos, pelo, marcas, tocado, ropa y forma del cráneo.

### Ciclo de juego
Cada año pasan cosas por su cuenta **y además eliges una actividad**:

`Trabajo` · `Formación` · `Social` · `Bajos fondos` · `Hangar` · `Viajar` · `La Fuerza` · `Mercado` · `Acción` · `Cuerpo y mente`

### Sistemas
- **11 estadísticas** (salud, Fuerza, destreza, intelecto, carisma, suerte, cordura, reputación, notoriedad, alineamiento y créditos).
- **Carreras con escalera de ascensos**, rendimiento, sueldos, despidos y chantajes de oficina.
- **La Fuerza**: sensibilidad de nacimiento o despertar tardío, poderes de luz y oscuridad, cristales kyber, construcción de sable (8 colores) y formas de combate.
- **Naves**: compra, mejoras, estado del casco, rutas de carga legales y no tanto, polizones y averías.
- **Momentos de acción reales**: los duelos y los combates espaciales son escenas por turnos con tácticas (agresivo, defensa, maniobra astuta, la Fuerza, retirada) que dependen de tus estadísticas, no tiradas invisibles.
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
