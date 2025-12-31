import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

export function makeCamera(){
    // Camera set up
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0,2,7);
    return camera;
}


