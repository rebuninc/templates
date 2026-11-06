import { useEffect, useRef } from "react"
import { getTheme, subscribeTheme } from "@/lib/theme"

const VERTEX = `attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`

// Same silk as the Rebun site hero: soft folds seen through a dot grid.
const FRAGMENT = `precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uLight;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 tex = vec2(uv.x, 1.0 - uv.y) * 2.0;
  float t = uTime * 1.2;
  tex.y += 0.03 * sin(8.0 * tex.x - t);
  float pattern = 0.5 + 0.5 * sin(
    3.0 * (tex.x + tex.y + 0.6 * cos(2.0 * tex.x + 3.0 * tex.y) + 0.02 * t)
    + 0.35 * sin(8.0 * (tex.x + tex.y - 0.1 * t))
  );
  pattern = smoothstep(0.0, 1.0, pattern);
  float dots = smoothstep(0.9, 0.4, length(mod(gl_FragCoord.xy, 3.0) - 1.5));
  vec3 color = vec3(0.3, 0.29, 0.32) * pattern * (0.25 + 0.75 * dots);
  color *= mix(0.9, 0.6, smoothstep(0.0, 0.7, distance(uv, vec2(0.5))));
  color *= mix(0.5, 1.0, smoothstep(0.0, 0.5, uv.y)) * mix(0.7, 1.0, smoothstep(1.0, 0.5, uv.y));
  // Light theme: the same folds, inverted onto paper white.
  color = mix(color, vec3(0.98) - color * 0.5, uLight);
  gl_FragColor = vec4(color, 1.0);
}`

const veil = (alpha: number) =>
  `color-mix(in srgb, var(--color-bg) ${alpha}%, transparent)`
const VEIL = `linear-gradient(${veil(60)} 0%, ${veil(5)} 26%, ${veil(8)} 54%, ${veil(90)} 100%), linear-gradient(90deg, ${veil(35)}, transparent 55%)`

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .07 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`

export function NightSilk({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext("webgl", {
      antialias: false,
      powerPreference: "low-power",
    })
    if (!canvas || !gl) return

    const shader = (type: number, source: string) => {
      const s = gl.createShader(type)
      if (!s) return null
      gl.shaderSource(s, source)
      gl.compileShader(s)
      return s
    }
    const program = gl.createProgram()
    const vertex = shader(gl.VERTEX_SHADER, VERTEX)
    const fragment = shader(gl.FRAGMENT_SHADER, FRAGMENT)
    if (!program || !vertex || !fragment) return
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.bindAttribLocation(program, 0, "aPosition")
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL call, not a React hook
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const resolution = gl.getUniformLocation(program, "uResolution")
    const time = gl.getUniformLocation(program, "uTime")
    const light = gl.getUniformLocation(program, "uLight")

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    const start = performance.now()
    let frame = 0
    const draw = () => {
      gl.uniform1f(time, still ? 4 : (performance.now() - start) / 1000)
      gl.uniform1f(light, getTheme() === "light" ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      canvas.dataset.ready = ""
    }
    const loop = () => {
      draw()
      frame = requestAnimationFrame(loop)
    }
    // Half resolution: the silk is blurry by nature, so it saves GPU for free.
    const resize = new ResizeObserver(() => {
      const scale = 0.5 * Math.min(devicePixelRatio, 2)
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolution, canvas.width, canvas.height)
      draw()
    })
    resize.observe(canvas)
    // Redraw at once so the theme transition captures the new silk.
    const unsubscribe = subscribeTheme(draw)
    if (!still) frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      unsubscribe()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
    }
  }, [])

  return (
    <div aria-hidden="true" className={`bg-bg ${className}`}>
      <div className="absolute -inset-[5%] animate-[silk-arrive_7s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full opacity-0 transition-opacity duration-1000 data-ready:opacity-100"
        />
      </div>
      <div className="absolute inset-0" style={{ background: VEIL }} />
      <div
        className="absolute inset-0 bg-size-[256px] opacity-70"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  )
}
