import View from './view'

let app = new View()

const ec2URL = "ec2-54-234-48-204.compute-1.amazonaws.com"

// const socket = new WebSocket(`ws://${ec2URL}:8081`)

// socket.onopen = (event) => {
//     console.log('connection opened!')
// }

// socket.onmessage = (event) => {
//     const bufferPromise = event.data.arrayBuffer()
//     bufferPromise.then((data) => {
//         console.log(data)
//         // data.forEach(element => {
//         //     console.log(element)
//         // });
//     })
// }

// generate random pixels
var uintc8 = new Uint8ClampedArray(4 * 1000000); 

for(let i = 0; i < 4000000; i++) {
    uintc8[i] = Math.floor(Math.random() * 256)
}

app.renderInitialMap(uintc8)

// each int, convert to binary and split into 4 pixels
// each pixel is 4 bits 1101 1011 1011 0000 = 56240
// AND 0000 0000 0000 1111 
// BITSHIFT 
// map 16 colors to [r, g, b, a]

