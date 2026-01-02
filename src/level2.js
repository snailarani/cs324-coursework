import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import * as Env from './environment.js';
import { makeMaterial } from './utils.js';
import seedrandom from 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/+esm';
import PoissonDiskSampling from 'https://cdn.jsdelivr.net/npm/poisson-disk-sampling@2.3.1/+esm';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';



const roomSize = 35;
const roomHeight = 1;
const wallThickness = 0.2;


export function makeLevel2(camera, renderer){
    //set up camera



    //set up scene




    //lights




    //floor




    //sky




    //asset loading 







    //other objects






    //animation







    //game logic






    const scene = new THREE.Scene();
    // scene.fog = new THREE.Fog( 0x554e59, 12, 14 );
    const objects = [];
    
    scene.background = new THREE.Color(0x000000);

    const skyTex = new THREE.TextureLoader().load('assets/textures/au.jpg');
    skyTex.colorSpace = THREE.SRGBColorSpace;
    const skyGeo = new THREE.SphereGeometry(100, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
        map: skyTex,
        side: THREE.BackSide,   // IMPORTANT
        depthWrite: false,       // sky never occludes anything
        // color: 0x888888,
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.material.toneMapped = false;
    scene.add(sky);

    const loader = new OBJLoader();
    // const object = loader.loadAsync( './assets/models/snowman.obj' );
    // scene.add( object );

    loader.load(
        // resource URL
        './assets/models/snowman.obj',
        // called when resource is loaded
        function ( object ) {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load('./assets/textures/snowmancol.png');
            object.traverse((child) => {
                if (child.isMesh) {
                    // Apply material with texture
                    child.material = new THREE.MeshStandardMaterial({
                        map: texture,           // Color/diffuse texture
                        roughness: 0.8,
                        metalness: 0.2,
                    });
                    
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add( object );
            objects.push( object );

    });

    //floor
    const floorMaterial = makeMaterial({
        roughnessSrc: 'assets/textures/snowrough.jpg',
        normalSrc: 'assets/textures/snownorm.jpg',
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0,
        repeat: [50,50],
    })

    const floor = Env.makeFloor(0, 100, 100, floorMaterial);
    scene.add(floor);
    objects.push(floor);

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

    // trees
    // Create sampler
    const pds = new PoissonDiskSampling({
        shape: [35, 35],      // your map size
        minDistance: 4,         // minimum spacing
        maxDistance: 15,         // maximum spacing (optional)
        tries: 10,              // attempts per point 
    },
    seedrandom('level2-final'),  // for consistent placement
    );

    // Generate points
    let points = pds.fill();

    // Place trees
    let randScale;
    points.forEach(point => {
        const treePos = new THREE.Vector3(point[0]-roomSize/2, 0, point[1]-roomSize/2);
        randScale = 0.8//Math.random() * 1 + 0.5;
        const tree = Env.makeIceTree(treePos, randScale);
        scene.add(tree);
        objects.push(tree);
    });


    //tree outside of boundary:
        // trees
    // Create sampler
    const out = 15;
    const pdsOut = new PoissonDiskSampling({
        shape: [35, out],      // your map size
        minDistance: 3,         // minimum spacing
        maxDistance: 15,         // maximum spacing (optional)
        tries: 10,              // attempts per point 
    },
    );

    // Generate points
    points = pdsOut.fill();

    // Place trees
    points.forEach(point => {
        const treePos = new THREE.Vector3(point[0]-(roomSize/2), 0, point[1]-(roomSize/2+out+2));
        const randScale = Math.random() * 1.3 + 0.5;
        const tree = Env.makeIceTree(treePos, randScale);
        scene.add(tree);
        objects.push(tree);
    });

    points.forEach(point => {
        const treePos = new THREE.Vector3(point[0]-(roomSize/2), 0, point[1]+(roomSize/2+2));
        const randScale = Math.random() * 1.3 + 0.5;
        const tree = Env.makeIceTree(treePos, randScale);
        scene.add(tree);
        objects.push(tree);
    });

    const outz = 65
    const pdsOut2 = new PoissonDiskSampling({
        shape: [out, outz],      // your map size
        minDistance: 3.5,         // minimum spacing
        maxDistance: 15,         // maximum spacing (optional)
        tries: 10,              // attempts per point 
    },
    );

    points = pdsOut2.fill();

    points.forEach(point => {
        const treePos = new THREE.Vector3(point[0]+(roomSize/2+2), 0, point[1]-(outz/2));
        const randScale = Math.random() * 1.3 + 0.5;
        const tree = Env.makeIceTree(treePos, randScale);
        scene.add(tree);
        objects.push(tree);
    });

    points.forEach(point => {
        const treePos = new THREE.Vector3(point[0]-(roomSize/2+out+2), 0, point[1]-(outz/2));
        const randScale = Math.random() * 1.3 + 0.5;
        const tree = Env.makeIceTree(treePos, randScale);
        scene.add(tree);
        objects.push(tree);
    });


    const pds1 = new PoissonDiskSampling({
        shape: [35, 35],      // your map size
        minDistance: 8,         // minimum spacing
        maxDistance: 15,         // maximum spacing (optional)
        tries: 10         // attempts per point
    });

    const rockPoint = pds1.fill();
    rockPoint.forEach(point => {
        const rockPos = new THREE.Vector3(point[0]-roomSize/2, 0, point[1]-roomSize/2);
        const rock = Env.makeGlowRocks(rockPos, 0.5);
        scene.add(rock);
        objects.push(rock);
    });

    // scene.add(new THREE.AxesHelper(5));      // X red, Y green, Z blue
    // scene.add(new THREE.GridHelper(20, 20)); // grid on the ground


    //ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05)
    scene.add(ambientLight)

    // moon light
    const dirLight = new THREE.DirectionalLight(0x5596e0, 0.25);
    dirLight.position.set(0,25,25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    const d = 50;
    dirLight.shadow.camera.left   = -d;
    dirLight.shadow.camera.right  =  d;
    dirLight.shadow.camera.top    =  d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // hemisphere light for aurora effect
    const hemisphereLight = new THREE.HemisphereLight(
        0x7799cc,  // Aurora sky color (blue-purple)
        0x334455,  // Snowy ground reflection (dark blue)
        0.35        // Moderate intensity
    );
    scene.add(hemisphereLight);




    return {scene, objects, sky};
}



//adjusted from https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_envmaps_exr.html
function loadEXRTexture(scene, srcexr, scrimg, renderer){
    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    
    // apply exr environment map to scene
    new EXRLoader().load( srcexr, function ( texture ) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        const envRenderTarget = pmremGenerator.fromEquirectangular( texture );
        scene.environment = envRenderTarget.texture;

        texture.dispose();
        pmremGenerator.dispose();
    } );

    // apply background image
    new THREE.TextureLoader().load( scrimg, function ( texture ) {

        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;

        scene.background = texture;
    } );
}