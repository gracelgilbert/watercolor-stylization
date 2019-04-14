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

let cube: Cube;
let sphere: Mesh;
let ColorImage: WebGLTexture;
let zBufferImage: WebGLTexture;
let ControlImage: WebGLTexture;
let BlurredImage: WebGLTexture;
let BleededImage: WebGLTexture;

let fbColor: WebGLFramebuffer;
let fbDepth: WebGLFramebuffer;
let fbControl: WebGLFramebuffer;
let fbBlur: WebGLFramebuffer;
let fbBilateral: WebGLFramebuffer;

let rbColor: WebGLRenderbuffer;
let rbDepth: WebGLRenderbuffer;
let rbControl: WebGLRenderbuffer;
let rbBlur: WebGLRenderbuffer;
let rbBilateral: WebGLRenderbuffer;



let screenQuad: ScreenQuad;
let time: number = 0.0;

function loadScene() {
  cube = new Cube(vec3.fromValues(0, 0, 0), 1);
  cube.create();
  let obj0: string = readTextFile('./sphere.obj');
  sphere = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  sphere.create();
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

  const blur = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/noop-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/gaussian-frag.glsl')),
  ]);

  // const bilateral = new ShaderProgram([
  //   new Shader(gl.VERTEX_SHADER, require('./shaders/noop-vert.glsl')),
  //   new Shader(gl.FRAGMENT_SHADER, require('./shaders/bilateral-frag.glsl')),
  // ]);

  const stylization = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/noop-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/stylization-frag.glsl')),
  ]);
  loadScene();


  function createTextures() {
    ColorImage = gl.createTexture();
    zBufferImage = gl.createTexture();
    ControlImage = gl.createTexture();
    BlurredImage = gl.createTexture();
    BleededImage = gl.createTexture();
  }

  function createFrameBuffers() {
    fbColor = gl.createFramebuffer();
    fbDepth = gl.createFramebuffer();
    fbControl = gl.createFramebuffer();
    fbBlur = gl.createFramebuffer();
    fbBilateral = gl.createFramebuffer();
  }

  function createRenderbuffers() {
    rbColor = gl.createRenderbuffer();
    rbDepth = gl.createRenderbuffer();
    rbControl = gl.createRenderbuffer();
    rbBlur = gl.createRenderbuffer();
    rbBilateral = gl.createRenderbuffer();
  }

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
    createTextures();
    createFrameBuffers();
    createRenderbuffers();
    
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

    // Render 3D Scene with Color:
    renderer.render(camera, vec4.fromValues(169.0/255, 115.0/255, 235.0/255, 1.0), color, [sphere]);

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

    // Render 3D scene with Depth:
    renderer.render(camera, vec4.fromValues(0.8, 0.7, 1.0, 1.0), depth, [sphere]);

    /*
    THIRD PASS: CONTROLS
    */

    // // bind Control pass texture, fb, rb
    // gl.bindTexture(gl.TEXTURE_2D, ControlImage);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, fbControl);
    // gl.bindRenderbuffer(gl.RENDERBUFFER, rbControl);

    // // Setup texture, fb, rb
    // textureSetup();
    // fbrbSetup(ControlImage, fbControl, rbControl);

    // // Render 3D scene with Control:
    // renderer.render(camera, vec4.fromValues(1.0, 1.0, 0.0, 1.0), control, [sphere]);


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

    
    

    // bind to screen and bind texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, BlurredImage);
    stylization.setImage0();


    // gl.activeTexture(gl.TEXTURE1);
    // gl.bindTexture(gl.TEXTURE_2D, ColorImage);
    // stylization.setImage1();


    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // render stylization to screen
    renderer.render(camera, vec4.fromValues(0.8, 0.7, 1.0, 1.0), stylization,[screenQuad]);


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
