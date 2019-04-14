#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform sampler2D u_Image1;



in vec2 fs_Pos;
out vec4 out_Col;

const float array[25] = float[25](
  0.003765,	0.015019,	0.023792,	0.015019,	0.003765,
  0.015019,	0.059912,	0.094907,	0.059912,	0.015019,
  0.023792,	0.094907,	0.150342,	0.094907,	0.023792,
  0.015019,	0.059912,	0.094907,	0.059912,	0.015019,
  0.003765,	0.015019,	0.023792,	0.015019,	0.003765
);

void main() {

  float x = 0.5 * (fs_Pos.x + 1.0);
  float y = 0.5 * (fs_Pos.y + 1.0);
  

  float pixDimx = 1.0 / float(u_Dimensions.x);
  float pixDimy = 1.0 / float(u_Dimensions.y);

  vec4 accumColor = vec4(0.0);

  int count = 0;
  for (int i = -2; i <= 2; i++) {
    for (int j = -2; j <= 2; j++) {
        vec4 curr_color = texture(u_Image1, vec2(x + float(i) * (pixDimx), y + float(j) * (pixDimy)));
        float scale = array[count];
        accumColor = accumColor + (scale * curr_color);
        count++;

    }
  }

  // accumColor = texture(u_Image1, vec2( x,  y));
  out_Col = vec4(accumColor.rgb, 1.0);

}
