import View from './view'

let app = new View()


// generate random pixels
const pixels = [] 
for(let i = 0; i < 10000; i++) {
    const x = Math.floor(Math.random() * 1000)
    const y = Math.floor(Math.random() * 1000)
    const color = Math.floor(Math.random() * 16)
    if (i % 10000 === 0) {
        console.log(i)
    }
    pixels.push([x, y, color])
}

app.renderInitialMap(pixels)

// pixels = [[x, y, color]]

//Add the canvas that Pixi automatically created for you to the HTML document
