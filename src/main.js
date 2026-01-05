import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js"

import { loadLevel1 } from "./level1.js";
import { loadLevel2 } from "./level2.js";
import {makeControls, updateControls} from "./controls.js"
import { gameInit } from "./game.js";

const clock = new THREE.Clock()

var currentLevel=1

function animate(renderer, scene, camera, objects, controls, currentLevel, door, sky) {
    let animationId
    let hitDoor
    function loop() {
        animationId = requestAnimationFrame(loop);
        hitDoor = updateControls(clock.getDelta(), controls, objects, camera, currentLevel, door) //0 for level 2
        renderer.render(scene, camera);
        if(sky!=null){
            sky.position.copy(camera.position)
        }
        if (hitDoor) {
            // Player walked into the active door - transition to next level
            cancelAnimationFrame(animationId);
            transitionToNextLevel(renderer, scene, camera);
            return;
        }
    }
    loop();
}


function transitionToNextLevel(renderer, scene, camera) {
    // Clear the current scene
    while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
    }
    
    // Increment level
    currentLevel++;
    
    // Load next level
    main(renderer, scene, camera);
}


function main(){
    //Initialise Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //Initialise camera:
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    
    //Initialise scene
    const scene = new THREE.Scene();

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

        gameInit(10, door, currentLevel)

        animate(renderer, scene, camera, objects, controls, currentLevel, door);
    });
}

main();
