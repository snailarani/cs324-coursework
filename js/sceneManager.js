import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';




export function makeScene(){
    // Scene set up
    const scene = new THREE.Scene();
    const objects = [];

    scene.background = new THREE.Color(0x79aaf7);
    //TODO: add fog? for lvl 2

    //floor
    const floorGeometry = new THREE.PlaneGeometry(20,20);
    floorGeometry.rotateX( - Math.PI / 2 );

    const floorTexture = new THREE.TextureLoader().load('assets/shipfloor.jpg')
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(5, 5);

    const floorMaterial = new THREE.MeshPhongMaterial()
    floorMaterial.map = floorTexture
    
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.receiveShadow = true;
    scene.add(floor);
    objects.push(floor);


    // walls
    const wallTexture = new THREE.TextureLoader().load('assets/shipwall.png')
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 0.5);

    const wallMaterial = new THREE.MeshPhongMaterial()
    wallMaterial.map = wallTexture

    const leftWall = makeWall(new THREE.Vector3(-10, 2.5, 0), 0.2, 5, 20, wallMaterial);
    const rightWall = makeWall(new THREE.Vector3(10, 2.5, 0), 0.2, 5, 20, wallMaterial);

    const frontWall = makeWall(new THREE.Vector3(0, 2.5, -10), 0.2, 5, 20, wallMaterial);
    frontWall.rotateY( - Math.PI / 2 );
    
    const backWall = makeWall(new THREE.Vector3(0, 2.5, 10), 0.2, 5, 20, wallMaterial);
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
    const roofTexture = new THREE.TextureLoader().load('assets/shipwall.png')
    const roofMaterial = new THREE.MeshPhongMaterial()
    roofMaterial.map = roofTexture

    const roof = makeWall(new THREE.Vector3(0, 5, 0), 0.2, 20, 20, roofMaterial);
    roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping;
    roofTexture.repeat.set(5, 5);
    roof.rotateZ( - Math.PI / 2 );
    scene.add(roof)


    // crates
    const crateTexture =  new THREE.TextureLoader().load('assets/crate1.jpg')
    const crateMaterial = new THREE.MeshPhongMaterial()
    crateMaterial.map = crateTexture

    const crate = makeCrate(new THREE.Vector3(0,0.0,0), 1.5, 1.5, 1.5, crateMaterial);
    scene.add(crate);
    objects.push(crate);

    // Light

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 4, 0);
    light.castShadow = true;
    scene.add(light);

    scene.add(new THREE.AxesHelper(5));      // X red, Y green, Z blue
    scene.add(new THREE.GridHelper(20, 20)); // grid on the ground

    return {scene, objects};
}


function makeWall(pos, w, h, d, material){
    const wallGeometry = new THREE.BoxGeometry(w, h, d);

    const wall = new THREE.Mesh(wallGeometry, material);

    wall.position.set(pos.x, pos.y, pos.z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    return wall;
}


function makeCrate(pos, w, h, d, material, options = {}){
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