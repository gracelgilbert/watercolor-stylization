import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Triangle extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  offsets: Float32Array;
  cols1: Float32Array;
  cols2: Float32Array;
  cols3: Float32Array;

  constructor(center: vec3, public side: number) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);

  }

  create() {
  let r = this.side / 2.0;
  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3,
                                
                                  4, 5, 6,
                                  4, 6, 7,
                              
                                  8, 9, 10,
                                  8, 10, 11,
                          
                                  12, 13, 14,
                                  12, 14, 15,
                      
                                  16, 17, 18,
                                  16, 18, 19,
                  
                                  20, 21, 22,
                                  20, 22, 23
                                ]);

  this.normals = new Float32Array([0, 1, 0, 0,
                                   0, 1, 0, 0,
                                   0, 1, 0, 0,
                                   0, 1, 0, 0, // top
                                  
                                   0, 0, 1, 0, 
                                   0, 0, 1, 0,
                                   0, 0, 1, 0,
                                   0, 0, 1, 0, // front
                                  
                                   -1, 0, 0, 0,
                                   -1, 0, 0, 0,
                                   -1, 0, 0, 0,
                                   -1, 0, 0, 0, //left
                                  
                                  
                                   1, 0, 0, 0,
                                   1, 0, 0, 0,
                                   1, 0, 0, 0,
                                   1, 0, 0, 0, // right

                                   0, -1, 0, 0, 
                                   0, -1, 0, 0, 
                                   0, -1, 0, 0, 
                                   0, -1, 0, 0, // bottom

                                   0, 0, -1, 0,
                                   0, 0, -1, 0,
                                   0, 0, -1, 0,
                                   0, 0, -1, 0 // back
                                  ]);


  this.positions = new Float32Array([-r, r, -r, 1,
                                     -r, r, r, 1,
                                     r, r, r, 1,
                                     r, r, -r, 1, // top
                                    
                                     -r, r, r, 1, 
                                     -r, -r, r, 1,
                                     r, -r, r, 1,
                                     r, r, r, 1, // front
                                    
                                     -r, r, r, 1,
                                     -r, r, -r, 1,
                                     -r, -r, -r, 1,
                                     -r, -r, r, 1, //left
                                    
                                    
                                     r, r, -r, 1,
                                     r, r, r, 1,
                                     r, -r, r, 1,
                                     r, -r, -r, 1, // right

                                     -r, -r, -r, 1,
                                     r, -r, -r, 1,
                                     r, -r, r, 1,
                                     -r, -r, r, 1, // bottom

                                     -r, r, -r, 1,
                                     r, r, -r, 1,
                                     r, -r, -r, 1, 
                                     -r, -r, -r, 1 // back
                                    ]);


    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();
    this.generateTranslate();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created cube`);
  }

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

export default Triangle;
