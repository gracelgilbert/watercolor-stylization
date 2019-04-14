#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform sampler2D u_Image0;
// uniform sampler2D u_Image1;



in vec2 fs_Pos;
out vec4 out_Col;

void main() {

  float x = 0.5 * (fs_Pos.x + 1.0);
  float y = 0.5 * (fs_Pos.y + 1.0);

  vec4 textureColor = texture(u_Image0, vec2( x,  y));
  // vec4 grayscale = texture(u_Image1, vec2( x,  y));

  out_Col = textureColor;

}
