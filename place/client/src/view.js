import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

export default class View {
    constructor() {       
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight, backgroundColor: 0xFFFFFF})

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

        document.body.appendChild(this.app.view);
    }

    renderInitialMap(pixels) {
        const texture = PIXI.Texture.fromBuffer(pixels, 1000, 1000)
        const sprite = new PIXI.Sprite(texture);
        this.viewport.addChild(sprite)
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