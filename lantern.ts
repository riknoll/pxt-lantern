
//% icon="\uf185" color="#8f1fff"
namespace lantern {
    let bandPalettes: Buffer[];

    // The top row is just the palette, each row gets darker
    const palette_ramps = image.ofBuffer(hex`e4100400ffff0000d1cb0000a2ff0000b3fc0000e4fc000045ce000086fc000067c80000c8ff000069c80000bafc0000cbff0000fcff0000bdfc0000ceff0000ffff0000`);

    export interface LightAnchor {
        x: number;
        y: number;
    }

    export class LightSource {
        anchor: LightAnchor;
        offsetTable: Buffer;
        width: number;
        height: number;

        constructor(public rings: number, public bandWidth: number, public centerRadius: number) {
            const halfh = centerRadius + rings * bandWidth;
            this.offsetTable = pins.createBuffer((rings + 1) * halfh);

            // Approach is roughly based on https://hackernoon.com/pico-8-lighting-part-1-thin-dark-line-8ea15d21fed7
            let x: number;
            let band: number;
            let y2: number;
            for (let y = 0; y < halfh; y++) {
                y2 = Math.pow(y, 2);
                // Store the offsets where the bands switch light levels for each row. We only need to
                // do one quadrant which we can mirror in x/y
                for (band = 0; band < rings; band++) {
                    x = Math.sqrt(Math.pow(centerRadius + bandWidth * (band + 1), 2) - y2) | 0;
                    this.offsetTable[y * rings + band] = x;
                }
            }

            this.width = halfh;
            this.height = halfh;
        }

        apply() {
            const camera = game.currentScene().camera;
            const halfh = this.width;
            const cx = this.anchor.x - camera.drawOffsetX;
            const cy = this.anchor.y - camera.drawOffsetY;

            let prev: number;
            let offset: number;
            let band: number;

            // First, black out the completely dark areas of the screen
            screen.fillRect(0, 0, screen.width, cy - halfh + 1, 15)
            screen.fillRect(0, cy - halfh + 1, cx - halfh, halfh << 1, 15)
            screen.fillRect(cx + halfh, cy - halfh + 1, screen.width - cx - halfh + 1, halfh << 1, 15)
            screen.fillRect(0, cy + halfh, screen.width, screen.height - (cy + halfh) + 1, 15)

            // Go over each row and darken the colors
            for (let y = 0; y < halfh; y++) {
                band = this.rings;
                prev = 0;
                offset = this.offsetTable[y * this.rings + band - 1]

                // Black out the region outside the darkest light band
                screen.mapRect(cx - halfh, cy + y + 1, halfh - offset, 1, bandPalettes[bandPalettes.length - 1])
                screen.mapRect(cx - halfh, cy - y, halfh - offset, 1, bandPalettes[bandPalettes.length - 1])
                screen.mapRect(cx + offset, cy + y + 1, halfh - offset, 1, bandPalettes[bandPalettes.length - 1])
                screen.mapRect(cx + offset, cy - y, halfh - offset, 1, bandPalettes[bandPalettes.length - 1])

                // Darken each concentric circle by remapping the colors
                while (band > 0) {
                    offset = this.offsetTable[y * this.rings + band - 1]
                    if (offset) {
                        offset += (Math.idiv(Math.randomRange(0, 11), 5))
                    }

                    // We reflect the circle-quadrant horizontally and vertically
                    screen.mapRect(cx + offset, cy + y + 1, prev - offset, 1, bandPalettes[band - 1])
                    screen.mapRect(cx - prev, cy + y + 1, prev - offset, 1, bandPalettes[band - 1])
                    screen.mapRect(cx + offset, cy - y, prev - offset, 1, bandPalettes[band - 1])
                    screen.mapRect(cx - prev, cy - y, prev - offset, 1, bandPalettes[band - 1])

                    prev = offset;
                    band--;
                }
            }
        }
    }

    export class LanternEffect implements effects.BackgroundEffect {
        protected sources: LightSource[];
        protected static instance: LanternEffect;
        protected anchor: LightAnchor;
        protected init: boolean;
        protected running: boolean;
        protected breathing: boolean;

        public static getInstance() {
            if (!LanternEffect.instance) LanternEffect.instance = new LanternEffect();
            return LanternEffect.instance;
        }

        private constructor() {
            bandPalettes = [];
            for (let band = 0; band < 6; band++) {
                const buffer = pins.createBuffer(16);
                for (let i = 0; i < 16; i++) {
                    buffer[i] = palette_ramps.getPixel(i, band + 1);
                }
                bandPalettes.push(buffer);
            }

            this.setBandWidth(13);

            this.setAnchor({ x: screen.width >> 1, y: screen.height >> 1 });
            this.running = false;
            this.breathing = true;
        }

        startScreenEffect() {
            this.running = true;

            if (this.init) return;
            this.init = true;

            let index = 0;

            scene.createRenderable(91, () => {
                if (!this.running) return;
                this.sources[index].apply();
            })

            let up = true;

            game.onUpdateInterval(1000, () => {
                if (!this.running) return;
                if (!this.breathing) {
                    index = 1;
                    return;
                }
                if (up) index++;
                else index--;

                if (index < 0) {
                    index = 1;
                    up = true;
                }
                else if (index >= this.sources.length) {
                    index = this.sources.length - 2;
                    up = false;
                }
            })
        }

        stopScreenEffect() {
            this.running = false;
        }

        setAnchor(anchor: LightAnchor) {
            this.anchor = anchor;
            this.sources.forEach((value: LightSource, index: number) => {
                value.anchor = this.anchor;
            });
        }

        setBandWidth(width: number) {
            this.sources = [
                new LightSource(4, width - 1, 2),
                new LightSource(4, width, 1),
                new LightSource(4, width + 1, 2)
            ];

            this.setAnchor(this.anchor)
        }

        setBreathingEnabled(enabled: boolean) {
            this.breathing = enabled;
        }
    }

    //% block
    export function startLanternEffect(anchor: Sprite) {
        if (!anchor) {
            stopLanternEffect();
            return;
        }

        const effect = LanternEffect.getInstance();
        effect.setAnchor(anchor);
        effect.startScreenEffect();
    }

    //% block
    export function stopLanternEffect() {
        LanternEffect.getInstance().stopScreenEffect();
    }

    //% block
    export function setLightBandWidth(width: number) {
        LanternEffect.getInstance().setBandWidth(width);
    }

    //% block
    export function setBreathingEnabled(enabled: boolean) {
        LanternEffect.getInstance().setBreathingEnabled(enabled);
    }
}
