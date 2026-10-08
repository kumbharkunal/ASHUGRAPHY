import { Flowmap, Mesh, Program, Renderer, Texture, Triangle, Vec2, Vec4 } from "ogl";
import { ScrollTrigger } from "@/lib/gsap";

interface Focal {
  x: number;
  y: number;
}

export interface HeroShaderOptions {
  /** Absolutely positioned layer inside the hero frame; the canvas goes in here. */
  host: HTMLElement;
  /** The painted hero <img>; its current source becomes the texture (already cached, no new download). */
  image: HTMLImageElement;
  /** The hero section, used to switch the effect off once the screen turns into a print. */
  section: HTMLElement;
  focal: { landscape: Focal; portrait: Focal };
}

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// The photograph, displaced by the cursor's flow (about 0.03 UV at full strength) with a faint
// channel split along the flow, plus a warm light that follows the cursor while it moves.
// With no flow and no light, the output equals the photograph, so the layer can cross-fade
// in and out over the <img> without a visible step.
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tImage;
  uniform sampler2D tFlow;
  uniform vec4 uCover;
  uniform vec2 uPointer;
  uniform float uAspect;
  uniform float uGlow;
  varying vec2 vUv;

  void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;
    vec2 uv = vUv * uCover.xy + uCover.zw;
    vec2 shift = flow.xy * 0.03;
    vec3 color;
    color.r = texture2D(tImage, uv - shift * 1.12).r;
    color.g = texture2D(tImage, uv - shift).g;
    color.b = texture2D(tImage, uv - shift * 0.88).b;

    vec2 delta = vUv - uPointer;
    delta.x *= uAspect;
    float light = smoothstep(0.42, 0.0, length(delta));
    color += vec3(1.0, 0.74, 0.46) * light * light * 0.14 * uGlow;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const IDLE_FRAMES = 120;

function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  return image.decode().then(() => image);
}

/**
 * "Liquid light" over the hero photograph (OGL Flowmap). Starts hidden; while the cursor moves
 * over the hero the layer fades in, the photo ripples with the cursor's flow and a warm light
 * follows it. After the flow settles the layer fades out and rendering stops, so at rest the
 * crisp <img> is what you see. Off as soon as the hero starts turning into a print.
 * Returns a cleanup function; returns a no-op if WebGL is unavailable.
 */
export async function startHeroShader({ host, image, section, focal }: HeroShaderOptions): Promise<() => void> {
  // Test for a context ourselves, so an unsupported device fails quietly instead of logging.
  const canvas = document.createElement("canvas");
  const attributes = { alpha: false, antialias: false, depth: false, powerPreference: "low-power" as const };
  const context =
    (canvas.getContext("webgl2", attributes) as WebGL2RenderingContext | null) ??
    (canvas.getContext("webgl", attributes) as WebGLRenderingContext | null);
  if (!context) return () => undefined;

  let source = await loadImage(image.currentSrc || image.src);
  let sourceUrl = source.src;

  const cover = new Vec4(1, 1, 0, 0);
  const pointer = new Vec2(0.5, 0.5);
  let renderer: Renderer;
  let flowmap: Flowmap;
  let texture: Texture;
  let program: Program;
  let mesh: Mesh;
  try {
    renderer = new Renderer({
      canvas,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
      webgl: context instanceof WebGLRenderingContext ? 1 : 2,
    });
    const glContext = renderer.gl;
    flowmap = new Flowmap(glContext, { size: 128, falloff: 0.22, alpha: 0.6, dissipation: 0.955 });
    texture = new Texture(glContext, {
      image: source,
      generateMipmaps: false,
      minFilter: glContext.LINEAR,
      magFilter: glContext.LINEAR,
    });
    program = new Program(glContext, {
      vertex,
      fragment,
      uniforms: {
        tImage: { value: texture },
        tFlow: flowmap.uniform,
        uCover: { value: cover },
        uPointer: { value: pointer },
        uAspect: { value: 1 },
        uGlow: { value: 0 },
      },
    });
    mesh = new Mesh(glContext, { geometry: new Triangle(glContext), program });
  } catch {
    // Missing float render targets or a shader the GPU rejects: keep the plain photograph.
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return () => undefined;
  }
  const gl = renderer.gl;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

  /** Same crop as CSS object-fit: cover with the photo's focal point as object-position. */
  const resize = () => {
    const width = host.offsetWidth;
    const height = host.offsetHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    const aspect = width / height;
    flowmap.aspect = aspect;
    program.uniforms.uAspect.value = aspect;
    const point = height > width ? focal.portrait : focal.landscape;
    const imageAspect = source.naturalWidth / source.naturalHeight;
    const scaleX = aspect > imageAspect ? 1 : aspect / imageAspect;
    const scaleY = aspect > imageAspect ? imageAspect / aspect : 1;
    cover.set(scaleX, scaleY, (1 - scaleX) * (point.x / 100), (1 - scaleY) * (1 - point.y / 100));
  };

  // The <picture> swaps sources when the orientation changes; follow it.
  const syncSource = async () => {
    const next = image.currentSrc || image.src;
    if (!next || next === sourceUrl) return;
    sourceUrl = next;
    source = await loadImage(next);
    texture.image = source;
    resize();
  };

  const mouse = new Vec2(-1, -1);
  const lastMouse = new Vec2();
  const velocity = new Vec2();
  let moved = false;
  let lastTime = 0;
  let glow = 0;
  let raf = 0;
  let idle = 0;
  let enabled = window.scrollY < window.innerHeight * 0.08;
  let destroyed = false;

  const setActive = (active: boolean) => {
    host.dataset.active = String(active);
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!moved) {
      mouse.set(-1, -1);
      velocity.set(0, 0);
    }
    moved = false;
    flowmap.mouse.copy(mouse);
    flowmap.velocity.lerp(velocity, velocity.len() ? 0.5 : 0.1);
    flowmap.update();

    const target = Math.min(1, flowmap.velocity.len() * 6);
    glow += (target - glow) * 0.06;
    program.uniforms.uGlow.value = glow;
    renderer.render({ scene: mesh });

    // Settled: fade back to the crisp photograph and stop drawing until the cursor moves again.
    if (flowmap.velocity.len() < 0.0004 && glow < 0.01) idle += 1;
    else idle = 0;
    if (idle === 40) setActive(false);
    if (idle > IDLE_FRAMES) stop();
  };

  const start = () => {
    if (raf || !enabled || destroyed) return;
    idle = 0;
    raf = requestAnimationFrame(frame);
  };

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !enabled) return;
    const rect = host.getBoundingClientRect();
    if (event.clientY < rect.top || event.clientY > rect.bottom || event.clientX < rect.left || event.clientX > rect.right) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    const now = performance.now();
    if (!lastTime) {
      lastTime = now;
      lastMouse.set(event.clientX, event.clientY);
    }
    const delta = Math.max(14, now - lastTime);
    velocity.set((event.clientX - lastMouse.x) / delta, (event.clientY - lastMouse.y) / delta);
    lastMouse.set(event.clientX, event.clientY);
    lastTime = now;
    mouse.set(x, y);
    pointer.set(x, y);
    moved = true;
    setActive(true);
    start();
  };

  const onResize = () => {
    resize();
    void syncSource();
  };

  // Off once the hero starts becoming a print (or scrolls away); back on when you return to the top.
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${Math.round(window.innerHeight * 0.08)}`,
    onLeave: () => {
      enabled = false;
      setActive(false);
      stop();
    },
    onEnterBack: () => {
      enabled = true;
    },
  });

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    stop();
    trigger.kill();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("resize", onResize);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
    delete host.dataset.active;
  };

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    destroy();
  });

  resize();
  renderer.render({ scene: mesh });
  host.appendChild(canvas);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  return destroy;
}
