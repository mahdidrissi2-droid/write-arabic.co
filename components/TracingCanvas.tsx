'use client'
import { useRef, useEffect, useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PenType = 'brush' | 'pencil' | 'marker' | 'calligraphy'
type PenSize = 'sm' | 'md' | 'lg'

interface PenConfig {
  label: string
  icon: string
  baseWidth: number
  opacity: number
  lineCap: CanvasLineCap
  blur: number
  variableWidth: boolean
}

const PEN_CONFIGS: Record<PenType, PenConfig> = {
  brush:       { label: 'Brush',       icon: '🖌️', baseWidth: 16, opacity: 0.65, lineCap: 'round',  blur: 1, variableWidth: true  },
  pencil:      { label: 'Pencil',      icon: '✏️', baseWidth: 2,  opacity: 0.8,  lineCap: 'round',  blur: 0, variableWidth: false },
  marker:      { label: 'Marker',      icon: '🖊️', baseWidth: 20, opacity: 0.85, lineCap: 'square', blur: 0, variableWidth: false },
  calligraphy: { label: 'Calligraphy', icon: '🪶', baseWidth: 10, opacity: 1,    lineCap: 'butt',   blur: 0, variableWidth: true  },
}

const SIZE_MULT: Record<PenSize, number> = { sm: 0.55, md: 1, lg: 2 }

const COLORS = [
  { hex: '#16a34a', label: 'Forest'  },
  { hex: '#111827', label: 'Ink'     },
  { hex: '#2563eb', label: 'Cobalt'  },
  { hex: '#dc2626', label: 'Crimson' },
  { hex: '#7c3aed', label: 'Violet'  },
  { hex: '#d97706', label: 'Amber'   },
  { hex: '#0891b2', label: 'Teal'    },
  { hex: '#be185d', label: 'Rose'    },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  arabic: string
  onProgress?: (pct: number) => void
  onComplete?: () => void
  onCheck?: (pct: number) => void
  minHeight?: number
}

// ─── Utilities ────────────────────────────────────────────────────────────────

// Chaikin curve smoothing: subdivides segments iteratively for silky curves
function chaikin(pts: {x:number,y:number}[], iters = 3) {
  for (let k = 0; k < iters; k++) {
    const out = [pts[0]]
    for (let i = 0; i < pts.length - 1; i++) {
      out.push({ x: 0.75*pts[i].x + 0.25*pts[i+1].x, y: 0.75*pts[i].y + 0.25*pts[i+1].y })
      out.push({ x: 0.25*pts[i].x + 0.75*pts[i+1].x, y: 0.25*pts[i].y + 0.75*pts[i+1].y })
    }
    out.push(pts[pts.length - 1])
    pts = out
  }
  return pts
}

// Separable box dilation — O(W*H) regardless of radius
function dilateBox(mask: Uint8Array, W: number, H: number, radius: number): Uint8Array {
  const tmp = new Uint8Array(W * H)
  // Horizontal pass
  for (let y = 0; y < H; y++) {
    let sum = 0
    const base = y * W
    for (let x = 0; x < Math.min(radius, W); x++) if (mask[base + x]) sum++
    for (let x = 0; x < W; x++) {
      if (x + radius < W && mask[base + x + radius]) sum++
      if (x - radius - 1 >= 0 && mask[base + x - radius - 1]) sum--
      if (sum > 0) tmp[base + x] = 1
    }
  }
  // Vertical pass
  const result = new Uint8Array(W * H)
  for (let x = 0; x < W; x++) {
    let sum = 0
    for (let y = 0; y < Math.min(radius, H); y++) if (tmp[y * W + x]) sum++
    for (let y = 0; y < H; y++) {
      if (y + radius < H && tmp[(y + radius) * W + x]) sum++
      if (y - radius - 1 >= 0 && tmp[(y - radius - 1) * W + x]) sum--
      if (sum > 0) result[y * W + x] = 1
    }
  }
  return result
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TracingCanvas({ arabic, onProgress, onComplete, onCheck, minHeight = 380 }: Props) {
  // Three canvas layers: guide → committed strokes → active (current) stroke
  const guideCanvasRef     = useRef<HTMLCanvasElement>(null)
  const committedCanvasRef = useRef<HTMLCanvasElement>(null)
  const activeCanvasRef    = useRef<HTMLCanvasElement>(null)
  const debugCanvasRef     = useRef<HTMLCanvasElement>(null)
  const containerRef       = useRef<HTMLDivElement>(null)
  const arabicSpanRef      = useRef<HTMLSpanElement>(null)

  // Scoring masks (physical pixel space, built when guide is rendered)
  const guideMask     = useRef<Uint8Array | null>(null)  // guide pixels (alpha > 32)
  const toleranceMask = useRef<Uint8Array | null>(null)  // dilated guide mask (tolerance band)
  const maskW         = useRef(0)
  const maskH         = useRef(0)
  const guideCount    = useRef(0)  // total guide pixels (recall denominator)

  // Drawing state
  const drawingRef   = useRef(false)
  const rawStroke    = useRef<{ x: number; y: number }[]>([])
  const completedRef = useRef(false)

  // UI state
  const [penType,    setPenType]    = useState<PenType>('brush')
  const [penSize,    setPenSize]    = useState<PenSize>('md')
  const [color,      setColor]      = useState('#86efac')
  const [assist,     setAssist]     = useState(true)
  const [showDebug,  setShowDebug]  = useState(false)
  const [progress,   setProgress]   = useState(0)
  const [feedback,   setFeedback]   = useState<string | null>(null)
  const [checked,    setChecked]    = useState(false)

  // ─── Guide drawing + mask building ────────────────────────────────────────

  const drawGuide = useCallback(() => {
    const canvas = guideCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W   = canvas.width   // physical pixels
    const H   = canvas.height
    const w   = W / dpr        // logical pixels
    const h   = H / dpr

    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const arabicFont = arabicSpanRef.current
      ? getComputedStyle(arabicSpanRef.current).fontFamily
      : "'Noto Naskh Arabic', serif"

    const fontSize = Math.min(h * 0.62, w * 0.55)
    const cx = w / 2
    const cy = h / 2

    if (assist) {
      // Faint ghost — the tracing guide
      ctx.font         = `700 ${fontSize}px ${arabicFont}`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha  = 0.12
      ctx.fillStyle    = '#374151'
      ctx.fillText(arabic, cx, cy)
      ctx.globalAlpha  = 1
    }
    ctx.restore()

    // ── Build guide mask at physical pixel resolution ──
    const off = document.createElement('canvas')
    off.width  = W
    off.height = H
    const octx = off.getContext('2d')!
    octx.setTransform(dpr, 0, 0, dpr, 0, 0)
    octx.font         = `700 ${fontSize}px ${arabicFont}`
    octx.textAlign    = 'center'
    octx.textBaseline = 'middle'
    octx.fillStyle    = '#000'
    octx.fillText(arabic, cx, cy)

    const raw  = octx.getImageData(0, 0, W, H).data
    const gMask = new Uint8Array(W * H)
    let gCount = 0
    // Sample every 2 physical pixels (deterministic, 4× faster, tolerance covers gaps)
    for (let py = 0; py < H; py += 2) {
      for (let px = 0; px < W; px += 2) {
        const i = py * W + px
        if (raw[i * 4 + 3] > 32) { gMask[i] = 1; gCount++ }
      }
    }

    // Pen radius in logical px → physical px; add 6px logical buffer
    const penRadius  = (PEN_CONFIGS[penType].baseWidth * SIZE_MULT[penSize]) / 2
    const tolerancePx = Math.round((penRadius + 6) * dpr)

    const tMask = dilateBox(gMask, W, H, tolerancePx)

    guideMask.current     = gMask
    toleranceMask.current = tMask
    maskW.current         = W
    maskH.current         = H
    guideCount.current    = gCount
  }, [arabic, assist, penType, penSize])

  // ─── Canvas init & resize ──────────────────────────────────────────────────

  const initCanvases = useCallback(() => {
    const container = containerRef.current
    const guide     = guideCanvasRef.current
    const committed = committedCanvasRef.current
    const active    = activeCanvasRef.current
    const debug     = debugCanvasRef.current
    if (!container || !guide || !committed || !active || !debug) return

    const dpr = window.devicePixelRatio || 1
    const w   = container.offsetWidth
    const h   = container.offsetHeight
    if (!w || !h) return

    for (const canvas of [guide, committed, active, debug]) {
      canvas.width        = w * dpr
      canvas.height       = h * dpr
      canvas.style.width  = `${w}px`
      canvas.style.height = `${h}px`
    }

    document.fonts.ready.then(drawGuide)
  }, [drawGuide])

  useEffect(() => {
    setProgress(0)
    setFeedback(null)
    setChecked(false)
    completedRef.current = false
    rawStroke.current    = []
    initCanvases()

    let prevW = 0, prevH = 0
    const ro = new ResizeObserver(() => {
      const container = containerRef.current
      if (!container) return
      const w = container.offsetWidth, h = container.offsetHeight
      if (Math.abs(w - prevW) < 2 && Math.abs(h - prevH) < 2) return
      prevW = w; prevH = h
      setProgress(0); setFeedback(null); setChecked(false)
      completedRef.current = false
      initCanvases()
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [arabic, initCanvases])

  useEffect(() => { document.fonts.ready.then(drawGuide) }, [assist, drawGuide])

  // Rebuild masks when pen changes (tolerance radius depends on pen)
  useEffect(() => { document.fonts.ready.then(drawGuide) }, [penType, penSize, drawGuide])

  // ─── Pointer helpers ───────────────────────────────────────────────────────

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = activeCanvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  // ─── Stroke rendering ─────────────────────────────────────────────────────

  const penStyle = useCallback((ctx: CanvasRenderingContext2D) => {
    const cfg  = PEN_CONFIGS[penType]
    const mult = SIZE_MULT[penSize]
    const lw   = cfg.baseWidth * mult
    ctx.lineWidth   = Math.max(1, lw)
    ctx.lineCap     = cfg.lineCap
    ctx.lineJoin    = 'round'
    ctx.strokeStyle = color
    ctx.globalAlpha = cfg.opacity
    ctx.shadowBlur  = cfg.blur
    ctx.shadowColor = color
    ctx.setLineDash([])
    if (penType === 'pencil') ctx.setLineDash([lw * 1.5, lw * 0.5])
  }, [penType, penSize, color])

  const redrawActive = useCallback(() => {
    const canvas = activeCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

    const pts = rawStroke.current
    if (pts.length < 2) { ctx.restore(); return }

    const smoothed = chaikin(pts, pts.length < 5 ? 1 : 3)
    penStyle(ctx)
    ctx.beginPath()
    ctx.moveTo(smoothed[0].x, smoothed[0].y)
    for (let i = 1; i < smoothed.length; i++) ctx.lineTo(smoothed[i].x, smoothed[i].y)
    ctx.stroke()
    ctx.restore()
  }, [penStyle])

  // ─── Scoring: recall + precision + tolerance band ─────────────────────────

  const computeScore = useCallback((): number => {
    const committed   = committedCanvasRef.current
    const active      = activeCanvasRef.current
    const gMask       = guideMask.current
    const tMask       = toleranceMask.current
    if (!committed || !active || !gMask || !tMask) return 0

    const W = maskW.current, H = maskH.current
    if (!W || !H) return 0
    if (guideCount.current === 0) return 0

    const cData = committed.getContext('2d')!.getImageData(0, 0, W, H).data
    const aData = active.getContext('2d')!.getImageData(0, 0, W, H).data

    // Build ink mask (physical pixels, sample every 2px)
    const inkMask = new Uint8Array(W * H)
    let inkCount  = 0
    for (let py = 0; py < H; py += 2) {
      for (let px = 0; px < W; px += 2) {
        const i = py * W + px
        if (cData[i * 4 + 3] > 32 || aData[i * 4 + 3] > 32) { inkMask[i] = 1; inkCount++ }
      }
    }

    if (inkCount === 0) return 0

    // Dilate ink mask by same tolerance radius (so guide pixels near ink count as covered)
    const dpr = window.devicePixelRatio || 1
    const penRadius   = (PEN_CONFIGS[penType].baseWidth * SIZE_MULT[penSize]) / 2
    const tolerancePx = Math.round((penRadius + 6) * dpr)
    const inkTolerance = dilateBox(inkMask, W, H, tolerancePx)

    // recall  = guide pixels that have ink nearby / total guide pixels
    // precision = ink pixels inside guide tolerance band / total ink pixels
    let guideHit = 0, inkGood = 0
    for (let py = 0; py < H; py += 2) {
      for (let px = 0; px < W; px += 2) {
        const i = py * W + px
        if (gMask[i] && inkTolerance[i]) guideHit++
        if (inkMask[i] && tMask[i])       inkGood++
      }
    }

    const recall    = guideHit / guideCount.current
    const precision = inkGood  / inkCount

    return Math.round(100 * (0.7 * recall + 0.3 * precision))
  }, [penType, penSize])

  // ─── Debug overlay ────────────────────────────────────────────────────────

  const paintDebugOverlay = useCallback(() => {
    const debugCanvas = debugCanvasRef.current
    const committed   = committedCanvasRef.current
    const active      = activeCanvasRef.current
    const gMask       = guideMask.current
    const tMask       = toleranceMask.current
    if (!debugCanvas || !committed || !active || !gMask || !tMask) return

    const W = maskW.current, H = maskH.current
    if (!W || !H) return

    const cData = committed.getContext('2d')!.getImageData(0, 0, W, H).data
    const aData = active.getContext('2d')!.getImageData(0, 0, W, H).data

    const inkMask = new Uint8Array(W * H)
    for (let py = 0; py < H; py += 2)
      for (let px = 0; px < W; px += 2) {
        const i = py * W + px
        if (cData[i * 4 + 3] > 32 || aData[i * 4 + 3] > 32) inkMask[i] = 1
      }

    const dpr = window.devicePixelRatio || 1
    const penRadius   = (PEN_CONFIGS[penType].baseWidth * SIZE_MULT[penSize]) / 2
    const tolerancePx = Math.round((penRadius + 6) * dpr)
    const inkTolerance = dilateBox(inkMask, W, H, tolerancePx)

    const dCtx = debugCanvas.getContext('2d')!
    dCtx.clearRect(0, 0, W, H)
    const img = dCtx.createImageData(W, H)

    for (let py = 0; py < H; py += 2) {
      for (let px = 0; px < W; px += 2) {
        const i  = py * W + px
        const i4 = i * 4
        const isGuide = gMask[i]
        const isInk   = inkMask[i]
        const inTol   = tMask[i]

        if (isGuide && inkTolerance[i]) {
          // guide covered — green
          img.data[i4]=0; img.data[i4+1]=200; img.data[i4+2]=80; img.data[i4+3]=180
        } else if (isGuide) {
          // guide missed — red
          img.data[i4]=220; img.data[i4+1]=30; img.data[i4+2]=30; img.data[i4+3]=180
        } else if (isInk && !inTol) {
          // ink outside guide tolerance — orange
          img.data[i4]=255; img.data[i4+1]=140; img.data[i4+2]=0; img.data[i4+3]=180
        }
      }
    }

    dCtx.putImageData(img, 0, 0)
  }, [penType, penSize])

  // ─── Event handlers ───────────────────────────────────────────────────────

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (checked) return
    e.preventDefault()
    const pos = getPos(e)
    if (!pos) return
    drawingRef.current = true
    rawStroke.current  = [pos]
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current || checked) return
    e.preventDefault()
    const pos = getPos(e)
    if (!pos) return
    rawStroke.current.push(pos)
    redrawActive()
  }

  const endDraw = () => {
    if (!drawingRef.current) return

    // Commit active stroke into the committed canvas
    const committed = committedCanvasRef.current
    const active    = activeCanvasRef.current
    if (committed && active) {
      const ctx = committed.getContext('2d')
      if (ctx) ctx.drawImage(active, 0, 0)
      const dpr = window.devicePixelRatio || 1
      const actCtx = active.getContext('2d')!
      actCtx.save()
      actCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      actCtx.clearRect(0, 0, active.width / dpr, active.height / dpr)
      actCtx.restore()
    }
    drawingRef.current = false
    rawStroke.current  = []

    // Score after each stroke so progress bar stays live (includes current active state)
    const pct = computeScore()
    setProgress(pct)
    onProgress?.(pct)
    if (pct >= 55 && !completedRef.current) {
      completedRef.current = true
      onComplete?.()
    }
    if (showDebug) paintDebugOverlay()
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  const clear = () => {
    const dpr = window.devicePixelRatio || 1
    for (const ref of [committedCanvasRef, activeCanvasRef, debugCanvasRef]) {
      const c = ref.current; if (!c) continue
      const ctx = c.getContext('2d')!
      ctx.clearRect(0, 0, c.width, c.height)
    }
    setProgress(0); setFeedback(null); setChecked(false)
    completedRef.current = false
    rawStroke.current    = []
  }

  const check = () => {
    const pct = computeScore()
    setProgress(pct)
    setChecked(true)
    if (showDebug) paintDebugOverlay()
    onCheck?.(pct)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full h-full gap-3">
      {/* Force Noto Naskh Arabic to download — ref lets canvas read the real font name */}
      <span ref={arabicSpanRef} className="arabic sr-only" aria-hidden>أ</span>

      {/* ── Toolbar ── */}
      <div className="shrink-0 flex flex-wrap items-center gap-2 px-1">

        {/* Pen type */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(Object.keys(PEN_CONFIGS) as PenType[]).map((pt) => (
            <button
              key={pt}
              onClick={() => setPenType(pt)}
              title={PEN_CONFIGS[pt].label}
              className={`text-base px-2 py-1 rounded-lg transition-all ${
                penType === pt
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {PEN_CONFIGS[pt].icon}
            </button>
          ))}
        </div>

        {/* Size */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['sm', 'md', 'lg'] as PenSize[]).map((s) => (
            <button
              key={s}
              onClick={() => setPenSize(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                penSize === s
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Color swatches */}
        <div className="flex gap-1.5 items-center">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => setColor(c.hex)}
              title={c.label}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                color === c.hex ? 'border-gray-400 scale-125' : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* Assist toggle */}
        <button
          onClick={() => setAssist(!assist)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
            assist
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${assist ? 'bg-green-500' : 'bg-gray-300'}`} />
          Guide {assist ? 'on' : 'off'}
        </button>

        {/* Debug toggle */}
        <button
          onClick={() => {
            const next = !showDebug
            setShowDebug(next)
            if (next) paintDebugOverlay()
            else {
              const dc = debugCanvasRef.current
              if (dc) dc.getContext('2d')!.clearRect(0, 0, dc.width, dc.height)
            }
          }}
          className={`ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
            showDebug
              ? 'bg-orange-50 border-orange-200 text-orange-700'
              : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}
        >
          Debug {showDebug ? 'on' : 'off'}
        </button>
      </div>

      {/* ── Canvas area ── */}
      <div
        ref={containerRef}
        className="relative flex-1 rounded-2xl overflow-hidden border border-gray-200 bg-white"
        style={{ minHeight }}
      >
        {/* Layer 1: faint guide letter */}
        <canvas ref={guideCanvasRef}     className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 1 }} />
        {/* Layer 2: committed strokes */}
        <canvas ref={committedCanvasRef} className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 2 }} />
        {/* Layer 3: current stroke (receives input) */}
        <canvas
          ref={activeCanvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{ zIndex: 3 }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {/* Layer 4: debug overlay (transparent unless showDebug) */}
        <canvas ref={debugCanvasRef} className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 4, opacity: 0.7 }} />

        {progress === 0 && assist && !checked && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-400 text-xs font-medium px-4 py-2 rounded-full shadow-sm pointer-events-none" style={{ zIndex: 5 }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Trace the faint guide
          </div>
        )}
      </div>

      {/* ── Progress bar ── */}
      <div className="shrink-0 flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-100"
            style={{ width: `${Math.min(100, progress)}%`, backgroundColor: '#16a34a' }}
          />
        </div>
        <span className="text-xs text-gray-400 tabular-nums w-8 text-right">
          {Math.min(100, progress)}%
        </span>
      </div>

      {/* ── Controls row ── */}
      <div className="shrink-0 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400 leading-snug">
          Trace the dotted guide, then Check.<br className="hidden sm:block" />
          Shape is rated, not perfection.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={clear}
            className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 border border-gray-200 rounded-xl transition-colors"
          >
            ↺ Clear
          </button>
          <button
            onClick={check}
            disabled={checked}
            className="text-sm bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold"
          >
            Check
          </button>
        </div>
      </div>

    </div>
  )
}
