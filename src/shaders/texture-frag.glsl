#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform sampler2D u_RenderedTexture;
uniform float u_PopToggle;
uniform float u_TerrainToggle;


in vec2 fs_Pos;
out vec4 out_Col;

void main() {

  float x = 0.5 * (fs_Pos.x + 4.0) / 4.0;
  float y = 0.5 * (fs_Pos.y + 4.0) / 4.0;

  vec4 textureColor = texture(u_RenderedTexture, vec2(x,  y));

  vec3 finalColor = vec3(0.0);
  if (u_TerrainToggle == 1.0) {
    finalColor += textureColor.rgb;
  }
  if (u_PopToggle == 1.0) {
    finalColor += vec3(textureColor.a);
  }
  if (u_PopToggle + u_TerrainToggle == 0.0) {
    finalColor = vec3(1.0);
  }
    out_Col = vec4(finalColor, 1.0);
  // out_Col = vec4(0.0, 0.0, 1.0, 1.0);

}
