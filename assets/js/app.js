// Nav hamburgerburger selections
const burger = document.querySelector("#burger-menu");
const ul = document.querySelector("nav ul");
const nav = document.querySelector("nav");

// Scroll to top selection
const scrollUp = document.querySelector("#scroll-up");

// Select nav links
const navLink = document.querySelectorAll(".nav-link");

// Hamburger menu function
burger.addEventListener("click", () => {
  ul.classList.toggle("show");
});

// Close hamburger menu when a link is clicked
navLink.forEach((link) =>
  link.addEventListener("click", () => {
    ul.classList.remove("show");
  })
);

// scroll to top functionality
scrollUp.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////
// Mouse Particle Effect

// Create and setup canvas
const canvas = document.getElementById("particle-canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  console.error("WebGL2 not supported");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle resizing
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);

// Handle mouse tracking
let mousePosition = [0.5, 0.5];
window.addEventListener("mousemove", (e) => {
  mousePosition = [
    e.clientX / window.innerWidth,
    1.0 - e.clientY / window.innerHeight
  ];
});

// Vertex shader
const vertexShaderSource = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}
`;

// Fragment shader
const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
out vec4 outColor;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 diff = uv - u_mouse;
  float dist = length(diff);
  float glow = 0.02 / dist;
  float noise = random(uv + u_time);
  vec3 teal = vec3(0.0, 0.8, 0.7); // Teal glow
  outColor = vec4(teal * (glow + noise * 0.05), 1.0);
}
`;

// Shader utilities
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

// Create program
const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

// Look up attributes/uniforms
const positionLoc = gl.getAttribLocation(program, "a_position");
const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
const uTimeLoc = gl.getUniformLocation(program, "u_time");

// Create fullscreen triangle
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

// Set clear color (dark blue)
gl.clearColor(0.0, 0.12, 0.25, 1.0);

// Animation loop
function render(time) {
  time *= 0.001;

  resizeCanvas();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
  gl.uniform2f(uMouseLoc, mousePosition[0], mousePosition[1]);
  gl.uniform1f(uTimeLoc, time);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
