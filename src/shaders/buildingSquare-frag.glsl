#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec1;
in vec4 fs_LightVec2;

in vec3 fs_Translate;

uniform sampler2D u_RenderedTexture;

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

float fbm3D(float x, float y, float z, float height, float xScale, float yScale, float zScale) {
  float total = 0.f;
  float persistence = 0.5f;
  int octaves = 8;
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


out vec4 out_Col;

void main()
{   


        vec3 instancedPos = 0.03 * fs_Pos.rgb + fs_Translate;

        float x = 0.5 * (instancedPos.x + 4.0) / 4.0;
        float y = 0.5 * (instancedPos.z + 4.0) / 4.0;
        vec4 textureColor = texture(u_RenderedTexture, vec2(x,  y));


        vec3 stripeColor = vec3(0.0, 0.0, 0.0);
        vec3 color11 = vec3(0.7 + 0.3 * computeWorley(x, y, 100.0, 100.0), 0.4 + 0.1 * computeWorley(x, y, 100.0, 100.0), 0.4 + 0.1 * computeWorley(x, y, 100.0, 100.0));
        vec3 color12 = vec3(0.8 + 0.3 * computeWorley(x, y, 100.0, 100.0), 0.6 + 0.3 * computeWorley(x, y, 100.0, 100.0), 0.2 + 0.1 * computeWorley(x, y, 100.0, 100.0));
        vec3 color13 = vec3(0.2 + 0.1 * computeWorley(x, y, 100.0, 100.0), 0.2 + 0.1 * computeWorley(x, y, 100.0, 100.0), 0.7 + 0.3 * computeWorley(x, y, 100.0, 100.0));

        vec3 color1 = vec3(0.0);
        float colorProb = computeWorley(x, y, 200.0, 200.0);
        if (colorProb < 0.3) {
            color1 = color11;
        } else if (colorProb < 0.6) {
            color1 = color12;
        } else {
            color1 = color13;
        }


        // vec3 color2 = vec3(0.5 + 0.3 * random1(vec2(x,y), vec2(1.0, 1.0)), 0.6 + 0.2 * random1(vec2(x,y), vec2(1.0, 1.0)), 0.3 + 0.6 * random1(vec2(x,y), vec2(1.0, 1.0)));
        vec3 color2 = 0.7 * vec3(0.7 + 0.2 * computeWorley(x, y, 110.0, 110.0), 0.7 + 0.2 * computeWorley(x, y, 120.0, 120.0), 0.7 + 0.2 * computeWorley(x, y, 150.0, 150.0));

        vec3 diffuseColor = mix(color1, color2, pow(textureColor.a, 2.0));
        if (textureColor.a < 0.0000001) {
            diffuseColor = mix(color1, color2, 0.9);
        }
        // diffuseColor = color1;

        if (textureColor.a > 0.5 || textureColor.a < 0.0000001) {
          if (abs(fs_Nor.z) > 0.001) {
            diffuseColor *= (1.0 - pow(sin(instancedPos.x * 300.0), 5.0));
          } 
          if (abs(fs_Nor.x) > 0.001) {
              diffuseColor *= (1.0 - pow(sin(instancedPos.z * 300.0), 5.0));
          }
        } else {
          diffuseColor *= fbm3D(instancedPos.x, instancedPos.y, instancedPos.z, 1.0, 0.1, 0.1, 0.1);
        }


        vec3 light1Color = vec3(1.2, 1.1, 0.8);
        vec3 light2Color = vec3(1.0, 0.8, 1.2);
        float light1Intensity = 1.0;
        float light2Intensity = 1.0;

        // Calculate the diffuse term for Lambert shading
        float diffuseTerm1 = 2.0 * clamp(dot(normalize(fs_Nor), normalize(fs_LightVec1)), 0.0, 1.0);
        float diffuseTerm2 = clamp(dot(normalize(fs_Nor), normalize(fs_LightVec2)), 0.0, 1.0);

        // Avoid negative lighting values
        // diffuseTerm = clamp(diffuseTerm, 0, 1);

        float ambientTerm = 0.1;
        diffuseTerm1 += ambientTerm;
        diffuseTerm2 += ambientTerm;



        // float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.
        // float lightIntensity2 = 0.5 * diffuseTerm2 + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.
        // Compute final shaded color

        out_Col = vec4(diffuseColor * (light1Intensity * light1Color * diffuseTerm1 + light2Intensity * light2Color * diffuseTerm2), 1.0);
        // out_Col = vec4(fs_Nor.xyz, 1.0);
    // float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
}
