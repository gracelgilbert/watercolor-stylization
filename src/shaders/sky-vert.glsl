#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

in vec4 vs_Pos;
out vec4 fs_Pos;

void main() {
  gl_Position = vs_Pos;
  fs_Pos = vs_Pos;
}
