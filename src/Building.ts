import {vec3, vec4, vec2} from 'gl-matrix';
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';

class Building {

  height: number;
  position: vec2;
  // shapes: Array<vec2>;
  squares: Array<vec2>
  pents: Array<vec2>;
  octs: Array<vec2>;

  // positions: Array<vec3>;
  squarePositions: Array<vec3>;
  pentPositions: Array<vec3>;
  octPositions: Array<vec3>;

  constructor(height: number, position: vec2) {
      this.height = height;
      this.position = position;
      this.squares = new Array<vec2>();
      this.pents = new Array<vec2>();
      this.octs = new Array<vec2>();

      let shapeRand = Math.floor(3.0 * Math.random());

      if (shapeRand == 0) {
        this.squares.push(this.position);
      } else if (shapeRand == 1) {
        this.pents.push(this.position);
      } else {
        this.octs.push(this.position);
      }

      // this.positions = new Array<vec3>();
      this.squarePositions = new Array<vec3>();
      this.pentPositions = new Array<vec3>();
      this.octPositions = new Array<vec3>();

      this.placeBlocks();
  }

  placeBlocks() {
      for(var y = this.height; y > 0; y--) {
        for (var i = 0; i < this.squares.length; i++) {
            this.squarePositions.push(vec3.fromValues(this.squares[i][0], y / 16.9 + 1.28, this.squares[i][1]));
        }

        for (var i = 0; i < this.pents.length; i++) {
          this.pentPositions.push(vec3.fromValues(this.pents[i][0], y / 16.9 + 1.28, this.pents[i][1]));
        }

        for (var i = 0; i < this.octs.length; i++) {
          this.octPositions.push(vec3.fromValues(this.octs[i][0], y / 16.9 + 1.28, this.octs[i][1]));
        }


        let prob = 0.5;
        if (Math.random() < prob) {
            let shapeRand = Math.floor(3.0 * Math.random());
            let newPos = vec2.fromValues(this.position[0] + 0.05 * (Math.random() * 2.0 - 1.0), this.position[1] + 0.05 * (Math.random() * 2.0 - 1.0));

            if (shapeRand == 0) {
              this.squares.push(newPos);

            } else if (shapeRand == 1) {
              this.pents.push(newPos);
            } else {
              this.octs.push(newPos);
            }

        }
      }
  }






};

export default Building;
