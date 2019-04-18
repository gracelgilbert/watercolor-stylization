#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;


// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Pos;
in vec4 viewspace;
uniform vec4 u_CameraPos;


out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.
// layout(location = 0) out vec4 out_Col;


void main()
{
    float depth = 0.2 * fs_Pos.z + 0.5;
        // Compute final shaded color
    if (depth > 0.99999) {
        out_Col = vec4(vec3(1.0, 0.0, 0.0), 1.0);
    } else {
        out_Col = vec4(vec3(depth), 1.0);
    }
        // out_Col = vec4(1.0, 1.0, 0.0, 1.0);
}
