#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform sampler2D u_Image1;



const vec4 lightPos = vec4(5, 5, 3, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.
uniform vec4 u_CameraPos;


in vec2 fs_Pos;
out vec4 out_Col;

void main() {

    // float epsilon = 0.0001;    


    // float x = 0.5 * (fs_Pos.x + 1.0);
    // float y = 0.5 * (fs_Pos.y + 1.0);
    // vec2 position = vec2(x,y);

    vec4 albedo = vec4(1.0, 0.99, 0.95, 1.0);
    // float height = getHeight(position);

    // vec2 posxP = position + vec2(epsilon, 0.0);
    // vec2 posxN = position - vec2(epsilon, 0.0);

    // vec2 posyP = position + vec2(0.0, epsilon);
    // vec2 posyN = position - vec2(0.0, epsilon);


    // float right = getHeight(posxP);
    // float left = getHeight(posxN);
    // float up = getHeight(posyP);
    // float down = getHeight(posyN);

    // float nor1 = 0.5 * (right - left);
    // float nor2 = 0.5 * (down - up);
    // float nor3 = 1.0;

    // // float dx = left - height;
    // // float dy = up - height;
    // // fs_gradientScale = 500.0 * pow(dx * dx + dy * dy, 0.4);

    // vec4 normal = vec4(nor1, nor2, nor3, 0.f);

    // vec4 fs_LightVec = normalize(lightPos);  // Compute the direction in which the light source lies


    // float diffuseTerm = dot(normalize(normal), normalize(fs_LightVec));
    //     // Avoid negative lighting values
    //     // diffuseTerm = clamp(diffuseTerm, 0, 1);

    // float ambientTerm = 0.1;

    // float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
    //                                                     //to simulate ambient lighting. This ensures that faces that are not
    //                                                     //lit by our point light are not completely black.

    // out_Col = vec4(diffuseTerm * 2.5 * albedo.rgb, 1.0);
    out_Col = vec4(albedo.rgb, 1.0);


    // accumColor = texture(u_Image1, vec2( x,  y));
    // out_Col = vec4(albedo.rgb * height, 1.0);

}
