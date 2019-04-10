import {vec3, mat3, vec2} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Road from './Road';
import Plane from './geometry/Plane';
import BuildingSystem from './BuildingSystem';
import Cube from './geometry/Cube';
import Mesh from './geometry/Mesh';

import Triangle from './geometry/Triangle';
import Building from './Building';
import {readTextFile} from './globals';


// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  displayTerrain: true,
  displayPopulation: true,
  shorePopulation: 0.5,
  roadLength: 0.11,
  gridDensity: 1.0,
};

let square: Square;
let buildingSquare: Cube;
let buildingPent: Mesh;
let buildingOct: Mesh;


let screenQuad: ScreenQuad;
let skyQuad: ScreenQuad;
let plane: Plane;
let time: number = 0.0;
let road: Road;
let buildingSystem: BuildingSystem;
let prevPopSeed = controls.shorePopulation;
let prevRoadLength = controls.roadLength;
let prevGridDensity = controls.gridDensity;

function loadScene(road: Road, buildingSystem: BuildingSystem) {
  square = new Square();
  square.create();

  buildingSquare = new Cube(vec3.fromValues(0, 0, 0), 2);
  buildingSquare.create();

  let obj0: string = readTextFile('./src/pentagon.obj');
  buildingPent = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  buildingPent.create();


  let obj1: string = readTextFile('./src/octagon.obj');
  buildingOct = new Mesh(obj1, vec3.fromValues(0, 0, 0));
  buildingOct.create();





  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  // let offsetsArray = [];
  // let colorsArray = [];
  // let transformationsArray = [];

  let col1sArray = [];
  let col2sArray = [];
  let col3sArray = [];


  let n: number = road.transformations.length;

  for(let i = 0; i < n; i++) {
    let transformation: mat3 = road.transformations[i];

      col1sArray.push(transformation[0]);
      col1sArray.push(transformation[1]);
      col1sArray.push(transformation[2]);

      col2sArray.push(transformation[3]);
      col2sArray.push(transformation[4]);
      col2sArray.push(transformation[5]);

      col3sArray.push(transformation[6]);
      col3sArray.push(transformation[7]);
      col3sArray.push(transformation[8]);

  }
  // let offsets: Float32Array = new Float32Array(offsetsArray);
  // let colors: Float32Array = new Float32Array(colorsArray);
  let col1s: Float32Array = new Float32Array(col1sArray);
  let col2s: Float32Array = new Float32Array(col2sArray);
  let col3s: Float32Array = new Float32Array(col3sArray);

  let tempOffsets: Float32Array = new Float32Array(col1sArray);

  square.setInstanceVBOs(col1s, col2s, col3s, tempOffsets);
  square.setNumInstances(n); // grid of "particles"





  let offsetsArraySquare = [];


  let nSquare: number = 0;

  for(var i = 0; i < buildingSystem.buildings.length; i++) {
    for (var j = 0; j < buildingSystem.buildings[i].squarePositions.length; j++) {
      let currPosition = buildingSystem.buildings[i].squarePositions[j];
      offsetsArraySquare.push(currPosition[0]);
      offsetsArraySquare.push(currPosition[1]);
      offsetsArraySquare.push(currPosition[2]);
      nSquare++;
    }

  }
  let offsetsSquare: Float32Array = new Float32Array(offsetsArraySquare);

  buildingSquare.setInstanceVBOs(col1s, col2s, col3s, offsetsSquare);
  buildingSquare.setNumInstances(nSquare); // grid of "particles"



  let offsetsArrayPent = [];


  let nPent: number = 0;

  for(var i = 0; i < buildingSystem.buildings.length; i++) {
    for (var j = 0; j < buildingSystem.buildings[i].pentPositions.length; j++) {
      let currPosition = buildingSystem.buildings[i].pentPositions[j];
      offsetsArrayPent.push(currPosition[0]);
      offsetsArrayPent.push(currPosition[1]);
      offsetsArrayPent.push(currPosition[2]);
      nPent++;
    }

  }
  let offsetsPent: Float32Array = new Float32Array(offsetsArrayPent);

  buildingPent.setInstanceVBOs(col1s, col2s, col3s, offsetsPent);
  buildingPent.setNumInstances(nPent); // grid of "particles"




  let offsetsArrayOct = [];


  let nOct: number = 0;

  for(var i = 0; i < buildingSystem.buildings.length; i++) {
    for (var j = 0; j < buildingSystem.buildings[i].octPositions.length; j++) {
      let currPosition = buildingSystem.buildings[i].octPositions[j];
      offsetsArrayOct.push(currPosition[0]);
      offsetsArrayOct.push(currPosition[1]);
      offsetsArrayOct.push(currPosition[2]);
      nOct++;
    }

  }
  let offsetsOct: Float32Array = new Float32Array(offsetsArrayOct);

  buildingOct.setInstanceVBOs(col1s, col2s, col3s, offsetsOct);
  buildingOct.setNumInstances(nOct); // grid of "particles"





}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);



  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'displayTerrain');
  gui.add(controls, 'displayPopulation');
  gui.add(controls, 'shorePopulation', 0.0, 1.0).step(0.1);
  gui.add(controls, 'roadLength', 0.08, 0.14).step(0.01);
  gui.add(controls, 'gridDensity', 0.5, 1.5).step(0.1);


  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);


  screenQuad = new ScreenQuad();
  screenQuad.create();
  skyQuad = new ScreenQuad();
  skyQuad.create();
  plane = new Plane(vec3.fromValues(0, -3, 0), vec2.fromValues(8, 8), 20);
  plane.create();


  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const buildingShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/buildingSquare-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/buildingSquare-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const texture = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/texture-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/texture-frag.glsl')),
  ]);

  const sky = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/sky-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/sky-frag.glsl')),
  ]);




  // This function will be called every frame
  const texWidth = window.innerWidth;
    const texHeight = window.innerHeight;
  
    var fb = gl.createFramebuffer();
    var myTexture = gl.createTexture();
    var rb = gl.createRenderbuffer();
  
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.bindTexture(gl.TEXTURE_2D, myTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texWidth, texHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);   
  
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texWidth, texHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
  
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, myTexture, 0);
  
  
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
  
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      console.log("error");
    }
  
    // Render 3D Scene:
  
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // done with shader fun code for this part


    flat.setShorePop(controls.shorePopulation);

    renderer.render(camera, flat,[screenQuad]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, myTexture, 0);
    var pixels = new Uint8Array(texWidth * texHeight * 4);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
      gl.readPixels(0, 0, texWidth, texHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    }
    road = new Road(pixels, texWidth, texHeight, controls.roadLength, controls.gridDensity);
    buildingSystem = new BuildingSystem(road, 7);

    loadScene(road, buildingSystem);



  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    sky.setTime(time++);

    if (prevPopSeed != controls.shorePopulation || prevRoadLength != controls.roadLength || prevGridDensity != controls.gridDensity) {
      
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, window.innerWidth, window.innerHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      flat.setShorePop(controls.shorePopulation);

      renderer.render(camera, flat,[screenQuad]);
      prevPopSeed = controls.shorePopulation;

      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, myTexture, 0);
      var pixels = new Uint8Array(texWidth * texHeight * 4);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
        gl.readPixels(0, 0, texWidth, texHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      }
      prevRoadLength = controls.roadLength;
      prevGridDensity = controls.gridDensity;
      road = new Road(pixels, texWidth, texHeight, controls.roadLength, controls.gridDensity);
      buildingSystem = new BuildingSystem(road, 7);

      loadScene(road, buildingSystem);
    }



    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, myTexture);

    if (controls.displayPopulation == true) {
      texture.setPopToggle(1.0);
    } else {
      texture.setPopToggle(0.0);
    }

    if (controls.displayTerrain == true) {
      texture.setTerrainToggle(1.0);
    } else {
      texture.setTerrainToggle(0.0);
    }


    renderer.render(camera, texture, [plane]);
    

    renderer.render(camera, instancedShader, [
      square,
    ]);

    renderer.render(camera, buildingShader, [
      buildingSquare, buildingPent, buildingOct,
    ]);    

    renderer.render(camera, sky,[screenQuad]);


    stats.end();

    
    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
