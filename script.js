
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TextureCoords;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' + // Model matrix
  'uniform mat4 u_NormalMatrix;\n' + // Transformation matrix of the normal
  'uniform mat4 u_ProjMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec2 v_TextureCoords;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position*u_ModelMatrix;\n' +
  // Calculate the vertex position in the world coordinate
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  '  v_Color = a_Color;\n' +
  '  v_TextureCoords = a_TextureCoords;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform bool u_ToggleTextures;\n' +
  'uniform float light;\n' +
  'uniform bool u_TvLight;\n' +
  'uniform vec3 u_LightColor;\n' +
  'uniform vec3 u_TvLightColour;\n' +
  'uniform vec3 u_LightPosition;\n' +
  'uniform vec3 u_TVlightPos;\n' +
  'uniform vec3 u_AmbientLight;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TextureCoords;\n' +
  'void main() {\n' +
  '  vec3 normal = normalize(v_Normal);\n' +
  '  vec3 lightDir = normalize(u_LightPosition - v_Position);\n' +


  '  float nDotL = max(dot(lightDir, normal), 0.0);\n' +

  '  vec3 diffuse= vec3(0,0,0);\n' +
  '  vec3 TVdiffuse;\n' +
  '  if (u_ToggleTextures) {\n' +
  '     vec4 TexColor = texture2D(u_Sampler, v_TextureCoords);\n' +
  '       diffuse = u_LightColor * TexColor.rgb * nDotL * 1.35;\n' +

  '  } else {\n' +
  '     diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  }\n' +
  '  if (u_TvLight) {\n' +
  '  float lightDistance = length(u_TVlightPos - v_Position);\n' +
  '  vec3 lightDir = normalize(u_TVlightPos - v_Position);\n' +
  '  float TVnDotL = max(dot(normal,lightDir), 0.0);\n' +
  '     TVdiffuse = v_Color.rgb * TVnDotL * u_TvLightColour* inversesqrt(lightDistance);\n' +
  '  } ' +
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient + TVdiffuse, v_Color.a);\n' +
  '}\n';
var pos=60;
light=true
var fly=25;
var canvas = document.getElementById('webgl');
var viewProjMatrix = new Matrix4();
viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 1000.0);
viewProjMatrix.lookAt(0.0, fly, pos, -5.0, 0.0, 0.0, 0.0, 1.0, 0.0);
function main() {

  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
  if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
    console.log('Failed to get the storage location');
    return;
  }

  var u_TvLight = gl.getUniformLocation(gl.program, "u_TvLight");
  var u_ToggleTextures = gl.getUniformLocation(gl.program, "u_ToggleTextures");
  gl.uniform1i(u_ToggleTextures, false);
  if (!u_TvLight) {
    console.log('Failed to get the storage location for tv light flag');
    return;
  }

  var modelMatrix = new Matrix4();
  var u_TvLightColour = gl.getUniformLocation(gl.program, 'u_TvLightColour');
  var u_TVlightPos = gl.getUniformLocation(gl.program, 'u_TVlightPos');
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.uniform3f(u_TVlightPos, 6, 3.0, 0);

  gl.uniform3f(u_TvLightColour, 1.0, 1.0, 1.0);

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1, 1, 1);
  // Set the light direction
  gl.uniform3f(u_LightPosition, 0.0, 3.0, 3.0);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.15, 0.15, 0.15);






  gl.uniform1i(u_ToggleTextures, false);


  document.onkeydown = function(ev) {
    keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_TvLight, u_ToggleTextures,u_LightColor);

  };
  drawScene(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_ToggleTextures);
}



var crotate = 210.0;
var chairMove = 0.0;
var door = false;

var couchMove = 0.0;
var tvLight = false;

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_TvLight, u_ToggleTextures,u_LightColor) {
  switch (ev.keyCode) {
    case 40:
      pos--;
      viewProjMatrix.lookAt(0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      break;
    case 38:
      pos++;
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      break;
    case 39:
      crotate -= 3.0;
      break;
    case 37:
      crotate += 3.0;
      break;
    case 65:
      if (chairMove < 0.5) {
        chairMove += 0.3;
      }
      break;
    case 83:
      if (chairMove > -2.0) {
        chairMove -= 0.3;
      }
      break;
    case 81:
      if (couchMove < 0.5) {
        couchMove += 0.3;
      }
      break;
    case 87:
      if (couchMove > -2.0) {
        couchMove -= 0.3;
      }
      break;
    case 85://u
      viewProjMatrix.lookAt(0.0, 0.1, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

      break;
    case 73://i
      viewProjMatrix.lookAt(0.0, -0.1, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.lookAt(0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      break;
    case 79:
      if (door) {
        door = false;
      } else {
        door = true;
      }
      break;

    case 88:
      if (light) {
        light = false;
        gl.uniform3f(u_LightColor, 0.5, 0.5, 0.5);
      } else {
        light = true;
        gl.uniform3f(u_LightColor, 1, 1, 1);
      }
      break;
    case 32:
      if (tvLight) {
        gl.uniform1i(u_TvLight, false);
        tvLight = false;
      } else {
        gl.uniform1i(u_TvLight, true);
        tvLight = true;
      }

  }


  drawScene(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_ToggleTextures);
}

function initVertexBuffers(gl) {
  // Coordinates（Cube which length of one side is 1 with the origin on the center of the bottom)
  var vertices = new Float32Array([
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 1.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 1.0, -0.5, // v0-v3-v4-v5 right
    0.5, 1.0, 0.5, 0.5, 1.0, -0.5, -0.5, 1.0, -0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
    -0.5, 1.0, 0.5, -0.5, 1.0, -0.5, -0.5, 0.0, -0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
    -0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0, -0.5, -0.5, 0.0, -0.5, -0.5, 1.0, -0.5, 0.5, 1.0, -0.5 // v4-v7-v6-v5 back
  ]);


  // Colors

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
  ]);



  // Indices of the vertices
  var indices = new Uint8Array([
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // right
    8, 9, 10, 8, 10, 11, // up
    12, 13, 14, 12, 14, 15, // left
    16, 17, 18, 16, 18, 19, // down
    20, 21, 22, 20, 22, 23 // back
  ]);

  // Write the vertex property to buffers (coordinates and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_TextureCoords', texCoords, 2)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}
var texCoords = new Float32Array([
  1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, // v0-v1-v2-v3 front
  1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
  1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, // v0-v5-v6-v1 up
  1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, // v1-v6-v7-v2 left
  0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, // v7-v4-v3-v2 down
  0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0 // v4-v7-v6-v5 back
]);
var texCoordsR = new Float32Array([
  5.0, 0.0, 0.0, 0.0, 0.0, 5.0, 5.0, 5.0, // v0-v1-v2-v3 front
  5.0, 0.0, 5.0, 5.0, 0.0, 5.0, 0.0, 0.0, // v0-v3-v4-v5 right
  5.0, 5.0, 5.0, 0.0, 0.0, 0.0, 0.0, 5.0, // v0-v5-v6-v1 up
  5.0, 0.0, 0.0, 0.0, 0.0, 5.0, 5.0, 5.0, // v1-v6-v7-v2 left
  0.0, 5.0, 5.0, 5.0, 5.0, 0.0, 0.0, 0.0, // v7-v4-v3-v2 down
  0.0, 5.0, 5.0, 5.0, 5.0, 0.0, 0.0, 0.0 // v4-v7-v6-v5 back
]);
var texCoordsR3 = new Float32Array([
  3.0, 0.0, 0.0, 0.0, 0.0, 3.0, 3.0, 3.0, // v0-v1-v2-v3 front
  3.0, 0.0, 3.0, 3.0, 0.0, 3.0, 0.0, 0.0, // v0-v3-v4-v5 right
  3.0, 3.0, 3.0, 0.0, 0.0, 0.0, 0.0, 3.0, // v0-v5-v6-v1 up
  3.0, 0.0, 0.0, 0.0, 0.0, 3.0, 3.0, 3.0, // v1-v6-v7-v2 left
  0.0, 3.0, 3.0, 3.0, 3.0, 0.0, 0.0, 0.0, // v7-v4-v3-v2 down
  0.0, 3.0, 3.0, 3.0, 3.0, 0.0, 0.0, 0.0 // v4-v7-v6-v5 back
]);

function initArrayBuffer(gl, attribute, data, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Element size
  var FSIZE = data.BYTES_PER_ELEMENT;

  // Assign the buffer object to the attribute variable

  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, FSIZE * num, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

// Coordinate transformation matrix
var g_modelMatrix = new Matrix4(),
  g_mvpMatrix = new Matrix4();

function drawScene(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, u_ToggleTextures) {

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawCouch(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -2.90 + couchMove, 0.4, 10.0, crotate + 180, 0, u_ToggleTextures);
  drawCouch(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -2.8 + couchMove, 0.4, -11.0, crotate + 90, 4, u_ToggleTextures);
  drawTvTable(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -5.0, 0.0, -21.0, crotate + 40, u_ToggleTextures);
  drawTable(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -8.0, 0.0, -7.5, crotate, u_ToggleTextures);
  drawShoe(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -16.0, 0.0, 25.5, crotate, u_ToggleTextures);
  drawTV(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 21.0, 2.3, -5.0, crotate + 130)
  drawDiningTable(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 10.0, 0, 10.0, crotate, u_ToggleTextures)
  drawChair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 3.0 + chairMove, 0, 11.0, crotate, u_ToggleTextures)
  drawChair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 6 + chairMove, 0, -15, crotate + 270, u_ToggleTextures)
  drawChair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -25 + chairMove, 0, -13.0, crotate + 180, u_ToggleTextures)
  drawChair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, -18 + chairMove, 0, 13.0, crotate + 90, u_ToggleTextures)
  drawRoom(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, crotate, u_ToggleTextures);
  drawCarpet(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 8, 0, -10.0, crotate + 90, u_ToggleTextures)

}
function drawShoe(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, rotateAroundY, u_ToggleTextures) {
  gl.uniform1i(u_ToggleTextures, true);
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('wood-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.activeTexture(gl.TEXTURE0);
  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 1, z + 0.0);
  g_modelMatrix.scale(11, 0.25, 3.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 5.9, z);
  g_modelMatrix.scale(11, 0.25, 3.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 2.3, z);
  g_modelMatrix.scale(11, 0.25, 3.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 4, z);
  g_modelMatrix.scale(11, 0.25, 3.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 5.36, y + 0, z);
  g_modelMatrix.scale(0.35, 6, 3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 5.36, y + 0, z );
  g_modelMatrix.scale(0.35, 6, 3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.uniform1i(u_ToggleTextures, false);

}

function drawTable(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, rotateAroundY, u_ToggleTextures) {
  gl.uniform1i(u_ToggleTextures, true);
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('marble-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.activeTexture(gl.TEXTURE0);
  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 0.8, z + 0.0);
  g_modelMatrix.scale(11.0, 0.25, 6.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.8, 0.8, 0.8);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 2, z);
  g_modelMatrix.scale(11.0, 0.25, 6.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.8, 0.8, 0.8);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('black-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 5.36, y + 0, z + 2.9);
  g_modelMatrix.scale(0.35, 2.3, 0.35);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.5, 0.5, 0.5);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 5.36, y + 0, z + 2.9);
  g_modelMatrix.scale(0.35, 2.3, 0.35);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.5, 0.5, 0.5);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 5.36, y + 0, z - 2.9);
  g_modelMatrix.scale(0.35, 2.3, 0.35);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.5, 0.5, 0.5);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 5.36, y + 0, z - 2.9);
  g_modelMatrix.scale(0.35, 2.3, 0.35);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.5, 0.5, 0.5);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.uniform1i(u_ToggleTextures, false);

}

function drawRoom(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, rotateAroundY, u_ToggleTextures) {
  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-14.2, 11.0, -22.25);
  g_modelMatrix.scale(13.0, 0.1, 0.1);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-14.2, 2.0, -22.25);
  g_modelMatrix.scale(13.0, 0.1, 0.1);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-20.7, 2.0, -22.25);
  g_modelMatrix.scale(0.1, 9.0, 0.1);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-7.6, 2.0, -22.25);
  g_modelMatrix.scale(0.1, 9.0, 0.1);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(2.5, 0.0, 5.0);
  g_modelMatrix.scale(50.0, 0.0, 45.0);
  gl.uniform1i(u_ToggleTextures, true);

  initArrayBuffer(gl, 'a_TextureCoords', texCoordsR, 2)

  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('floor-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.activeTexture(gl.TEXTURE0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('grass-image')
  );

  gl.bindTexture(gl.TEXTURE_2D, boxTexture);



  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(2.5, 0.0, 37.5);
  g_modelMatrix.scale(50.0, 0.0, 20.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);






  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('wall-image')
  );

  gl.bindTexture(gl.TEXTURE_2D, boxTexture);




  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-5.0, 0.0, -22.5);
  g_modelMatrix.scale(45.0, 12.0, 0.1);

  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);



  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-27.5, 0.0, -6.75);
  g_modelMatrix.scale(0.1, 1.0, 11.5);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-27.5, 0.0, 17.8);
  g_modelMatrix.scale(0.1, 1.0, 11.6);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-27.5, 11.0, 5.5);
  g_modelMatrix.scale(0.1, 1.0, 36.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-27.5, 0.0, -17.5);
  g_modelMatrix.scale(0.1, 12.0, 10.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-27.5, 0.0, 0.5);
  g_modelMatrix.scale(0.1, 12.0, 3.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-27.5, 0.0, 10.5);
  g_modelMatrix.scale(0.1, 12.0, 3.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-27.5, 0.0, 25.5);
  g_modelMatrix.scale(0.1, 12.0, 4.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  initArrayBuffer(gl, 'a_TextureCoords', texCoords, 2)

  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('door-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);


  if (!door) {
    g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(-27.5, 0.0, 5.5);

  } else {
    g_modelMatrix.setRotate(rotateAroundY + 180, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(-2.0, 0.0, -24.0);
  }
  //g_modelMatrix.translate(-14.0, 0.0, -19.0);
  g_modelMatrix.scale(0.1, 11.0, 7.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);



  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('marbleblack-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);

  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-27.5, 1.0, 17.7);
  g_modelMatrix.scale(0.1, 10.0, 11.7);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-27.5, 1.0, -6.7);
  g_modelMatrix.scale(0.1, 10.0, 11.5);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);


  g_modelMatrix.setRotate(rotateAroundY + 90, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(-14.2, 2.0, -22.3);
  g_modelMatrix.scale(13.0, 9.0, 0.1);

  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('crate-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);

  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('path-image')
  );

  gl.bindTexture(gl.TEXTURE_2D, boxTexture);


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(5.4, -0.1, 37.5);
  g_modelMatrix.scale(10.0, 0.2, 20.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.uniform1i(u_ToggleTextures, false);










}








function drawCarpet(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, rotateAroundY, u_ToggleTextures) {

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 0.0, z + 0.0);
  g_modelMatrix.scale(12.0, 0.1, 18.0);
  gl.uniform1i(u_ToggleTextures, true);
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('carpet-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.activeTexture(gl.TEXTURE0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.5, 0.5, 0.5);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.uniform1i(u_ToggleTextures, false);



}


function drawChair(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, rotateAroundY, u_ToggleTextures) {


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 2.1, y + 0.0, z + 1.0);
  g_modelMatrix.scale(0.2, 2.5, 3);
  gl.uniform1i(u_ToggleTextures, true);
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('marble-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.activeTexture(gl.TEXTURE0);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 1.0, y + 2.5, z + 1.0);
  g_modelMatrix.scale(2.5, 0.2, 3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.9, y + 0.0, z + 1.0);
  g_modelMatrix.scale(2.5, 0.2, 3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('black-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 0.25, y + 2.5, z + 1.0);
  g_modelMatrix.rotate(5.0, 0.0, 0.0, 1.0);
  g_modelMatrix.scale(0.2, 3.5, 3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.uniform1i(u_ToggleTextures, false);
}



function drawDiningTable(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, rotateAroundY, u_ToggleTextures) {
  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 4.0, y + 3.0, z + 2.0);
  g_modelMatrix.scale(20.0, 0.5, 10.0);
  gl.uniform1i(u_ToggleTextures, true);
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('marble-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.activeTexture(gl.TEXTURE0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('black-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 0.0, z + 2.0);
  g_modelMatrix.scale(0.5, 3.0, 8.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 8.0, y + 0.0, z + 2.0);
  g_modelMatrix.scale(0.5, 3.0, 8.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.uniform1i(u_ToggleTextures, false);
}

function drawTV(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, rotateAroundY) {
  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 0.0, z + 0.0);
  g_modelMatrix.scale(2.2, 0.2, 4.5);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.2, 0.2, 0.2);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 0.0, z + 0.0);
  g_modelMatrix.scale(0.25, 1.5, 3.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.2, 0.2, 0.2);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 1.0, z + 0.0);
  g_modelMatrix.scale(0.5, 3.0, 4.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.2, 0.2, 0.2);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 0.25, y + 1.0, z + 0.0);
  g_modelMatrix.scale(0.5, 4.0, 9.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.2, 0.2, 0.2);

  if (tvLight) {
    g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
    g_modelMatrix.translate(x - 0.35, y + 1.4, z + 0.0);
    g_modelMatrix.scale(0.4, 3.5, 8.8);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 1.0, 1.0, 1.0);
  }
}



function drawTvTable(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, rotateAroundY, u_ToggleTextures) {
  gl.uniform1i(u_ToggleTextures, true);
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('marbleblack-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.activeTexture(gl.TEXTURE0);
  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 0.8, z + 0.0);
  g_modelMatrix.scale(7.0, 0.25, 3.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.85, 0.85, 0.85);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 2, z);
  g_modelMatrix.scale(8.0, 0.25, 4.0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.85, 0.85, 0.85);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.uniform1i(u_ToggleTextures, false);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 2.5, y + 0, z + 1);
  g_modelMatrix.scale(0.3, 2, 0.3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 2.5, y + 0, z + 1);
  g_modelMatrix.scale(0.3, 2, 0.3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 2.5, y + 0, z - 1);
  g_modelMatrix.scale(0.3, 2, 0.3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 2.5, y + 0, z - 1);
  g_modelMatrix.scale(0.3, 2, 0.3);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.0, 0.0, 0.0);



}

function drawCouch(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, x, y, z, rotateAroundY, size, u_ToggleTextures) {
  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 0.2, z + 0.0);
  g_modelMatrix.scale(4.0, 1.5, 12.0 + size);
  gl.uniform1i(u_ToggleTextures, true);
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('leather-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.activeTexture(gl.TEXTURE0);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.50, 0.50, 0.50);


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 2.0, y + 0.2, z + 0.0);
  g_modelMatrix.scale(1.5, 4.0, 12.0 + size);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.50, 0.50, 0.50);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('leather-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.activeTexture(gl.TEXTURE0);


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 1.7, z - 6.0 - size / 2);
  g_modelMatrix.scale(4.5, 1.25, 1.25);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.50, 0.50, 0.50);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 0.0, y + 1.7, z + 6.0 + size / 2);
  g_modelMatrix.scale(4.5, 1.25, 1.25);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.50, 0.50, 0.50);

  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('black-image')
  );
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);


  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 1.5, y - 0.4, z + 5.0 + size / 2);
  g_modelMatrix.scale(1, 0.7, 1);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.4, 0.4, 0.4);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 1.8, y - 0.4, z + 5.0 + size / 2);
  g_modelMatrix.scale(1, 0.7, 1);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.4, 0.4, 0.4);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x + 1.5, y - 0.4, z - 5.0 - size / 2);
  g_modelMatrix.scale(1, 0.7, 1);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.4, 0.4, 0.4);

  g_modelMatrix.setRotate(rotateAroundY, 0.0, 1.0, 0.0);
  g_modelMatrix.translate(x - 1.8, y - 0.4, z - 5.0 - size / 2);
  g_modelMatrix.scale(1, 0.7, 1);
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, 0.4, 0.4, 0.4);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.uniform1i(u_ToggleTextures, false);
}

var g_matrixStack = []; // Array for storing a matrix
var g_normalMatrix = new Matrix4(); // Coordinate transformation matrix for normals

function drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, r, g, b) {
  // Save the model matrix
  var new_g_modelMatrix = new Matrix4(g_modelMatrix);
  g_matrixStack.push(new_g_modelMatrix);
  var colors = new Float32Array([
    r, g, b, r, g, b, r, g, b, r, g, b, // v0-v1-v2-v3 front
    r, g, b, r, g, b, r, g, b, r, g, b, // v0-v3-v4-v5 right
    r, g, b, r, g, b, r, g, b, r, g, b, // v0-v5-v6-v1 up
    r, g, b, r, g, b, r, g, b, r, g, b, // v1-v6-v7-v2 left
    r, g, b, r, g, b, r, g, b, r, g, b, // v7-v4-v3-v2 down
    r, g, b, r, g, b, r, g, b, r, g, b, // v4-v7-v6-v5 back
  ]);
  if (!initArrayBuffer(gl, 'a_Color', colors, 3)) return -1;

  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
  // Calculate the normal transformation matrix and pass it to u_NormalMatrix
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
  // Draw
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  g_modelMatrix = g_matrixStack.pop();
}
