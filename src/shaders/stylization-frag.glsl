#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform sampler2D u_Image1; // Color image
uniform sampler2D u_Image2; // Blurred image
uniform sampler2D u_Image3; // Bleeded image
uniform sampler2D u_Image4; // Control image

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

in vec2 fs_Pos;
out vec4 out_Col;

float getHeight(vec2 pos) {
    float height = 1.0 * pow(1.0 - computeWorley(pos.x, pos.y, 1800.0, 1000.0), 0.3);
    height += 0.6 * (1.0 - pow(fbm(pos.x, pos.y, 1.0, 0.01, 0.01), 0.5));
    return clamp(height, 0.0, 1.0);
}
const vec4 lightPos = vec4(5, 5, 3, 1); //The position of our virtual light, which is used to compute the shading of


void main() {

  float x = 0.5 * (fs_Pos.x + 1.0);
  float y = 0.5 * (fs_Pos.y + 1.0);

  vec4 ColorSample = texture(u_Image1, vec2( x,  y));
  vec4 BlurSample = texture(u_Image2, vec2( x,  y));
  vec4 BleedSample = texture(u_Image3, vec2( x,  y));
  vec4 ControlSample = texture(u_Image4, vec2( x,  y));

  vec4 edgeDarkeningDiff = BlurSample - ColorSample;
  float maxRGB = 1.0 + 8.0 * ControlSample.b * ControlSample.g * max(max(edgeDarkeningDiff.x, edgeDarkeningDiff.y), edgeDarkeningDiff.z);
  // float maxRGB = 1.0 + 5.0 * max(max(edgeDarkeningDiff.x, edgeDarkeningDiff.y), edgeDarkeningDiff.z);

  vec4 darkenedEdgeCol = vec4(pow(BleedSample.x, maxRGB), pow(BleedSample.y, maxRGB), pow(BleedSample.z, maxRGB), 1.0);

    float epsilon = 0.0001;    

    vec2 position = vec2(x,y);

    float height = getHeight(position);

    vec2 posxP = position + vec2(epsilon, 0.0);
    vec2 posxN = position - vec2(epsilon, 0.0);

    vec2 posyP = position + vec2(0.0, epsilon);
    vec2 posyN = position - vec2(0.0, epsilon);


    float right = getHeight(posxP);
    float left = getHeight(posxN);
    float up = getHeight(posyP);
    float down = getHeight(posyN);

    float nor1 = 0.5 * (right - left);
    float nor2 = 0.5 * (down - up);
    float nor3 = 1.0;

    // float dx = left - height;
    // float dy = up - height;
    // fs_gradientScale = 500.0 * pow(dx * dx + dy * dy, 0.4);

    vec4 normal = vec4(nor1, nor2, nor3, 0.f);

    vec4 fs_LightVec = normalize(lightPos);  // Compute the direction in which the light source lies


    float diffuseTerm = pow(dot(normalize(normal), normalize(fs_LightVec)), 1.5);
        // Avoid negative lighting values
        // diffuseTerm = clamp(diffuseTerm, 0, 1);

    float ambientTerm = 0.1;

    float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.

    out_Col = vec4(diffuseTerm * 4.0 * darkenedEdgeCol.rgb, 1.0);


  // vec4 grayscale = texture(u_Image1, vec2( x,  y));

  // out_Col = vec4(maxRGB - 1.0, 0.0, 0.0, 1.0);
  // out_Col = vec4(ControlSample.rgb, 1.0); 
  // out_Col = ColorSample;

}
