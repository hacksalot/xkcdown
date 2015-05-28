# xkc(down) #

An interactive 3D visualization of popular webcomic [xkcd][2] with support for physics, camera movement, WebGL rendering with Canvas fallback, and smashing xkcd comics into stacks of other comics. **[View the live demo][1]**.

![][3]

## Features ##

- Standard HTML5 / CSS / JavaScript implementation.
- Cross-browser (ish) with recent Chrome, Firefox, IE, Safari.
- Supports WebGL and Canvas rendering (as a fallback).
- Multiple visualization/simulation types.
- HTML-driven via standard `<img>` tags and layouting.
- Simulation runs are shareable (through permalinks).
- Simulation runs are seedable (through an optional seed).
- Simulations runs are repeatable (by repeating the seed).
- Simulations runs are (pseudo-) random; new comics with each page load.
- Full mouse and keyboard controls.

## Build ##

1. Clone or fork the sources.
2. BYOI (Bring Your Own Images). Place images in the `src/img` folder and name them consecutively (`1.png`, `2.png`, etc.) for easy random selection.
3. Run `bower install` and `npm install` in the top-level project folder to install dependencies.
4. To build and serve a local copy of the demo run `grunt serve:debug` or `grunt serve:release`. You can also run `grunt build:debug` or `grunt build:release` to build without serving.

## Credits ##

- Original comics by Randall Munroe (http://xkcd.com).
- "xkc(down)" concept and code by James Devlin (james@indevious.com).

## License ##

MIT

[1]: http://xkcdown.indevious.com
[2]: http://xkcd.com
[3]: http://xkcdown.indevious.com/img/xkcdown_wall.jpg
