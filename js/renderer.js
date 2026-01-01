import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

export function makeRenderer(){
    // Renderer set up
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.body.appendChild(renderer.domElement);

    return renderer;
}

