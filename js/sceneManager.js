import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';




export function makeScene(){
    // Scene set up
    const scene = new THREE.Scene();
    const objects = [];

    scene.background = new THREE.Color(0x202020);
    //TODO: add fog? for lvl 2

    //floor
    const floorGeometry = new THREE.PlaneGeometry(20,20);
    floorGeometry.rotateX( - Math.PI / 2 );
    const flooMaterial = new THREE.MeshStandardMaterial( { color: 0x444444, side: THREE.DoubleSide } );
    const floor = new THREE.Mesh( floorGeometry, flooMaterial );
    // floor.position.set(0,-1)
    scene.add(floor);
    objects.push(floor);


    // cube
    const cubeGeometry = new THREE.BoxGeometry(1, 2, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 1, 0);
    scene.add(cube);
    objects.push(cube);


    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);

    return {scene, objects};
}
