import * as CG from './transforms.js';
import {Matrix} from './matrix.js';

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    constructor(canvas, limit_fps_flag, fps) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.limit_fps = limit_fps_flag;
        this.fps = fps;
        this.start_time = null;
        this.prev_time = null;

        this.models = {
            slide0: [
                // example model (diamond) -> should be replaced with actual model
                {
                    vertices: this.createCircleVertices(400, 300, 50, 40),
                    radius: 50,
                    transform: null,
                    state: {                                                                                              
                        midpoint: {x: 400, y: 300},
                        offset: {x: 0, y: 0},
                        currentRotation: 0,
                        currentScale: {x: 1, y: 1}
                    },
                    velocity: {
                        translate: {x: 50, y: 50},
                        rotate: 0,
                        scale: {x: 0, y: 0}
                    }
                }
            ],
            slide1: [
                {
                    vertices: this.createCircleVertices(200, 200, 75, 5),
                    radius: 75,
                    transform: null,
                    state: {
                        midpoint: {x: 200, y: 200},
                        offset: {x: 0, y: 0},
                        currentRotation: 0,
                        currentScale: {x: 1, y: 1}
                    },
                    velocity: {
                        translate: {x: 0, y: 0},
                        rotate: 150,
                        scale: {x: 0, y: 0}
                    },
                },
                {
                    vertices: this.createCircleVertices(500, 400, 120, 6),
                    radius: 120,
                    transform: null,
                    state: {
                        midpoint: {x: 500, y: 400},
                        offset: {x: 0, y: 0},
                        currentRotation: 0,
                        currentScale: {x: 1, y: 1}
                    },
                    velocity: {
                        translate: {x: 0, y: 0},
                        rotate: -75,
                        scale: {x: 0, y: 0}
                    },
                    minRotationVelocity: -125,
                    maxRotationVelocity: 0,
                    rotateAccel: 0.5
                },
                {
                    vertices: this.createCircleVertices(450, 150, 25, 3),
                    radius: 25,
                    transform: null,
                    state: {
                        midpoint: {x: 450, y: 150},
                        offset: {x: 0, y: 0},
                        currentRotation: 0,
                        currentScale: {x: 1, y: 1}
                    },
                    velocity: {
                        translate: {x: 0, y: 0},
                        rotate: 50,
                        scale: {x: 0, y: 0}
                    },
                    minRotationVelocity: -500,
                    maxRotationVelocity: 500,
                    rotateAccel: 1
                }
            ],
            slide2: [
                {
                    vertices: this.createCircleVertices(250, 300, 75, 5),
                    radius: 75,
                    transform: null,
                    state: {
                        midpoint: {x: 250, y: 300},
                        offset: {x: 0, y: 0},
                        currentRotation: 0,
                        currentScale: {x: 1, y: 1}
                    },
                    velocity: {
                        translate: {x: 0, y: 0},
                        rotate: 0,
                        scale: {x: 0.5, y: 0.5}
                    },
                    minScale: {x: 0.5, y: 0.5},
                    maxScale: {x: 2, y: 2}                   
                },

                    {
                    vertices: this.createCircleVertices(550, 300, 75, 4),
                    radius: 75,
                    transform: null,
                    state: {
                        midpoint: {x: 550, y: 300},
                        offset: {x: 0, y: 0},
                        currentRotation: 0,
                        currentScale: {x: 1, y: 1}
                    },
                    velocity: {
                        translate: {x: 0, y: 0},
                        rotate: 0,
                        scale: {x: 0.75, y: 0.3}
                    },
                    minScale: {x: 0.5, y: 0.75},
                    maxScale: {x: 2, y: 1.5}
                }
            ],
            slide3: [
                {
                    vertices: this.createSemiCircleVertices(50, 0, 50, 20),
                    radius: 50,
                    transform: null,
                    state: {
                        midpoint: {x: 0, y: 0},
                        offset: {x: 400, y: 300},
                        currentRotation: 0,
                        currentScale: {x: 1, y: 1}
                    },
                    velocity: {
                        translate: {x: 0, y: 0},
                        rotate: 50,
                        scale: {x: 0, y: 0}
                    },
                    minRotation: 0,
                    maxRotation: 15
                },
                {
                    vertices: this.createSemiCircleVertices(50, 0, 50, 20),
                    radius: 50,
                    transform: null,
                    state: {
                        midpoint: {x: 0, y: 0},
                        offset: {x: 400, y: 300},
                        currentRotation: 0,
                        currentScale: {x: 1, y: -1}
                    },
                    velocity: {
                        translate: {x: 0, y: 0},
                        rotate: -50,
                        scale: {x: 0, y: 0}
                    },
                    minRotation: -15,
                    maxRotation: 0
                }
            ]
        };

        this.directionInput = {x: 0, y: 0};
        window.addEventListener('keydown', (e)=>{
            if(e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') this.directionInput = {x: -1, y: 0};
            else if(e.key.toLowerCase() === 'd' || e.key === 'ArrowRight') this.directionInput = {x: 1, y: 0};

            if(e.key.toLowerCase() === 's' || e.key === 'ArrowDown') this.directionInput = {x: 0, y: -1};
            else if(e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') this.directionInput = {x: 0, y: 1};
        });
        this.prevInput = {x: 0, y: 0};
    }

    // flag:  bool
    limitFps(flag) {
        this.limit_fps = flag;
    }

    // n:  int
    setFps(n) {
        this.fps = n;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
    }

    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;
        //console.log('animate(): t = ' + time.toFixed(1) + ', dt = ' + delta_time.toFixed(1));

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.drawSlide();

        // Invoke call for next frame in animation
        if (this.limit_fps) {
            setTimeout(() => {
                window.requestAnimationFrame((ts) => {
                    this.animate(ts);
                });
            }, Math.floor(1000.0 / this.fps));
        }
        else {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateTransforms(time, delta_time) {
        if(this.slide_idx === 3) this.slide3Input();

        const dt_actual = delta_time/1000;
        let currentModel = this.models[`slide${this.slide_idx}`];
        
        for(const model of currentModel) {
            // Update state based on velocity
            model.state.offset.x += model.velocity.translate.x * dt_actual;
            model.state.offset.y += model.velocity.translate.y * dt_actual;

            model.state.currentRotation += model.velocity.rotate * dt_actual;
            

            model.state.currentScale.x += model.velocity.scale.x * dt_actual;
            model.state.currentScale.y += model.velocity.scale.y * dt_actual;

            // Initialize new matrices
            const translatePoint = new Matrix(3,3);
            const rotate = new Matrix(3,3);
            const scale = new Matrix(3,3);
            const translateOrigin = new Matrix(3,3);

            // Translate to new point
            const newX = model.state.midpoint.x + model.state.offset.x;
            const newY = model.state.midpoint.y + model.state.offset.y
            CG.mat3x3Translate(translatePoint, newX, newY);

            // Rotate
            CG.mat3x3Rotate(rotate, model.state.currentRotation);

            // Scale
            CG.mat3x3Scale(scale, model.state.currentScale.x, model.state.currentScale.y);

            // Translate to origin
            CG.mat3x3Translate(translateOrigin, -model.state.midpoint.x, -model.state.midpoint.y);

            // Multiply all matrices together
            model.transform = Matrix.multiply([translatePoint, rotate, scale, translateOrigin]);

            // Apply physics calculations for individual slides
            if (this.slide_idx === 0) this.slide0Physics();
            else if(this.slide_idx === 1) this.slide1Physics();
            else if(this.slide_idx === 2) this.slide2Physics();
            else if(this.slide_idx === 3) this.slide3Physics();
        }
        
    }

    slide0Physics() {
        const model = this.models.slide0[0];
        const centerX = model.state.midpoint.x + model.state.offset.x; 
        const centerY = model.state.midpoint.y + model.state.offset.y; 
        const radius = model.radius;

        // Right wall
        if (centerX + radius >= this.canvas.width && model.velocity.translate.x > 0) {
            model.velocity.translate.x *= -1;
        }

        // Left Wall
            if (centerX - radius <= 0 && model.velocity.translate.x < 0) {
            model.velocity.translate.x *= -1;
        }   
        
        // Bottom Floor
        if (centerY + radius >= this.canvas.height && model.velocity.translate.y > 0) {
            model.velocity.translate.y *= -1;
        }

        // Top Cieling 
        if (centerY - radius <= 0 && model.velocity.translate.y < 0) {
            model.velocity.translate.y *= -1;
                }
    }

    slide1Physics() {
        const currentModel = this.models.slide1;
        const hexagon = currentModel[1];
        const triangle = currentModel[2];

        hexagon.velocity.rotate += hexagon.rotateAccel;
        if(hexagon.velocity.rotate >= hexagon.maxRotationVelocity) hexagon.velocity.rotate = hexagon.minRotationVelocity;

        triangle.velocity.rotate += triangle.rotateAccel;
        if(triangle.velocity.rotate >= triangle.maxRotationVelocity) {
            triangle.velocity.rotate = triangle.maxRotationVelocity;
            triangle.rotateAccel = -1;
        } else if(triangle.velocity.rotate <= triangle.minRotationVelocity) {
            triangle.velocity.rotate = triangle.minRotationVelocity;
            triangle.rotateAccel = 1;
        }


    }

    slide2Physics() {
        for(const model of this.models.slide2) {
            if (model.state.currentScale.x >= model.maxScale.x && model.velocity.scale.x > 0) {
                model.velocity.scale.x *= -1;
            }

            if (model.state.currentScale.x <= model.minScale.x && model.velocity.scale.x < 0) {
                model.velocity.scale.x *= -1;
            }

            if (model.state.currentScale.y >= model.maxScale.y && model.velocity.scale.y > 0) {
                model.velocity.scale.y *= -1;
            }

            if (model.state.currentScale.y <= model.minScale.y && model.velocity.scale.y < 0) {
                model.velocity.scale.y *= -1;
            }
        }
    }

    slide3Input() {
        const pacTop = this.models.slide3[0];

        // Prevent input toward wall
        const centerX = pacTop.state.midpoint.x + pacTop.state.offset.x; 
        const centerY = pacTop.state.midpoint.y + pacTop.state.offset.y; 
        const diameter = pacTop.radius * 2;
        if(centerX + diameter >= this.canvas.width && this.directionInput.x === 1) this.directionInput.x = 0;
        if(centerX - diameter <= 0 && this.directionInput.x === -1) this.directionInput.x = 0;
        if(centerY + diameter >= this.canvas.height && this.directionInput.y === 1) this.directionInput.y = 0;
        if(centerY - diameter <= 0 && this.directionInput.y === -1) this.directionInput.y = 0;

        pacTop.velocity.translate.x = 200 * this.directionInput.x;
        pacTop.velocity.translate.y = 200 * this.directionInput.y;
        const pacBottom = this.models.slide3[1];
        pacBottom.velocity.translate.x = 200 * this.directionInput.x;
        pacBottom.velocity.translate.y = 200 * this.directionInput.y;

        if(this.directionInput.x === -1 && this.prevInput.x !== -1) {
            pacTop.state.currentScale = {x: -1, y: -1};
            pacTop.minRotation = 0;
            pacTop.maxRotation = 15;
            pacTop.state.currentRotation = 0;
            pacTop.velocity.rotate = 50;
            pacBottom.state.currentScale = {x: -1, y: 1};
            pacBottom.minRotation = -15;
            pacBottom.maxRotation = 0;
            pacBottom.state.currentRotation = 0;
            pacBottom.velocity.rotate = -50;
        } 
        
        
        if(this.directionInput.x === 1 && this.prevInput.x !== 1) {
            pacTop.state.currentScale = {x: 1, y: 1};
            pacTop.minRotation = 0;
            pacTop.maxRotation = 15;
            pacTop.state.currentRotation = 0;
            pacTop.velocity.rotate = 50;
            pacBottom.state.currentScale = {x: 1, y: -1};
            pacBottom.minRotation = -15;
            pacBottom.maxRotation = 0;
            pacBottom.state.currentRotation = 0;
            pacBottom.velocity.rotate = -50;
        }

        if(this.directionInput.y === 1 && this.prevInput.y !== 1) {
            pacTop.state.currentScale = {x: 1, y: 1};
            pacTop.minRotation = 90;
            pacTop.maxRotation = 105;
            pacTop.state.currentRotation = 90;
            pacTop.velocity.rotate = 50;
            pacBottom.state.currentScale = {x: 1, y: -1};
            pacBottom.minRotation = 75;
            pacBottom.maxRotation = 90;
            pacBottom.state.currentRotation = 90;
            pacBottom.velocity.rotate = -50;
        }

        if(this.directionInput.y === -1 && this.prevInput.y !== -1) {
            pacTop.state.currentScale = {x: -1, y: -1};
            pacTop.minRotation = 90;
            pacTop.maxRotation = 105;
            pacTop.state.currentRotation = 90;
            pacTop.velocity.rotate = 50;
            pacBottom.state.currentScale = {x: -1, y: 1};
            pacBottom.minRotation = 75;
            pacBottom.maxRotation = 90;
            pacBottom.state.currentRotation = 90;
            pacBottom.velocity.rotate = -50;
        }
        

        this.prevInput = {x: this.directionInput.x, y: this.directionInput.y};
    }

    slide3Physics() {
        const pacTop = this.models.slide3[0];
        const pacBottom = this.models.slide3[1];

        if(pacTop.state.currentRotation > pacTop.maxRotation) {
            pacTop.state.currentRotation = pacTop.maxRotation;
            pacTop.velocity.rotate = -50;
        }
        if(pacTop.state.currentRotation < pacTop.minRotation) {
            pacTop.state.currentRotation = pacTop.minRotation;
            pacTop.velocity.rotate = 50;
        }

        if(pacBottom.state.currentRotation > pacBottom.maxRotation) {
            pacBottom.state.currentRotation = pacBottom.maxRotation;
            pacBottom.velocity.rotate = -50;
        }
        if(pacBottom.state.currentRotation < pacBottom.minRotation) {
            pacBottom.state.currentRotation = pacBottom.minRotation;
            pacBottom.velocity.rotate = 50;
        }


    }
    
    //
    drawSlide() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0();
                break;
            case 1:
                this.drawSlide1();
                break;
            case 2:
                this.drawSlide2();
                break;
            case 3:
                this.drawSlide3();
                break;
        }
    }

    //
    drawSlide0() {
        let teal = [0, 128, 128, 255];
        const currentModel = this.models.slide0;
        for(const model of currentModel) {
            const verticies = [];
            for(const pt of model.vertices) {
                const vertex = Matrix.multiply([model.transform, pt]);
                verticies.push(vertex);
            }

            this.drawConvexPolygon(verticies, teal);
        }
        
        // Following lines are example of drawing a single polygon
        // (this should be removed/edited after you implement the slide)
        
        
    }

    //
    drawSlide1() {
        let red = [146, 43, 62, 255];
        const currentModel = this.models.slide1;
        for(const model of currentModel) {
            const verticies = [];
            for(const pt of model.vertices) {
                const vertex = Matrix.multiply([model.transform, pt]);
                verticies.push(vertex);
            }

            this.drawConvexPolygon(verticies, red);
        }
        
        
    }

    //
    drawSlide2() {
        
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions

        let purple = [120, 60, 180, 255];
        const currentModel = this.models.slide2;

        for(const model of currentModel) {
            const vertices = [];

            for (const pt of model.vertices) {
                const vertex  = Matrix.multiply([model.transform, pt]);
                vertices.push(vertex);
            }

            this.drawConvexPolygon(vertices, purple);
        }


    }

    //
    drawSlide3() {
        let yellow = [255, 255, 0, 255];
        const currentModel = this.models.slide3;
        const pacTop = currentModel[0];
        const pacBottom = currentModel[1];

        let verticies = [];
        for(const pt of pacTop.vertices) {
            const vertex = Matrix.multiply([pacTop.transform, pt]);
            verticies.push(vertex);
        }

        this.drawConvexPolygon(verticies, yellow);

        verticies = [];
        for(const pt of pacBottom.vertices) {
            const vertex = Matrix.multiply([pacBottom.transform, pt]);
            verticies.push(vertex);
        }

        this.drawConvexPolygon(verticies, yellow);
        
        
    }

    
    
    // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
    // color:        array of int [R, G, B, A]
    drawConvexPolygon(vertex_list, color) {
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
        let x = vertex_list[0].values[0][0] / vertex_list[0].values[2][0];
        let y = vertex_list[0].values[1][0] / vertex_list[0].values[2][0];
        this.ctx.moveTo(x, y);
        for (let i = 1; i < vertex_list.length; i++) {
            x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    //Makes a regular polygon with numPoints points to simulate a circle 
    createCircleVertices(centerX, centerY, radius, numPoints) {
        const vertices = [];

        for (let i = 0; i < numPoints; i++) {
            const theta = (i / numPoints) * 2 * Math.PI;

            const x = centerX + radius * Math.cos(theta);
            const y = centerY + radius * Math.sin(theta);

            vertices.push(CG.Vector3(x, y, 1));
        }

        return vertices;
    }

    //Makes half of a regular polygon to simulate a semicircle
    createSemiCircleVertices(centerX, centerY, radius, numPoints) {
        const vertices = [];

        for (let i = 0; i <= numPoints; i++) {
            const theta = (i / numPoints) * Math.PI;    

            const x = centerX + radius * Math.cos(theta);
            const y = centerY + radius * Math.sin(theta);

            vertices.push(CG.Vector3(x, y, 1));
        }

        return vertices;
    }

};

export { Renderer };
