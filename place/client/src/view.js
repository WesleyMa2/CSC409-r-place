import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

export default class View {
    constructor() {
        this.canvas = document.getElementById('canvas')
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight, view: this.canvas, backgroundColor: 0xFFFFFF})

        this.zoomScale = 4
        this.isMouseDown = false
        this.mouseDownPos = {x: 0, y: 0}

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
        
            interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        this.app.stage.addChild(this.viewport)

        this.viewport.drag()
        .wheel({ smooth: 10})
        .clamp({ direction: 'all'})
        .clampZoom({ maxScale: 32, minScale: 1})


        // register zoom + scroll handlers
        // this.canvas.addEventListener("wheel", this.zoom)
        // this.canvas.addEventListener('mousedown', this.mouseDown)
        // this.canvas.addEventListener('mousemove', this.mouseMove)
        // this.canvas.addEventListener('mouseup', this.mouseUp)
    }

    renderInitialMap(pixels) {
        // const canvas = document.createElement('canvas');
        // canvas.style.imageRendering = 'pixelated'
        // this.ctx = canvas.getContext('2d')
        // const image = new ImageData(pixels, 1000, 1000)
        // this.ctx.putImageData(image, 0, 0)
        const texture = PIXI.Texture.fromBuffer(pixels, 1000, 1000)
        const sprite = new PIXI.Sprite(texture);
        this.viewport.addChild(sprite)
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