import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import * as Env from './environment.js';
import { makeMaterial } from './utils.js';


const roomSize = 18;
const roomHeight = 4;
const wallThickness = 0.2;
const corridorleft = -3;


export function makeLevel1(camera){
    // Scene set up
    const scene = new THREE.Scene();
    const objects = [];

    scene.background = new THREE.Color(0x79aaf7);

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


    // walls
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


    //objects
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

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.025)
    scene.add(ambientLight)


    //player torch
    const torch = new THREE.SpotLight(0xffaa33); 
    torch.castShadow = true;
    torch.angle = Math.PI / 6;
    torch.intensity = 2;
    torch.decay = 1;
    torch.penumbra = 0.35;
    camera.add(torch);
    torch.position.set(0, -0.15, -0.15);

    const torchTarget = new THREE.Object3D();
    torchTarget.position.set(0, -0.15, -1);

    camera.add(torchTarget);
    torch.target = torchTarget;

    return {scene, objects};

}