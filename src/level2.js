import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import * as Env from './environment.js';
import { makeMaterial } from './utils.js';
import seedrandom from 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/+esm';
import PoissonDiskSampling from 'https://cdn.jsdelivr.net/npm/poisson-disk-sampling@2.3.1/+esm';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';



const roomSize = 50;
const roomHeight = 1;
const wallThickness = 0.2;

export function makeLevel2(){
    //set up camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(2,1.7,0);

    //set up scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);


    //lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    // moonlight
    const dirLight = new THREE.DirectionalLight(0xA8CCFF, 0.7); //blue tint for moonlight
    dirLight.position.set(0,10,3);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -roomSize;
    dirLight.shadow.camera.right = roomSize;
    dirLight.shadow.camera.top = roomSize;
    dirLight.shadow.camera.bottom = -roomSize;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // hemisphere light for aurora effect
    const hemisphereLight = new THREE.HemisphereLight(
        0x7799cc,  // Aurora sky color (blue-purple)
        0x334455,  // ground reflection (dark blue)
        0.7        
    );
    scene.add(hemisphereLight);

    const objects = [];

    //floor
    const color = new THREE.Color();
    let floorGeometry = new THREE.PlaneGeometry(100, 100, 20, 30);
    floorGeometry.rotateX(-Math.PI / 2);

    const position = floorGeometry.attributes.position;  // Declare position here
    const colorsFloor = [];

    for (let i = 0, l = position.count; i < l; i++) {
        color.setHSL(Math.random() * 0.35 + 0.5, 0.55, Math.random() * 0.55 + 0.15, THREE.SRGBColorSpace);
        colorsFloor.push(color.r, color.g, color.b);
    }

    floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));

    const floorMaterial = new THREE.MeshStandardMaterial({ 
        vertexColors: true, 
        metalness: 0.1,
        roughness: 0.2,
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    scene.add(floor);

    scene.add(new THREE.AxesHelper(5));      // X red, Y green, Z blue
    // scene.add(new THREE.GridHelper(roomSize, roomSize)); // grid on the ground


    //sky
    const skyTex = new THREE.TextureLoader().load('assets/textures/au.jpg');
    skyTex.colorSpace = THREE.SRGBColorSpace;
    const skyGeo = new THREE.SphereGeometry(100, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
        map: skyTex,
        side: THREE.BackSide,   
        depthWrite: false,       // sky never occludes anything
        color: 0x691DAD,    //purple tint
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.material.toneMapped = false;
    scene.add(sky);


    //walls/boundaries

    //level boundary walls - just for testing
    const wallMaterial = makeMaterial({
        color: 0x888888,
    });
    const leftWall = Env.makeWall(new THREE.Vector3(-roomSize/2, roomHeight/2, 0), wallThickness, roomHeight, roomSize, wallMaterial);
    scene.add(leftWall);
    objects.push(leftWall);

    const rightWall = Env.makeWall(new THREE.Vector3(roomSize/2, roomHeight/2, 0), wallThickness, roomHeight, roomSize, wallMaterial);
    scene.add(rightWall);
    objects.push(rightWall);

    const frontWall = Env.makeWall(new THREE.Vector3(0, roomHeight/2, -roomSize/2), wallThickness, roomHeight, roomSize, wallMaterial);
    frontWall.rotateY( - Math.PI / 2 );
    scene.add(frontWall);
    objects.push(frontWall);

    const backWall = Env.makeWall(new THREE.Vector3(0, roomHeight/2, roomSize/2), wallThickness, roomHeight, roomSize, wallMaterial);
    backWall.rotateY( - Math.PI / 2 );
    scene.add(backWall);
    objects.push(backWall);

    addIcicles(scene, objects, 500);


    // trees
    // Create sampler
    const pds = new PoissonDiskSampling({
        shape: [roomSize-3, roomSize-3],      
        minDistance: 4,        
        maxDistance: 15,        
        tries: 10,              
    },
    seedrandom('level2'),  // for consistent placement
    );

    // Generate points
    let points = pds.fill();

    // Place trees
    let randScale;
    points.forEach(point => {
        const treePos = new THREE.Vector3(point[0]-roomSize/2, 0, point[1]-roomSize/2);
        randScale = Math.random() * 0.9 + 0.5;
        const tree = Env.makeIceTree(treePos, randScale);
        scene.add(tree);
        objects.push(tree);
    });

    //rocks
    const pdsRocks = new PoissonDiskSampling({
        shape: [roomSize-3, roomSize-3],      
        minDistance: 15,        
        maxDistance: 20,        
        tries: 10,              
    },
    seedrandom('level2-final'),  // for consistent placement
    );

    // Generate points
    let rockPoints = pdsRocks.fill();

    // Place trees
    rockPoints.forEach(point => {
        const rockPos = new THREE.Vector3(point[0]-roomSize/2, 0, point[1]-roomSize/2);
        randScale = Math.random() * 1 + 0.2;
        const rock = Env.makeGlowRocks(rockPos, randScale);
        scene.add(rock);
        objects.push(rock);
    });

    //door
    const doorMaterial = makeMaterial({
        textureSrc: 'assets/textures/door2/doorcol.jpg',
        normalSrc: 'assets/textures/door2/doornorm.jpg',
        roughnessSrc: 'assets/textures/door2/doorrough.jpg',
        metalness: 0.5,
    });
    
    const frameMaterial = makeMaterial({
        textureSrc: 'assets/textures/door2/framecol.jpg',
        normalSrc: 'assets/textures/door2/framenorm.jpg',
        roughnessSrc: 'assets/textures/door2/framerough.jpg',
        metalness: 0.5,
    });

    const door = Env.makeDoor(new THREE.Vector3(roomSize/2-0.2, 0, -5), doorMaterial, frameMaterial, frameMaterial, 1.2, -Math.PI/2)
    scene.add(door);
    objects.push(door);

    const doorLight = new THREE.PointLight(0xffffff, 1, 10);
    doorLight.position.set(roomSize/2-0.2, 2, -5);
    scene.add(doorLight);
    //animation







    //game logic

    return{scene, objects, camera}

}



// export function makeLevel2(camera, renderer){
//     //set up camera



//     //set up scene




//     //lights




//     //floor




//     //sky




//     //asset loading 







//     //other objects






//     //animation







//     //game logic



function createIcicle(height = 1, radius = 0.1) {
    const geometry = new THREE.ConeGeometry(radius, height, 6, 1);
    
    const color = new THREE.Color();
    const position = geometry.attributes.position;
    const colorsIcicle = [];
    
    for (let i = 0, l = position.count; i < l; i++) {
        color.setHSL(Math.random() * 0.45 + 0.5, 0.55, Math.random() * 0.35 + 0.1, THREE.SRGBColorSpace);
        colorsIcicle.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsIcicle, 3));
    
    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.2,
        roughness: 0.3,
        transparent: false,
        opacity: 0.98,
        emissive: 0x88CCFF,
        emissiveIntensity: 0.08,
    });
    
    return new THREE.Mesh(geometry, material);
}


function addIcicles(scene, objects, count = 40) {
    const rng = seedrandom('icicles');
    
    for (let i = 0; i < count; i++) {
        const height = 4 + rng() * 15;
        const radius = 0.5 + rng() * 2.5;
        const icicle = createIcicle(height, radius);
        
        // Distribute around the perimeter
        const angle = rng() * Math.PI * 2;
        const distance = roomSize/2+5 + rng() * 25;
        
        icicle.position.set(
            Math.cos(angle) * distance,
            height / 2,
            Math.sin(angle) * distance
        );
        
        //random tilt
        icicle.rotation.z = (rng() - 0.5) * 0.2;
        icicle.rotation.x = (rng() - 0.5) * 0.2;
        
        scene.add(icicle);
        objects.push(icicle);
    }
}