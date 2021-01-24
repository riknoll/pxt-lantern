// Add your code here
//% icon="\uf185" color="#8f1fff"
namespace multilights {
     // The top row is just the palette, each row gets darker
    const palette_ramps = image.ofBuffer(hex`e4100400ffff0000d1cb0000a2ff0000b3fc0000e4fc000045ce000086fc000067c80000c8ff000069c80000bafc0000cbff0000fcff0000bdfc0000ceff0000ffff0000`);

    export class MultiLightScreenEffect implements effects.BackgroundEffect {

        private lightSourceMap : {[id:string]:lightsource.LightSource;} = {}
        private bandPalettes :Buffer[] = []
        private _init:boolean = false
        private running = false;
        private static instance :MultiLightScreenEffect

        public static getInstance() :MultiLightScreenEffect{
            if (MultiLightScreenEffect.instance == null) {
                MultiLightScreenEffect.instance = new MultiLightScreenEffect()
            }
            return MultiLightScreenEffect.instance
        }

        constructor() {
            this._init = false;
            this.bandPalettes = [];
            for (let band = 0; band < 6; band++) {
                const buffer = pins.createBuffer(16);
                for (let i = 0; i < 16; i++) {
                    buffer[i] = palette_ramps.getPixel(i, band + 1);
                }
                this.bandPalettes.push(buffer);
            }
        }

        stopScreenEffect() {
            this.running = false;
        }

        applyLightMapToScreen(lightMap:Image) {
            for (let y = 0; y< screen.height; y++) {            
                let begin = 0, currentLightLevel = lightMap.getPixel(0, y)
                for (let x = 1; x < screen.width; x++) {
                    if (currentLightLevel != lightMap.getPixel(x, y)) {
                        if (currentLightLevel > 0) {
                            screen.mapRect(begin, y, x - begin, 1, this.bandPalettes[currentLightLevel])
                        }
                        currentLightLevel = lightMap.getPixel(x, y)
                        begin = x
                    }
                }
                if (currentLightLevel > 0) {
                    screen.mapRect(begin, y, screen.width - begin, 1, this.bandPalettes[currentLightLevel])
                }   
            }
        }

        bandWidthOfSprite(sprite:Sprite, bandWidth:number) {
            let lightSource = this.lightSourceMap[sprite.id]
            lightSource.setBandWidth(bandWidth) 
        }

        removeLightSource(sprite:Sprite) {
            delete this.lightSourceMap[sprite.id]
        }

        startScreenEffect() {
            this.running = true            
            if(this._init) {
                return
            }

            scene.createRenderable(91, () => {
                if (!this.running) {
                    return;
                } 

                // 0. prepare a empty light map with radius 0
                let lightMap = image.create(screen.width, screen.height)
                lightMap.fill(5)
                // 1. prepare light map for each light source
                for (const key of Object.keys(this.lightSourceMap)) {
                    let lightsource = this.lightSourceMap[key]
                    lightsource.apply(lightMap)
                }                
                // 2. apply light map to screen
                // screen.drawTransparentImage(lightMap, 0, 0)
                this.applyLightMapToScreen(lightMap)
            })

            this._init = true
        }

        addFlashLightSource (sprite:Sprite, bandWidth:number, direction:number, lightRange:number, angleRange:number) {
            let newLightSource = this.lightSourceMap[sprite.id]
            if (!newLightSource) {
                newLightSource = new lightsource.FlashlightLightSource(sprite, bandWidth, direction, lightRange, angleRange)    
                this.lightSourceMap[sprite.id] = newLightSource
            } else {
                
            }

            sprite.onDestroyed(function() {
                removeLightSource(sprite)      
            })
        }

        addLightSource(sprite:Sprite, bandWidth:number) {
            let newLightSource = this.lightSourceMap[sprite.id]
            if (!newLightSource) {
                newLightSource = new lightsource.CircleLightSource(sprite, bandWidth, 4, 1)    
                this.lightSourceMap[sprite.id] = newLightSource
            }

            sprite.onDestroyed(function() {
                removeLightSource(sprite)      
            })
        }
    } 

    //%block
    export function toggleLighting(on:boolean) {
        if (on) {
            MultiLightScreenEffect.getInstance().startScreenEffect()
        } else {
            MultiLightScreenEffect.getInstance().stopScreenEffect()
        }

    }

    //%block
    //%blockid=multiplightBandWidthOfSprite block="set %sprite=variables_get(mySprite) light band width to %bandWidth"
    //%bandWidth.defl=4
    export function bandWidthOf(sprite:Sprite, bandWidth:number) {
        MultiLightScreenEffect.getInstance().bandWidthOfSprite(sprite, bandWidth)
    }

    //%block
    //%blockid=multiplightRemoveLishtSource block="remove light source of %sprite=variables_get(mySprite) "
       export function removeLightSource(sprite:Sprite) {
        MultiLightScreenEffect.getInstance().removeLightSource(sprite)
    }


    //%block
    //%blockid=multiplightAddLishtSource block="add light source of %sprite=variables_get(mySprite) || with band width of %bandWidth "
    //%bandWidth.defl=4
    export function addLightSource(sprite:Sprite,bandWidth:number=4) {
        MultiLightScreenEffect.getInstance().addLightSource(sprite, bandWidth)
    }

    export function addFlashLightSource(sprite:Sprite, bandWidth:number, direction:number, lightRange:number, angleRange:number) {
        MultiLightScreenEffect.getInstance().addFlashLightSource(sprite, bandWidth, direction, lightRange, angleRange)
    }
    
}