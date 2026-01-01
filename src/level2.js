import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import * as Env from './environment.js';
import { makeMaterial } from './utils.js';



const roomSize = 25;
const roomHeight = 4;
const wallThickness = 0.2;


export function makeLevel2(camera, renderer){

    const scene = new THREE.Scene();
    const objects = [];

    scene.background = new THREE.Color(0x414d5e);
    
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;

    //load exr environment map and background
    loadEXRTexture(scene, 'assets/textures/aurora.exr', 'assets/textures/aurora.jpg', renderer);


    //floor
    const floorMaterial = makeMaterial({
        textureSrc: 'assets/textures/snowcol.jpg',
        roughnessSrc: 'assets/textures/snowrough.jpg',
        normalSrc: 'assets/textures/snownorm.jpg',
        roughness: 0.9,
        metalness: 0,
        repeat: [50,50],
    })

    const floor = Env.makeFloor(0, 100, 100, floorMaterial);
    scene.add(floor);
    objects.push(floor);


    //level boundary walls
    const wallMaterial = makeMaterial({
        // textureSrc: 'assets/textures/shipwall.jpg',
        visible: false,
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


    //trees
    const tree = Env.makeIceTree(new THREE.Vector3(0,0,0), 1);
    scene.add(tree);
    objects.push(tree);

    //rocks
    const rock1 = Env.makeGlowRocks(new THREE.Vector3(-5,0,0), 0.5);
    scene.add(rock1);
    objects.push(rock1);

    //ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(ambientLight)

    // moon light
    const dirLight = new THREE.DirectionalLight(0x5596e0, 0.5);
    dirLight.position.set(0,10,5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // hemisphere light for aurora effect
    const hemisphereLight = new THREE.HemisphereLight(
        0x7799cc,  // Aurora sky color (blue-purple)
        0x334455,  // Snowy ground reflection (dark blue)
        0.5        // Moderate intensity
    );
    scene.add(hemisphereLight);


    // scene.add(new THREE.AxesHelper(5));      // X red, Y green, Z blue
    // scene.add(new THREE.GridHelper(20, 20)); // grid on the ground

    return {scene, objects};
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