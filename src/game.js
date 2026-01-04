
let numKeys;
let counter;
let door;

export function gameInit(n, d){
    numKeys = 1
    counter = 0
    door = d
    document.getElementById('key-img').innerHTML = `<img src="./assets/candycane.png" width = 40>`
    document.getElementById('key-counter').textContent = `${counter}/${numKeys}`;
}

export function collectKey(){
    counter++
    console.log("Keys:", counter + "/" + numKeys);
    document.getElementById('key-counter').textContent = `${counter}/${numKeys}`;
    if(counter == numKeys){
        document.getElementById('top-box').style.width = `500px`
        document.getElementById('key-counter').style.fontSize = `20px`
        document.getElementById('key-img').style.display = `none`
        document.getElementById('key-counter').textContent = `You collected all keys! Find the door and escape!`;
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


