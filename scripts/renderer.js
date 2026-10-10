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
                    vertices: [
                        CG.Vector3(400, 150, 1),
                        CG.Vector3(500, 300, 1),
                        CG.Vector3(400, 450, 1),
                        CG.Vector3(300, 300, 1)
                    ],
                    transform: null,
                    state: {
                        midpoint: {x: 400, y: 300},
                        offset: {x: 0, y: 0},
                        currentRotation: 0,
                        currentScale: {x: 1, y: 1}
                    },
                    velocity: {
                        translate: {x: 10, y: 10},
                        rotate: 0,
                        scale: {x: 0, y: 0}
                    }
                }
            ],
            slide1: [],
            slide2: [],
            slide3: []
        };
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
        // TODO: draw at least 3 polygons that spin about their own centers
        //   - have each polygon spin at a different speed / direction
        
        
    }

    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions


    }

    //
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)
        
        
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
};

export { Renderer };
