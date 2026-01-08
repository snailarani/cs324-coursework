import * as THREE from 'three'
import { loadLevel1 } from "./level1.js";
import { loadLevel2 } from "./level2.js";
import {makeControls, updatePosition, checkDoorCollision, removeControls} from "./controls.js"
import { gameInit, isLevelComplete } from "./gameLogic.js";
import { stopWalkAudio, stopBgAudio } from "./sounds.js";

const clock = new THREE.Clock()

//initialise game variables
var currentLevel = 1
let gameComplete = false;

//initialise renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//initialise camera:
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

//initialise scene
const scene = new THREE.Scene();

main(renderer, scene, camera, currentLevel)


/*  
    Main entry point for the game. Loads level enviroment, initialises controls
    and handles game loop
*/
function main(renderer, scene, camera, currentLevel){
    //load environment based on level
    let loadLevel;
    if (currentLevel == 1){
        loadLevel = loadLevel1
    }
    else{
        loadLevel = loadLevel2
    }

    //load level
    loadLevel(scene, camera).then(function ({objects, door}) {
        renderer.compile(scene, camera);

        // Render a few frames to warm up
        for(let i = 0; i < 10; i++) {
            renderer.render(scene, camera);
        }

        // Once loaded, add controls and begin
        const controls = makeControls(camera, scene, currentLevel)
        scene.add(controls.object)

        // automatically unlock controls for level 2
        if (currentLevel==2){
            controls.lock()
        }

        // initialise game logic (initialise key counters)
        gameInit(door, currentLevel)

        animate(renderer, scene, camera, objects, controls, currentLevel);
    });
}

/*  
    Handles animation/game loop. Updates player position every frame, and checks for interaction
    with the door on level completion to trigger level transisition
*/
function animate(renderer, scene, camera, objects, controls, currentLevel) {
    let animationId
    let hitDoor = false

    function loop() {
        animationId = requestAnimationFrame(loop);
        updatePosition(clock.getDelta(), controls, objects, camera, currentLevel) 

        const levelComplete = isLevelComplete()

        // if the level is complete, check is user walks into door
        if(levelComplete){
            hitDoor = checkDoorCollision()
        }

        renderer.render(scene, camera);

        if (levelComplete && hitDoor) {
            // Player walked into the active door - transition to next level
            cancelAnimationFrame(animationId);
            levelTransition(renderer, scene, camera, controls);
            return;
        }
    }
    loop();
}

/*  
    Handles transitions to the next level. Clears the current scene, camera, resets controls,
    before calling main to load in the next level
*/
function levelTransition(renderer, scene, camera, controls){

    removeControls(controls)

    clearScene(scene)
    clearCamera(camera)

    //stop sounds
    stopWalkAudio()
    stopBgAudio()

    //increment level
    currentLevel++

    if (currentLevel > 2){
        completeGame(controls)
        return
    }

    //load next level
    main(renderer, scene, camera, currentLevel)
}

/*  
    Clears all objects within the current scene
*/
function clearScene(scene){
    //clear scene
    while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
    }
}

/*  
    Clears all objects attached to the camera (including sounds and player torch for 
    level 1)
*/
function clearCamera(camera){
    //clear camera
    while(camera.children.length > 0) { 
        camera.remove(camera.children[0]); 
    }
}

/*  
    Displays game-completion screen
*/
function completeGame(controls){
    gameComplete = true;
    controls.unlock()
    document.getElementById('blocker').style.display = 'none'
    document.getElementById('instructions').style.display = 'none'
    document.getElementById('overlay').style.display = 'none'
    document.getElementById('game-complete').style.display = 'flex'
}


export function isGameComplete(){
    return gameComplete
}
