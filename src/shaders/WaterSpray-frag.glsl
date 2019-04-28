#version 300 es
precision highp float;

vec3 sunDirection = normalize(vec3(3.0, 2.5, -1.0));
float invPi = 0.31830988618;
in vec2 fs_Pos;

uniform float u_Time;
uniform vec2 u_Dimensions;
out vec4 out_Col;
uniform vec4 u_CameraPos;
uniform sampler2D u_Image1; // Full image
uniform sampler2D u_Image2; // Depth image

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. In this assignment,
                            // this will be the result of traversing your scene graph.

uniform mat4 u_ModelInvTr;  // The inverse transpose of the model matrix.
                            // This allows us to transform the object's normals properly
                            // if the object has been non-uniformly scaled.

uniform mat4 u_ViewProj;    // The matrix that defines the camera's transformation.
                            // We've written a static matrix for you to use for HW2,
                            // but in HW3 you'll have to generate one yourself



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

  float i1 = smoothstep(0.0, 1.0, mix(v2, v3, fractX));
  float i2 = smoothstep(0.0, 1.0, mix(v1, v4, fractX));
  float i3 = smoothstep(0.0, 1.0, mix(v6, v7, fractX));
  float i4 = smoothstep(0.0, 1.0, mix(v5, v8, fractX));

  float j1 = smoothstep(0.0, 1.0, mix(i4, i3, fractZ));
  float j2 = smoothstep(0.0, 1.0, mix(i2, i1, fractZ));

  return smoothstep(0.0, 1.0, mix(j2, j1, fractY));



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
  int octaves = 2;
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

// 3D Noise by IQ
float Noise3D( in vec3 pos )
{
    vec3 p = floor(pos);
    vec3 f = fract(pos);
    f = f * f * (3.0 - 2.0 * f);
    vec2 uv = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy;
    vec2 rg = random2((uv + 0.5) / 256.0, vec2(0.0, 1.0)).yx;
    // textureLod( iChannel0, (uv + 0.5) / 256.0, 0.0).yx;
    return -1.0 + 2.0 * mix( rg.x, rg.y, f.z );
}

float ComputeFBM( in vec3 pos )
{
    float amplitude = 0.25;
    float sum = 0.0;
    for(int i = 0; i < 3; i++)
    {
        sum += Noise3D(pos) * amplitude;
        amplitude *= 0.2;
        pos *= 4.0;
    }
    sum -= pos.y / 1200.0;
    sum *= 8.0; // Probably need to tweak this if the raymarching steps/step size are changed
    return clamp(sum, 0.0, 1.0);
}

// Henyey-Greenstein
float Phase( in float g, in float theta )
{
    return 0.25 * invPi * (1.0 - g * g) / (1.0 + g * g - 2.0 * g * pow(theta, 1.5));
}

vec4 ShadeBackground( in vec3 rayDirection )
{
    vec4 color = vec4(0.0);
    //vec3 sunDirection = normalize(vec3(cos(iTime), 2.0, sin(iTime)));
    // Sun
    // float sunDot = clamp(dot(sunDirection, rayDirection), 0.0, 1.0);
    // vec3 sunColor = vec3(1.0, 0.58, 0.3) * 20.0;
    // color += sunColor * pow(sunDot, 17.0);
    
    // Sky
    vec4 skyColor = vec4(0.0);
    color += skyColor;

    float x = 0.5 * (fs_Pos.x + 1.0);
    float y = 0.5 * (fs_Pos.y + 1.0);

    vec4 textureColor = texture(u_Image1, vec2(x,  y));

    
    return textureColor;
}

vec4 RaymarchScene( in vec3 origin, in vec3 dir )
{
    // Volume properties
    float scatteringCoeff = 0.5;
    float t = 0.1;
    float dt;
    vec3 pos;
    vec3 accumColor = vec3(0.0);
    float transmittance = 1.0;
    
    for(int i = 50; i < 180; i++)
    {
        pos = origin + t * dir + vec3(0.0, 0.0, 0.0);
        
        float density = fbm3D(pos.x + 0.4 * sin(u_Time / 2.0) + 0.5 * cos(u_Time/ 3.0 + 3.0), pos.y - u_Time/2.0, pos.z , 0.2, 0.5, 0.5, 0.5);

        
        vec4 modelposition = vec4(12.0, -20.0, -55.0, 1.0);   // Temporarily store the transformed vertex positions for use below
        // vec4 viewspace = u_ViewProj * modelposition;

        vec3 sprayPos = vec3(pos.x * 2.1, pos.y * 1.4, pos.z);
        // float distFromCenter = clamp(pow(abs(length(pos - vec3(modelposition))) * 10.0, 4.0), 0.0, 1.0);
        float dist = 15.0 + 5.0 * clamp(fbm3D(pos.x + sin(u_Time / 2.0 + 5.0) + cos(u_Time), pos.y - sin(u_Time/2.0 + 2.0), pos.z + cos(u_Time), 1.0, 5.0, 5.0, 5.0), 0.0, 1.0);
        float distFromCenter = clamp(pow(length(sprayPos - vec3(modelposition)) / dist, 0.5), 0.0, 1.0);
        density *= 1.0 - distFromCenter;

        float x = 0.5 * (fs_Pos.x + 1.0);
        float y = 0.5 * (fs_Pos.y + 1.0);
        vec4 textureColor = texture(u_Image2, vec2(x,  y));
        float depthVal = textureColor.r;
        float posDepth = length(sprayPos - u_CameraPos.xyz) / 89.0;
        // if (depthVal > 0.74) {
        if (depthVal > posDepth || sprayPos.y < -28.0) {
          density = 0.0;
        }
        // density *= 15.0 / distFromCenter;
        density *= 8.0;


        // if (distFromCenter > 10.0) {
        //   density = 0.0;
        // }
        // density = 0.0;
        transmittance *= exp(-scatteringCoeff * density * dt);
        
        // Evaluate incident lighting here
        vec3 incidentLight = vec3(0.0);
        
        // Compute samples toward light source
        const float numSamples = 1.0;
        float stepSize = 0.1;
        vec3 light = vec3(0.6, 0.6, 0.6) * 50.0;
        float accumDensity = 0.0;
        for(float j = 1.0; j <= numSamples; j += 1.0)
        {
            accumDensity += ComputeFBM(pos + stepSize * j * sunDirection) * stepSize;
        }
        accumDensity /= numSamples;
        incidentLight = light * exp(-scatteringCoeff * accumDensity * stepSize);
        
        accumColor += scatteringCoeff * density * Phase(scatteringCoeff, abs(dot(dir, sunDirection))) * incidentLight * transmittance * dt;
        
        if (transmittance <= 0.01)
        {
            break;
        }
        
        dt = max(0.04, 0.04 * t);
        t += dt;
    }
    
    // Shade the sky
    vec4 backgroundColor = ShadeBackground(dir);
    return vec4(transmittance * backgroundColor + vec4(accumColor, 1.0));
}

vec3 CastRay( in vec2 sp, in vec3 origin )
{
    // Compute local camera vectors
    vec3 refPoint = origin + vec3(0.0, 0.0, -1.0);
    vec3 camLook = normalize(refPoint - origin);
    vec3 camRight = normalize(cross(camLook, vec3(0, 1, 0)));
    vec3 camUp = normalize(cross(camRight, camLook));
    
    vec3 rayPoint = refPoint + sp.x * camRight + sp.y * camUp;
    return normalize(rayPoint - origin);
}

vec3 ToneMap( in vec3 color )
{
    return 1.0 - exp(-2.0 * color);
}

// void main( out vec4 fragColor, in vec2 fragCoord )
void main()
{
    float x = 0.5 * (fs_Pos.x + 1.0);
    float y = 0.5 * (fs_Pos.y + 1.0);
    vec2 screenPoint = (fs_Pos.xy);
    
    // Compute ray direction
    vec3 rayOrigin = u_CameraPos.xyz;
    vec3 rayDirection = CastRay(screenPoint, rayOrigin);
    
    // Raymarch the fbm
    vec4 finalColor = RaymarchScene(rayOrigin, rayDirection);
    
    // out_Col = vec4(ToneMap(finalColor.xyz), 1.0);
    out_Col = vec4(finalColor.rgb, 1.0);
}