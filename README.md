# watercolor-stylization

![](Images/Cover.png)

## Demo Link:
https://gracelgilbert.github.io/watercolor-stylization/

## Source:
# link to pdf

## Progress:
### Shader pipeline setup
There are many linked shaders that are involved in creating the watercolor sylization. I start by creating a paper texture, which is 2D layered noise to create a normal map rendered with lambertian shading. I then render geometry on top of that texture.  There are then multiple shaders. I will first describe the overall pipeline and then describe the steps in more detail below.  First the geometry goes through the "color" shader, which deforms the geometry and applies a reflectance model and renders to a texture called "colorImage".  This color shaders takes in the paper texture so the paper texture can show through the watercolors. Two more passes use the same vertex deformation but different fragment shaders, rendering out a depth map texture and a control map texture, which store parameters in the RGBA channels for later use.  Next, the texture "colorImage" is passed through a guassian blur and saved as a blurred texture, and is passed through a modified guassian blur saved as a bleeded texture. The modified gaussian blur uses the control map and the depth map. Finally, the original color texture and the two blurred textures are combined in a final pass output to the screen.

Something I may want to change about my rendering pipeline is to have one fragment shader write to three textures, the "colorImage" texture, the depth map, and the control map, rather than having three separate shaders and render the geometry three times.  

### Mesh deformation
There are two forms of mesh deformation.  The first is to achieve the effect of hand tremors and the second is for color bleeding.
#### Hand tremors
When painting with watercolors, edges are never perfectly straight. To mimic this effect, I deformed the edges of the mesh according to a sin curve. In the vertex shader, I evaluate a sinusoidal function at the vertex and push out the vertex along its normal by the sin function's value. I only want the deformation to occur at the edges of the geometry, so I scale how much the geometry is deformed by the dot product between the normal and the view vector. This ensures that the edges are deformed according to the sin function, but the rest of the geometry is smooth.  
#### Color bleeding
In order to mimic pigment that bleeds, which is an effect of watercolors, the geometry is actually deformed rather than just relying on blurring.  I use an FBM function to distribute a bleeding parameter over the geometry. In places that have a high bleeding amount I push out the geometry along its vertex normals according to the bleeding parameter.  This bleeding parameter also gets store in the control shader, as it is used later in the modified guassian blurring to intensify the blur of the bled portions of geometry. 
### Reflectance model
### Blurring passes
### Compositing effects

## Next Steps:
### Refine bleeding 
### Refine edge darkening
### Refine paper interaction
### Setup environment
### Add volumetric effect
