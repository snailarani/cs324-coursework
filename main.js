import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js"

import {makeScene} from "./js/sceneManager.js"
import { makeCamera } from "./js/camera.js";
import {makeRenderer} from "./js/renderer.js"
import {animate} from "./js/renderer.js"


const scene = makeScene();
const camera = makeCamera();
const renderer = makeRenderer();


animate(renderer, scene, camera);






