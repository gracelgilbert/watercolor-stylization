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
  unifDimensions: WebGLUniformLocation;
  unifBleedScale: WebGLUniformLocation;


  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
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
    this.unifDimensions = gl.getUniformLocation(this.prog, "u_Dimensions");
    this.unifBleedScale = gl.getUniformLocation(this.prog, "u_BleedScale");
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
      gl.uniform1i(this.unifTime, t);
    }
  }

  setBleed(bleed: number) {
    this.use();

    if(this.unifBleedScale != -1)
    {
      gl.uniform1f(this.unifBleedScale, bleed);
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

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
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
