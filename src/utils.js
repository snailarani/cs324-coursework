import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

export function makeMaterial(options = {}){
    const{
        color = null,
        textureSrc = null,
        roughnessSrc = null,
        normalSrc = null,
        repeat = [1,1],
        roughness = 0.5,
        metalness = 0.15,
        normalScale = 1.0,
    } = options;

    const textureParams = {
        roughness: roughness,
        metalness: metalness,
        color: color || 0xffffff, // default white if no color
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
    const texture = new THREE.TextureLoader().load(src);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat[0], repeat[1]);
    return texture;
}