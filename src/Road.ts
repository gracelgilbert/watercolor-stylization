import {vec3, vec2, mat3, vec4, quat, glMatrix} from 'gl-matrix';
import Turtle from './turtle';
import TurtleStack from './turtleStack'
import Edge from './edge';
import Intersection from './intersection'
import { gl } from './globals';

class Road {
    turtleStack: TurtleStack = new TurtleStack();
    gridStack: TurtleStack = new TurtleStack();

    currTurtle: Turtle; 
    // mapTexture: Array<vec4>;
    mapTexture: Uint8Array;
    mapWidth: number;
    mapHeight: number;
    first1: boolean = true;
    highwayTime = true;
    justClipped = false;

    edges: Array<Edge> = new Array<Edge>();
    highwayEdges: Array<Edge> = new Array<Edge>();
    intersections: Array<Intersection> = new Array<Intersection>();

    highwayLength: number;
    gridDensity: number;

    transformations: mat3[] = new Array();

    constructor (texture: Uint8Array, width: number, height: number, roadLength: number, gridDensity: number) {

        this.currTurtle = new Turtle(vec3.fromValues(-0.4, -0.8, 1), vec3.fromValues(-1, 0, 0), vec3.fromValues(1, 0, 0), 1);
        this.turtleStack.push(this.currTurtle);

        let intersection1 = new Intersection();
        intersection1.setPos(vec2.fromValues(this.currTurtle.position[0], this.currTurtle.position[1]));
        this.intersections.push(intersection1);

        this.currTurtle = new Turtle(vec3.fromValues(-0.9, 0.9, 1), vec3.fromValues(1, -1, 0), vec3.fromValues(1, 0, 0), 1);
        this.turtleStack.push(this.currTurtle);

        let intersection2 = new Intersection();
        intersection2.setPos(vec2.fromValues(this.currTurtle.position[0], this.currTurtle.position[1]));
        this.intersections.push(intersection2);


        this.currTurtle = new Turtle(vec3.fromValues(0.02, 0.15, 1), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 0, 0), 1);
        this.turtleStack.push(this.currTurtle);

        let intersection3 = new Intersection();
        intersection3.setPos(vec2.fromValues(this.currTurtle.position[0], this.currTurtle.position[1]));
        this.intersections.push(intersection3);

        this.highwayLength = roadLength;
        this.gridDensity = gridDensity;

        // this.currTurtle = new Turtle(vec3.fromValues(-1.0,-1.0, 1), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 0, 0), 1);
        this.mapTexture = new Uint8Array(texture.length);
        for (var i = 0; i < texture.length; i++) {
          this.mapTexture[i] = texture[i];
        }
        // this.mapTexture = vectorPixels;
        this.mapWidth = width;
        this.mapHeight = height;
        this.updateState();
    }

    updateState() {
        let counter = 0;


        while (this.turtleStack.stack.length != 0) {
            if (counter > 200) {
                return;
            }
            counter++;

            this.currTurtle = this.turtleStack.pop();
            if (this.first1) {
                this.currTurtle.branchNumber = 3;
                this.first1 = false;
            }
            if (this.currTurtle.branchNumber == 1) {
                let rotateAmt1 = (120 * Math.random() - 60);
                let rotateAmt2 = (120 * Math.random() - 60);
                let rotateAmt3 = (120 * Math.random() - 60);


                let testTurtle1 = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                             vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                             vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                             this.currTurtle.depth);
                let testTurtle2 = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                             vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                             vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                             this.currTurtle.depth);                
                                             
                let testTurtle3 = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                             vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                             vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                             this.currTurtle.depth);                
                
                testTurtle1.rotate(rotateAmt1);
                testTurtle2.rotate(rotateAmt2);
                testTurtle3.rotate(rotateAmt3);

                testTurtle1.moveForward(0.1);
                testTurtle2.moveForward(0.1);
                testTurtle3.moveForward(0.1);

                let pop1 = this.getPopulation(testTurtle1.position[0], testTurtle1.position[1]);
                let pop2 = this.getPopulation(testTurtle2.position[0], testTurtle2.position[1]);
                let pop3 = this.getPopulation(testTurtle3.position[0], testTurtle3.position[1]);

                if (pop1 > pop2 && pop1 > pop3) {
                    this.rotateTurtle(rotateAmt1);  
                } else if (pop2 > pop3) {
                    this.rotateTurtle(rotateAmt2);  
                } else {
                    this.rotateTurtle(rotateAmt3);
                }
                if (this.placeEdge(this.highwayLength + Math.random() * 0.02 - 0.01, 0.005)) {
                    this.turtleStack.push(this.currTurtle);
                }

            } else if (this.currTurtle.branchNumber == 2) {
                let theta1 = 60 + (Math.random() * 60 - 30);
                let theta2 = -60 + (Math.random() * 60 - 30);

                let realTurtle1 = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                             vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                             vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                             this.currTurtle.depth);

                let realTurtle2 = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                             vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                             vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                             this.currTurtle.depth);
                realTurtle1.rotate(theta1);
                realTurtle2.rotate(theta2);

                this.currTurtle = realTurtle1;
                if (this.placeEdge(this.highwayLength + Math.random() * 0.02 - 0.01, 0.005)) {
                    this.turtleStack.push(realTurtle1);
                }

                this.currTurtle = realTurtle2;
                if (this.placeEdge(this.highwayLength + Math.random() * 0.02 - 0.01, 0.005)) {
                    this.turtleStack.push(realTurtle2);
                }

            } else {
                let theta1 = 120;
                let theta2 = 0;
                let theta3 = -120

                let realTurtle1 = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                             vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                             vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                             this.currTurtle.depth);

                let realTurtle2 = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                             vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                             vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                             this.currTurtle.depth);

                let realTurtle3 = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                             vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                             vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                             this.currTurtle.depth);                
                realTurtle1.rotate(theta1);
                realTurtle2.rotate(theta2);
                realTurtle3.rotate(theta3);

                this.currTurtle = realTurtle1;
                if (this.placeEdge(this.highwayLength + Math.random() * 0.02 - 0.01, 0.005)) {
                    this.turtleStack.push(realTurtle1);
                }
                this.currTurtle = realTurtle2;
                if (this.placeEdge(this.highwayLength + Math.random() * 0.02 - 0.01, 0.005)) {
                    this.turtleStack.push(realTurtle2);
                }
                this.currTurtle = realTurtle3;
                if (this.placeEdge(this.highwayLength + Math.random() * 0.02 - 0.01, 0.005)) {
                    this.turtleStack.push(realTurtle3);
                }
                // this.turtleStack.push(realTurtle2);
                // this.turtleStack.push(realTurtle3);

            }
        }

        this.highwayTime = false;

        for (var i = 0; i < this.highwayEdges.length; i++) {
            let prob = this.gridDensity * 0.9;
            if (i % 2 == 0) {
                prob = 0.0;
            }
            if (Math.random() < prob) {
                this.growGrid(this.highwayEdges[i]);
            }
        }

    }

    growGrid(e: Edge) {
        let gridSpacing = Math.max(e.length / 3, 0.02);
        for (var i = 0; i < 4; i++) {
            let currOrigin = vec3.create();
            vec3.multiply(currOrigin, vec3.fromValues(i * gridSpacing, i * gridSpacing, 0), e.direction);
            vec3.add(currOrigin, e.origin, currOrigin);

            let firstTurtle = new Turtle(currOrigin, vec3.fromValues(e.direction[0], e.direction[1], 0), vec3.fromValues(0, 1, 0,), 2);
            firstTurtle.rotate(90);
            this.currTurtle = firstTurtle;
            this.gridStack = new TurtleStack();
            this.gridStack.push(firstTurtle);
            let counter = 0;
            while (this.gridStack.stack.length != 0) {
                counter++
                if (counter > 12) {
                    break;
                }
                this.currTurtle = this.gridStack.pop();
                // return;
                if (this.getPopulation(this.currTurtle.position[0], this.currTurtle.position[1]) < 0.8 * 255.0) {
                    let prob = this.gridDensity * 0.95 * this.getPopulation(this.currTurtle.position[0], this.currTurtle.position[1]) / 255.0;
                    if (Math.random() > prob) {
                        break;
                    }
                }
                let turnTurtle = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                            vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                            vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                            this.currTurtle.depth);
                turnTurtle.rotate(-90);
                let probTurn = 0.7;

                if (this.placeEdge(gridSpacing, 0.002)) {
                    this.gridStack.push(this.currTurtle);
                    if (Math.random() < probTurn) {
                        this.currTurtle = turnTurtle;
                        this.placeEdge(gridSpacing, 0.002);
                    }

                } else {
                    if (this.justClipped) {
                        if (Math.random() < probTurn) {
                            this.currTurtle = turnTurtle;
                            this.placeEdge(gridSpacing, 0.002);
                        }
                    }
                }                       
                
                
            }
        }


        for (var i = 0; i < 4; i++) {
            let currOrigin = vec3.create();
            vec3.multiply(currOrigin, vec3.fromValues(i * gridSpacing, i * gridSpacing, 0), e.direction);
            vec3.add(currOrigin, e.origin, currOrigin);

            let firstTurtle = new Turtle(currOrigin, vec3.fromValues(e.direction[0], e.direction[1], 0), vec3.fromValues(0, 1, 0,), 2);
            firstTurtle.rotate(-90);
            this.currTurtle = firstTurtle;
            this.gridStack = new TurtleStack();
            this.gridStack.push(firstTurtle);
            let counter = 0;
            while (this.gridStack.stack.length != 0) {
                counter++
                if (counter > 10) {
                    break;
                }
                this.currTurtle = this.gridStack.pop();

                if (this.getPopulation(this.currTurtle.position[0], this.currTurtle.position[1]) < 0.8 * 255.0) {
                    let prob = this.gridDensity * 0.95 * this.getPopulation(this.currTurtle.position[0], this.currTurtle.position[1]) / 255.0;
                    if (Math.random() > prob) {
                        break;
                    }
                }

                let turnTurtle = new Turtle(vec3.fromValues(this.currTurtle.position[0], this.currTurtle.position[1], this.currTurtle.position[2]), 
                                            vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], this.currTurtle.forward[2]), 
                                            vec3.fromValues(this.currTurtle.right[0], this.currTurtle.right[1], this.currTurtle.right[2]),
                                            this.currTurtle.depth);
                turnTurtle.rotate(90);
                let probTurn = 0.7;

                if (this.placeEdge(gridSpacing, 0.002)) {
                    this.gridStack.push(this.currTurtle);
                    if (Math.random() < probTurn) {
                        this.currTurtle = turnTurtle;
                        this.placeEdge(gridSpacing, 0.002);
                    }
                } else {
                    if (this.justClipped) {
                        if (Math.random() < probTurn) {
                            this.currTurtle = turnTurtle;
                            this.placeEdge(gridSpacing, 0.002);
                        }
                    }
                }
            }
        }



    }

    outOfBounds(x: number, y: number) : boolean {
        if (x < -1 || x > 1 || y < -1 ||y > 1) {
            return true;
        }
        return false;
    }

    intersect(testEdge: Edge) {
        let minIntersection = new Intersection();
        let intersect: boolean = false;
        for (var i = 0; i < this.edges.length; i++) {
            let currIntersection = new Intersection();
            if (currIntersection.intersect(testEdge, this.edges[i])) {
                intersect = true;
                let currDist = vec2.distance(vec2.fromValues(testEdge.origin[0], testEdge.origin[1]), currIntersection.getPos()); 
                let prevDist = vec2.distance(vec2.fromValues(testEdge.origin[0], testEdge.origin[1]), minIntersection.getPos());
                if (currDist < prevDist) {
                    minIntersection.position = vec2.fromValues(currIntersection.position[0], currIntersection.position[1]);
                }
            }
        }
        if (!intersect) {
            return;
        }
        let distance = vec2.distance(vec2.fromValues(testEdge.origin[0], testEdge.origin[1]), minIntersection.getPos());
        if (distance < 0.000000000000001) {
            return;
        }
        testEdge.setLength(distance);
    }

    snapToIntersection(e: Edge) {
        let endpointX = e.endpoint[0];
        let endpointY = e.endpoint[1];
        let radius = e.length / 2.0;
        let snap = false;
        

        let minIntersection = new Intersection();
        let minDist = 1000000;
        for (var i = 0; i < this.intersections.length; i++) {
            let intersectionPoint = vec2.fromValues(this.intersections[i].getPos()[0], this.intersections[i].getPos()[1]);
            let currDist = vec2.distance(vec2.fromValues(endpointX, endpointY), intersectionPoint); 
            if (currDist < radius && currDist < minDist) {
                snap = true;
                minIntersection = this.intersections[i];
                minDist = currDist;
            } 
        }
        if (snap) {

            let newDirection = vec2.fromValues(minIntersection.position[0] - e.origin[0], minIntersection.position[1] - e.origin[1]);
            let oldDirection = vec2.fromValues(e.direction[0], e.direction[1]);
            let angle = vec2.angle(oldDirection, newDirection);
            angle = 180.0 * angle / Math.PI;
            this.currTurtle.rotate(angle);
            e.setDirection(vec3.fromValues(this.currTurtle.forward[0], this.currTurtle.forward[1], 0));
            e.setLength(vec2.distance(vec2.fromValues(e.origin[0], e.origin[1]), minIntersection.getPos()));

        } else {
            // let newIntersection = new Intersection();
            // newIntersection.setPos(vec2.fromValues(endpointX, endpointY));
        }
    }


    placeEdge(length: number, width: number) : boolean {
        let newEdge = new Edge(this.currTurtle.position, length, this.currTurtle.forward, width);
        let prevLength = newEdge.length;
        this.intersect(newEdge);
        this.snapToIntersection(newEdge);
        let newLength = newEdge.length;
        let clipped = false;
        if (Math.abs(newLength - prevLength) > 0.00001) {
            clipped = true;
        }
        // if (newLength < 0.01) {
        //     return false;
        // }
        if (this.getTerrain(newEdge.origin[0], newEdge.origin[1]) < 0.5 || this.getTerrain(newEdge.endpoint[0], newEdge.endpoint[1]) < 0.5) {
            return false;
        } else {
            if (this.outOfBounds(newEdge.endpoint[0], newEdge.endpoint[1])) {
                return false;
            }
            this.edges.push(newEdge);
            let currIntersection = new Intersection();
            currIntersection.setPos(vec2.fromValues(newEdge.endpoint[0], newEdge.endpoint[1]));
            this.intersections.push(currIntersection);
            if (this.highwayTime) {
                this.highwayEdges.push(newEdge);
            }
            let translateMatrix = mat3.create();
            let identity = mat3.create();
            mat3.identity(identity);
            mat3.translate(translateMatrix, identity, vec2.fromValues(newEdge.origin[0], newEdge.origin[1]));

            let xScale = newEdge.width;
            let yScale = newEdge.length;
            let scaleMatrix = mat3.create();
            identity = mat3.create();
            mat3.identity(identity);
            mat3.scale(scaleMatrix, identity, vec2.fromValues(xScale, yScale));


            let baseDirection: vec3 = vec3.fromValues(0, 1, 0);
            let forwardDir: vec3 = vec3.fromValues(newEdge.direction[0], newEdge.direction[1], newEdge.direction[2]);

            var q = quat.fromValues(0, 0, 0, 0);
            quat.rotationTo(q, baseDirection, forwardDir);

            let rotMatrix = mat3.create();
            mat3.fromQuat(rotMatrix, q);

            let transform = mat3.create();
            mat3.multiply(transform, translateMatrix, rotMatrix);
            mat3.multiply(transform, transform, scaleMatrix);

            this.transformations.push(transform);

            this.currTurtle.moveForward(newEdge.length);
            if (clipped) {
                return false;
            }
            return true;
        }
    }

    saveTurtle() {
        this.turtleStack.push(this.currTurtle);
    }

    resetTurtle() {
        this.currTurtle = this.turtleStack.pop();
    }

    rotateTurtle(theta: number) {
        this.currTurtle.rotate(theta);
    }

    getTerrain(x: number, y: number) : number {
        x += 1.0;
        y += 1.0;
        x *= 0.5;
        y *= 0.5;

        x *= this.mapWidth;
        y *= this.mapHeight;
        x = Math.floor(x);
        y = Math.floor(y);
        let blue: number = this.mapTexture[4.0 * (x + this.mapWidth * y) + 2.0];
        let green: number = this.mapTexture[4.0 * (x + this.mapWidth * y) + 1.0];


        if (blue > green){
            return 0; // Water
        } else {
            return 1; // Land
        }
    }

    getPopulation(x: number, y: number) : number {
        x += 1.0;
        y += 1.0;
        x *= 0.5;
        y *= 0.5;

        x *= this.mapWidth;
        y *= this.mapHeight;
        x = Math.floor(x);
        y = Math.floor(y);

        let population: number = this.mapTexture[4.0 * (x + this.mapWidth * y) + 3.0];
        return population;
    }

    rasterize(width: number) : Array<number> {
        let grid = new Array<number>(this.mapWidth * this.mapHeight);
        for (var i = 0; i < this.mapWidth; i++) {
            for (var j = 0; j < this.mapHeight; j++) {
                let index = i + this.mapWidth * j;
                if (this.getTerrain(2.0 * (i / this.mapWidth) - 1.0, 2.0 * (j /  this.mapHeight) - 1.0) < 0.5) {
                    grid[index] = 0;
                    // console.log("water case!");
                } else {
                    grid[index] = 1;
                }
                
            }
        }

        for (var i = 0; i < this.edges.length; i++) {
            let e = this.edges[i];
            let endpoint = e.endpoint;
            let origin = e.origin;
            let ymin = Math.min((endpoint[1] + 1.0) * this.mapHeight * 0.5, (origin[1] + 1.0) * this.mapHeight * 0.5);
            let ymax = Math.max((endpoint[1] + 1.0) * this.mapHeight * 0.5, (origin[1] + 1.0) * this.mapHeight * 0.5);
            let xmin = Math.min((endpoint[0] + 1.0) * this.mapWidth  * 0.5, (origin[0] + 1.0) * this.mapWidth  * 0.5);
            let xmax = Math.max((endpoint[0] + 1.0) * this.mapWidth  * 0.5, (origin[0] + 1.0) * this.mapWidth  * 0.5);

            if (ymin == ymax) {
                // Horizontal line case
                for (var x = Math.floor(xmin); x <= Math.ceil(xmax); x++) {
                    for (var y = Math.floor(ymin - width); y <= Math.floor(ymax + width); y++) {
                        // console.log("horizontal line case!");
                        grid[x + this.mapWidth * y] = 0;
                    }
                }
            } else if (xmin == xmax) {
                // Vertical line case
                for (var x = Math.floor(xmin - width); x <= Math.floor(xmax + width); x++) {
                    for (var y = Math.floor(ymin); y <= Math.ceil(ymax); y++) {
                        // console.log("vertical line case!");
                        grid[x + this.mapWidth * y] = 0;
                    }
                }
            } else {
                let m = ((endpoint[1] + 1.0) * this.mapHeight * 0.5 - (origin[1] + 1.0) * this.mapHeight * 0.5) / ((endpoint[0] + 1.0) * this.mapWidth  * 0.5 - (origin[0] + 1.0) * this.mapWidth  * 0.5);
                let x1 = (origin[0] + 1.0) * this.mapWidth  * 0.5;
                let y1 = (origin[1] + 1.0) * this.mapHeight * 0.5;

                for (var y = Math.floor(ymin); y <= Math.ceil(ymax); y++) {
                    let xInt = x1 + (y - y1) / m;
                    for (var x = Math.floor(xInt - width); x <= Math.ceil(xInt + width); x++) {
                        // console.log("regular line case!");
                        grid[x + this.mapWidth * y] = 0;
                    }
                }
            }
        }
        return grid;
    }
}

export default Road;
