import {vec3, vec2, mat4, quat, glMatrix} from 'gl-matrix';


export function random2(p: vec2, seed: vec2) : vec2 {
    let pseed: vec2 = vec2.create();
    vec2.add(pseed, p, seed);
    let dotProduct1 = vec2.dot(pseed, vec2.fromValues(311.7, 127.1));
    let dotProduct2 = vec2.dot(pseed, vec2.fromValues(269.5, 183.3))

    let vector: vec2 = vec2.fromValues(dotProduct1, dotProduct2);
    vector = vec2.fromValues(Math.sin(vector[0]) * 85734.3545, Math.sin(vector[1]) * 85734.3545);
    vector = vec2.fromValues(vector[0] - Math.floor(vector[0]), vector[1] - Math.floor(vector[1]));

    return vector;
}



export function worley(x : number, y: number, numRows: number, numCols: number) : number {
    let xPos: number = x * numCols / 20;
    let yPos: number = y * numRows / 20;

    let minDist: number = 60;

    // let minVec: vec2 = vec2.fromValues(0, 0);

    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            let currGrid: vec2 = vec2.fromValues(Math.floor(xPos) + i, Math.floor(yPos) + j);
            let currNoise: vec2 = vec2.create();
            vec2.add(currNoise, currGrid, random2(currGrid, vec2.fromValues(2, 0)));
            let currDist: number = vec2.distance(vec2.fromValues(xPos, yPos), currNoise);
            if (currDist <= minDist) {
                minDist = currDist;
                // minVec = currNoise;
            }
        }
    }

    return minDist;
}