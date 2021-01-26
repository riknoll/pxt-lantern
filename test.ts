tiles.setTilemap(tilemap`级别1`)

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

// for (let x = 0; x < 5; x++) {
//     for (let y = 0; y < 5; y++) {
//         const temp = sprites.create(testImages[Math.randomRange(0, testImages.length - 1)], SpriteKind.Enemy);
//         temp.left = 10 + ((screen.width - 20) / 5) * x
//         temp.top = 10 + ((screen.height - 20) / 5) * y

//         if (y == 4) {
//             multilights.addLightSource(temp, 4)
//             temp.vx = randint(-20,20)
//             temp.vy = randint(-20,20)
//         }
//     }
// }
let flashlightLightSource = multilights.addFlashLightSource(s, 10, 0, 80, 20)
multilights.addLightSource(s, 5)
multilights.toggleLighting(true)

let lightEffectOn = true
let direction = 30
controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    // let flashlightSource = multilights.addFlashLightSource(s, 10, direction, 80, 20)
    
    flashlightLightSource.direction = flashlightLightSource.direction - 10
    
    // lightEffectOn = !lightEffectOn
    // multilights.toggleLighting(lightEffectOn)
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function() {
    // let flashlightSource = multilights.addFlashLightSource(s, 10, direction, 80, 20)
    
    flashlightLightSource.direction = flashlightLightSource.direction + 10
    
    // lightEffectOn = !lightEffectOn
    // multilights.toggleLighting(lightEffectOn)
})
// controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
//     let projectileSprite = sprites.createProjectileFromSprite(img`
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . 5 5 . . . . . . . .
//         . . . . . 5 2 2 5 . . . . . . .
//         . . . . 5 2 1 1 2 5 . . . . . .
//         . . . . 5 2 1 1 2 5 . . . . . .
//         . . . . . 5 2 2 5 . . . . . . .
//         . . . . . . 5 5 . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//     `, s, 50, 0)
//     multilights.addLightSource(projectileSprite, 4)
//     projectileSprite = sprites.createProjectileFromSprite(img`
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . 5 5 . . . . . . . .
//         . . . . . 5 2 2 5 . . . . . . .
//         . . . . 5 2 1 1 2 5 . . . . . .
//         . . . . 5 2 1 1 2 5 . . . . . .
//         . . . . . 5 2 2 5 . . . . . . .
//         . . . . . . 5 5 . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//     `, s, -50, 0)
//     multilights.addLightSource(projectileSprite, 4)
//     projectileSprite = sprites.createProjectileFromSprite(img`
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . 5 5 . . . . . . . .
//         . . . . . 5 2 2 5 . . . . . . .
//         . . . . 5 2 1 1 2 5 . . . . . .
//         . . . . 5 2 1 1 2 5 . . . . . .
//         . . . . . 5 2 2 5 . . . . . . .
//         . . . . . . 5 5 . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//     `, s, 0, 50)
//     multilights.addLightSource(projectileSprite, 4)
//     projectileSprite = sprites.createProjectileFromSprite(img`
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . 5 5 . . . . . . . .
//         . . . . . 5 2 2 5 . . . . . . .
//         . . . . 5 2 1 1 2 5 . . . . . .
//         . . . . 5 2 1 1 2 5 . . . . . .
//         . . . . . 5 2 2 5 . . . . . . .
//         . . . . . . 5 5 . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//         . . . . . . . . . . . . . . . .
//     `, s, 0, -50)
//     multilights.addLightSource(projectileSprite, 4)
// })