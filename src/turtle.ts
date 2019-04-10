import {vec3, vec4, mat4, mat3, vec2, quat, glMatrix} from 'gl-matrix';
import {gl} from './globals';


class Turtle {
    position: vec3;
    forward: vec3;
    right: vec3;
    depth: number;  
    // FAILED: boolean;
    // branchDelay: number;
    // killDelay: number;
    branchNumber: number;

    // will have a temporary road piece

  
    constructor(position: vec3, forward: vec3, right: vec3, depth: number) {
      this.position = position;
      this.forward = forward;
      this.right = right;
      let rand = Math.random();
      this.branchNumber = Math.floor(Math.pow(rand, 4) * 2) + 1;      
    //   this.branchNumber = 2;
    //   this.FAILED = failedVal;
    //   this.branchDelay = branchDelay;
    //   this.killDelay = killDelay;

      this.depth = depth;
    }


    getPos() : vec3 {
        let output: vec3 = vec3.fromValues(this.position[0], this.position[1], this.position[2]);
        return output;
    }

    getForward() : vec3 {
        let output: vec3 = vec3.fromValues(this.forward[0], this.forward[1], this.forward[2]);
        return output;
    }

    getRight() : vec3 {
        let output: vec3 = vec3.fromValues(this.right[0], this.right[1], this.right[2]);
        return output;
    }

    getDepth() : number {
        return this.depth;
    }

    incDepth(val: number) {
        this.depth += val;
    }


    moveForward(dist: number) {
        let translate = vec3.create();
        translate = vec3.multiply(translate, this.forward, vec3.fromValues(dist, dist, 1.0)); 
        vec3.add(this.position, this.position, translate);
        this.position[2] = 1.0;
    }

    rotate(deg: number) {
        let rotMat = mat3.create();
        rotMat = mat3.rotate(rotMat, mat3.create(), glMatrix.toRadian(deg));
        this.forward = vec3.normalize(this.forward, vec3.transformMat3(this.forward, this.forward, rotMat));
    }

    getRotationMatrix() : mat3 {
        let baseDirection: vec2 = vec2.fromValues(0, 1);
        let forwardDir: vec2 = vec2.fromValues(this.forward[0], this.forward[1]);

        let theta = Math.acos(vec2.dot(baseDirection, forwardDir) / (vec2.length(baseDirection) * vec2.length(forwardDir)));

        let rotMatrix = mat3.create();
        mat3.fromRotation(rotMatrix, theta);

        return rotMatrix;   
    }

    getTranslationMatrix() : mat3 {
        let translation: vec3 = vec3.fromValues(this.position[0], this.position[1], this.position[2]);
        let matrix = mat3.create();
        let identity = mat3.create();
        mat3.identity(identity);
        mat3.translate(matrix, identity, vec2.fromValues(translation[0], translation[1]));
        return matrix;
    }

    getScaleMatrix() : mat3 {
        let xScale = 10.0 * Math.pow((1 / this.depth), 1.3);
        let zScale = 10.0 * Math.pow((1 / this.depth), 1.3);
        let matrix = mat3.create();
        let identity = mat3.create();
        mat3.identity(identity);
        mat3.scale(matrix, identity, vec2.fromValues(xScale, zScale));

        return matrix;
    }

    getTransformation() : mat3 {
        let transform = mat3.create();
        mat3.multiply(transform, this.getTranslationMatrix(), this.getRotationMatrix());
        mat3.multiply(transform, transform, this.getScaleMatrix());
        return transform;
    }
  };
  
  export default Turtle;
  
