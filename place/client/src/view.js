import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

export default class View {    
    constructor() {      
        let colorId = 0; 
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight, backgroundColor: 0x423f3f})

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

        this.viewport.on('clicked', (e) => console.log('clicked (' + Math.floor(e.world.x) + ',' + Math.floor(e.world.y) + ') and sending color ' + getColor(colorId) + ' with color ID ' + colorId))


        document.getElementById("selector").addEventListener("pointerdown", e => {
            colorId = e.target.id
            document.getElementById("currcolor").style.backgroundColor = getColor(colorId)
        })


    }

    renderInitialMap(pixels) {
        console.log('rendering ma')
        const texture = PIXI.Texture.fromBuffer(pixels, 1000, 1000)
        const sprite = new PIXI.Sprite(texture);
        this.viewport.addChild(sprite)
    }

}

function getColor(colorId) {
    const colors = [
        "#FFFFFF",   //white
        "#E4E4E4",   //white
        "#888888",   //grey
        "#222222",   //dark grey
        "#FFA7D1",
        "#E50000",
        "#E59500",
        "#A06A42",
        "#E5D900",
        "#94E044",
        "#02BE01",
        "#00D3DD",
        "#0083C7",
        "#0000EA",
        "#CF6EE4",
        "#820080"
    ]

    if (colorId > 0 && colorId < 16) {
        return colors[colorId]
    } else {
        return 0x222222
    }
}