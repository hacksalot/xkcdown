xkcdown
===
*Transform cartoons from the xkcd webcomic into colliding 3D blocks directly
in the browser.*


xkcdown is an interactive 3D visualization of popular webcomic [xkcd][2] with
support for physics, collisions, camera movement, and smashing xkcd comics into
stacks of other comics. **[View the live demo][1]**.

![][3]

## Features ##

- Standard HTML5 / CSS / JavaScript implementation.
- Cross-browser with recent Chrome, Firefox, IE, Safari.
- HTML-driven via standard `<img>` tags and layouting.
- Simulation runs are shareable (through permalinks).
- Simulation runs are seedable (through an optional seed).
- Simulations runs are repeatable (by repeating the seed).
- Simulations runs are (pseudo-) random; new comics with each page load.
- Multiple visualization/simulation types.
- Full mouse and keyboard controls.

## Build ##

1. Clone or fork the sources.
2. BYOI (Bring Your Own Images). Place images in the `src/img` folder and name
them consecutively (`1.png`, `2.png`, etc.) for easy random selection.
3. Run `bower install` and `npm install` in the top-level project folder to
install dependencies.
4. To build and serve a local copy of the demo run `grunt serve:debug` or
`grunt serve:release`. You can also run `grunt build:debug` or
`grunt build:release` to build without serving.

## Credits ##

- Original comics by Randall Munroe (http://xkcd.com).
- "xkcdown" concept and code by James Devlin (https://deskchained.com).

## License ##

MIT

[1]: https://xkcdown.indevious.com
[2]: https://xkcd.com
[3]: https://xkcdown.indevious.com/img/xkcdown_static_float.png
