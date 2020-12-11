import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import * as request from 'request'

const LAMDA_URL = 'https://fsc2uv90z3.execute-api.us-east-1.amazonaws.com/prod'

let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

export default class View {    
    constructor() {      
        this.colorId = 0; 
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

        this.viewport.on('clicked', this.clickPixel) 

        document.getElementById("selector").addEventListener("pointerdown", e => {
            this.colorId = parseInt(e.target.id)
            document.getElementById("currcolor").style.backgroundColor = getColor(this.colorId)
        })


    }

    renderMap(pixels) {
        const texture = PIXI.Texture.fromBuffer(pixels, 1000, 1000)
        const sprite = new PIXI.Sprite(texture);
        this.viewport.addChild(sprite)
    }

    clickPixel = (e) => {
        const reqBody = {
            x: Math.floor(e.world.x),
            y: Math.floor(e.world.y),
            color: this.colorId
        }

        const CORSheaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "crossorigin": true
        }
          
        request.put({json: true, body: reqBody, uri: "https://cors-anywhere.herokuapp.com/"+LAMDA_URL, headers: CORSheaders, }, (err, res, body)=> {
            if (err) { console.error(err)}
            if (res) console.log(res)
            if(res.body.statusCode !== 200) {
                alert(res.body.body)
            }
        })
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

    if (colorId >= 0 && colorId < 16) {
        return colors[colorId]
    } else {
        return 0x222222
    }
}