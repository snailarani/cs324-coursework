import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import * as Env from './environment.js';
import { makeMaterial } from './utils.js';


const roomSize = 21;
const roomHeight = 5;
const wallThickness = 0.2;
const corridorleft = -3.5;


export function makeLevel1(){
    // Scene set up
    const scene = new THREE.Scene();
    const objects = [];

    scene.background = new THREE.Color(0x79aaf7);

     //floor
    const floorMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipfloorcol.jpg',
        roughnessScr: 'assets/textures/shipfloorrough.jpg',
        normalScr: 'assets/textures/shipfloornorm.jpg',
        repeat: [5,5],
    })

    const floor = Env.makeFloor(0, roomSize, roomSize, floorMaterial);
    scene.add(floor);
    objects.push(floor);


    // walls
    const wallMaterial = makeMaterial({
        textureSrc: 'assets/textures/shipwallcol.jpg',
        roughnessScr: 'assets/textures/shipwallrough.jpg',
        normalScr: 'assets/textures/shipwallnorm.jpg',
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
        roughnessScr: 'assets/textures/shipwallrough.jpg',
        normalScr: 'assets/textures/shipwallnorm.jpg',
        repeat: [5,5],
    })

    const roof = Env.makeWall(new THREE.Vector3(0, roomHeight, 0), wallThickness, roomSize, roomSize, roofMaterial);
    roof.rotateZ( - Math.PI / 2 );
    scene.add(roof);
    objects.push(roof);


    //inner walls
    const doorway1 = Env.makeWallWithDoorway(new THREE.Vector3(corridorleft, roomHeight/2, 7), roomSize/3, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway1.rotateY( - Math.PI / 2 );
    scene.add(doorway1);
    objects.push(doorway1);

    const doorway2 = Env.makeWallWithDoorway(new THREE.Vector3(corridorleft, roomHeight/2, 0), roomSize/3, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway2.rotateY( - Math.PI / 2 );
    scene.add(doorway2);
    objects.push(doorway2);

    const doorway3 = Env.makeWallWithDoorway(new THREE.Vector3(corridorleft, roomHeight/2, -7), roomSize/3, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway3.rotateY( - Math.PI / 2 );
    scene.add(doorway3);
    objects.push(doorway3);


    const innerWall1 = Env.makeWall(new THREE.Vector3(corridorleft*2, roomHeight/2, 3.5), wallThickness, roomHeight, roomSize/3, wallMaterial);
    innerWall1.rotateY( - Math.PI / 2 );
    scene.add(innerWall1);
    objects.push(innerWall1);


    const innerWall2 = Env.makeWall(new THREE.Vector3(corridorleft*2, roomHeight/2,-3.5), roomSize/3, roomHeight, wallThickness, wallMaterial);
    scene.add(innerWall2);
    objects.push(innerWall2);  


    const doorway4 = Env.makeWallWithDoorway(new THREE.Vector3(-corridorleft, roomHeight/2, 0), roomSize, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    doorway4.rotateY( - Math.PI / 2 );
    scene.add(doorway4);
    objects.push(doorway4);

    const doorway5 = Env.makeWallWithDoorway(new THREE.Vector3(-corridorleft*2, roomHeight/2, -5), roomSize/3, roomHeight, wallThickness, 2.5, 3, wallMaterial);
    scene.add(doorway5);
    objects.push(doorway5);


    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    //sun
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-8, 4, 0);
    light.castShadow = true;
    scene.add(light);

    return {scene, objects};

}