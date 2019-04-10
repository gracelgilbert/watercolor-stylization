import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Square extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  offsets: Float32Array;
  cols1: Float32Array;
  cols2: Float32Array;
  cols3: Float32Array;



  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  this.positions = new Float32Array([-0.5, 0.0, 0, 1,
                                     0.5, 0.0, 0, 1,
                                     0.5, 1.0, 0, 1,
                                     -0.5, 1.0, 0, 1]);

    this.generateIdx();
    this.generatePos();
    // this.generateCol();
    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();
    this.generateTranslate();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created square`);
  }

  // setInstanceVBOs(offsets: Float32Array, colors: Float32Array) {
  //   this.colors = colors;
  //   this.offsets = offsets;

  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
  //   gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
  //   gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);
  // }
  setInstanceVBOs(cols1: Float32Array, cols2: Float32Array, cols3: Float32Array, offsets: Float32Array) {
    // this.colors = colors;
    this.offsets = offsets;
    // this.transforms = transforms;
    this.cols1 = cols1;
    this.cols2 = cols2;
    this.cols3 = cols3;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform1);
    gl.bufferData(gl.ARRAY_BUFFER, this.cols1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform2);
    gl.bufferData(gl.ARRAY_BUFFER, this.cols2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform3);
    gl.bufferData(gl.ARRAY_BUFFER, this.cols3, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);
  }
};

export default Square;
