import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js"

import { makeLevel1 } from "./level1.js";
import { makeLevel2 } from "./level2.js";
import {makeControls, updateControls} from "./controls.js"

const clock = new THREE.Clock()


// Camera set up
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0,1.7,8.5);


// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Create Scene object
// const {scene, objects} = makeLevel1(camera);
const {scene, objects} = makeLevel2(camera, renderer);


// Create controls object
const controls = makeControls(camera);
scene.add(controls.object);


animate(renderer, scene, camera);


function animate(renderer, scene, camera) {
    function loop() {
        requestAnimationFrame(loop);
        updateControls(clock.getDelta(), controls, objects, camera)
        renderer.render(scene, camera);
    }
    loop();
}