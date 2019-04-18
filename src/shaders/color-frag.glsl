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

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform sampler2D u_Image1; // Paper image

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos;
in float bleedAmount;
in vec2 screenspace;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.
// layout(location = 0) out vec4 out_Col;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

float interpNoise2d(float x, float y) {
  float intX = floor(x);
  float fractX = fract(x);
  float intY = floor(y);
  float fractY = fract(y);

  float v1 = random1(vec2(intX, intY), vec2(1.f, 1.f));
  float v2 = random1(vec2(intX + 1.f, intY), vec2(1.f, 1.f));
  float v3 = random1(vec2(intX, intY + 1.f), vec2(1.f, 1.f));
  float v4 = random1(vec2(intX + 1.f, intY + 1.f), vec2(1.f, 1.f));

  float i1 = mix(v1, v2, fractX);
  float i2 = mix(v3, v4, fractX);
  return mix(i1, i2, fractY);
  return 2.0;

}

float interpNoise3d(float x, float y, float z) {
  float intX = floor(x);
  float fractX = fract(x);
  float intY = floor(y);
  float fractY = fract(y);
  float intZ = floor(z);
  float fractZ = fract(z);

  float v1 = random1(vec3(intX, intY, intZ), vec3(1.f, 1.f, 1.f));
  float v2 = random1(vec3(intX, intY, intZ + 1.0), vec3(1.f, 1.f, 1.f));
  float v3 = random1(vec3(intX + 1.0, intY, intZ + 1.0), vec3(1.f, 1.f, 1.f));
  float v4 = random1(vec3(intX + 1.0, intY, intZ), vec3(1.f, 1.f, 1.f));
  float v5 = random1(vec3(intX, intY + 1.0, intZ), vec3(1.f, 1.f, 1.f));
  float v6 = random1(vec3(intX, intY + 1.0, intZ + 1.0), vec3(1.f, 1.f, 1.f));
  float v7 = random1(vec3(intX + 1.0, intY + 1.0, intZ + 1.0), vec3(1.f, 1.f, 1.f));
  float v8 = random1(vec3(intX + 1.0, intY + 1.0, intZ), vec3(1.f, 1.f, 1.f));

  float i1 = mix(v2, v3, fractX);
  float i2 = mix(v1, v4, fractX);
  float i3 = mix(v6, v7, fractX);
  float i4 = mix(v5, v8, fractX);

  float j1 = mix(i4, i3, fractZ);
  float j2 = mix(i2, i1, fractZ);

  return mix(j2, j1, fractY);

}

float computeWorley(float x, float y, float numRows, float numCols) {
    float xPos = x * float(numCols) / 20.f;
    float yPos = y * float(numRows) / 20.f;

    float minDist = 60.f;
    vec2 minVec = vec2(0.f, 0.f);

    for (int i = -1; i < 2; i++) {
        for (int j = -1; j < 2; j++) {
            vec2 currGrid = vec2(floor(float(xPos)) + float(i), floor(float(yPos)) + float(j));
            vec2 currNoise = currGrid + random2(currGrid, vec2(2.0, 1.0));
            float currDist = distance(vec2(xPos, yPos), currNoise);
            if (currDist <= minDist) {
                minDist = currDist;
                minVec = currNoise;
            }
        }
    }
    return minDist;
    // return 2.0;
}

float fbmWorley(float x, float y, float height, float xScale, float yScale) {
  float total = 0.f;
  float persistence = 0.5f;
  int octaves = 8;
  float freq = 2.0;
  float amp = 1.0;
  for (int i = 0; i < octaves; i++) {
    // total += interpNoise2d( (x / xScale) * freq, (y / yScale) * freq) * amp;
    total += computeWorley( (x / xScale) * freq, (y / yScale) * freq, 2.0, 2.0) * amp;
    freq *= 2.0;
    amp *= persistence;
  }
  return height * total;
}

float fbm(float x, float y, float height, float xScale, float yScale) {
  float total = 0.f;
  float persistence = 0.5f;
  int octaves = 8;
  float freq = 2.0;
  float amp = 1.0;
  for (int i = 0; i < octaves; i++) {
    // total += interpNoise2d( (x / xScale) * freq, (y / yScale) * freq) * amp;
    total += interpNoise2d( (x / xScale) * freq, (y / yScale) * freq) * amp;
    freq *= 2.0;
    amp *= persistence;
  }
  return height * total;
}

float fbm3D(float x, float y, float z, float height, float xScale, float yScale, float zScale) {
  float total = 0.f;
  float persistence = 0.5f;
  int octaves = 4;
  float freq = 2.0;
  float amp = 1.0;
  for (int i = 0; i < octaves; i++) {
    // total += interpNoise2d( (x / xScale) * freq, (y / yScale) * freq) * amp;
    total += interpNoise3d( (x / xScale) * freq, (y / yScale) * freq, (z / zScale) * freq) * amp;
    freq *= 2.0;
    amp *= persistence;
  }
  return height * total;
}   


void main()
{
    // Material base color (before shading)
        vec4 diffuseColor = u_Color;

        float x = 0.5 * (fs_Pos.x + 1.0);
        float y = 0.5 * (fs_Pos.y + 1.0);

        float u = fs_Pos.x * 0.05 + 0.5;
        float v = fs_Pos.y * 0.05 + 0.5 ;

        vec4 paperColor = texture(u_Image1, screenspace);

        // Calculate the diffuse term for Lambert shading
        // float diffuseTerm = 0.5 * (dot(normalize(fs_Nor), normalize(fs_LightVec)) + 1.0);
        // Avoid negative lighting values
        // diffuseTerm = clamp(diffuseTerm, 0, 1);

        float dA = 1.0;
        float c = 0.4;
        float d = 0.8;
        float DA = (clamp(dot(normalize(fs_LightVec), normalize(fs_Nor)), 0.0, 1.0) + (dA - 1.0)) / dA;

        vec4 Cc = u_Color + (DA * c);
        vec4 Cd = d * DA * (paperColor - Cc) + Cc;


        float turbulenceCtrl = clamp(fbm3D(fs_Pos.x, fs_Pos.y, fs_Pos.z, 0.57, 3.0, 3.0, 3.0) + 0.2 * bleedAmount, 0.0, 1.0);

        vec4 Ct = vec4(pow(Cd.r, 3.0 - (4.0 * turbulenceCtrl)), pow(Cd.g, 3.0 - (4.0 * turbulenceCtrl)), pow(Cd.b, 3.0 - (4.0 * turbulenceCtrl)), 1.0);
        if (turbulenceCtrl >= 0.5) {
            Ct = (turbulenceCtrl - 0.5) * 2.0 * (paperColor - Cd) + Cd;
        }



        // float ambientTerm = 0.1;

        // float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.

        // Compute final shaded color
        // out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
        out_Col = Ct;
        // out_Col = vec4(screenspace, 0.0, 1.0);
        // out_Col = vec4(1.0, 1.0, 0.0, 1.0);
}
