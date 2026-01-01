import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.170.0/examples/jsm/controls/PointerLockControls.js";

//TODO: add bobbing up and down when walking (don't shift the camera up/down, you'll drift, use sine wave from set base height (camera height))

let moveForward = false;
let moveBackward = false;
let moveRight = false;
let moveLeft = false;
let jump = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 23

let forwardDir = new THREE.Vector3;
let rightDir = new THREE.Vector3;

let playerRadius = 0.5
let ray_down = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, playerRadius );
let ray_forward = new THREE.Raycaster( new THREE.Vector3(), forwardDir, 0, playerRadius );
let ray_right = new THREE.Raycaster( new THREE.Vector3(), rightDir, 0, playerRadius );


export function makeControls(camera){
    //Making pointer controls
    const controls = new PointerLockControls( camera, document.body );

    // locks cursor on click
    document.addEventListener('click', function () {
        controls.lock();
    });

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';

    } );

    controls.addEventListener( 'unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';

    } );

    // Movement
    const onKeyDown = function (event){
        switch(event.code){
            // W - Forward
            case 'KeyW':
                moveForward = true;
                break;
            // A - left
            case 'KeyA':
                moveLeft = true;
                break;
            // S - Backwards
            case 'KeyS':
                moveBackward = true;
                break;
            // D - Right
            case 'KeyD':
                moveRight = true;
                break;
        }
    }

    const onKeyUp = function (event){
        switch(event.code){
            // W - Forward
            case 'KeyW':
                moveForward = false;
                break;
            // A - left
            case 'KeyA':
                moveLeft = false;
                break;
            // S - Backwards
            case 'KeyS':
                moveBackward = false;
                break;
            // D - Right
            case 'KeyD':
                moveRight = false;
                break;
        }
    }

    document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);


    // Movement physics
    return controls
};


export function updateControls(delta, controls, objects, camera){

    // Only move if cursor is locked
    if (!controls.isLocked) return;

    const playerPos = controls.object.position

    // Determine movement direction
    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );

    // Add acceleration for smooth movement
    velocity.x -= velocity.x * 5 * delta;
    velocity.z -= velocity.z * 5 * delta;

    // Determine movement length
    if ( moveForward || moveBackward ) velocity.z -= direction.z * speed * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * speed * delta;



    // Handling collisions

    // Debug logging
    if (moveLeft || moveRight) {
        console.log('Moving:', moveLeft ? 'LEFT' : 'RIGHT');
        console.log('direction.x:', direction.x);
        console.log('velocity.x:', velocity.x);
    }

    // Get camera direction first
    controls.getDirection(forwardDir);
    
    // Calculate forward and right directions
    const horizontalForward = new THREE.Vector3(forwardDir.x, 0, forwardDir.z).normalize();
    const rightVector = new THREE.Vector3().crossVectors(horizontalForward, camera.up).normalize();

    // Forward/Backwards
    let blockedForward = false;

    // Only raycast forward/backward if moving forward/backward
    if (velocity.z !== 0) {
        const dirZ = horizontalForward.clone().multiplyScalar(-Math.sign(velocity.z)); // right or left
        ray_forward.ray.origin.copy(playerPos);
        ray_forward.ray.origin.y -= 1; // ray from chest position
        ray_forward.ray.direction.copy(dirZ);
        blockedForward = ray_forward.intersectObjects(objects, true).length > 0;
    }

    // Right/Left
    let blockedRight = false;

    // Only raycast left/right if moving left/right
    if (velocity.x !== 0) {
        const dirX = rightVector.clone().multiplyScalar(-Math.sign(velocity.x)); // forward or backward
        ray_right.ray.origin.copy(playerPos);
        ray_right.ray.origin.y -= 1; // ray from chest position
        ray_right.ray.direction.copy(dirX);
        const intersections = ray_right.intersectObjects(objects, true);
        blockedRight = intersections.length > 0;
        
        console.log('rightVector:', rightVector, 'dirX:', dirX, 'intersections:', intersections.length);
    } else if (moveLeft || moveRight) {
        console.log('velocity.x is 0 but keys are pressed!');
    }


    // Move if no collisions
    if (!blockedForward) {
        controls.moveForward(-velocity.z * delta);
    }
    else{
        velocity.z = 0; // set to 0 to prevent camera 'sliding' from acc
    }

    if (!blockedRight) {
        controls.moveRight(-velocity.x * delta);
    }
    else{
        velocity.x = 0;
    }
    

}