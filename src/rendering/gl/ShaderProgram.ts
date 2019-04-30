import {vec4, mat4, vec2} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifCameraPos: WebGLUniformLocation;
  unifImage0: WebGLUniformLocation;
  unifImage1: WebGLUniformLocation;
  unifImage2: WebGLUniformLocation;
  unifImage3: WebGLUniformLocation;
  unifImage4: WebGLUniformLocation;
  unifDimensions: WebGLUniformLocation;
  unifBleedScale: WebGLUniformLocation;
  unifGeomID: WebGLUniformLocation;
  unifIsWater: WebGLUniformLocation;
  unifTremorFreq: WebGLUniformLocation;
  unifTremorInt: WebGLUniformLocation;
  unifBleedFreq: WebGLUniformLocation;
  unifBleedInt: WebGLUniformLocation;
  unifStyle: WebGLUniformLocation;
  unifPaperColor: WebGLUniformLocation;
  unifViewMode: WebGLUniformLocation;
  unifPaperBump: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos        = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor        = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol        = gl.getAttribLocation(this.prog, "vs_Col");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifColor      = gl.getUniformLocation(this.prog, "u_Color");
    this.unifTime       = gl.getUniformLocation(this.prog, "u_Time");
    this.unifCameraPos  = gl.getUniformLocation(this.prog, "u_CameraPos");
    this.unifImage0     = gl.getUniformLocation(this.prog, "u_Image0");
    this.unifImage1     = gl.getUniformLocation(this.prog, "u_Image1");
    this.unifImage2     = gl.getUniformLocation(this.prog, "u_Image2");
    this.unifImage3     = gl.getUniformLocation(this.prog, "u_Image3");
    this.unifImage4     = gl.getUniformLocation(this.prog, "u_Image4");

    this.unifDimensions = gl.getUniformLocation(this.prog, "u_Dimensions");
    this.unifBleedScale = gl.getUniformLocation(this.prog, "u_BleedScale");
    this.unifGeomID     = gl.getUniformLocation(this.prog, "u_GeomID");
    this.unifIsWater    = gl.getUniformLocation(this.prog, "u_IsWater");

    this.unifTremorFreq = gl.getUniformLocation(this.prog, "u_TremorFreq");
    this.unifTremorInt  = gl.getUniformLocation(this.prog, "u_TremorInt");
    this.unifBleedFreq  = gl.getUniformLocation(this.prog, "u_BleedFreq");
    this.unifBleedInt   = gl.getUniformLocation(this.prog, "u_BleedInt");

    this.unifStyle      = gl.getUniformLocation(this.prog, "u_Style");
    this.unifPaperColor = gl.getUniformLocation(this.prog, "u_PaperCol");

    this.unifViewMode   = gl.getUniformLocation(this.prog, "u_ViewMode");
    this.unifPaperBump  = gl.getUniformLocation(this.prog, "u_PaperRough");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setTime(t: number) {
    this.use();

    if(this.unifTime != -1)
    {
      gl.uniform1f(this.unifTime, t);
    }
  }

  setBleed(bleed: number) {
    this.use();

    if(this.unifBleedScale != -1)
    {
      gl.uniform1f(this.unifBleedScale, bleed);
    }
  }

  setRoughness(r: number) {
    this.use();

    if(this.unifPaperBump != -1)
    {
      gl.uniform1f(this.unifPaperBump, r);
    }
  }

  setViewMode(mode: number) {
    this.use();

    if(this.unifViewMode != -1)
    {
      gl.uniform1f(this.unifViewMode, mode);
    }
  }

  setStyle(s: number) {
    this.use();

    if(this.unifStyle != -1)
    {
      gl.uniform1f(this.unifStyle, s);
    }
  }

  setTremor(freq: number, int: number) {
    this.use();

    if(this.unifTremorFreq != -1)
    {
      gl.uniform1f(this.unifTremorFreq, freq);
    }

    if(this.unifTremorInt != -1)
    {
      gl.uniform1f(this.unifTremorInt, int);
    }
  }

  setBleedVals(freq: number, int: number) {
    this.use();

    if(this.unifBleedFreq != -1)
    {
      gl.uniform1f(this.unifBleedFreq, freq);
    }

    if(this.unifBleedInt != -1)
    {
      gl.uniform1f(this.unifBleedInt, int);
    }
  }

  setWater(water: number) {
    this.use();

    if(this.unifIsWater != -1)
    {
      gl.uniform1f(this.unifIsWater, water);
    }
  }

  setID(ID: number) {
    this.use();

    if(this.unifGeomID != -1)
    {
      gl.uniform1f(this.unifGeomID, ID);
    }
  }

  setCameraPos(p: vec4) {
    this.use();
    if(this.unifCameraPos != -1) {
      gl.uniform4fv(this.unifCameraPos, p);
    }
  }


  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setImage0() {
    this.use();
    if (this.unifImage0 !== -1) {
      gl.uniform1i(this.unifImage0, 0);
    }
  }

  setImage1() {
    this.use();
    if (this.unifImage1 !== -1) {
      gl.uniform1i(this.unifImage1, 1);
    }
  }

  setImage2() {
    this.use();
    if (this.unifImage2 !== -1) {
      gl.uniform1i(this.unifImage2, 2);
    }
  }

  setImage3() {
    this.use();
    if (this.unifImage3 !== -1) {
      gl.uniform1i(this.unifImage3, 3);
    }
  }

  setImage4() {
    this.use();
    if (this.unifImage4 !== -1) {
      gl.uniform1i(this.unifImage4, 4);
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }


  setPaperColor(color: vec4) {
    this.use();
    if (this.unifPaperColor !== -1) {
      gl.uniform4fv(this.unifPaperColor, color);
    }
  }

  setDimensions(dims: vec2) {
    this.use();
    if (this.unifDimensions !== -1) {
      gl.uniform2fv(this.unifDimensions, dims);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
  }
};

export default ShaderProgram;
