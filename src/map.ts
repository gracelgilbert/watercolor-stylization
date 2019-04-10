import {vec3, vec4, mat4, quat, glMatrix} from 'gl-matrix';


class Map {
    terrainColors: vec3[];
    populationDensity = new Array<number>(35 * 35);

    constructor () {

    }

    getTerrainValue(x: number, y: number) : vec3 {
        return this.terrainColors[x + 35 * y];
    }

    getPopulationDensity(x: number, y: number) : number { 
        return this.populationDensity[x + 35 * y];
    }

    setPopulationDensity(x: number, y: number, newValue: number) {
        this.populationDensity[x + 35 * y] = newValue;
    }

    setColor(x: number, y: number, newValue: vec3) {
        this.terrainColors[x + 35 * y] = newValue;
    }

}

export default Map;
