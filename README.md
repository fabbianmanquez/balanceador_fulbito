# Picadito App

<img src="assets/img/logo.svg" alt="Logo de Picadito App" width="96" align="right">

Armá equipos de fútbol parejos a partir de la lista del grupo de WhatsApp: pegás los nombres, indicás el nivel de cada jugador y la app reparte los equipos para que queden balanceados.

**Demo:** https://fabbianmanquez.github.io/picadito-app/

## Funciones

- **Importar lista.** Lee la lista como venga: vertical, horizontal, con numeración, con comas o con guiones. Descarta solo los datos de la cancha, la hora y la fecha (y los guarda para el mensaje de WhatsApp) y detecta nombres repetidos.
- **Numeración automática.** Al escribir a mano, cada jugador nuevo trae su número. Al pegar una lista, corrige los números salteados, repetidos o desordenados (1, 3, 4 pasa a 1, 2, 3).
- **Validación en vivo.** Mientras escribís indica cuántos jugadores hay y a qué modalidad corresponde (F5, F6, F7, F8, F9 o F11).
- **Un jugador de más.** Con 11 jugadores para un F5 pregunta si van a jugar 11 y reparte 6 contra 5 cuidando el promedio de cada equipo.
- **Formato liga.** Elegís cuántos equipos (de 3 a 8) y cuántos jugadores por equipo (de 4 a 11) y arma todos los equipos parejos.
- **Vista en lista o en cancha.** La vista en cancha dibuja cada equipo con sus posiciones y puede enviarse como imagen.
- **Compartir.** Genera el texto para WhatsApp y una imagen de los equipos.

## Cómo se mide el nivel

| Nivel | Puntos |
| --- | --- |
| Crack | 5 |
| Muy bueno | 4 |
| Regular | 3 |
| Irregular | 2 |
| Flojo | 1 |
| Arquero fijo (POR) | 3 |
| Lesionado | al azar entre 1 y 3 |
| Random | al azar entre 1 y 4 |

El reparto minimiza la diferencia de puntos entre equipos y, en segundo lugar, la diferencia en la cantidad de jugadores de cada nivel. Con dos equipos prueba todas las combinaciones posibles; con más equipos (o con muchos jugadores) usa un reparto goloso mejorado por intercambios.

## Estructura

```
index.html          Estructura de la página
css/                Estilos (base, componentes, menú, pantallas, detalles y responsive)
js/
  main.js           Punto de entrada
  router.js         Navegación entre pantallas
  state.js          Estado de la aplicación
  config.js         Constantes y parámetros
  parser.js         Lectura de la lista pegada
  match.js          Modalidad y estado de la lista
  balance.js        Armado y balance de equipos
  scoring.js        Puntaje de cada jugador
  actions.js        Acciones de la barra de comandos
  ui.js, icons.js   Piezas de interfaz e iconos
  sound.js          Sonidos
  image.js          Imagen para compartir
  idle.js           Reinicio por inactividad
  screens/          Una pantalla por archivo
assets/             Imágenes y sonidos
tests/              Pruebas automáticas
```

## Desarrollo

Los módulos de JavaScript se cargan con `import`, por lo que hace falta servir la carpeta por HTTP (abrir `index.html` con doble clic no alcanza):

```bash
npm start        # servidor local
npm test         # pruebas del parser y del balanceo
npm run lint     # análisis estático
```

## Publicación

El sitio se publica con GitHub Pages desde la rama `main`. El archivo `.nojekyll` evita que Pages procese los archivos.
