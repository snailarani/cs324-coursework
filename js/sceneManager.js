import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

export function makeScene(){
    // Scene set up
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x202020);
    //TODO: add fog? for lvl 2

    //floor
    const floorGeometry = new THREE.PlaneGeometry(10,5);
    floorGeometry.rotateX( - Math.PI / 2 );
    const flooMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
    const floor = new THREE.Mesh( floorGeometry, flooMaterial );
    floor.position.set(0,-1)
    scene.add( floor );


    // cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);


    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);

    return scene;
}
