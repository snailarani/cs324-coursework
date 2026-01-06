import { playDoorAudio } from "./sounds.js";
let numKeys;
let counter;
let door;
let levelcomplete = false;

export function gameInit(d, currentLevel){
    //initalise variables
    numKeys = (currentLevel==1) ? 12 : 25
    counter = 0
    levelcomplete = false

    //define door
    door = d

    //reset ui to default styles
    document.getElementById('top-box').style.width = ''
    document.getElementById('key-counter').style.fontSize = ''
    document.getElementById('key-img').style.display = ''

    //update overlay counter
    if (currentLevel==1){
        document.getElementById('key-img').innerHTML = `<img src="./assets/coin.png" width = 40>`
    }
    else{
        document.getElementById('key-img').innerHTML = `<img src="./assets/candycane.png" width = 40>`
    }
    document.getElementById('key-counter').textContent = `${counter}/${numKeys}`;
}


export function collectKey(scene, object){
    //remove key from screen
    scene.remove(object.parent)

    counter++

    //update overlay counter
    document.getElementById('key-counter').textContent = `${counter}/${numKeys}`

    //update ui and complete level if all keys are collected
    if(counter == numKeys){
        levelcomplete = true
        document.getElementById('top-box').style.width = `500px`
        document.getElementById('key-counter').style.fontSize = `20px`
        document.getElementById('key-img').style.display = `none`
        document.getElementById('key-counter').textContent = `You collected all keys! Find the door and escape!`;
        updateDoor(door)
    }
}


export function updateDoor(doorGroup){
    const door = doorGroup.getObjectByName('door')
    const knob = doorGroup.getObjectByName('doorKnob')
    door.material.color.set(0xffffff)
    door.material.emissive.set(0xffffff)
    door.material.emissiveIntensity = 0.8
    knob.visible = false
    levelcomplete = true
    playDoorAudio()
}


export function isLevelComplete(){
    return levelcomplete;
}


