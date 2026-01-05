import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js"
//initialise audio loader
const audioLoader = new THREE.AudioLoader();

let bgAudio;
let walkAudio;
let coinAudio;
let doorAudio;
let listener;

// set up listener for scene
export function initAudio(camera){
    bgAudio = [];

    listener = new THREE.AudioListener();
    camera.add(listener)
}

export async function loadBgAudio(src, options){
    const audio = await loadAudio(src, listener, options)
    bgAudio.push(audio)
    return audio
}

export async function loadFloorAudio(src, options){
    walkAudio = await loadAudio(src, listener, options)
    return walkAudio
}

export async function loadKeyAudio(src, options){
    coinAudio = await loadAudio(src, listener, options)
    return coinAudio
}

export async function loadDoorAudio(src, options){
    doorAudio = await loadAudio(src, listener, options)
    return doorAudio
}

export async function loadAudio(src, listener, options={}) {
    const {
        loop = false,
        volume = 0.5,
    } = options;

    const audio = new THREE.Audio(listener);
    const audioBuffer = await audioLoader.loadAsync(src);
    audio.setBuffer(audioBuffer);
    audio.setLoop(loop);
    audio.setVolume(volume);

    return audio;
}


export function playBgAudio() {
    bgAudio.forEach(function (audio) {
        if (!audio.isPlaying){
            audio.play();
        } 
    });
}

export function pauseBgAudio() {
    bgAudio.forEach(function (audio) {
        if (audio.isPlaying){
            audio.pause();
        }
    });
}

export function stopBgAudio() {
    bgAudio.forEach(function (audio) {
        if (audio.isPlaying){
            audio.stop();
        }
    });
}


export function playWalkAudio() {
    if (!walkAudio.isPlaying){
        console.log("playing audio")
        walkAudio.play();
    }
}

export function stopWalkAudio() {
    if (walkAudio.isPlaying){
        console.log("stopped audio")
        walkAudio.stop();
    }
}

export function playCoinAudio() {
    if (coinAudio) {
        coinAudio.stop();
        coinAudio.play();
    }
}

export function playDoorAudio() {
    if (doorAudio) {
        doorAudio.stop();
        doorAudio.play();
    }
}