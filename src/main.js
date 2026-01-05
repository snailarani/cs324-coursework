import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js"

import { loadLevel1 } from "./level1.js";
import { loadLevel2 } from "./level2.js";
import {makeControls, updateControls} from "./controls.js"
import { gameInit } from "./game.js";
import { stopWalkAudio, stopBgAudio } from "./sounds.js";

const clock = new THREE.Clock()
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var currentLevel = 1

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
            levelTransition(renderer, scene, camera);
            return;
        }
    }
    loop();
}

function levelTransition(renderer, scene, camera){

    clearScene(scene)
    clearCamera(camera)

    //stop sounds
    stopWalkAudio()
    stopBgAudio()

    //increment level
    currentLevel++

    if (currentLevel > 2){
        gameComplete()
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

        gameInit(door, currentLevel)

        animate(renderer, scene, camera, objects, controls, currentLevel, door);
    });
}


function gameComplete(){
    document.getElementById('overlay').style.display = 'none'
    document.getElementById('game-complete').style.display = 'flex'
}




// function tempScene(renderer, scene, camera){
//     scene.background = new THREE.Color(0x87ceeb);
//     const floorGeometry = new THREE.PlaneGeometry(20, 20);
//     const floorMaterial = new THREE.MeshStandardMaterial({ 
//       color: 0x2d5016,
//       side: THREE.DoubleSide 
//     });
//     const floor = new THREE.Mesh(floorGeometry, floorMaterial);
//     floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
//     floor.position.y = 0;
//     scene.add(floor);

//     // Add a grid helper to visualize the floor better
//     const gridHelper = new THREE.GridHelper(20, 20, 0x000000, 0x3d6b1f);
//     scene.add(gridHelper);

//     // Lighting
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
//     directionalLight.position.set(5, 10, 5);
//     scene.add(directionalLight);

//     // Animation loop
//     function animate() {
//       requestAnimationFrame(animate);
//       renderer.render(scene, camera);
//     }
//     animate();
// }