const s = sprites.create(sprites.castle.princess2Front, SpriteKind.Player)
controller.moveSprite(s)
s.z = 10;
scene.cameraFollowSprite(s)

const testImages = [
    sprites.castle.skellyAttackFront1,
    sprites.castle.heroWalkFront1,
    sprites.builtin.cat0,
    sprites.builtin.hermitCrabAwaken3,
    sprites.space.spaceAsteroid0,
    sprites.dungeon.chestOpen,
    sprites.dungeon.floorDark0,
    sprites.dungeon.floorLight0,
    sprites.dungeon.greenInnerNorthEast,
    sprites.dungeon.purpleOuterNorthWest
]

scene.setBackgroundColor(Math.randomRange(2, 14))

for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
        const temp = sprites.create(testImages[Math.randomRange(0, testImages.length - 1)], SpriteKind.Enemy);
        temp.left = 10 + ((screen.width - 20) / 5) * x
        temp.top = 10 + ((screen.height - 20) / 5) * y

        if (y == 4) {
            multilights.addLightSource(temp, 4)
            // temp.vx = randint(-20,20)
            // temp.vy = randint(-20,20)
        }
    }
}



// lantern.startLanternEffect(s)
// lantern.setBreathingEnabled(false);
// lantern.setLightBandWidth(20)
multilights.addLightSource(s, 10)
multilights.toggleLighting(true)