export default class View {
    constructor() {
        this.canvas = document.getElementById('canvas')
        this.ctx = this.canvas.getContext('2d')

        this.zoomScale = 4
        this.isMouseDown = false
        this.mouseDownPos = {x: 0, y: 0}

        // register zoom + scroll handlers
        this.canvas.addEventListener("wheel", this.zoom)
        this.canvas.addEventListener('mousedown', this.mouseDown)
        this.canvas.addEventListener('mousemove', this.mouseMove)
        this.canvas.addEventListener('mouseup', this.mouseUp)
    }

    renderInitialMap(pixels) {
        console.log(pixels.length)
        const image = new ImageData(pixels, 1000, 1000)
        this.ctx.putImageData(image, 0, 0)
    }

    zoom = (event) => {
        event.preventDefault()
        const zoomEl = document.getElementById('zoom')

        // zoom in
        if (event.deltaY < 0) {
            this.zoomScale = 40
        } else {
            this.zoomScale = 4
        }
        zoomEl.style.transform = `scale(${this.zoomScale})`;
    }

    mouseDown = (event) => {
        event.preventDefault()
        const panEl = document.getElementById('pan')

        if (event.button === 0) {
            this.isMouseDown = true
            this.mouseDownPos = { x: event.screenX, y: event.screenY}
            console.log(panEl.style.transform)
        }

    }

    mouseMove = (event) => {
        event.preventDefault()
        const panEl = document.getElementById('pan')
        if (this.isMouseDown) {
            const xOffset = event.screenX - this.mouseDownPos.x
            const yOffset = event.screenY - this.mouseDownPos.y
            panEl.style.transform = `translate(${xOffset}px, ${yOffset}px)`
        }
    }

    mouseUp = (event) => {
        event.preventDefault()
        const panEl = document.getElementById('pan')

        if (event.button === 0) {
            this.isMouseDown = false
        }
    }
}

function getColor(colorId) {
    const colors = [
        0xFFFFFF,
        0xE4E4E4,
        0x888888,
        0x222222,
        0xFFA7D1,
        0xE50000,
        0xE59500,
        0xA06A42,
        0xE5D900,
        0x94E044,
        0x02BE01,
        0x00D3DD,
        0x0083C7,
        0x0000EA,
        0xCF6EE4,
        0x820080
    ]

    if (colorId > 0 && colorId < 16) {
        return colors[colorId]
    } else {
        return 0x222222
    }
}