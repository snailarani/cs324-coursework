import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import * as Env from './environment.js';
import { loadObject, makeMaterial } from './utils.js';


const roomSize = 18;
const roomHeight = 4;
const wallThickness = 0.2;
const corridorleft = -3;

//TODO: fix weird texture stretching on walls with doorways
//TODO: randomise crate textures 
//TODO: add particles to flames
//TODO: refactor code
//TODO: Add sound for walking

export function makeLevel1(){
    //set up camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0,1.7,roomSize/2-1);


    //set up scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x79aaf7);


    //lights
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05)
    scene.add(ambientLight)

    //player light
    const torch = new THREE.SpotLight(0xffaa33); 
    torch.castShadow = true;
    torch.angle = Math.PI / 7;
    torch.intensity = 3;
    torch.decay = 1;
    torch.penumbra = 0.35;
    camera.add(torch);
    torch.position.set(0, -0.15, -0.15);

    const torchTarget = new THREE.Object3D();
    torchTarget.position.set(0, -0.15, -1);

    camera.add(torchTarget);
    torch.target = torchTarget;


    const objects = [];
    //floor
    const floorMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipfloorcol.jpg',
        roughnessSrc: 'assets/textures/shipfloorrough.jpg',
        normalSrc: 'assets/textures/shipfloornorm.jpg',
        repeat: [5,5],
    })

    const floor = Env.makeFloor(0, roomSize, roomSize, floorMaterial);
    scene.add(floor);
    objects.push(floor);


    //walls/boundaries
    const wallMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipwallcol.jpg',
        roughnessSrc: 'assets/textures/shipwallrough.jpg',
        normalSrc: 'assets/textures/shipwallnorm.jpg',
        repeat: [2,0.5],
    })

    const leftWall = Env.makeWall(new THREE.Vector3(-roomSize/2, roomHeight/2, 0), wallThickness, roomHeight, roomSize, wallMaterial);
    const rightWall = Env.makeWall(new THREE.Vector3(roomSize/2, roomHeight/2, 0), wallThickness, roomHeight, roomSize, wallMaterial);

    const frontWall = Env.makeWall(new THREE.Vector3(0, roomHeight/2, -roomSize/2), wallThickness, roomHeight, roomSize, wallMaterial);
    frontWall.rotateY( - Math.PI / 2 );

    const backWall = Env.makeWall(new THREE.Vector3(0, roomHeight/2, roomSize/2), wallThickness, roomHeight, roomSize, wallMaterial);
    backWall.rotateY( - Math.PI / 2 );
    
    scene.add(leftWall);
    scene.add(rightWall);
    scene.add(frontWall);
    scene.add(backWall);

    objects.push(leftWall);
    objects.push(rightWall);
    objects.push(frontWall);
    objects.push(backWall);


    //roof
    const roofMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipwallcol.jpg',
        roughnessSrc: 'assets/textures/shipwallrough.jpg',
        normalSrc: 'assets/textures/shipwallnorm.jpg',
        repeat: [5,5],
    })

    const roof = Env.makeWall(new THREE.Vector3(0, roomHeight, 0), wallThickness, roomSize, roomSize, roofMaterial);
    roof.rotateZ( - Math.PI / 2 );
    scene.add(roof);
    objects.push(roof);


    //asset loading 
    loadModels(scene, objects);




    //other objects
    //inner walls
    const doorway1 = Env.makeWallWithDoorway(new THREE.Vector3(corridorleft, roomHeight/2, roomSize/3), roomSize/3, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway1.rotateY( - Math.PI / 2 );
    scene.add(doorway1);
    objects.push(doorway1);

    const doorway2 = Env.makeWallWithDoorway(new THREE.Vector3(corridorleft, roomHeight/2, 0), roomSize/3, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway2.rotateY( - Math.PI / 2 );
    scene.add(doorway2);
    objects.push(doorway2);

    const doorway3 = Env.makeWallWithDoorway(new THREE.Vector3(corridorleft, roomHeight/2, -roomSize/3), roomSize/3, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway3.rotateY( - Math.PI / 2 );
    scene.add(doorway3);
    objects.push(doorway3);


    const innerWall1 = Env.makeWall(new THREE.Vector3(corridorleft*2, roomHeight/2, roomSize/6), wallThickness, roomHeight, roomSize/3, wallMaterial);
    innerWall1.rotateY( - Math.PI / 2 );
    scene.add(innerWall1);
    objects.push(innerWall1);


    const innerWall2 = Env.makeWall(new THREE.Vector3(corridorleft*2, roomHeight/2,-roomSize/6), roomSize/3, roomHeight, wallThickness, wallMaterial);
    scene.add(innerWall2);
    objects.push(innerWall2);  


    const doorway4 = Env.makeWallWithDoorway(new THREE.Vector3(-corridorleft, roomHeight/2, 0), roomSize, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway4.rotateY( - Math.PI / 2 );
    scene.add(doorway4);
    objects.push(doorway4);

    const doorway5 = Env.makeWallWithDoorway(new THREE.Vector3(-corridorleft*2, roomHeight/2, -5), roomSize/3, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    scene.add(doorway5);
    objects.push(doorway5);

        //Crates
    const crateMaterial1 = makeMaterial({
        textureSrc: 'assets/textures/crate1col.jpg',
        roughnessSrc: 'assets/textures/crate1rough.jpg',
        normalSrc: 'assets/textures/crate1norm.jpg',
        roughness: 0.7,
        repeat: [1,1],
    })

    const crateMaterial2 = makeMaterial({
        textureSrc: 'assets/textures/crate2col.jpg',
        roughnessSrc: 'assets/textures/crate2rough.jpg',
        normalSrc: 'assets/textures/crate2norm.jpg',
        roughness: 0.7,
        repeat: [1,1],
    })

    //room 1
    const crateStack1 = Env.makeCrateStack(new THREE.Vector3(-roomSize/2+1,0,roomSize/2-1), 1.3, [crateMaterial1, crateMaterial2]);
    scene.add(crateStack1);
    objects.push(crateStack1);

    const bigCrate1 = Env.makeBigCrate(new THREE.Vector3(-roomSize/3+1.5,0,roomSize/3-2), crateMaterial1);
    bigCrate1.rotateY(Math.PI/2);
    scene.add(bigCrate1);
    objects.push(bigCrate1);


    //room 2
    const crateStack2 = Env.makeCrateStack(new THREE.Vector3(-roomSize/2+2,0,0), 1, [crateMaterial1, crateMaterial2]);
    crateStack2.rotateY(Math.PI/4);
    scene.add(crateStack2);
    objects.push(crateStack2);

    const bigCrate2 = Env.makeBigCrate(new THREE.Vector3(-roomSize/6-2,0,roomSize/6-1), crateMaterial1);
    bigCrate2.rotateY(Math.PI/2);
    scene.add(bigCrate2);
    objects.push(bigCrate2);

    const boxCrate2 = Env.makeBoxCrate(new THREE.Vector3(-roomSize/3+2,0,-roomSize/6+1), 1.2, crateMaterial2);
    scene.add(boxCrate2);
    objects.push(boxCrate2);


    //room 3
    const crateStack3 = Env.makeCrateStack(new THREE.Vector3(-roomSize/2+1.5,0,-roomSize/2+1.5), 1.2, [crateMaterial1, crateMaterial2]);
    crateStack3.rotateY(-Math.PI/2);
    scene.add(crateStack3);
    objects.push(crateStack3);

    const crateStack4 = Env.makeCrateStack(new THREE.Vector3(-roomSize/6-2.5,0,-roomSize/6-0.5), 0.8, [crateMaterial1, crateMaterial2]);
    scene.add(crateStack4);
    objects.push(crateStack4);

    const boxCrate3 = Env.makeBoxCrate(new THREE.Vector3(-roomSize/6-0.5,0,-roomSize/6-0.5), 0.7, crateMaterial2);
    scene.add(boxCrate3);
    objects.push(boxCrate3);

    //room4
    const crateStack5 = Env.makeCrateStack(new THREE.Vector3(roomSize/6+1,0,-4), 1, [crateMaterial1, crateMaterial2]);
    crateStack5.rotateY(-Math.PI/2);
    scene.add(crateStack5);
    objects.push(crateStack5);

    const bigCrate3 = Env.makeBigCrate(new THREE.Vector3(roomSize/2-1,0,0), crateMaterial1);
    scene.add(bigCrate3);
    objects.push(bigCrate3);

    const boxCrate4 = Env.makeBoxCrate(new THREE.Vector3(roomSize/2-1,0,2), 1.1, crateMaterial1);
    scene.add(boxCrate4);
    objects.push(boxCrate4);

    //corridor
    const boxCrate5 = Env.makeBoxCrate(new THREE.Vector3(roomSize/6-1.5 ,0,roomSize/2-1.5), 1.6, crateMaterial1);
    scene.add(boxCrate5);
    objects.push(boxCrate5);

    const bigCrate4 = Env.makeBigCrate(new THREE.Vector3(-roomSize/6+1,0,roomSize/6), crateMaterial1);
    scene.add(bigCrate4);
    objects.push(bigCrate4);

    const crateStack6 = Env.makeCrateStack(new THREE.Vector3(roomSize/6-1,0,-roomSize/6), 1, [crateMaterial1, crateMaterial2]);
    crateStack6.rotateY(Math.PI)
    scene.add(crateStack6);
    objects.push(crateStack6);

    //torches    
    const torch1 = Env.createTorch(roomSize/2-wallThickness, 2, 0, 0); // left wall
    scene.add(torch1);

    const torch2 = Env.createTorch(roomSize/3, 2, -roomSize/2+wallThickness, Math.PI/2); // left wall
    scene.add(torch2);

    //center pole
    const poleGeometry = new THREE.CylinderGeometry(1, 1, roomHeight, 16);
    const pole = new THREE.Mesh(poleGeometry, wallMaterial);
    pole.position.set(0, roomHeight/2, 0);
    pole.castShadow = true;
    pole.receiveShadow = true;
    scene.add(pole);
    objects.push(pole);


    //animation







    //game logic

    


    

    // //Audio
    // //TODO: move later?
    // const listener = new THREE.AudioListener();
    // camera.add( listener );
    
    // // load a sound and set it as the Audio object's buffer
    // const audioLoader = new THREE.AudioLoader();

    // const storm = new THREE.Audio( listener );
    // audioLoader.load( 'assets/audio/waves.mp3', function( buffer ) {
    //     storm.setBuffer(buffer);
    //     storm.setLoop(true);
    //     storm.setVolume(0.2);
    //     storm.play();
    // });
    
    // const waves = new THREE.Audio( listener );
    // audioLoader.load( 'assets/audio/storm.mp3', function( buffer ) {
    //     waves.setBuffer(buffer);
    //     waves.setLoop(true);
    //     waves.setVolume(0.5);
    //     waves.play();
    // });

    
    // scene.add(new THREE.AxesHelper(5));      // X red, Y green, Z blue
    // scene.add(new THREE.GridHelper(roomSize, roomSize)); // grid on the ground
    return {scene, objects, camera};

}



async function loadModels(scene, objects){
    const bed = await loadObject('./assets/models/bed/bed.obj', './assets/models/bed/bed.mtl', new THREE.Vector3(roomSize/3+1,0,roomSize/2-2.5), Math.PI, 0.045)
    scene.add(bed)
    objects.push(bed)

    const barrel1 = await loadObject('./assets/models/barrel/barrel.obj', './assets/models/barrel/barrel.mtl', new THREE.Vector3(roomSize/6+0.8,0,3), Math.PI/2, 0.01)
    scene.add(barrel1)
    objects.push(barrel1)

    const barrel2 = await loadObject('./assets/models/barrel/barrel.obj', './assets/models/barrel/barrel.mtl', new THREE.Vector3(roomSize/6+1,0,-6), Math.PI/2, 0.013)
    scene.add(barrel2)
    objects.push(barrel2)

    const barrel3 = await loadObject('./assets/models/barrel/barrel.obj', './assets/models/barrel/barrel.mtl', new THREE.Vector3(-roomSize/6-0.8,0,-roomSize/2+1), Math.PI, 0.011)
    scene.add(barrel3)
    objects.push(barrel3)

    const barrel4 = await loadObject('./assets/models/barrel/barrel.obj', './assets/models/barrel/barrel.mtl', new THREE.Vector3(roomSize/2-1,0,-roomSize/6), -Math.PI/2, 0.015)
    scene.add(barrel4)
    objects.push(barrel4)

    const chest1 = await loadObject('./assets/models/chest/chest.obj', './assets/models/chest/chest.mtl', new THREE.Vector3(-8,0,roomSize/6+1), 0, 0.5)
    scene.add(chest1)
    objects.push(chest1)

    const chest2 = await loadObject('./assets/models/chest/chest.obj', './assets/models/chest/chest.mtl', new THREE.Vector3(roomSize/3+2,0,roomSize/6+1), -Math.PI/2, 0.5)
    scene.add(chest2)
    objects.push(chest2)

    const chest3 = await loadObject('./assets/models/chest/chest.obj', './assets/models/chest/chest.mtl', new THREE.Vector3(roomSize/6-1,0,roomSize/4+1), -Math.PI/2, 0.5)
    scene.add(chest3)
    objects.push(chest3)

    const chest4 = await loadObject('./assets/models/chest/chest.obj', './assets/models/chest/chest.mtl', new THREE.Vector3(roomSize/3+1.5,0,-roomSize/2+2), -Math.PI/2, 0.7)
    scene.add(chest4)
    objects.push(chest4)
}