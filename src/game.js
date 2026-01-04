

let numKeys;
let counter;
let door;

export function gameInit(n, d){
    numKeys = 1
    counter = 0
    door = d
}

export function collectKey(){
    counter++
    console.log("Keys:", counter + "/" + numKeys);
    if(counter == numKeys){
        console.log("Level Complete")
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
    
}


