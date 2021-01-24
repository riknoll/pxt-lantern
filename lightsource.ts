// Add your code here
namespace lightsource {

    export interface LightSource {
        apply(lightMap:Image) :void
        setBandWidth(bandWidth:number):void
    }

    function changeRowLightLevel(lightMap:Image, x:number, y:number, width:number, lightLevel:number) {
        for(let x0 = x ; x0 < width + x; x0++) {
            let currentLightLevel = lightMap.getPixel(x0, y)
            lightMap.setPixel(x0, y, Math.min(lightLevel, currentLightLevel))
        }
    }

    function degreeToRadius(degree:number) :number {
        return degree / 180 * Math.PI
    }

    export class FlashlightLightSource implements LightSource {
        private sprite:Sprite;
        private bandWidth:number;
        private direction:number;
        offsetTable: Buffer;

        private width:number;
        private height:number;

        setBandWidth(bandWidth:number) : void {
            this.bandWidth = bandWidth
        }

         prepareOffset() {
            const halfh = this.lightRange;
            this.offsetTable = pins.createBuffer(halfh);

            // Approach is roughly based on https://hackernoon.com/pico-8-lighting-part-1-thin-dark-line-8ea15d21fed7
            let x: number;
            let y2: number;
            for (let y = 0; y < halfh; y++) {
                // Store the offsets where the bands switch light levels for each row. We only need to
                // do one quadrant which we can mirror in x/

                // defering angle consideration to actual applying light map
                // may introduce wall-blocking in the future, caculation may require sprite position and tilemap
                x = Math.sqrt(Math.pow(this.lightRange, 2) - Math.pow(y, 2)) | 0;
                this.offsetTable[y] = x;
            }

            this.width = halfh;
            this.height = halfh;
        }

         constructor(sprite:Sprite, bandWidth:number,  direction:number, private lightRange:number, private angleRange:number){
            this.sprite = sprite
            this.bandWidth = bandWidth
            this.direction = direction

            this.prepareOffset()
        }                        

        

        apply(lightMap:Image) {
            const camera = game.currentScene().camera;
            const halfh = this.width;
            const cx = this.sprite.x - camera.drawOffsetX;
            const cy = this.sprite.y - camera.drawOffsetY;

            let prev: number;
            let x0 :number;
            let x1 :number;
            let x2 :number;
            let x3 :number;
            let offset: number;


            // Go over each row and light the colors
            for (let y = -halfh; y < halfh; y++) {
                offset = this.offsetTable[Math.abs(y)]
                x0 = -offset

                if (y == -2) {
                    console.log(1111)
                }
                // angle caculation
                if (y > Math.tan(degreeToRadius(this.direction - this.angleRange)) * x0) {
                    x0 =  y / Math.tan(degreeToRadius(this.direction - this.angleRange))              
                } else if (y < Math.tan(degreeToRadius(this.direction + this.angleRange)) * x0) {
                    x0 =  y / Math.tan(degreeToRadius(this.direction + this.angleRange))  
                }
                if (Math.atan2(y, offset) < degreeToRadius(this.direction - this.angleRange)) {
                    offset =  y / Math.tan(degreeToRadius(this.direction - this.angleRange))              
                } else if (Math.atan2(y, offset) > degreeToRadius(this.direction + this.angleRange)) {
                    offset =  y / Math.tan(degreeToRadius(this.direction + this.angleRange))
                }

                // Darken each concentric circle by remapping the colors
                if (offset - x0 > 0) {
                    offset += (Math.idiv(Math.randomRange(0, 11), 5))
                    x0 -= (Math.idiv(Math.randomRange(0, 11), 5))
                }

                // We reflect the circle-quadrant horizontally and vertically
                // no diffraction == no offset
                // changeRowLightLevel(lightMap, cx + offset, cy + y + 1, prev - offset,1)
                // changeRowLightLevel(lightMap, cx - prev, cy + y + 1, prev - offset,1) 
                // changeRowLightLevel(lightMap, cx + offset, cy - y, prev - offset,1)
                // changeRowLightLevel(lightMap, cx - prev, cy - y, prev - offset,1)

                if (y == -2) {
                    console.log("-2-2-2-2-2 degreeToRadius(this.direction + this.angleRange)=" + degreeToRadius(this.direction + this.angleRange) + "Math.atan2(y, x0)=" + Math.atan2(y, x0) + ",x0=" + x0 + ", offset=" + offset)
                }
                if (y == 2) {
                    console.log("2222222222 degreeToRadius(this.direction + this.angleRange)=" + degreeToRadius(this.direction + this.angleRange) + "Math.atan2(y, x0)=" + Math.atan2(y, x0) + ",x0=" + x0 + ", offset=" + offset)
                }

                changeRowLightLevel(lightMap, cx + x0, cy + y, Math.abs(x0 - offset),0)
                // changeRowLightLevel(lightMap, cx + x1, cy + y, Math.abs(offset - x1),0)
                // changeRowLightLevel(lightMap, cx-offset, cy + y + 1, Math.abs(offset - x0),0)
                
            }
        }
        
    }

    export class CircleLightSource implements LightSource {
        private sprite:Sprite
        offsetTable: Buffer;
        
        private bandWidth:number
        private width:number
        private height:number

        setBandWidth(bandWidth:number) {
            this.bandWidth = bandWidth
            this.prepareOffset()
        }

        getBandWidth():number {
            return this.bandWidth 
        }

        prepareOffset() {
            const halfh = this.centerRadius + this.rings * this.bandWidth;
            this.offsetTable = pins.createBuffer((this.rings + 1) * halfh);

            // Approach is roughly based on https://hackernoon.com/pico-8-lighting-part-1-thin-dark-line-8ea15d21fed7
            let x: number;
            let band: number;
            let y2: number;
            for (let y = 0; y < halfh; y++) {
                y2 = Math.pow(y, 2);
                // Store the offsets where the bands switch light levels for each row. We only need to
                // do one quadrant which we can mirror in x/y
                for (band = 0; band < this.rings; band++) {
                    x = Math.sqrt(Math.pow(this.centerRadius + this.bandWidth * (band + 1), 2) - y2) | 0;
                    this.offsetTable[y * this.rings + band] = x;
                }
            }

            this.width = halfh;
            this.height = halfh;
        }

        constructor(sprite:Sprite, bandWidth:number, public rings: number, public centerRadius: number ){
            this.sprite = sprite
            this.bandWidth = bandWidth

            this.prepareOffset()
        }

        apply(lightMap:Image) {
            const camera = game.currentScene().camera;
            const halfh = this.width;
            const cx = this.sprite.x - camera.drawOffsetX;
            const cy = this.sprite.y - camera.drawOffsetY;

            let prev: number;
            let offset: number;
            let band: number;

            // Go over each row and light the colors
            for (let y = 0; y < halfh; y++) {
                band = this.rings;
                prev = 0;
                offset = this.offsetTable[y * this.rings + band - 1]

                // Darken each concentric circle by remapping the colors
                while (band > 0) {
                    offset = this.offsetTable[y * this.rings + band - 1]
                    if (offset) {
                        offset += (Math.idiv(Math.randomRange(0, 11), 5))
                    }

                    // We reflect the circle-quadrant horizontally and vertically
                    changeRowLightLevel(lightMap, cx + offset, cy + y + 1, prev - offset,band)
                    changeRowLightLevel(lightMap, cx - prev, cy + y + 1, prev - offset,band) 
                    changeRowLightLevel(lightMap, cx + offset, cy - y, prev - offset,band)
                    changeRowLightLevel(lightMap, cx - prev, cy - y, prev - offset,band)

                    if (band == 1) {
                        changeRowLightLevel(lightMap, cx, cy + y + 1, prev,0)
                        changeRowLightLevel(lightMap, cx-prev, cy + y + 1, prev,0)  
                        changeRowLightLevel(lightMap, cx, cy - y, prev,0)
                        changeRowLightLevel(lightMap, cx-prev, cy - y, prev,0)   
                    }

                    prev = offset;
                    band--;
                }
            }
        }
    }

}