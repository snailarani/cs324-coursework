import { playDoorAudio } from "./sounds.js";
let numKeys;
let counter;
let door;

export function gameInit(n, d, currentLevel){
    //initalise counters
    numKeys = (currentLevel==1) ? 12 : 25
    counter = 0

    //define door
    door = d

    //update overlay counter
    if (currentLevel==1){
        document.getElementById('key-img').innerHTML = `<img src="./assets/coin.png" width = 40>`
    }
    else{
        document.getElementById('key-img').innerHTML = `<img src="./assets/candycane.png" width = 40>`
    }
    document.getElementById('key-counter').textContent = `${counter}/${numKeys}`;
}


export function collectKey(){
    counter++

    //update overlay counter
    document.getElementById('key-counter').textContent = `${counter}/${numKeys}`

    //update ui and complete level if all keys are collected
    if(counter == numKeys){
        document.getElementById('top-box').style.width = `500px`
        document.getElementById('key-counter').style.fontSize = `20px`
        document.getElementById('key-img').style.display = `none`
        document.getElementById('key-counter').textContent = `You collected all keys! Find the door and escape!`;
        levelComplete(door)
    }
}


//TODO; maybe add light to door
export function levelComplete(doorGroup){
    const door = doorGroup.getObjectByName('door')
    const knob = doorGroup.getObjectByName('doorKnob')
    door.material.color.set(0xffffff)
    door.material.emissive.set(0xffffff)
    door.material.emissiveIntensity = 0.8
    knob.visible = false
    playDoorAudio()
}


