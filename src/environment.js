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

export function makeBigCrate(pos, material){
    return makeCrate(pos, 1.5, 1.2, 2.5, material, {
        lidOverhang: 0.08,
        lidThickness: 0.1,
    });
}

export function makeBoxCrate(pos, size, material){
    return makeCrate(pos, size, size, size, material, {
        lidOverhang: 0.05,
        lidThickness: 0.08,
    });
}
    

export function makeCrateStack(pos, baseSize, materials){
    const stackGroup = new THREE.Group();
    stackGroup.position.set(pos.x, pos.y, pos.z);

    // Base crate
    let randMaterial = materials[Math.floor(Math.random() * materials.length)];
    const baseCrate = makeBoxCrate(new THREE.Vector3(0, 0, 0), baseSize, randMaterial);
    stackGroup.add(baseCrate);

    // Right crate
    randMaterial = materials[Math.floor(Math.random() * materials.length)];
    const rightCrate = makeBoxCrate(new THREE.Vector3(baseSize+0.15, 0, 0), baseSize, randMaterial);
    stackGroup.add(rightCrate);

    // Bottom crate
    randMaterial = materials[Math.floor(Math.random() * materials.length)];
    const bottomCrate = makeBoxCrate(new THREE.Vector3(0, 0, -baseSize-0.15), baseSize, randMaterial);
    stackGroup.add(bottomCrate);

    // Top crate
    randMaterial = materials[Math.floor(Math.random() * materials.length)];
    const topCrate = makeBoxCrate(new THREE.Vector3(0, baseSize+0.08, 0), baseSize, randMaterial);
    stackGroup.add(topCrate);

    return stackGroup;

}


// export function randomCratePlacement(scene, objects, bounds, numCrates, materials) {
//     const placements = []; // Store Box3 objects
//     const attempts = numCrates * 50;
//     let placed = 0;

//     for (let i = 0; i < attempts && placed < numCrates; i++) {
//         // Random position within bounds
//         const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
//         const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
        
//         // Random crate type
//         const isSmall = Math.random() > 0.5;
//         const material = materials[Math.floor(Math.random() * materials.length)];
        
//         // Create the crate
//         const crate = isSmall ? 
//             makeSmallCrate(new THREE.Vector3(x, 0, z), material) :
//             makeBigCrate(new THREE.Vector3(x, 0, z), material);
        
//         // Get bounding box
//         const crateBox = new THREE.Box3().setFromObject(crate);
        
//         // Add padding
//         const padding = 0.5;
//         crateBox.expandByScalar(padding);
        
//         // Check if valid placement
//         if (isValidBox3Placement(crateBox, placements, bounds)) {
//             scene.add(crate);
//             objects.push(crate);
//             placements.push(crateBox);
//             placed++;
//         }
//     }
    
//     return placed;
// }

// function isValidBox3Placement(crateBox, existingBoxes, bounds) {
//     // Check bounds
//     if (crateBox.min.x < bounds.minX || crateBox.max.x > bounds.maxX ||
//         crateBox.min.z < bounds.minZ || crateBox.max.z > bounds.maxZ) {
//         return false;
//     }
    
//     // Check against existing boxes
//     for (const existingBox of existingBoxes) {
//         if (crateBox.intersectsBox(existingBox)) {
//             return false;
//         }
//     }
    
//     return true;
// }