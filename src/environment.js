import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
// import PoissonDiskSampling from 'poisson-disk-sampling';
import { makeMaterial, randomRGB } from './utils.js';


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

    wallGroup.castShadow = true;
    wallGroup.receiveShadow = true;

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

    crateGroup.castShadow = true;
    crateGroup.receiveShadow = true;

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

    stackGroup.castShadow = true;
    stackGroup.receiveShadow = true;

    return stackGroup;

}


export function createTorch(x, y, z, rotateY) {
  const torchGroup = new THREE.Group();
  torchGroup.position.set(x, y, z);
  torchGroup.rotateY(rotateY);

  // Torch stick
  const stickGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
  const stickMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
  const stick = new THREE.Mesh(stickGeometry, stickMaterial);
  
  // Flame
  const flameGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const flameMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: 0xff6600,
    emissiveIntensity: 1
  });
  const flame = new THREE.Mesh(flameGeometry, flameMaterial);
  flame.position.y = 0.3;
  
  // Point light for light source
  const light = new THREE.PointLight(0xff9944, 0.8, 5); // orange color, intensity, distance
  light.position.y = 0.3;
  light.castShadow = true;
  
  torchGroup.add(stick);
  torchGroup.add(flame);
  torchGroup.add(light);

  torchGroup.castShadow = true;
  torchGroup.rotateZ(Math.PI / 5);  //slanted to stick out from wall
  
  
  return torchGroup;
}

export function playerTorch(camera) {
    const torch = new THREE.SpotLight(0xffaa33); 
    torch.castShadow = true;

    camera.add(torch);
    torch.position.set(0, 1.7, -0.5);

    return torch

}


// level 2 objects
export function makeIceTree(pos, scale){
    const treeGroup = new THREE.Group();
    treeGroup.position.set(pos.x, pos.y, pos.z);
    treeGroup.scale.set(scale, scale, scale);

    // const trunkmaterial = makeMaterial({
    //     color: 0x452f29,
    // });

    // const treeMaterial = makeMaterial({
    //     color:new THREE.Color(1, 0, 0),
    //     roughness: 0,
    //     metalness: 0,
    // });
    const trunkmaterial = makeMaterial({color: 0x452f29});
    const treeMaterial = makeMaterial({color: 0x5aa1f2});
    treeMaterial.envMapIntensity = 2;
    treeMaterial.needsUpdate = true;

    const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1, 16);
    const trunk = new THREE.Mesh(trunkGeometry, trunkmaterial);
    trunk.position.set(0, 0.6, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    const treeGeometry = new THREE.ConeGeometry(1.5, 5, 32);
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(0, 3.5, 0);
    tree.castShadow = true;
    tree.receiveShadow = true;
    treeGroup.add(tree);

    return treeGroup;
}

export function makeGlowRocks(pos, scale){
    const rockGroup = new THREE.Group();
    rockGroup.position.set(pos.x, pos.y, pos.z);

    const randCol = randomRGB();

    // const rockMaterial = makeMaterial({color: randCol});
    // rockMaterial.emissive = randCol;
    // rockMaterial.emissiveIntensity = 1;
    // rockMaterial.needsUpdate = true;

    // const randGeometry = Math.floor(Math.random()*3+1);
    // const rockGeometry = new THREE.TetrahedronGeometry(scale, randGeometry);
    // const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    // rock.position.set(0,0,0);
    // rock.castShadow = true;
    // rock.receiveShadow = true;
    // rockGroup.add(rock);

    const light = new THREE.PointLight(randCol, 0.3, 10, 2); // blueish light
    light.position.set(0, scale-0.1, 0);
    light.castShadow = true;
    rockGroup.add(light);

    return rockGroup;
}

