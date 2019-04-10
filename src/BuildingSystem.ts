import {vec3, vec2, mat3, vec4, quat, glMatrix} from 'gl-matrix';
import Turtle from './turtle';
import TurtleStack from './turtleStack'
import Edge from './edge';
import Intersection from './intersection'
import { gl } from './globals';
import Road from './Road';
import Building from './Building'

class BuildingSystem {
    roadSystem: Road;
    grid: Array<number> =  new Array<number>();
    positions: Array<vec2> = new Array<vec2>();
    buildings: Array<Building> = new Array<Building>();
    width: number;

    constructor (roadSystem: Road, width: number) {
        this.roadSystem = roadSystem;
        this.width = width;
        this.grid = this.roadSystem.rasterize(this.width);
        this.populateBuildings();
    }

    populateBuildings() {
        // for (var i = 0; i < this.roadSystem.mapWidth; i++) {
        //      for (var j = 0; j < this.roadSystem.mapHeight; j++) {
        //         if (this.grid[i + this.roadSystem.mapWidth * j] == 0) {
        //             // this.positions.push(vec2.fromValues(14.3 * (i /  this.roadSystem.mapWidth) - 4.0, 8.0 * (j / this.roadSystem.mapHeight) - 4.0));
        //             this.positions.push(vec2.fromValues( (8.0 * i /  this.roadSystem.mapWidth) - 4.0, (8.0 * j / this.roadSystem.mapHeight) - 4.0)) ;
        //         } 
        //     }
        // }


        for (var i = 0; i < 2000; i++) {
            let x = Math.floor(Math.random() * this.roadSystem.mapWidth);
            let y = Math.floor(Math.random() * this.roadSystem.mapHeight);

            if (this.grid[x + this.roadSystem.mapWidth * y] > 0.5) {
                let prob = this.roadSystem.getPopulation((2.0 * x / this.roadSystem.mapWidth) - 1.0, (2.0 * y / this.roadSystem.mapHeight) - 1.0) / 255.0;
                if (Math.random() < prob * prob) {
                    this.positions.push(vec2.fromValues((8.0 * x /  this.roadSystem.mapWidth) - 4.0, (8.0 * y / this.roadSystem.mapHeight) - 4.0));
                    this.buildings.push(new Building(Math.max(Math.floor((Math.random()) * 8.0 * prob * prob), Math.floor(prob * 3)), vec2.fromValues((8.0 * x /  this.roadSystem.mapWidth) - 4.0, (8.0 * y / this.roadSystem.mapHeight) - 4.0)));
                }
            }
        }
    }




}

export default BuildingSystem;