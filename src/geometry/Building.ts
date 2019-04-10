import {vec3, vec4, vec2} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Building {

  height: number;
  position: vec2;
  shapes: Array<vec2>;
  positions: Array<vec3>;

  constructor(height: number, position: vec2) {
      this.height = height;
      this.position = position;
      this.shapes = new Array<vec2>();
      this.shapes.push(this.position);
      this.positions = new Array<vec3>();
      this.placeBlocks();
  }

  placeBlocks() {
      for(var y = this.height; y > 0; y--) {
        for (var i = 0; i < this.shapes.length; i++) {
            this.positions.push(vec3.fromValues(this.shapes[i][0], y, this.shapes[i][1]));
        }
        let prob = 0.5;
        if (Math.random() < prob) {
            let newPos = vec2.fromValues(this.position[0] + Math.random() * 2.0 - 1.0, this.position[1] + Math.random() * 2.0 - 1.0);
            this.shapes.push(newPos);
        }
      }
  }






};

export default Building;
