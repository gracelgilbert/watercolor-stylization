#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

uniform sampler2D u_RenderedTexture;


in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
in vec3 vs_Transform1; // Another instance rendering attribute used to position each quad instance in the scene
in vec3 vs_Transform2; // Another instance rendering attribute used to position each quad instance in the scene
in vec3 vs_Transform3; // Another instance rendering attribute used to position each quad instance in the scene


out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_LightVec1;
out vec4 fs_LightVec2;

out vec3 fs_Translate;
const vec4 lightPos1 = vec4(50, 10, 50, 1); //The position of our virtual light, which is used to compute the shading of
const vec4 lightPos2 = vec4(-50, 10, -50, 1); //The position of our virtual light, which is used to compute the shading of


void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;
    fs_Translate = vs_Translate;

    // mat3 transformation = mat3(vs_Transform1, vs_Transform2, vs_Transform3);

    
    vec3 instancedPos = 0.03 * vs_Pos.rgb + vs_Translate;

    // vec3 rotatedPos = instancedPos;
    // rotatedPos.y = instancedPos.z;
    // rotatedPos.z = instancedPos.y;
    // rotatedPos *= 4.0;

    float x = 0.5 * (instancedPos.x + 4.0) / 4.0;
    float y = 0.5 * (instancedPos.z + 4.0) / 4.0;
    vec4 textureColor = texture(u_RenderedTexture, vec2(x,  y));

    float height = textureColor.r * 12.0;
    if (height > 1.3) {
        height = 1.3;
    }
    if (height < 1.1) {
        height = 1.1;
    }
    float floatingDist = 1.3 - height;
    instancedPos.y -= floatingDist;


    fs_LightVec1 = lightPos1 - vec4(instancedPos, 1.0);  // Compute the direction in which the light source lies
    fs_LightVec2 = lightPos2 - vec4(instancedPos, 1.0);  // Compute the direction in which the light source lies

    instancedPos.y -= 3.0;

    gl_Position = u_ViewProj * vec4(instancedPos.xyz, 1.0);


}

