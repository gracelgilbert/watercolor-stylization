import {vec3, vec4, vec2} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Cube from './geometry/Cube';
import {readTextFile} from './globals';
import Mesh from './geometry/Mesh';


// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
};

// let sphere: Mesh;
let water: Mesh;
let rock: Mesh;
let darkBush: Mesh;
let lightBush:Mesh;

let windmill: Mesh;
let roof: Mesh;
let spin: Mesh;
let fence: Mesh;
let grass: Mesh;


let sceneVersion = 0;

let ColorImage: WebGLTexture;
let zBufferImage: WebGLTexture;
let ControlImage: WebGLTexture;
let BlurredImage: WebGLTexture;
let BleededImage: WebGLTexture;
let PaperImage: WebGLTexture;
let StyleImage: WebGLTexture;

let fbColor: WebGLFramebuffer;
let fbDepth: WebGLFramebuffer;
let fbControl: WebGLFramebuffer;
let fbBlur: WebGLFramebuffer;
let fbBilateral: WebGLFramebuffer;
let fbPaper: WebGLFramebuffer;
let fbStyle: WebGLFramebuffer;

let rbColor: WebGLRenderbuffer;
let rbDepth: WebGLRenderbuffer;
let rbControl: WebGLRenderbuffer;
let rbBlur: WebGLRenderbuffer;
let rbBilateral: WebGLRenderbuffer;
let rbPaper: WebGLRenderbuffer;
let rbStyle: WebGLRenderbuffer;



let screenQuad: ScreenQuad;
let time: number = 0.0;

function loadScene() {
  if (sceneVersion == 0) {
    let objRock: string = readTextFile('./Rock.obj');
    rock = new Mesh(objRock, vec3.fromValues(0, 0, 0));
    rock.create();
  
    let objWater: string = readTextFile('./Water.obj');
    water = new Mesh(objWater, vec3.fromValues(0, 0, 0));
    water.create();
  
    let objDarkBush: string = readTextFile('./DarkBush.obj');
    darkBush = new Mesh(objDarkBush, vec3.fromValues(0, 0, 0));
    darkBush.create();
  
    let objLightBush: string = readTextFile('./LightBush.obj');
    lightBush = new Mesh(objLightBush, vec3.fromValues(0, 0, 0));
    lightBush.create();
  } else {
    let objMill: string = readTextFile('./windmillStructure.obj');
    windmill = new Mesh(objMill, vec3.fromValues(0, 0, 0));
    windmill.create();
  
    let objRoof: string = readTextFile('./windmillCap.obj');
    roof = new Mesh(objRoof, vec3.fromValues(0, 0, 0));
    roof.create();
  
    let objSpin: string = readTextFile('./windmillSpin.obj');
    spin = new Mesh(objSpin, vec3.fromValues(0, 0, 0));
    spin.create();
    
    let objFence: string = readTextFile('./fence.obj');
    fence = new Mesh(objFence, vec3.fromValues(0, 0, 0));
    fence.create();
  
    let objGrass: string = readTextFile('./grass.obj');
    grass = new Mesh(objGrass, vec3.fromValues(0, 0, 0));
    grass.create();
  }



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


  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  // canvas.addEventListener("webglcontextlost", function(event) {
  //     event.preventDefault();
  // }, false);

  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);


  screenQuad = new ScreenQuad();
  screenQuad.create();


  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  // Create shaderPrograms:
  const color = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/color-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/color-frag.glsl')),
  ]);

  const depth = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/color-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/z-buffer-frag.glsl')),
  ]);

  const control = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/color-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/control-frag.glsl')),
  ]);

  const paper = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/noop-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/paper-frag.glsl')),
  ]);

  const blur = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/noop-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/gaussian-frag.glsl')),
  ]);

  const bilateral = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/noop-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/bilateral-frag.glsl')),
  ]);

  const stylization = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/noop-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/stylization-frag.glsl')),
  ]);

  const spray = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/noop-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/WaterSpray-frag.glsl')),
  ]);

  const clouds = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/noop-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/Clouds-frag.glsl')),
  ]);
  loadScene();



  function createTextures() {
    ColorImage = gl.createTexture();
    zBufferImage = gl.createTexture();
    ControlImage = gl.createTexture();
    BlurredImage = gl.createTexture();
    BleededImage = gl.createTexture();
    PaperImage = gl.createTexture();
    StyleImage = gl.createTexture();

  }

  function createFrameBuffers() {
    fbColor = gl.createFramebuffer();
    fbDepth = gl.createFramebuffer();
    fbControl = gl.createFramebuffer();
    fbBlur = gl.createFramebuffer();
    fbBilateral = gl.createFramebuffer();
    fbPaper = gl.createFramebuffer();
    fbStyle = gl.createFramebuffer();

  }

  function createRenderbuffers() {
    rbColor = gl.createRenderbuffer();
    rbDepth = gl.createRenderbuffer();
    rbControl = gl.createRenderbuffer();
    rbBlur = gl.createRenderbuffer();
    rbBilateral = gl.createRenderbuffer();
    rbPaper = gl.createRenderbuffer();
    rbStyle = gl.createRenderbuffer();
  }

  createTextures();
  createFrameBuffers();
  createRenderbuffers();

  function textureSetup() {
    const texWidth = window.innerWidth;
    const texHeight = window.innerHeight;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texWidth, texHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);   
  }

  function fbrbSetup(texture: WebGLTexture, fb: WebGLFramebuffer, rb: WebGLRenderbuffer) {
    const texWidth = window.innerWidth;
    const texHeight = window.innerHeight;

    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texWidth, texHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      console.log("error");
    }
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }


  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();

    // Instantiate textures, fbs, rbs

    
    /*
    PAPER TEXTURE
    */
    // bind Paper pass texture, fb, rb
    gl.bindTexture(gl.TEXTURE_2D, PaperImage);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbPaper);
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbPaper);  
    // Setup texture, fb, rb
    textureSetup();
    fbrbSetup(PaperImage, fbPaper, rbPaper);  
    // Render 3D Scene with Color:
    renderer.render(camera, vec4.fromValues(169.0/255, 115.0/255, 235.0/255, 1.0), paper, [screenQuad]);

    /*
    FIRST PASS: COLOR
    */
    // bind Color pass texture, fb, rb
    gl.bindTexture(gl.TEXTURE_2D, ColorImage);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbColor);
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbColor);

    // Setup texture, fb, rb
    textureSetup();
    fbrbSetup(ColorImage, fbColor, rbColor);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, PaperImage);
    color.setImage1();
    color.setCameraPos(vec4.fromValues(camera.position[0], camera.position[1], camera.position[2], 1.0));
    // color.setViewProjMatrix(camera.projectionMatrix);

    // color.set

    color.setTime(time);
    depth.setTime(time);
    control.setTime(time);
    spray.setTime(time);
    clouds.setTime(time);

    spray.setCameraPos(vec4.fromValues(camera.position[0], camera.position[1], camera.position[2], 1.0));
    // spray.setViewProjMatrix(camera.projectionMatrix);
    time++;

    // Render 3D Scene with Color:

    if (sceneVersion == 0) {
      renderer.render(camera, vec4.fromValues(1.0, 0.99, 0.95, 1.0), paper, [screenQuad]);
      color.setBleed(0.2);
      color.setID(0.0);
      color.setWater(1.0);
      renderer.render(camera, vec4.fromValues(0.517, 0.796, 1.0, 1.0), color, [water]);
      color.setBleed(0.2);
      color.setID(0.5);
      color.setWater(0.0);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 3.0 * 0.064,3.0 * 0.046, 1.0), color, [rock]);
      color.setBleed(0.02);
      color.setID(0.7);
      renderer.render(camera, vec4.fromValues(1.0 * 0.087, 3.0 * 0.064,1.0 * 0.046, 1.0), color, [darkBush]);
      color.setBleed(0.02);
      color.setID(0.9);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), color, [lightBush]);
  
  
      /*
      SECOND PASS: DEPTH MAP
      */
      // bind Depth pass texture, fb, rb
      gl.bindTexture(gl.TEXTURE_2D, zBufferImage);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbDepth);
      gl.bindRenderbuffer(gl.RENDERBUFFER, rbDepth);
  
      // Setup texture, fb, rb
      textureSetup();
      fbrbSetup(zBufferImage, fbDepth, rbDepth);
  
      depth.setViewProjMatrix(camera.projectionMatrix);
      depth.setCameraPos(vec4.fromValues(camera.position[0], camera.position[1], camera.position[2], 1.0));
  
      // Render 3D scene with Depth:
      depth.setBleed(0.2);
      depth.setWater(1.0);
      renderer.render(camera, vec4.fromValues(50.0/255, 165.0/255, 170.0/255, 1.0), depth, [water]);
      depth.setBleed(0.2);
      depth.setWater(0.0);
      renderer.render(camera, vec4.fromValues(169.0/255, 115.0/255, 235.0/255, 1.0), depth, [rock]);
      depth.setBleed(0.02);
      depth.setID(0.7);
      renderer.render(camera, vec4.fromValues(1.0 * 0.087, 2.0 * 0.064,1.0 * 0.046, 1.0), depth, [darkBush]);
      depth.setBleed(0.02);
      depth.setID(0.9);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), depth, [lightBush]);
      /*
      THIRD PASS: CONTROLS
      */
  
      // bind Control pass texture, fb, rb
      gl.bindTexture(gl.TEXTURE_2D, ControlImage);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbControl);
      gl.bindRenderbuffer(gl.RENDERBUFFER, rbControl);
  
      // Setup texture, fb, rb
      textureSetup();
      fbrbSetup(ControlImage, fbControl, rbControl);
  
      // Render 3D scene with Control:
      control.setBleed(0.2);
      control.setID(0.0);
      control.setViewProjMatrix(camera.projectionMatrix);
      control.setCameraPos(vec4.fromValues(camera.position[0], camera.position[1], camera.position[2], 1.0));
  
      control.setWater(1.0);
      renderer.render(camera, vec4.fromValues(50.0/255, 165.0/255, 170.0/255, 1.0), control, [water]);
      control.setBleed(0.2);
      control.setID(0.5);
      control.setWater(0.0);
      renderer.render(camera, vec4.fromValues(169.0/255, 115.0/255, 235.0/255, 1.0), control, [rock]);
      control.setBleed(0.02);
      control.setID(0.7);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), control, [darkBush]);
      control.setBleed(0.02);
      control.setID(0.9);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), control, [lightBush]);
  
  
    } else {
      renderer.render(camera, vec4.fromValues(220.0/255, 230.0/255, 255.0/255, 1.0), paper, [screenQuad]);
      color.setBleed(0.25);
      color.setID(0.0);
      renderer.render(camera, vec4.fromValues(100/255, 80/255, 20/155, 1.0), color, [windmill]);
      color.setBleed(0.2);
      color.setID(0.5);
      color.setWater(2.0);
      renderer.render(camera, vec4.fromValues(250/255, 245./255,230/255, 1.0), color, [spin]);
      color.setBleed(0.02);
      color.setID(0.7);
      color.setWater(0.0);

      renderer.render(camera, vec4.fromValues(130/255, 20/255,30/255, 1.0), color, [roof]);
      color.setBleed(0.1);
      color.setID(0.9);
      renderer.render(camera, vec4.fromValues(230/255, 225./255,200/255, 1.0), color, [fence]);
      color.setBleed(0.1);
      color.setID(0.95);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), color, [grass]);


      /*
      SECOND PASS: DEPTH MAP
      */
      // bind Depth pass texture, fb, rb
      gl.bindTexture(gl.TEXTURE_2D, zBufferImage);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbDepth);
      gl.bindRenderbuffer(gl.RENDERBUFFER, rbDepth);

      // Setup texture, fb, rb
      textureSetup();
      fbrbSetup(zBufferImage, fbDepth, rbDepth);

      depth.setViewProjMatrix(camera.projectionMatrix);
      depth.setCameraPos(vec4.fromValues(camera.position[0], camera.position[1], camera.position[2], 1.0));

      // Render 3D scene with Depth:
      depth.setBleed(0.2);
      renderer.render(camera, vec4.fromValues(50.0/255, 165.0/255, 170.0/255, 1.0), depth, [windmill]);
      depth.setBleed(0.2);
      depth.setWater(0.0);
      depth.setWater(2.0);
      renderer.render(camera, vec4.fromValues(169.0/255, 115.0/255, 235.0/255, 1.0), depth, [spin]);
      depth.setBleed(0.02);
      depth.setID(0.7);
      depth.setWater(0.0);
      renderer.render(camera, vec4.fromValues(1.0 * 0.087, 2.0 * 0.064,1.0 * 0.046, 1.0), depth, [roof]);
      depth.setBleed(0.02);
      depth.setID(0.9);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), depth, [fence]);
      depth.setBleed(0.02);
      depth.setID(0.95);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), depth, [grass]);
      /*
      THIRD PASS: CONTROLS
      */

      // bind Control pass texture, fb, rb
      gl.bindTexture(gl.TEXTURE_2D, ControlImage);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbControl);
      gl.bindRenderbuffer(gl.RENDERBUFFER, rbControl);

      // Setup texture, fb, rb
      textureSetup();
      fbrbSetup(ControlImage, fbControl, rbControl);

      // Render 3D scene with Control:
      control.setBleed(0.2);
      control.setID(0.0);
      control.setViewProjMatrix(camera.projectionMatrix);
      control.setCameraPos(vec4.fromValues(camera.position[0], camera.position[1], camera.position[2], 1.0));

      control.setWater(0.0);
      renderer.render(camera, vec4.fromValues(50.0/255, 165.0/255, 170.0/255, 1.0), control, [windmill]);
      control.setBleed(0.2);
      control.setID(0.5);
      control.setWater(2.0);
      renderer.render(camera, vec4.fromValues(169.0/255, 115.0/255, 235.0/255, 1.0), control, [spin]);
      control.setBleed(0.02);
      control.setID(0.7);
      control.setWater(0.0);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), control, [roof]);
      control.setBleed(0.02);
      control.setID(0.9);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), control, [fence]);
      control.setBleed(0.02);
      control.setID(0.95);
      renderer.render(camera, vec4.fromValues(3.0 * 0.087, 8.0 * 0.064,3.0 * 0.046, 1.0), control, [grass]);

    }
    
    /*
    FOURTH PASS: GAUSSIAN BLUR
    */

    // bind blur pass texture, fb, rb
    gl.bindTexture(gl.TEXTURE_2D, BlurredImage);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbBlur);
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbBlur);

    // Setup texture, fb, rb
    textureSetup();
    fbrbSetup(BlurredImage, fbBlur, rbBlur);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, ColorImage);
    blur.setImage1();

    // gl.activeTexture(gl.TEXTURE2);
    // gl.bindTexture(gl.TEXTURE_2D, ControlImage);
    // blur.setImage2();
    

    // Render 3D scene with blur:
    renderer.render(camera, vec4.fromValues(0.8, 0.7, 1.0, 1.0), blur, [screenQuad]);

    
      /*
    FIFTH PASS: BILATERAL BLUR
    */

    // bind bilateral pass texture, fb, rb
    gl.bindTexture(gl.TEXTURE_2D, BleededImage);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbBilateral);
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbBilateral);

    // Setup texture, fb, rb
    textureSetup();
    fbrbSetup(BleededImage, fbBilateral, rbBilateral);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, ColorImage);
    bilateral.setImage1();

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, zBufferImage);
    bilateral.setImage2();

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, ControlImage);
    bilateral.setImage3();
    

    // Render 3D scene with blur:
    renderer.render(camera, vec4.fromValues(0.8, 0.7, 1.0, 1.0), bilateral, [screenQuad]);


    if (sceneVersion == 0) {
      // bind to screen and bind texture
      // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, StyleImage);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbStyle);
      gl.bindRenderbuffer(gl.RENDERBUFFER, rbStyle);

      textureSetup();
      fbrbSetup(StyleImage, fbStyle, rbStyle);


      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, ColorImage);
      stylization.setImage1();

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, BlurredImage);
      stylization.setImage2();

      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, BleededImage);
      stylization.setImage3();

      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, ControlImage);
      stylization.setImage4();

      gl.viewport(0, 0, window.innerWidth, window.innerHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // render stylization to texture
      renderer.render(camera, vec4.fromValues(0.8, 0.7, 1.0, 1.0), stylization,[screenQuad]);


      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, StyleImage);
      spray.setImage1();

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, zBufferImage);
      spray.setImage2();

      renderer.render(camera, vec4.fromValues(0.8, 0.7, 1.0, 1.0), spray,[screenQuad]);
    } else {
      // bind to screen and bind texture
      // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, StyleImage);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbStyle);
      gl.bindRenderbuffer(gl.RENDERBUFFER, rbStyle);

      textureSetup();
      fbrbSetup(StyleImage, fbStyle, rbStyle);


      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, ColorImage);
      stylization.setImage1();

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, BlurredImage);
      stylization.setImage2();

      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, BleededImage);
      stylization.setImage3();

      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, ControlImage);
      stylization.setImage4();

      gl.viewport(0, 0, window.innerWidth, window.innerHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // render stylization to texture
      renderer.render(camera, vec4.fromValues(0.8, 0.7, 1.0, 1.0), stylization,[screenQuad]);


      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, StyleImage);
      spray.setImage1();

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, zBufferImage);
      spray.setImage2();

      renderer.render(camera, vec4.fromValues(0.8, 0.7, 1.0, 1.0), clouds,[screenQuad]);
    }


    // renderer.render(camera, vec4.fromValues(0.8, 0.7, 1.0, 1.0), paper,[screenQuad]);


    stats.end();

    
    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    // flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  // flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
