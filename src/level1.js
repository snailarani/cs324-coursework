import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import * as Env from './environment.js';
import { loadObject, makeMaterial } from './utils.js';
import { initAudio, loadBgAudio, loadFloorAudio, loadKeyAudio, loadDoorAudio } from './sounds.js';

const roomSize = 18;
const roomHeight = 4;
const wallThickness = 0.2;

//TODO: just have 1 texture for all crates
export async function loadLevel1(scene, camera){
    const objects = [];

    //camera, scene
    camera.position.set(0,1.7,roomSize/2-1);
    scene.background = new THREE.Color(0x000000);

    //Lighting
    level1Lighting(scene, camera);

    //Environment
    level1Env(scene, objects)

    const door = loadDoor(scene, objects)

    //sounds
    initAudio(camera)
    await loadSounds()

    //external models
    await loadExtModels(scene, objects)

    return {objects, door}
}



function level1Lighting(scene, camera){
    //ambient light TODO: set to 0.03
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

function loadDoor(scene, objects){
    // door
    const doorMat = makeMaterial({
        textureSrc : './assets/textures/door1/doorcol.jpg',
        roughness: 0.5,
        metalness: 0.1,
        repeat: [1,2],
    });

    const frameMat = makeMaterial({
        textureSrc : './assets/textures/door1/framecol.jpg',
        roughness: 0.5,
        metalness: 0.1,
    });

    const knobMat = makeMaterial({
        textureSrc : './assets/textures/door1/knobcol.jpg',
        normalSrcSrc : './assets/textures/door1/knobnorm.jpg',
        metalness: 0.5,
    })

    const door = Env.makeDoor(new THREE.Vector3(0, 0, -roomSize/2+0.1), doorMat, frameMat, knobMat, 1.1);
    scene.add(door)
    objects.push(door)

    return door

}

function level1Env(scene, objects){
    const envObjects =[];

    //floor
    const floorMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipfloorcol.jpg',
        repeat: [5,5],
    })
    const floor = Env.makeFloor(0, roomSize, floorMaterial);
    envObjects.push(floor);


    //roof TODO:add back
    const roofMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipwallcol.jpg',
        repeat: [5,5],
    })
    const roof = Env.makeWall(new THREE.Vector3(0, roomHeight, 0), wallThickness, roomSize, roomSize, roofMaterial);
    roof.rotateZ( - Math.PI / 2 );
    envObjects.push(roof);


    //outer walls (boundaries)
    const wallMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipwallcol.jpg',
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
    const innerWall1 = Env.makeWall(new THREE.Vector3(-roomSize/6*2, roomHeight/2, roomSize/6), wallThickness, roomHeight, roomSize/3, wallMaterial);
    innerWall1.rotateY( - Math.PI / 2 );

    const innerWall2 = innerWall1.clone()
    innerWall2.position.set(-roomSize/6*2, roomHeight/2,-roomSize/6)

    envObjects.push(innerWall1)
    envObjects.push(innerWall2)


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



    //center pole
    const poleGeometry = new THREE.CylinderGeometry(1, 1, roomHeight, 16);
    const pole = new THREE.Mesh(poleGeometry, wallMaterial);
    pole.position.set(0, roomHeight/2, 0);
    pole.castShadow = true;
    pole.receiveShadow = true;
    envObjects.push(pole);


    //crates

    //crate stacks
    const crateStack1 = Env.makeCrateStack(new THREE.Vector3(-roomSize/2+1,0,roomSize/2-1), 1.3);
    const crateStack2 = Env.makeCrateStack(new THREE.Vector3(-roomSize/2+2,0,0), 1);
    crateStack2.rotateY(Math.PI/4);
    const crateStack3 = Env.makeCrateStack(new THREE.Vector3(-roomSize/2+1.5,0,-roomSize/2+1.5), 1.2);
    crateStack3.rotateY(-Math.PI/2);
    const crateStack4 = Env.makeCrateStack(new THREE.Vector3(-roomSize/6-2.5,0,-roomSize/6-0.5), 0.8);
    const crateStack5 = Env.makeCrateStack(new THREE.Vector3(roomSize/6+1,0,-4), 1);
    crateStack5.rotateY(-Math.PI/2);
    const crateStack6 = Env.makeCrateStack(new THREE.Vector3(roomSize/6-1,0,-roomSize/6), 1);
    crateStack6.rotateY(Math.PI)

    //big crates
    const bigCrate1 = Env.makeBigCrate(new THREE.Vector3(-roomSize/3+1.5,0,roomSize/3-2));
    bigCrate1.rotateY(Math.PI/2);
    const bigCrate2 = Env.makeBigCrate(new THREE.Vector3(-roomSize/6-2,0,roomSize/6-1));
    bigCrate2.rotateY(Math.PI/2);
    const bigCrate3 = Env.makeBigCrate(new THREE.Vector3(roomSize/2-1,0,0));
    const bigCrate4 = Env.makeBigCrate(new THREE.Vector3(-roomSize/6+1,0,roomSize/6));

    // box crates
    const boxCrate1 = Env.makeBoxCrate(new THREE.Vector3(-roomSize/3+2,0,-roomSize/6+1), 1.22);
    const boxCrate2 = Env.makeBoxCrate(new THREE.Vector3(-roomSize/6-0.5,0,-roomSize/6-0.5), 0.72);
    const boxCrate3 = Env.makeBoxCrate(new THREE.Vector3(roomSize/2-1,0,2), 1.11);
    const boxCrate4 = Env.makeBoxCrate(new THREE.Vector3(roomSize/6-1.5 ,0,roomSize/2-1.5), 1.61);

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
    const chest1 = await loadObject('./assets/models/chest/chest.obj', './assets/models/chest/chest.mtl', new THREE.Vector3(-7,0,roomSize/6+1), 0, 0.6)
    
    const chest2 = chest1.clone()
    chest2.position.set(roomSize/3+2,0,roomSize/6+1)
    chest2.rotateY(-Math.PI/2)

    const chest3 = chest1.clone()
    chest3.position.set(-roomSize/6-1.1,0,-roomSize/2+1)
    chest3.scale.setScalar(0.5)

    const chest4 = chest2.clone()
    chest4.position.set(roomSize/3+1.5,0,-roomSize/2+2)
    chest4.scale.setScalar(0.8)

    envObjects.push(chest1)
    envObjects.push(chest2)
    envObjects.push(chest3)
    envObjects.push(chest4)

    //coins - might have seperate function for collectibles
    const coinObjSrc = './assets/models/key1/coin.obj'
    const coinObjMtl = './assets/models/key1/coin.mtl'
    const coinPos = [
        [-2,1.35,4.2],
        [2.7,0,8.6],
        [0.55,1.12,-3],

        [-8.5,0,3.5],
        [-6.5,1.42,8],

        [-7,0,-1.3],
        [-3.3,0,1.6],

        [-7,0,-8.5],

        [5.5,0,8.6],
        [5,0,2.41],
        [5.1,1.12,-4],
        [8.6,0,-8.7],
    ]

    let pos;
    for (let i=0; i<coinPos.length; i++){
        pos = new THREE.Vector3(coinPos[i][0], coinPos[i][1], coinPos[i][2])
        const coin = await loadObject(coinObjSrc, coinObjMtl, pos, 0, 0.1, false)
        envObjects.push(coin)
    }

    envObjects.forEach(function (object) {
        scene.add(object);
        objects.push(object)
    });
}

async function loadSounds() {
    const storm = await loadBgAudio('./assets/audio/storm.mp3', {loop:true, volume:0.4});
    const waves = await await loadBgAudio('./assets/audio/waves.mp3', {loop:true, volume:0.3});
    const floor = await loadFloorAudio('./assets/audio/floor1.mp3', {loop:true, volume:1.1});
    const door = await loadKeyAudio('./assets/audio/keys1.wav', {volume:1.5});
    const keys = await loadDoorAudio('./assets/audio/door1.wav', {volume:1.3});
}


//TODO: add particles to flames




