# ts-game-engine

This is a very simple and experimental 3D WebGL engine written in TypeScript. Done as a personal project mainly for learning purposes. It is based on a similar engine I did a several years ago in C#, both in OpenGL 3 and Direct3D 11.

I'll work on this on my spare time, and it's not meant, by any means, to be used in production. 

## Current features

- Several types of entities like MeshRenderer, Camera and PointLight.
- It supports maximum 16 point lights.
- Several basic mesh types like Triangle, Cube, Sphere and a configurable grid with X, Y and Z axis. It can also load a custom binary mesh format I called MDL, which allows to load complex meshes efficiently. Its data layout is ready to be sent as is to the GPU without any conversion or processing.
- Textures.
- It caches the WebGL pipeline state to avoid unnecessary state changes before each draw call.

## Coming soon

- Frustum culling, along with octree or similar data structure to handle culling of many objects more efficiently.
- GPU instancing.
- More types of shaders and materials.

## Demo

https://maikelchan.github.io/ts-game-engine/