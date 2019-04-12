#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform sampler2D u_RenderedTexture;


in vec2 fs_Pos;
out vec4 out_Col;

void main() {

  float x = 0.5 * (fs_Pos.x + 1.0);
  float y = 0.5 * (fs_Pos.y + 1.0);

  vec4 textureColor = texture(u_RenderedTexture, vec2( x,  y));
  out_Col = textureColor;

}
