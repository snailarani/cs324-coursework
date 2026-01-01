import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';


export function makeFloor(y, w, d, material){
    const floorGeometry = new THREE.PlaneGeometry(w,d);
    floorGeometry.rotateX( - Math.PI / 2 );

    const floor = new THREE.Mesh( floorGeometry, material );
    floor.position.set(0, y, 0);
    floor.receiveShadow = true;
    return floor;
}


export function makeWall(pos, w, h, d, material){
    const wallGeometry = new THREE.BoxGeometry(w, h, d);

    const wall = new THREE.Mesh(wallGeometry, material);

    wall.position.set(pos.x, pos.y, pos.z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    return wall;
}


export function makeWallWithDoorway(pos, w, h, d, doorW, doorH, material){
    const wallGroup = new THREE.Group();
    wallGroup.position.set(pos.x, pos.y, pos.z);

    const leftWallW = (w - doorW) / 2;
    const rightWallW = leftWallW;
    const topWallH = h - doorH;

    const leftWall = makeWall(new THREE.Vector3( - (w/2 - leftWallW/2), -(h-doorH)/2, 0), leftWallW, doorH, d, material);
    const rightWall = makeWall(new THREE.Vector3( w/2 - rightWallW/2, -(h-doorH)/2, 0), rightWallW, doorH, d, material);
    const topWall = makeWall(new THREE.Vector3(0, h/2 - topWallH/2, 0), w, topWallH, d, material);

    wallGroup.add(leftWall);
    wallGroup.add(rightWall);
    wallGroup.add(topWall);

    return wallGroup;
}


export function makeCrate(pos, w, h, d, material, options = {}){
    const{
        lidOverhang = 0.04,
        lidThickness = 0.05,
        lidMaterial = material,
    } = options;

    const crateGroup = new THREE.Group();
    crateGroup.position.set(pos.x, pos.y, pos.z);

    const crateGeometry = new THREE.BoxGeometry(w, h, d);
    const crate = new THREE.Mesh(crateGeometry, material);
    crate.position.set(0, h/2 + lidThickness, 0); // crate position relative to group
    crate.castShadow = true;
    crate.receiveShadow = true;
    crateGroup.add(crate);


    const lidWidth = w + lidOverhang * 2;
    const lidDepth = d + lidOverhang * 2;
    const lidGeometry = new THREE.BoxGeometry(lidWidth, lidThickness, lidDepth);

    const lidTop = new THREE.Mesh(lidGeometry, lidMaterial);
    lidTop.position.set(0, h+lidThickness, 0);
    lidTop.castShadow = true;
    lidTop.receiveShadow = true;
    crateGroup.add(lidTop);

    const lidBot = new THREE.Mesh(lidGeometry, lidMaterial);
    lidBot.position.set(0, 0, 0);
    lidBot.castShadow = true;
    lidBot.receiveShadow = true;
    crateGroup.add(lidBot);

    return crateGroup;
}