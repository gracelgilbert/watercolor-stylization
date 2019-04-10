#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

in vec4 vs_Pos;
uniform mat4 u_ViewProj;
uniform mat4 u_Model;
out vec2 fs_Pos;
uniform sampler2D u_RenderedTexture;


void main() {
    fs_Pos = vs_Pos.xz;

    float x = 0.5 * (fs_Pos.x + 4.0) / 4.0;
    float y = 0.5 * (fs_Pos.y + 4.0) / 4.0;

    vec4 textureColor = texture(u_RenderedTexture, vec2(x,  y));

    vec4 instancedPos = vs_Pos;

    float height = textureColor.r * 12.0;
    if (height > 1.3) {
        height = 1.3;
    }
    if (height < 1.1) {
        height = 1.1;
    }

    instancedPos.y += height;

    // fs_LightVec = lightPos - instancedPos;  // Compute the direction in which the light source lies

    gl_Position = u_ViewProj * vec4(instancedPos.xyz, 1.0);
}
