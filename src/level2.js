import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import seedrandom from 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/+esm';
import PoissonDiskSampling from 'https://cdn.jsdelivr.net/npm/poisson-disk-sampling@2.3.1/+esm';
import * as Env from './environment.js';
import { makeMaterial, loadAudio, loadObject } from './utils.js';
import { initAudio, loadBgAudio, loadFloorAudio, loadKeyAudio, loadDoorAudio } from './sounds.js';

const roomSize = 55
const treeZone = 53
const roomHeight = 5
const wallThickness = 0.2

export async function loadLevel2(scene, camera){
    const objects = []

    //camera, scene
    camera.position.set(-2,1.7,-1.5);
    scene.background = new THREE.Color(0x000000);

    //lighting
    level2Lighting(scene, camera)

    //Environment
    level2Env(scene, objects)

    //door
    const door = loadDoor(scene, objects)

    //sounds
    initAudio(camera)
    await loadSounds()

    //external models
    loadExtModels(scene, objects)

    return {objects, door}
}

function loadDoor(scene, objects){
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

    const doorGroup = Env.makeDoor(new THREE.Vector3(roomSize/2-0.2, 0, -5), doorMaterial, frameMaterial, frameMaterial, 1.2, -Math.PI/2)

    objects.push(doorGroup)
    scene.add(doorGroup)

    return doorGroup

}


function level2Lighting(scene){
    //ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(ambientLight)

    // moonlight - TODO: edit later
    const dirLight = new THREE.DirectionalLight(0xA8CCFF, 0.4); //blue tint for moonlight
    dirLight.position.set(0,10,3);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -roomSize;
    dirLight.shadow.camera.right = roomSize;
    dirLight.shadow.camera.top = roomSize;
    dirLight.shadow.camera.bottom = -roomSize;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // hemisphere light (for aurora effect)
    const hemisphereLight = new THREE.HemisphereLight(
        0x7799cc,  
        0x334455, 
        0.3       
    );
    scene.add(hemisphereLight);
}

function level2Env(scene, objects){
    const envObjects =[];

    //floor
    const color = new THREE.Color();
    let floorGeometry = new THREE.PlaneGeometry(100, 100, 20, 30);
    floorGeometry.rotateX(-Math.PI / 2);

    const position = floorGeometry.attributes.position;
    const floorCols = [];

    for (let i = 0, l = position.count; i < l; i++) {
        color.setHSL(Math.random() * 0.35 + 0.5, 0.55, Math.random() * 0.5 + 0.1, THREE.SRGBColorSpace);
        floorCols.push(color.r, color.g, color.b);
    }

    floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(floorCols, 3));

    const floorMaterial = new THREE.MeshStandardMaterial({ 
        vertexColors: true, 
        metalness: 0.0,
        roughness: 0.5,
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    envObjects.push(floor);


    //sky
    const skyTex = new THREE.TextureLoader().load('assets/textures/au.jpg');
    skyTex.colorSpace = THREE.SRGBColorSpace;
    const skyGeo = new THREE.SphereGeometry(100, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
        map: skyTex,
        side: THREE.BackSide,   
        depthWrite: false,      
        color: 0x691DAD,    //purple tint
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.material.toneMapped = false;
    envObjects.push(sky);


    //boundaries
    const wallMaterial = makeMaterial({
        visible:false,
    });
    const leftWall = Env.makeWall(new THREE.Vector3(-roomSize/2, roomHeight/2, 0), wallThickness, roomHeight, roomSize, wallMaterial);

    const rightWall = leftWall.clone()
    rightWall.position.set(roomSize/2, roomHeight/2, 0)

    const frontWall = leftWall.clone()
    frontWall.position.set(0, roomHeight/2, -roomSize/2)
    frontWall.rotateY( - Math.PI / 2 );

    const backWall = leftWall.clone()
    backWall.position.set(0, roomHeight/2, roomSize/2)
    backWall.rotateY( - Math.PI / 2 );

    envObjects.push(leftWall);
    envObjects.push(rightWall);
    envObjects.push(frontWall);
    envObjects.push(backWall);


    //trees - randomly placed with poisson dist
    const treePDS = new PoissonDiskSampling({
        shape: [treeZone-2, treeZone-2],      
        minDistance: 4,        
        maxDistance: 12,        
        tries: 10,              
    },
        seedrandom('level2'),  // for consistent placement
    );

    let treePoints = treePDS.fill();

    let randScale;
    treePoints.forEach(point => {
        const treePos = new THREE.Vector3(point[0]-treeZone/2, 0, point[1]-treeZone/2);
        randScale = Math.random() * 0.7 + 0.7;
        const tree = Env.createTree(treePos, randScale);
        envObjects.push(tree);
    });


    //rocks - randomly placed with poisson dist
    const rocksPDS = new PoissonDiskSampling({
        shape: [treeZone-5, treeZone-5],      
        minDistance: 15,        
        maxDistance: 20,        
        tries: 10,              
    },
        seedrandom('level2'),  
    );

    let rockPoints = rocksPDS.fill();

    rockPoints.forEach(point => {
        const rockPos = new THREE.Vector3(point[0]-treeZone/2, 0, point[1]-treeZone/2);
        randScale = Math.random() * 0.4 + 0.7;
        const rock = Env.createRock(rockPos, randScale);
        envObjects.push(rock);
    });

    //icicles
    const icicles = addIcicles(500);

    icicles.forEach(function (icicle) {
        envObjects.push(icicle)
    });

    
    envObjects.forEach(function (object) {
        scene.add(object);
        objects.push(object)
    });

}

async function loadExtModels(scene, objects){
    const envObjects =[];
    
    //snowmen
    const snowman1 = await loadObject('./assets/models/snowman/snowman.obj', './assets/models/snowman/snowman.mtl', new THREE.Vector3(roomSize/2,0,2), -Math.PI/2, 1.3)
    
    const snowman2 = snowman1.clone();
    snowman2.position.set(roomSize/2, 0, -1)

    const snowman3 = snowman1.clone();
    snowman3.position.set(6, 0, -roomSize/2-1)
    snowman3.rotateY(Math.PI/2)
    snowman3.scale.setScalar(1.5)

    const snowman4 = snowman1.clone();
    snowman4.position.set(0, 0, roomSize/2+1)
    snowman4.rotateY(-Math.PI/2)
    snowman4.scale.setScalar(1.1)

    const snowman5 = snowman1.clone();
    snowman5.position.set(-roomSize/4, 0, 5)
    snowman5.rotateY(-Math.PI/6)
    snowman5.scale.setScalar(0.8)

    envObjects.push(snowman1)
    envObjects.push(snowman2)
    envObjects.push(snowman3)
    envObjects.push(snowman4)
    envObjects.push(snowman5)

    //candy
    const candyObjSrc = './assets/models/key2/CandyCane.obj'
    const candyObjMtl = './assets/models/key2/CandyCane.mtl'
    const candyY = -0.05
    const candyPos = [
        [-4,4],
        [-3.5,11],
        [-16,12],
        [-11,21],
        [-22,17],
        [-26,5],

        [-26,-5],
        [-16,-9],
        [-15,-15],
        [-19,-21],
        [-5.5,-15],
        [-6, -26.5],

        [8,-8],
        [18,-2],
        [26.5,4],
        [22,-17],
        [17,-21],
        [15,-26],

        [7,7],
        [16,5],
        [15,15],
        [3.5,19],
        [13,24],
        [24,11],
        [19,18],
    ]

    let pos;
    let rot;
    let tilt;
    let scale;
    for (let i=0; i<candyPos.length; i++){
        pos = new THREE.Vector3(candyPos[i][0], candyY, candyPos[i][1])
        rot = Math.PI/(Math.random()*16-8)
        scale = Math.random()*0.2+0.4
        tilt = (Math.random() - 0.5) * (Math.PI / 6)
        const candy = await loadObject(candyObjSrc, candyObjMtl, pos, rot, scale, false)
        candy.rotateZ(tilt)
        envObjects.push(candy)
    }

    envObjects.forEach(function (object) {
        scene.add(object);
        objects.push(object)
    });

}

function addIcicles(count) {
    const iceRng = seedrandom('icicles')
    const icicles = []
    
    for (let i = 0; i < count; i++) {
        const height = 4 + iceRng() * 15
        const radius = 0.5 + iceRng() * 2.5
        const icicle = Env.createIcicle(height, radius)
        
        //make icicles around perimeter of scene
        const angle = iceRng() * Math.PI * 2
        const distance = (treeZone/2+5) + iceRng() * 25
        
        icicle.position.set(Math.cos(angle) * distance, height / 2, Math.sin(angle) * distance);
        
        //random tilt
        icicle.rotateZ((iceRng() - 0.5) * 0.2)
        icicle.rotateX((iceRng() - 0.5) * 0.2)
        
        icicles.push(icicle);
    }
    return icicles
}


async function loadSounds(){
    const music = await loadBgAudio('./assets/audio/music.mp3', {loop:true, volume:0.15});
    const wind = await loadBgAudio('./assets/audio/wind.mp3', {loop:true, volume:1.3});
    const floor = await loadFloorAudio('./assets/audio/floor2.mp3', {loop:true, volume:1.3});
    const key = await loadKeyAudio('./assets/audio/keys2.mp3', {volume:1.5});
    const door = await loadDoorAudio('./assets/audio/door2.wav', {volume:1.3});
}

