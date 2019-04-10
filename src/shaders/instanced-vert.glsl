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

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    // fs_Nor = vec4(0.0, 0.0, 1.0, 0.0);

    mat3 transformation = mat3(vs_Transform1, vs_Transform2, vs_Transform3);

    
    vec3 instancedPos = transformation * vs_Pos.rga;
    vec3 rotatedPos = instancedPos;
    rotatedPos.y = instancedPos.z;
    rotatedPos.z = instancedPos.y;
    rotatedPos *= 4.0;

    float x = 0.5 * (rotatedPos.x + 4.0) / 4.0;
    float y = 0.5 * (rotatedPos.z + 4.0) / 4.0;
    vec4 textureColor = texture(u_RenderedTexture, vec2(x,  y));

    float height = textureColor.r * 12.0;
    if (height > 1.3) {
        height = 1.3;
    }
    if (height < 1.1) {
        height = 1.1;
    }

    rotatedPos.y = height + 0.05;
    rotatedPos.y -= 3.0;


    // fs_LightVec = lightPos - instancedPos;  // Compute the direction in which the light source lies

    gl_Position = u_ViewProj * vec4(rotatedPos.xyz, 1.0);


}

