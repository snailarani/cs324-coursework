// import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
// import * as Env from './environment.js';
// import { makeMaterial } from './utils.js';

// // TODO: makescene function takes background texture, light, and objects to add as parameters


// export function makeScene(){
//     // Scene set up
//     const scene = new THREE.Scene();
//     const objects = [];

//     scene.background = new THREE.Color(0x79aaf7);
//     //TODO: add fog? for lvl 2

//     //floor
//     const floorMaterial = makeMaterial({
//         textureSrc: 'assets/textures/shipfloorcol.jpg',
//         roughnessScr: 'assets/textures/shipfloorrough.jpg',
//         normalScr: 'assets/textures/shipfloornorm.jpg',
//         repeat: [5,5],
//     })

//     const floor = Env.makeFloor(0, 20, 20, floorMaterial);
//     scene.add(floor);
//     objects.push(floor);


//     // walls
//     const wallMaterial = makeMaterial({
//         textureSrc: 'assets/textures/shipwallcol.jpg',
//         roughnessScr: 'assets/textures/shipwallrough.jpg',
//         normalScr: 'assets/textures/shipwallnorm.jpg',
//         repeat: [2,0.5],
//     })

//     const leftWall = Env.makeWall(new THREE.Vector3(-10, 2.5, 0), 0.2, 5, 20, wallMaterial);
//     const rightWall = Env.makeWall(new THREE.Vector3(10, 2.5, 0), 0.2, 5, 20, wallMaterial);

//     const frontWall = Env.makeWall(new THREE.Vector3(0, 2.5, -10), 0.2, 5, 20, wallMaterial);
//     frontWall.rotateY( - Math.PI / 2 );
    
//     const backWall = Env.makeWall(new THREE.Vector3(0, 2.5, 10), 0.2, 5, 20, wallMaterial);
//     backWall.rotateY( - Math.PI / 2 );
    
//     scene.add(leftWall);
//     scene.add(rightWall);
//     scene.add(frontWall);
//     scene.add(backWall);

//     objects.push(leftWall);
//     objects.push(rightWall);
//     objects.push(frontWall);
//     objects.push(backWall);


//     //roof
//     const roofMaterial = makeMaterial({
//         textureSrc: 'assets/textures/shipwallcol.jpg',
//         roughnessScr: 'assets/textures/shipwallrough.jpg',
//         normalScr: 'assets/textures/shipwallnorm.jpg',
//         repeat: [5,5],
//     })

//     const roof = Env.makeWall(new THREE.Vector3(0, 2.5, 0), 0.2, 20, 20, roofMaterial);
//     roof.rotateZ( - Math.PI / 2 );
//     scene.add(roof);
//     objects.push(roof);


//     //inner walls


//     // // crates
//     // const crateTexture =  new THREE.TextureLoader().load('assets/crate1.jpg')
//     // const crateMaterial = new THREE.MeshPhongMaterial()
//     // crateMaterial.map = crateTexture

//     // const crate = Env.makeCrate(new THREE.Vector3(0,0.0,0), 1.5, 1.5, 1.5, crateMaterial);
//     // scene.add(crate);
//     // objects.push(crate);

//     // Light

//     // Ambient light
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
//     scene.add(ambientLight)

    
//     // const light = new THREE.DirectionalLight(0xffffff, 1);
//     // light.position.set(-8, 4, 0);
//     // light.castShadow = true;
//     // scene.add(light);

//     scene.add(new THREE.AxesHelper(5));      // X red, Y green, Z blue
//     scene.add(new THREE.GridHelper(20, 20)); // grid on the ground

//     return {scene, objects};
// }


