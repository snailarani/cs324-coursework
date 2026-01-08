import * as THREE from 'three'
//initialise audio loader
const audioLoader = new THREE.AudioLoader();

let bgAudio;
let walkAudio;
let coinAudio;
let doorAudio;
let listener;

/*  
    Initialises audio listener and attaches it to the camera
*/
export function initAudio(camera){
    bgAudio = [];

    listener = new THREE.AudioListener();
    camera.add(listener)
}

/*  
    Loads an audio file to be played in a scene
*/
export async function loadAudio(src, listener, options={}) {
    const {
        loop = false,
        volume = 0.5,
    } = options;

    const audio = new THREE.Audio(listener);
    const audioBuffer = await audioLoader.loadAsync(src);
    audio.setBuffer(audioBuffer);

    // configures play options
    audio.setLoop(loop);
    audio.setVolume(volume);

    return audio;
}

/*  
    Loads background audio(s)
*/
export async function loadBgAudio(src, options){
    const audio = await loadAudio(src, listener, options)
    bgAudio.push(audio)
    return audio
}

/*  
    Loads floor (walking) audio
*/
export async function loadFloorAudio(src, options){
    walkAudio = await loadAudio(src, listener, options)
    return walkAudio
}

/*  
    Loads key collection audio
*/
export async function loadKeyAudio(src, options){
    coinAudio = await loadAudio(src, listener, options)
    return coinAudio
}

/*  
    Loads door open audio
*/
export async function loadDoorAudio(src, options){
    doorAudio = await loadAudio(src, listener, options)
    return doorAudio
}


/*  
    Plays all background audio tracks
*/
export function playBgAudio() {
    bgAudio.forEach(function (audio) {
        if (!audio.isPlaying){
            audio.play();
        } 
    });
}

/*  
    Pauses all background audio tracks
*/
export function pauseBgAudio() {
    bgAudio.forEach(function (audio) {
        if (audio.isPlaying){
            audio.pause();
        }
    });
}

/*  
    Stops all background audio tracks
*/
export function stopBgAudio() {
    bgAudio.forEach(function (audio) {
        if (audio.isPlaying){
            audio.stop();
        }
    });
}

/*  
    Plays walking audio track
*/
export function playWalkAudio() {
    if (!walkAudio.isPlaying){
        walkAudio.play();
    }
}

/*  
    Stops walking audio track
*/
export function stopWalkAudio() {
    if (walkAudio.isPlaying){
        walkAudio.stop();
    }
}

/*  
    Plays pick up coin audio track
*/
export function playKeyAudio() {
    if (coinAudio) {
        coinAudio.stop();
        coinAudio.play();
    }
}

/*  
    Plays door audio track
*/
export function playDoorAudio() {
    if (doorAudio) {
        doorAudio.stop();
        doorAudio.play();
    }
}