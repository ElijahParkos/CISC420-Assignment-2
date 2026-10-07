///////////////////////////////////////////////////////////////////////////////////
// 3x3 Transform Matrices                                                        //
///////////////////////////////////////////////////////////////////////////////////
import { Matrix } from "./matrix.js";

// Set values of existing 3x3 matrix to the identity matrix
function mat3x3Identity(mat3x3) {
    mat3x3.values = [[1, 0, 0],
                     [0, 1, 0],
                     [0, 0, 1]];
}

// Set values of existing 3x3 matrix to the translate matrix
function mat3x3Translate(mat3x3, tx, ty) {
    const transform_matrix = [[1, 0, tx],
                              [0, 1, ty],
                              [0, 0, 1]];
    mat3x3.values = Matrix.multiply([mat3x3.values, transform_matrix]);

}

// Set values of existing 3x3 matrix to the scale matrix
function mat3x3Scale(mat3x3, sx, sy) {
    const scale_matrix = [[sx, 0, 0],
                          [0, sy, 0],
                          [0, 0, 1]];
    mat3x3.values = Matrix.multiply([mat3x3.values, scale_matrix]);
}

// Set values of existing 3x3 matrix to the rotate matrix
function mat3x3Rotate(mat3x3, theta) {
    const radians = (theta*Math.PI)/180;
    let cosTheta = Math.cos(radians);
    let sinTheta = Math.sin(radians);
    const rotation_matrix = [[cosTheta, -(sinTheta), 0],
                             [sinTheta,  cosTheta, 0],
                             [0, 0, 1]];
    mat3x3.values = Matrix.multiply([mat3x3.values, rotation_matrix]);
}

// Create a new 3-component vector with values x,y,w
function Vector3(x, y, w) {
    let vec3 = new Matrix(3, 1);
    vec3.values = [x, y, w];
    return vec3;
}

export {
    mat3x3Identity,
    mat3x3Translate,
    mat3x3Scale,
    mat3x3Rotate,
    Vector3
};
