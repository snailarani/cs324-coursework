import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

export function makeMaterial(options = {}){
    const{
        color = null,
        textureSrc = null,
        roughnessScr = null,
        nomralScr = null,
        repeat = [1,1],
        roughness = 0.8,
        metalness = 0.0,
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

    if(roughnessScr!=null){
        textureParams.roughnessMap = loadTexture(roughnessScr, repeat);
    }

    if(nomralScr!=null){
        const normalMap = loadTexture(nomralScr, repeat);
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