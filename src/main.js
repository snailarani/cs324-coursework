import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js"

import { loadLevel1 } from "./level1.js";
import { makeLevel2 } from "./level2.js";
import {makeControls, updateControls} from "./controls.js"

const clock = new THREE.Clock()

// Camera set up
// const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
// );
// camera.position.set(0,1.7,0);


// Create renderer
// const renderer = new THREE.WebGLRenderer();
// renderer.shadowMap.enabled = true;

// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement); 

// const sky = null;

// // const {scene, objects, camera} = makeLevel1();
// const {scene, objects, camera} = makeLevel2();


// // Create controls object
// const controls = makeControls(camera);
// scene.add(controls.object);


// animate(renderer, scene, camera, sky);


function animate(renderer, scene, camera, controls, objects, sky) {
    function loop() {
        requestAnimationFrame(loop);
        updateControls(clock.getDelta(), controls, objects, camera, 23, 1)
        renderer.render(scene, camera);
        if(sky!=null){
            sky.position.copy(camera.position)
        }
    }
    loop();
}

var currentLevel;
function init(){
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

    //add controls
    const controls = makeControls(camera)
    scene.add(controls.object)

    //load level
    loadLevel1(scene, camera).then(function (objects) {
        // Once loaded, start the game
        animate(renderer, scene, camera, controls, objects);
    });

    // animate(renderer, scene, camera, controls, objects)

}

// function init(){
//     console.log("Init started");
    
//     const renderer = new THREE.WebGLRenderer();
//     renderer.shadowMap.enabled = true;
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     document.body.appendChild(renderer.domElement);

//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     const scene = new THREE.Scene();

//     const controls = makeControls(camera);
//     scene.add(controls.object);

//     console.log("Loading level...");
    
//     loadLevel1(scene, camera).then(function (objects) {
//         console.log("Level loaded, objects:", objects);
//         console.log("Starting animate...");
//         animate(renderer, scene, camera, controls, objects, null);
//     }).catch(error => {
//         console.error("Level loading failed:", error);
//     });
// }

init();