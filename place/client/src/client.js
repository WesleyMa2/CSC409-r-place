import View from './view'

let app = new View()

const ec2URL = "ec2-54-234-48-204.compute-1.amazonaws.com"

const socket = new WebSocket(`ws://${ec2URL}:8081`)

socket.onopen = (event) => {
    console.log('connection opened!')
}

var uintc8 = new Uint8ClampedArray(4 * 1000000); 

socket.onmessage = (event) => {
    if (event.data instanceof Blob) {
        // handle entire board
        const bufferPromise = event.data.arrayBuffer()
        bufferPromise.then((data) => {
            const bit64Array = new Uint32Array(data)
            for (let i = 0; i < 125000; i++) {
                const colors = convertToColors(bit64Array[i])
                for (let j = 0; j < 8; j++) {
                    const pixels = convertToRGBPixel(colors[j])
                    for (let k = 0; k < 4; k++) {
                        uintc8[i*32 + j*4 + k] = pixels[k]
                    }
                }
                
            }
            app.renderInitialMap(uintc8)
        })
    } else {
        // handle pixel updates
        console.log(event.data)
    }
}



function convertToColors(num) {
     const val = new Array(8)
     for (let i = 0; i < 8; i++) {
         val[7 - i] = num & 15
         num = num >> 4
     }
     return val
}

function convertToRGBPixel(colorID) {
    const colorMap = [
        [255, 255, 255, 255], // white
        [228, 228, 228, 255], // light grey
        [136, 136, 136, 255], // dark grey
        [34, 34, 34, 255],    // black
        [255, 167, 209, 255], // pink
        [229, 0, 0, 255],     // red
        [229, 149, 0, 255],   // orange
        [160, 106, 66, 255],  // brown
        [229, 217, 0, 255],   // yellow
        [148, 224, 68, 255],  // light green
        [2, 190, 1, 255],     // dark green
        [0, 211, 221, 255],   // cyan
        [0, 131, 199, 255],   // blue
        [0, 0, 234, 255],     // dark blue
        [207, 110, 228, 255], // peppa pink
        [130, 0, 128, 255],   // wine
    ]
    return colorMap[colorID]
}

// generate random pixels
// var uintc8 = new Uint8ClampedArray(4 * 1000000); 




// each int, convert to binary and split into 4 pixels
// each pixel is 4 bits 1000 0100 0010 0001 = 56240
// AND 0000 0000 0000 1111 
// BITSHIFT 
// map 16 colors to [r, g, b, a]

