import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import * as Env from './environment.js';
import { loadObject, loadAudio, makeMaterial } from './utils.js';

const roomSize = 18;
const roomHeight = 4;
const wallThickness = 0.2;
const objects = [];


export async function loadLevel1(scene, camera){
    const objects = [];
    const listener = new THREE.AudioListener();

    //camera, scene
    camera.position.set(0,1.7,roomSize/2-1);
    scene.background = new THREE.Color(0x79aaf7);

    //Lighting
    level1Lighting(scene, camera);

    //Environment
    level1Env(scene, objects)

    //sounds
    camera.add(listener);
    await loadSounds(listener)

    await loadExtModels(scene, objects)

    //Game Logic

    //Animate

    return objects
}


function level1Lighting(scene, camera){
    //ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.03)
    scene.add(ambientLight)

    //player torch
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

}

function level1Env(scene, objects){
    const envObjects =[];

    //floor
    const floorMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipfloorcol.jpg',
        roughnessSrc: 'assets/textures/shipfloorrough.jpg',
        normalSrc: 'assets/textures/shipfloornorm.jpg',
        repeat: [5,5],
    })
    const floor = Env.makeFloor(0, roomSize, floorMaterial);
    envObjects.push(floor);


    //roof
    const roofMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipwallcol.jpg',
        roughnessSrc: 'assets/textures/shipwallrough.jpg',
        normalSrc: 'assets/textures/shipwallnorm.jpg',
        repeat: [5,5],
    })
    const roof = Env.makeWall(new THREE.Vector3(0, roomHeight, 0), wallThickness, roomSize, roomSize, roofMaterial);
    roof.rotateZ( - Math.PI / 2 );
    envObjects.push(roof);


    //outer walls (boundaries)
    const wallMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipwallcol.jpg',
        roughnessSrc: 'assets/textures/shipwallrough.jpg',
        normalSrc: 'assets/textures/shipwallnorm.jpg',
        repeat: [2,0.5],
    })
    
    const leftWall = Env.makeWall(new THREE.Vector3(-roomSize/2, roomHeight/2, 0), wallThickness, roomHeight, roomSize, wallMaterial);
    
    const rightWall = leftWall.clone()
    rightWall.position.set(roomSize/2, roomHeight/2, 0)
    
    const backWall = leftWall.clone()
    backWall.position.set(0, roomHeight/2, -roomSize/2)
    backWall.rotateY(- Math.PI / 2)
    
    const frontWall = leftWall.clone()
    frontWall.position.set(0, roomHeight/2, roomSize/2)
    frontWall.rotateY(- Math.PI / 2)

    envObjects.push(leftWall);
    envObjects.push(rightWall);
    envObjects.push(frontWall);
    envObjects.push(backWall);


    //inner walls
    const doorway1 = Env.makeWallWithDoorway(new THREE.Vector3(-roomSize/6, roomHeight/2, roomSize/3), roomSize/3, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway1.rotateY(- Math.PI / 2);

    const doorway2 = doorway1.clone()
    doorway2.position.set(-roomSize/6, roomHeight/2, 0)

    const doorway3 = doorway1.clone()
    doorway3.position.set(-roomSize/6, roomHeight/2, -roomSize/3)

    const doorway4 = Env.makeWallWithDoorway(new THREE.Vector3(roomSize/3, roomHeight/2, 0), roomSize, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway4.rotateY( - Math.PI / 2 );
    doorway4.position.set(roomSize/6, roomHeight/2, 0)

    const doorway5 = doorway1.clone()
    doorway5.position.set(roomSize/6*2, roomHeight/2, -5)
    doorway5.rotateY(Math.PI/2)
    
    envObjects.push(doorway1);
    envObjects.push(doorway2);
    envObjects.push(doorway3);
    envObjects.push(doorway4);
    envObjects.push(doorway5);


    const innerWall1 = Env.makeWall(new THREE.Vector3(-roomSize/6*2, roomHeight/2, roomSize/6), wallThickness, roomHeight, roomSize/3, wallMaterial);
    innerWall1.rotateY( - Math.PI / 2 );

    const innerWall2 = innerWall1.clone()
    innerWall2.position.set(-roomSize/6*2, roomHeight/2,-roomSize/6)

    envObjects.push(innerWall1)
    envObjects.push(innerWall2)


    //center pole
    const poleGeometry = new THREE.CylinderGeometry(1, 1, roomHeight, 16);
    const pole = new THREE.Mesh(poleGeometry, wallMaterial);
    pole.position.set(0, roomHeight/2, 0);
    pole.castShadow = true;
    pole.receiveShadow = true;
    envObjects.push(pole);


    //crates
    const crateMat1 = makeMaterial({
        textureSrc: 'assets/textures/crate1col.jpg',
        roughnessSrc: 'assets/textures/crate1rough.jpg',
        normalSrc: 'assets/textures/crate1norm.jpg',
        roughness: 0.7,
        repeat: [1,1],
    })

    const crateMat2 = makeMaterial({
        textureSrc: 'assets/textures/crate2col.jpg',
        roughnessSrc: 'assets/textures/crate2rough.jpg',
        normalSrc: 'assets/textures/crate2norm.jpg',
        roughness: 0.7,
        repeat: [1,1],
    })

    const crateMats = [crateMat1, crateMat2]

    //crate stacks
    const crateStack1 = Env.makeCrateStack(new THREE.Vector3(-roomSize/2+1,0,roomSize/2-1), 1.3, crateMats);
    const crateStack2 = Env.makeCrateStack(new THREE.Vector3(-roomSize/2+2,0,0), 1, crateMats);
    crateStack2.rotateY(Math.PI/4);
    const crateStack3 = Env.makeCrateStack(new THREE.Vector3(-roomSize/2+1.5,0,-roomSize/2+1.5), 1.2, crateMats);
    crateStack3.rotateY(-Math.PI/2);
    const crateStack4 = Env.makeCrateStack(new THREE.Vector3(-roomSize/6-2.5,0,-roomSize/6-0.5), 0.8, crateMats);
    const crateStack5 = Env.makeCrateStack(new THREE.Vector3(roomSize/6+1,0,-4), 1, crateMats);
    crateStack5.rotateY(-Math.PI/2);
    const crateStack6 = Env.makeCrateStack(new THREE.Vector3(roomSize/6-1,0,-roomSize/6), 1, crateMats);
    crateStack6.rotateY(Math.PI)

    //big crates
    const bigCrate1 = Env.makeBigCrate(new THREE.Vector3(-roomSize/3+1.5,0,roomSize/3-2), crateMat1);
    bigCrate1.rotateY(Math.PI/2);
    const bigCrate2 = Env.makeBigCrate(new THREE.Vector3(-roomSize/6-2,0,roomSize/6-1), crateMat1);
    bigCrate2.rotateY(Math.PI/2);
    const bigCrate3 = Env.makeBigCrate(new THREE.Vector3(roomSize/2-1,0,0), crateMat1);
    const bigCrate4 = Env.makeBigCrate(new THREE.Vector3(-roomSize/6+1,0,roomSize/6), crateMat1);

    // box crates
    const boxCrate1 = Env.makeBoxCrate(new THREE.Vector3(-roomSize/3+2,0,-roomSize/6+1), 1.2, crateMat2);
    const boxCrate2 = Env.makeBoxCrate(new THREE.Vector3(-roomSize/6-0.5,0,-roomSize/6-0.5), 0.7, crateMat2);
    const boxCrate3 = Env.makeBoxCrate(new THREE.Vector3(roomSize/2-1,0,2), 1.1, crateMat1);
    const boxCrate4 = Env.makeBoxCrate(new THREE.Vector3(roomSize/6-1.5 ,0,roomSize/2-1.5), 1.6, crateMat1);

    envObjects.push(crateStack1)
    envObjects.push(crateStack2)
    envObjects.push(crateStack3)
    envObjects.push(crateStack4)
    envObjects.push(crateStack5)
    envObjects.push(crateStack6)

    envObjects.push(bigCrate1)
    envObjects.push(bigCrate2)
    envObjects.push(bigCrate3)
    envObjects.push(bigCrate4)

    envObjects.push(boxCrate1)
    envObjects.push(boxCrate2)
    envObjects.push(boxCrate3)
    envObjects.push(boxCrate4)
    
    // door
    const doorMat = makeMaterial({
        textureSrc : './assets/textures/door1/doorcol.jpg',
        roughnessSrc : './assets/textures/door1/doorrough.jpg',
        normalSrcSrc : './assets/textures/door1/doornorm.jpg',
        roughness: 0.7,
        metalness: 0.1,
        repeat: [1,2],
    });

    const frameMat = makeMaterial({
        textureSrc : './assets/textures/door1/framecol.jpg',
        roughnessSrc : './assets/textures/door1/framerough.jpg',
        normalSrcSrc : './assets/textures/door1/framenorm.jpg',
        roughness: 0.7,
        metalness: 0.1,
    });

    const knobMat = makeMaterial({
        textureSrc : './assets/textures/door1/knobcol.jpg',
        roughnessSrc : './assets/textures/door1/knobrough.jpg',
        normalSrcSrc : './assets/textures/door1/knobnorm.jpg',
        metalness: 0.5,
    })

    const door = Env.makeDoor(new THREE.Vector3(0, 0, -roomSize/2+0.1), doorMat, frameMat, knobMat, 1.1);
    envObjects.push(door)

    //torches
    const torch1 = Env.createTorch(roomSize/2-wallThickness, 2, 0, 0); 
    const torch2 = Env.createTorch(roomSize/3, 2, -roomSize/2+wallThickness, Math.PI/2); 
    const torch3 = torch2.clone()
    torch3.position.set(0, 3.3, -roomSize/2+wallThickness)

    envObjects.push(torch1)
    envObjects.push(torch2)
    envObjects.push(torch3)
     
    envObjects.forEach(function (object) {
        scene.add(object);
        objects.push(object)
    });
}


async function loadExtModels(scene, objects){
    const envObjects =[];
    //exported models

    //bed
    const bed = await loadObject('./assets/models/bed/bed.obj', './assets/models/bed/bed.mtl', new THREE.Vector3(roomSize/3+1,0,roomSize/2-2.5), Math.PI, 0.045)
    envObjects.push(bed)

    //chests
    const chest1 = await loadObject('./assets/models/chest/chest.obj', './assets/models/chest/chest.mtl', new THREE.Vector3(-8,0,roomSize/6+1), 0, 0.5)
    const chest2 = await loadObject('./assets/models/chest/chest.obj', './assets/models/chest/chest.mtl', new THREE.Vector3(roomSize/3+2,0,roomSize/6+1), -Math.PI/2, 0.5)
    const chest3 = await loadObject('./assets/models/chest/chest.obj', './assets/models/chest/chest.mtl', new THREE.Vector3(roomSize/6-1,0,roomSize/4+1), -Math.PI/2, 0.5)
    const chest4 = await loadObject('./assets/models/chest/chest.obj', './assets/models/chest/chest.mtl', new THREE.Vector3(roomSize/3+1.5,0,-roomSize/2+2), -Math.PI/2, 0.7)

    envObjects.push(chest1)
    envObjects.push(chest2)
    envObjects.push(chest3)
    envObjects.push(chest4)

    //barrels
    const barrel1 = await loadObject('./assets/models/barrel/barrel.obj', './assets/models/barrel/barrel.mtl', new THREE.Vector3(roomSize/6+0.8,0,3), Math.PI/2, 0.01)
    const barrel2 = await loadObject('./assets/models/barrel/barrel.obj', './assets/models/barrel/barrel.mtl', new THREE.Vector3(roomSize/6+1,0,-6), Math.PI/2, 0.013)
    const barrel3 = await loadObject('./assets/models/barrel/barrel.obj', './assets/models/barrel/barrel.mtl', new THREE.Vector3(-roomSize/6-0.8,0,-roomSize/2+1), Math.PI, 0.011)
    const barrel4 = await loadObject('./assets/models/barrel/barrel.obj', './assets/models/barrel/barrel.mtl', new THREE.Vector3(roomSize/2-1,0,-roomSize/6), -Math.PI/2, 0.015)

    envObjects.push(barrel1)
    envObjects.push(barrel2)
    envObjects.push(barrel3)
    envObjects.push(barrel4)

    //coins - might have seperate function for collectibles
    // const coin = await loadObject('./assets/models/key1/coin.obj', './assets/models/key1/coin.mtl', new THREE.Vector3(0,1,5), -Math.PI/2, 0.1)

    envObjects.forEach(function (object) {
        scene.add(object);
        objects.push(object)
    });

    

}

async function loadSounds(listener) {
    const storm = await loadAudio('./assets/audio/storm.mp3', listener, {loop:true, volume:0.4, autoplay:true});
    const waves = await loadAudio('./assets/audio/waves.mp3', listener, {loop:true, volume:0.3, autoplay:true});
    const floor = await loadAudio('./assets/audio/floor1.mp3', listener, {});
    const door = await loadAudio('./assets/audio/door1.wav', listener, {});
    const keys = await loadAudio('./assets/audio/keys1.mp3', listener, {});
}


//TODO: fix weird texture stretching on walls with doorways
//TODO: randomise crate textures 
//TODO: add particles to flames
//TODO: Add sound for walking



