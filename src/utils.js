import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';


THREE.Cache.enabled = true;

// initialise a loader
const textureLoader = new THREE.TextureLoader();

// create a cache to store loaded textures
const textureCache = new Map();


export function makeMaterial(options = {}){
    const{
        color = null,
        textureSrc = null,
        roughnessSrc = null,
        normalSrc = null,
        repeat = [1,1],
        roughness = 0.5,
        metalness = 0.3,
        normalScale = 1.0,
        visible = true,
    } = options;

    const textureParams = {
        roughness: roughness,
        metalness: metalness,
        color: color || 0xffffff, // default white if no color
        visible: visible,
    }

    if(textureSrc!=null){
        textureParams.map = loadTexture(textureSrc, repeat);
        textureParams.map.colorSpace = THREE.SRGBColorSpace;
    }

    if(roughnessSrc!=null){
        textureParams.roughnessMap = loadTexture(roughnessSrc, repeat);
        textureParams.roughnessMap.colorSpace = THREE.NoColorSpace;
    }

    if(normalSrc!=null){
        const normalMap = loadTexture(normalSrc, repeat);
        normalMap.colorSpace = THREE.NoColorSpace;
        textureParams.normalMap = normalMap;
        textureParams.normalScale = new THREE.Vector2(normalScale, normalScale);
    }

    const material = new THREE.MeshStandardMaterial(textureParams);
    return material;
}

function loadTexture(src, repeat){
    const key = src + repeat.toString(); // have to store different textures if they are modified

    // if texture is already in cache, return it
    if(textureCache.has(key)){
        return textureCache.get(key);
    }

    // otherwise load new texture and store
    const texture = textureLoader.load(src);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat[0], repeat[1]);
    textureCache.set(key, texture);

    return texture;
}

export function randomRGB(){
    const rRange =[0,255];
    const gRange =[0,255];
    const bRange =[0,255];
    const r = Math.floor(Math.random()*(rRange[1]-rRange[0])+rRange[0]);
    const g = Math.floor(Math.random()*(gRange[1]-gRange[0])+gRange[0]);
    const b = Math.floor(Math.random()*(bRange[1]-bRange[0])+bRange[0]);
    return new THREE.Color(r/255, g/255, b/255);
}


// initialise object loader:
const objLoader = new OBJLoader();
const matLoader = new MTLLoader()

export async function loadObject(src, materialsrc, pos, rotation=0, scale=1){
    const material = await matLoader.loadAsync( materialsrc );
    objLoader.setMaterials( material );

    const object = await objLoader.loadAsync( src );

    // add inivisible box for collider
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const collider = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        makeMaterial({ visible: false })
    );

    collider.position.copy(center);

    // Attach collider to model (so it moves with it)
    object.add(collider);
    collider.position.sub(object.position);

    //cast shadows (each mesh)
    object.traverse(function(node){
        if(node.isMesh){
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });


    //position object
    object.rotateY(rotation)
    object.position.copy(pos)
    object.scale.setScalar(scale)

    return object;
}


//initialise audio loader
const audioLoader = new THREE.AudioLoader();

export async function loadAudio(src, listener, options={}) {
    const {
        loop = false,
        volume = 0.5,
        autoplay=false,
    } = options;

    const audio = new THREE.Audio(listener);
    const audioBuffer = await audioLoader.loadAsync(src);
    audio.setBuffer(audioBuffer);
    audio.setLoop(loop);
    audio.setVolume(volume);

    if(autoplay){
        audio.play();
    }
    return audio;
}


