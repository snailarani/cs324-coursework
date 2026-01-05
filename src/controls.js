import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.170.0/examples/jsm/controls/PointerLockControls.js";
import { collectKey, isLevelComplete } from "./game.js"
import { playBgAudio, pauseBgAudio, playWalkAudio, stopWalkAudio, playCoinAudio } from "./sounds.js";


//TODO: add bobbing up and down when walking (don't shift the camera up/down, you'll drift, use sine wave from set base height (camera height))
//TODO: fix animation stuff (moving pointer lock, improve collision stuff)

let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let forwardDir = new THREE.Vector3();
let rightDir = new THREE.Vector3();

let playerRadius = 0.5
let ray_forward = new THREE.Raycaster( new THREE.Vector3(), forwardDir, 0, playerRadius );
let ray_right = new THREE.Raycaster( new THREE.Vector3(), rightDir, 0, playerRadius );


export function makeControls(camera, scene, currentLevel){
    //Making pointer controls
    const controls = new PointerLockControls( camera, document.body );

    //store locked mouse position
    let lockedRotation = { x: 0, y: 0 };

    //locks cursor on click
    document.addEventListener('click', function () {
        controls.lock();
    });

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        overlay.style.display = 'flex';
        playBgAudio();

    } );

    controls.addEventListener( 'unlock', function () {
        overlay.style.display = 'none';
        blocker.style.display = 'flex';  
        instructions.style.display = 'flex'; 
        pauseBgAudio();
        stopWalkAudio();

    } );

    //Movement
    const onKeyDown = function (event){

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

        if (!moveForward && !moveBackward && !moveLeft && !moveRight) {
            stopWalkAudio();
    }
    }
        


    document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

    //add controls to pick up coins
    document.addEventListener('click', function(){
        pickUpCoin(controls, camera, scene, currentLevel)
    })

    return controls
};


const clickRay = new THREE.Raycaster();
const maxClickDist = 10;

function pickUpCoin(controls, camera, scene, currentLevel){
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

    // get first object hit, and remove from scene
    const intersection = intersections[0]
    if (intersection!=null ){
        const object = intersection.object
        if (object.name==keyName){
            scene.remove(object.parent)
            playCoinAudio()|
            collectKey()
        }
    }
}


// handling movement
export function updateControls(delta, controls, objects, camera, currentLevel, door){

    const speed = (currentLevel==1) ? 12 : 15;
    const ray_offset = (currentLevel==1) ? 1 : 0;

    if (!controls.isLocked) {
        // Reset velocity when not locked
        velocity.set(0, 0, 0);
        return;
    }

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

    let intersectionsZ
    let intersectionsX

    //Only raycast forward/backward if moving forward/backward
    if (velocity.z != 0) {
        const dirZ = horizontalForward.clone().multiplyScalar(-Math.sign(velocity.z)); //right or left
        ray_forward.ray.origin.copy(playerPos);
        ray_forward.ray.origin.y -= ray_offset; //ray from chest position
        ray_forward.ray.direction.copy(dirZ);
        intersectionsZ = ray_forward.intersectObjects(objects, true);
        blockedForward = intersectionsZ.length > 0;

        if(isLevelComplete()){
            const intersectionZ = intersectionsZ[0]
            if (intersectionZ!=null){
                const object = intersectionZ.object
                if (object.name=="door"|| object.name=="doorKnob"){
                    return true;
                }
            }
        }
    }

    //Right/Left
    let blockedRight = false;

    //Only raycast left/right if moving left/right
    if (velocity.x != 0) {
        const dirX = rightVector.clone().multiplyScalar(-Math.sign(velocity.x)); //forward or backward
        ray_right.ray.origin.copy(playerPos);
        ray_right.ray.origin.y -= ray_offset; //ray from chest position
        ray_right.ray.direction.copy(dirX);
        intersectionsX = ray_right.intersectObjects(objects, true);
        blockedRight = intersectionsX.length > 0;

        if(isLevelComplete()){
            const intersectionX = intersectionsX[0]
            if (intersectionX!=null){
                const object = intersectionX.object
                if (object.name=="door"|| object.name=="doorKnob"){
                    return true;
                }
            }
        }
    } 

    // //check for door
    // if(isLevelComplete()){
    //     const intersectionZ = intersectionsZ[0]
    //     const intersectionX = intersectionsX[0]
    //     if (intersectionZ!=null){
    //         const object = intersectionZ.object
    //         if (object.name=="door"|| object.name=="doorKnob"){
    //             return true;
    //         }
    //     }
    //     if (intersectionX!=null){
    //         const object = intersectionX.object
    //         if (object.name=="door"|| object.name=="doorKnob"){
    //             return true;
    //         }
    //     }
    // }



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
    return false
}


function checkDoorCollision(playerPos, doorGroup){
    const door = doorGroup.getObjectByName('door')

}