#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform sampler2D u_Image0; // Color image
uniform sampler2D u_Image1; // Blurred image
uniform sampler2D u_Image2; // Bleeded image
uniform sampler2D u_Image3; // Control image



in vec2 fs_Pos;
out vec4 out_Col;

void main() {

  float x = 0.5 * (fs_Pos.x + 1.0);
  float y = 0.5 * (fs_Pos.y + 1.0);

  vec4 ColorSample = texture(u_Image0, vec2( x,  y));
  vec4 BlurSample = texture(u_Image1, vec2( x,  y));
  vec4 BleedSample = texture(u_Image2, vec2( x,  y));
  vec4 ControlSample = texture(u_Image3, vec2( x,  y));

  vec4 edgeDarkeningDiff = BlurSample - ColorSample;
  float maxRGB = 1.0 + ControlSample.g * max(max(edgeDarkeningDiff.x, edgeDarkeningDiff.y), edgeDarkeningDiff.z);
  vec4 darkenedEdgeCol = vec4(pow(BleedSample.x, maxRGB), pow(BleedSample.y, maxRGB), pow(BleedSample.z, maxRGB), 1.0);




  // vec4 grayscale = texture(u_Image1, vec2( x,  y));

  // out_Col = vec4(vec3(ControlSample.g), 1.0);
  out_Col = darkenedEdgeCol;

}
