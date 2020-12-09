import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

const WIDTH = 600
const HEIGHT = 600

PIXI.utils.sayHello(type)
PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;


export default class View {
    constructor() {
        this.app = new PIXI.Application({ 
            width: 1200, 
            height: 800, 
            backgroundColor: 0xdfe5f0
        });
        this.viewport = new Viewport({
            screenWidth: 1200,
            screenHeight: 800,
            worldWidth: 16 * 1000,
            worldHeight: 16 * 1000,
            interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })
        this.app.stage.addChild(this.viewport)
        this.viewport.drag().wheel()
        .clampZoom({
            minWidth: 16 * 100,
            maxWidth: 16 * 1000
        }).clamp({
            direction: "all"
        })
        document.getElementById("view").appendChild(this.app.view);
    }

    renderInitialMap(pixels) {
        const renderer = this.app.renderer;
        console.log(renderer)
        const initial = new PIXI.Container()
        
        pixels.forEach(pixel => {
            const sprite = this.getPixel(pixel)
            initial.addChild(sprite)
        });
        const texture = renderer.generateTexture(initial, PIXI.SCALE_MODES.LINEAR, 1)
        const background = new PIXI.Sprite(texture)
        background.cacheAsBitmap = true
        this.viewport.addChild(background)
    }

    addPixel(pixel) {
        const sprite = this.getPixel(pixel)
        this.app.stage.addChild(sprite)
    }

    getPixel(pixel) {
        const sprite = new PIXI.Graphics()
        sprite.cacheAsBitmap = true
        sprite.beginFill(getColor(pixel[2]))
        sprite.drawRect(0, 0, 16, 16)
        sprite.x = pixel[0] * 16
        sprite.y = pixel[1] * 16
        return sprite
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