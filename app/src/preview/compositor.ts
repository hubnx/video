/**
 * Draws a frame on the preview's canvas with WebGL2: upright (the clip's clockwise rotation, applied here once), fitted
 * inside the canvas with black bars where the shapes differ. One quad today; captions, the 9:16 frame and pictures over
 * the video join it as layers (docs/plan.md › What each release has).
 */
const VERTEX = `#version 300 es
in vec2 position;
uniform vec2 scale;     // the picture's share of the canvas, after fitting
uniform int quarterTurns; // clockwise
out vec2 place; // where in the picture this corner reads (not named texture: that is GLSL's own function)
void main() {
  // The shown corner (x right, y up) maps to the stored picture's corner it must show. Turned a quarter clockwise, the
  // shown top-left is the stored bottom-left: stored x = 1 - shown y, stored y = shown x.
  vec2 corner = position * 0.5 + 0.5;
  vec2 stored = corner;
  if (quarterTurns == 1) stored = vec2(1.0 - corner.y, corner.x);
  if (quarterTurns == 2) stored = vec2(1.0 - corner.x, 1.0 - corner.y);
  if (quarterTurns == 3) stored = vec2(corner.y, 1.0 - corner.x);
  place = vec2(stored.x, 1.0 - stored.y); // a frame's first row is its top: texture y runs down
  gl_Position = vec4(position * scale, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision mediump float;
in vec2 place;
uniform sampler2D picture;
out vec4 color;
void main() {
  color = texture(picture, place);
}`;

export type QuarterTurns = 0 | 1 | 2 | 3;

export class Compositor {
  private readonly gl: WebGL2RenderingContext;
  private readonly scaleAt: WebGLUniformLocation | null;
  private readonly turnsAt: WebGLUniformLocation | null;
  private readonly pictureTexture: WebGLTexture;
  private readonly overlayTexture: WebGLTexture;
  /** The last picture's share of the canvas: an overlay covers exactly the picture, not the black bars. */
  private scale: [number, number] = [1, 1];
  readonly canvas: HTMLCanvasElement | OffscreenCanvas;

  /** On a canvas on screen, sized to it as it's shown; on an OffscreenCanvas (export), at the size it was made. */
  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    this.canvas = canvas;
    // preserveDrawingBuffer: the checks read the drawn frame back (scripts/check-preview.ts).
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, preserveDrawingBuffer: true }) as WebGL2RenderingContext | null;
    if (!gl) throw new Error("COMPOSITOR_NO_WEBGL2");
    this.gl = gl;
    const program = gl.createProgram();
    for (const [type, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]] as const) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`COMPOSITOR_SHADER: ${gl.getShaderInfoLog(shader)}`);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`COMPOSITOR_PROGRAM: ${gl.getProgramInfoLog(program)}`);
    gl.useProgram(program);
    const corners = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = () => {
      const made = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, made);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return made;
    };
    this.pictureTexture = texture();
    this.overlayTexture = texture();
    // Captions and anything else laid over the picture blend by their own transparency, premultiplied as a 2D canvas is.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    this.scaleAt = gl.getUniformLocation(program, "scale");
    this.turnsAt = gl.getUniformLocation(program, "quarterTurns");
  }

  /** Draws `picture` (stored `width` × `height`, to be turned `turns` quarter turns clockwise) fitted to the canvas. */
  draw(picture: TexImageSource, width: number, height: number, turns: QuarterTurns): void {
    const gl = this.gl;
    this.fitCanvas();
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.bindTexture(gl.TEXTURE_2D, this.pictureTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, picture);
    const [uprightWidth, uprightHeight] = turns % 2 === 0 ? [width, height] : [height, width];
    const picturesShape = uprightWidth / uprightHeight;
    const canvasShape = this.canvas.width / this.canvas.height;
    this.scale = picturesShape > canvasShape ? [1, canvasShape / picturesShape] : [picturesShape / canvasShape, 1];
    gl.uniform2f(this.scaleAt, this.scale[0], this.scale[1]);
    gl.uniform1i(this.turnsAt, turns);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /** The size in canvas pixels the last picture fills: an overlay drawn at this size is sharp. */
  get pictureSize(): { width: number; height: number } {
    return { width: Math.round(this.canvas.width * this.scale[0]), height: Math.round(this.canvas.height * this.scale[1]) };
  }

  /** Lays `overlay` (upright, with transparency) over the picture just drawn. */
  drawOverlay(overlay: TexImageSource): void {
    const gl = this.gl;
    gl.enable(gl.BLEND);
    gl.bindTexture(gl.TEXTURE_2D, this.overlayTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, overlay);
    gl.uniform2f(this.scaleAt, this.scale[0], this.scale[1]);
    gl.uniform1i(this.turnsAt, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /** Gives the graphics context back now, rather than when it's collected: Chromium keeps about 16 and drops the oldest. */
  release(): void {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  /** The canvas's pixels match its size on screen, sharp on a high-density display; an export's canvas keeps its own. */
  private fitCanvas(): void {
    if (!(this.canvas instanceof HTMLCanvasElement)) return;
    const width = Math.max(1, Math.round(this.canvas.clientWidth * devicePixelRatio));
    const height = Math.max(1, Math.round(this.canvas.clientHeight * devicePixelRatio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }
}
