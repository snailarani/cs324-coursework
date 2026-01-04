import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.170.0/examples/jsm/controls/PointerLockControls.js";
import { collectKey } from "./game.js"

//TODO: add bobbing up and down when walking (don't shift the camera up/down, you'll drift, use sine wave from set base height (camera height))
//TODO: Change raycast position for level 2 (make it chest height not feet height)

let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 23

let forwardDir = new THREE.Vector3;
let rightDir = new THREE.Vector3;

let playerRadius = 0.5
let ray_forward = new THREE.Raycaster( new THREE.Vector3(), forwardDir, 0, playerRadius );
let ray_right = new THREE.Raycaster( new THREE.Vector3(), rightDir, 0, playerRadius );


export function makeControls(camera, scene){
    //Making pointer controls
    const controls = new PointerLockControls( camera, document.body );

    //locks cursor on click
    document.addEventListener('click', function () {
        overlay.style.display = 'flex';
        controls.lock();
    });

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    } );

    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'flex';  
        instructions.style.display = 'flex';  
    } );

    //Movement
    const onKeyDown = function (event){
        switch(event.code){
            //W - Forward
            case 'KeyW':
                moveForward = true;
                break;
            //A - left
            case 'KeyA':
                moveLeft = true;
                break;
            //S - Backwards
            case 'KeyS':
                moveBackward = true;
                break;
            //D - Right
            case 'KeyD':
                moveRight = true;
                break;
        }
    }

    const onKeyUp = function (event){
        switch(event.code){
            //W - Forward
            case 'KeyW':
                moveForward = false;
                break;
            //A - left
            case 'KeyA':
                moveLeft = false;
                break;
            //S - Backwards
            case 'KeyS':
                moveBackward = false;
                break;
            //D - Right
            case 'KeyD':
                moveRight = false;
                break;
        }
    }

    document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

    //add controls to pick up coins
    document.addEventListener('click', function(){
        pickUpCoin(controls, camera, scene)
    })

    return controls
};


const clickRay = new THREE.Raycaster();
const maxClickDist = 10;

function pickUpCoin(controls, camera, scene){
    if (!controls.isLocked){
        return
    }

    const currentLevel=2
    let keyName;

    if (currentLevel==1){
        keyName = 'Doubloon'
    } 
    else{
        keyName = 'CandyCane'
    }

    //set up raycaster for clicking
    const cameraDir = new THREE.Vector3()
    camera.getWorldDirection(cameraDir)

    clickRay.set(camera.position, cameraDir)
    clickRay.far = maxClickDist

    let intersections = clickRay.intersectObjects(scene.children, true);

    console.log("Found", intersections.length, "objects within range");
        
    //debugging
    intersections.forEach(function (intersection) {
        const hitObject = intersection.object;
        
        // Log all the info we can get
        console.log("Hit object:", {
            name: hitObject.name,
            type: hitObject.type,
            distance: intersection.distance.toFixed(2),
            position: hitObject.position,
            parent: hitObject.parent?.name || "no parent"
        });

        // Try to find the root object (like candy cane model)
        let rootObject = hitObject;
        while (rootObject.parent && rootObject.parent.type !== 'Scene') {
            rootObject = rootObject.parent;
        }
        
        console.log("Root object:", rootObject.name || rootObject.type);
    });

    // get first object hit, and remove from scene
    const intersection = intersections[0]
    if (intersection!=null ){
        const object = intersection.object
        if (object.name==keyName){
            scene.remove(object.parent)
            collectKey()
        }
    }

    scene.add(new THREE.ArrowHelper(clickRay.ray.direction, clickRay.ray.origin, 300, 0xff0000) );
}




export function updateControls(delta, controls, objects, camera, speed, ray_offset){

    //Only move if cursor is locked
    if (!controls.isLocked) return;

    const playerPos = controls.object.position

    //Determine movement direction
    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );

    //Add acceleration for smooth movement
    velocity.x -= velocity.x * 5 * delta;
    velocity.z -= velocity.z * 5 * delta;

    //Determine movement length
    if ( moveForward || moveBackward ) velocity.z -= direction.z * speed * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * speed * delta;

    //Handling collisions

    //Get camera direction first
    controls.getDirection(forwardDir);
    
    //Calculate forward and right directions
    const horizontalForward = new THREE.Vector3(forwardDir.x, 0, forwardDir.z).normalize();
    const rightVector = new THREE.Vector3().crossVectors(horizontalForward, camera.up).normalize();

    //Forward/Backwards
    let blockedForward = false;

    //Only raycast forward/backward if moving forward/backward
    if (velocity.z !== 0) {
        const dirZ = horizontalForward.clone().multiplyScalar(-Math.sign(velocity.z)); //right or left
        ray_forward.ray.origin.copy(playerPos);
        ray_forward.ray.origin.y -= ray_offset; //ray from chest position
        ray_forward.ray.direction.copy(dirZ);
        blockedForward = ray_forward.intersectObjects(objects, true).length > 0;
    }

    //Right/Left
    let blockedRight = false;

    //Only raycast left/right if moving left/right
    if (velocity.x !== 0) {
        const dirX = rightVector.clone().multiplyScalar(-Math.sign(velocity.x)); //forward or backward
        ray_right.ray.origin.copy(playerPos);
        ray_right.ray.origin.y -= ray_offset; //ray from chest position
        ray_right.ray.direction.copy(dirX);
        const intersections = ray_right.intersectObjects(objects, true);
        blockedRight = intersections.length > 0;
    } 

    //Move if no collisions
    if (!blockedForward) {
        controls.moveForward(-velocity.z * delta);
    }
    else{
        velocity.z = 0; //set to 0 to prevent camera 'sliding' from acc
    }

    if (!blockedRight) {
        controls.moveRight(-velocity.x * delta);
    }
    else{
        velocity.x = 0;
    }
}