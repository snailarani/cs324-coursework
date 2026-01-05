import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js"

import { loadLevel1 } from "./level1.js";
import { loadLevel2 } from "./level2.js";
import {makeControls, updatePosition, checkDoorCollision, removeControls} from "./controls.js"
import { gameInit, isLevelComplete } from "./game.js";
import { stopWalkAudio, stopBgAudio } from "./sounds.js";

const clock = new THREE.Clock()
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var currentLevel = 1
let gameComplete = false;

//Initialise camera:
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

//Initialise scene
const scene = new THREE.Scene();

main(renderer, scene, camera, currentLevel)



function animate(renderer, scene, camera, objects, controls, currentLevel, door) {
    let animationId
    let hitDoor = false
    function loop() {
        animationId = requestAnimationFrame(loop);
        updatePosition(clock.getDelta(), controls, objects, camera, currentLevel, door) //0 for level 2

        if(isLevelComplete()){
            hitDoor = checkDoorCollision()
        }

        renderer.render(scene, camera);

        if (hitDoor) {
            // Player walked into the active door - transition to next level
            cancelAnimationFrame(animationId);
            levelTransition(renderer, scene, camera, controls);
            return;
        }
    }
    loop();
}

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

function clearScene(scene){
    //clear scene
    while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
        console.log("Cleared Scene")
    }
}

function clearCamera(camera){
    //clear camera
    while(camera.children.length > 0) { 
        camera.remove(camera.children[0]); 
        console.log("Cleared camera")
    }
}


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
        // add controls
        const controls = makeControls(camera, scene, currentLevel)
        scene.add(controls.object)

        if (currentLevel==2){
            controls.lock()
        }

        gameInit(door, currentLevel)

        animate(renderer, scene, camera, objects, controls, currentLevel, door);
    });
}

export function isGameComplete(){
    return gameComplete
}

function completeGame(controls){
    gameComplete = true;
    controls.unlock()
    document.getElementById('blocker').style.display = 'none'
    document.getElementById('instructions').style.display = 'none'
    document.getElementById('overlay').style.display = 'none'
    document.getElementById('game-complete').style.display = 'flex'
}
