import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.170.0/examples/jsm/controls/PointerLockControls.js";
import { collectKey } from "./gameLogic.js"
import { isGameComplete } from "./main.js";
import { playBgAudio, pauseBgAudio, playWalkAudio, stopWalkAudio, playKeyAudio } from "./sounds.js";

let onClickLock
let onKeyDown
let onKeyUp
let onClickPickUp

/*
    makes all user controls and adds them to the canvas
*/
export function makeControls(camera, scene, currentLevel){
    //pointer lock
    const pointerLock = makePointerLock(camera)
    onClickLock = function(){pointerLock.lock()}

    //key binders (wasd)
    const binds = makeKeyBinds(pointerLock)
    onKeyDown = binds.onKeyDown
    onKeyUp = binds.onKeyUp

    //pick up coins
    onClickPickUp = function(){
        pickUpKey(pointerLock, camera, scene, currentLevel)
    };

    //add binds to canvas
    document.addEventListener('click', onClickLock);
    document.addEventListener('click', onClickPickUp);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return pointerLock
}


/*
    remove controls from canvas
*/
export function removeControls(controls) {
    document.removeEventListener('click', onClickLock);
    document.removeEventListener('click', onClickPickUp);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);

    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;

    controls = null;
}


/*
    creates pointer lock controls to lock cursor to screen center
*/
function makePointerLock(camera){
    const pointerLock = new PointerLockControls( camera, document.body );

    // when locked, add ui and sounds
    pointerLock.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        overlay.style.display = 'flex';
        playBgAudio();

    } );

    //when unlocked, show menu and stop sounds
    pointerLock.addEventListener( 'unlock', function () {

        if (!isGameComplete()) {
            overlay.style.display = 'none';
            blocker.style.display = 'flex';
            instructions.style.display = 'flex';
        } else {
            // game finished - don't show menu
            blocker.style.display = 'none';
            instructions.style.display = 'none';
        }
        pauseBgAudio();
        stopWalkAudio();
    } );

    return pointerLock
}


let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;


/*
    defines keyboard movement controls
*/
function makeKeyBinds(controls){
    //Movement
    const onKeyDown = function (event){

        //don't move if the screen is locked (prevents sliding/drifting)
        if (!controls.isLocked) return;

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
        playWalkAudio()
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

        //play floor audio if any movement occurs
        if (!moveForward && !moveBackward && !moveLeft && !moveRight) {
            stopWalkAudio();
        }
    }

    return {onKeyDown, onKeyUp}
}


const clickRay = new THREE.Raycaster();
const maxClickDist = 10;

/*
    defines click action to pick up key object
*/
function pickUpKey(controls, camera, scene, currentLevel){
    if (!controls.isLocked){
        return
    }

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

    // get first object hit, if its a key remove from scene
    const intersection = intersections[0]
    if (intersection!=null){
        const object = intersection.object
        if (object.name==keyName){
            playKeyAudio()
            collectKey(scene, object)
        }
    }
}

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const rayZDir = new THREE.Vector3();
const rayXDir = new THREE.Vector3();

let intersectionsZ = []
let intersectionsX = []

let playerRadius = 0.5

let rayZ = new THREE.Raycaster();
rayZ.near = 0
rayZ.far = playerRadius

let rayX = new THREE.Raycaster();
rayX.near = 0
rayX.far = playerRadius


/*
    updates player position each frame
*/
export function updatePosition(delta, controls, objects, camera, currentLevel){

    //ignore large deltas
    if (delta > 0.05) {
        return;
    }

    //TODO - initialise these somewhere else (once at beginning of each level)
    //set speed
    const speed = (currentLevel==1) ? 12 : 15;

    //set ray offset (from camera) for collision detection
    const rayOffset = (currentLevel==1) ? 1 : 0.3

    //if controls are locked, set velocity to 0 just in case
    if (!controls.isLocked){
        velocity.set(0,0,0)
        return
    }

    //get player posisition
    const playerPos = controls.object.position

    //determine movement direction
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);

    //determine movement speed (add acceleration for smooth movement)
    velocity.x -= velocity.x * 5 * delta
    velocity.z -= velocity.z * 5 * delta

    //determine movement distance
    if (moveForward || moveBackward){
        velocity.z -= direction.z * speed * delta
    } 
    if (moveLeft || moveRight){
        velocity.x -= direction.x * speed * delta
    } 

    //look for collisions/blocking objects (raycasting)
    //raycast for objects infront/behind
    controls.getDirection(rayZDir);
    rayZDir.y = 0
    rayZDir.normalize()

    let blockedZ = false;

    //if moving forward, raycast forward/backwards
    if (velocity.z != 0) {
        const directionZ = -Math.sign(velocity.z);  //ray points forward/backward

        //get player position to set ray origin
        rayZ.ray.origin.copy(playerPos);
        rayZ.ray.origin.y -= rayOffset;

        rayZ.ray.direction.copy(rayZDir).multiplyScalar(directionZ);

        //check for intersection objects
        intersectionsZ = rayZ.intersectObjects(objects, true);
        blockedZ = intersectionsZ.length > 0;
    }

    //raycast for objects left/right
    rayXDir.crossVectors(rayZDir, camera.up)
    rayXDir.normalize()

    let blockedX = false;

    //if moving left/right, raycast left/right
    if (velocity.x != 0) {
        const directionX = -Math.sign(velocity.x); //ray points left/right

        //get player position to set ray origin
        rayX.ray.origin.copy(playerPos);
        rayX.ray.origin.y -= rayOffset;

        rayX.ray.direction.copy(rayXDir).multiplyScalar(directionX);

        //check for intersection objects
        intersectionsX = rayX.intersectObjects(objects, true);
        blockedX = intersectionsX.length > 0;
    }

    //update position
    if (!blockedZ) {
        controls.moveForward(-velocity.z * delta);
    }
    else{
        velocity.z = 0; //set to 0 to prevent camera 'sliding' from acc
    }

    if (!blockedX) {
        controls.moveRight(-velocity.x * delta);
    }
    else{
        velocity.x = 0;
    }
}

/*
    checks if player collides with door
*/
export function checkDoorCollision(){
    //get the first object intersected by the ray

    //checking z movement
    const intersectionZ = intersectionsZ[0]
    if (intersectionZ!=null){
        const object = intersectionZ.object
        //if the object is the door, return true
        if (object.name=="door"|| object.name=="doorKnob"){
            return true
        }
    }

    //checking x movement
    const intersectionX = intersectionsX[0]
    if (intersectionX!=null){
        const object = intersectionX.object
        if (object.name=="door"|| object.name=="doorKnob"){
            return true;
            
        }
    }
    return false
}
