import View from './view'

let app = new View()

// generate random pixels
var uintc8 = new Uint8ClampedArray(4 * 1000000);

for(let i = 0; i < 4000000; i++) {
    uintc8[i] = Math.floor(Math.random() * 256)
}

app.renderInitialMap(uintc8)

// pixels = [[x, y, color]]

//Add the canvas that Pixi automatically created for you to the HTML document
