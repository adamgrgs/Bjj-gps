import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import ForceGraph2D, { type ForceGraphMethods, type LinkObject, type NodeObject } from 'react-force-graph-2d'
import { CAT_META, catOf, lvl, type Item, type State } from '../lib/model'

export interface GNode {
  id: string
  item: Item
  isPos: boolean
  x?: number
  y?: number
}
interface GLink {
  source: string | GNode
  target: string | GNode
  kind: 'from' | 'to' | 'concept'
}

export interface GraphHandle {
  focus: (id: string, flash?: boolean) => void
  fit: () => void
}

interface Props {
  state: State
  items: Item[]
  visibleCats: Set<string>
  onlyKnown: boolean
  selected: string | null
  routeIds: Set<string> | null
  onSelect: (id: string | null) => void
  width: number
  height: number
}

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

const Graph = forwardRef<GraphHandle, Props>(function Graph(p, ref) {
  const fg = useRef<ForceGraphMethods<NodeObject<GNode>, LinkObject<GNode, GLink>> | undefined>(undefined)
  const flash = useRef<{ id: string; t: number } | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const cache = useRef(new Map<string, GNode>())
  const node = (it: Item, isPos: boolean): GNode => {
    let n = cache.current.get(it.id)
    if (!n) { n = { id: it.id, item: it, isPos }; cache.current.set(it.id, n) }
    n.item = it
    return n
  }

  const data = useMemo(() => {
    const nodes: GNode[] = []
    const links: GLink[] = []
    const keep = (it: Item) => {
      if (!p.visibleCats.has(catOf(it))) return false
      if (p.onlyKnown && lvl(p.state, it.id) === 0) return false
      return true
    }
    const posIds = new Set<string>()
    for (const it of p.items) if (it.kind === 'position') { nodes.push(node(it, true)); posIds.add(it.id) }
    for (const it of p.items) {
      if (it.kind !== 'technique' || !keep(it)) continue
      nodes.push(node(it, false))
      const t = it.tech
      const isConcept = t.cat === 'concept' || t.cat === 'movement'
      const froms = [...new Set(t.from.map((f) => f.split(':')[0]))]
      for (const f of froms) if (posIds.has(f)) links.push({ source: f, target: it.id, kind: isConcept ? 'concept' : 'from' })
      if (t.to) {
        const to = t.to.split(':')[0]
        if (posIds.has(to) && !froms.includes(to)) links.push({ source: it.id, target: to, kind: 'to' })
      }
    }
    return { nodes, links }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.items, p.visibleCats, p.onlyKnown, p.onlyKnown ? p.state : null])

  // neighbourhood of the selected / hovered node
  const focusId = hover ?? p.selected
  const neighbours = useMemo(() => {
    if (!focusId) return null
    const s = new Set<string>([focusId])
    for (const l of data.links) {
      const a = typeof l.source === 'string' ? l.source : l.source.id
      const b = typeof l.target === 'string' ? l.target : l.target.id
      if (a === focusId) s.add(b)
      if (b === focusId) s.add(a)
    }
    return s
  }, [focusId, data.links])

  useEffect(() => {
    const g = fg.current
    if (!g) return
    g.d3Force('charge')?.strength((n: GNode) => (n.isPos ? -260 : -38))
    const lf = g.d3Force('link') as unknown as { distance: (f: (l: GLink) => number) => void; strength: (f: (l: GLink) => number) => void } | undefined
    lf?.distance((l: GLink) => (l.kind === 'concept' ? 26 : 38))
    lf?.strength((l: GLink) => (l.kind === 'concept' ? 0.5 : 0.25))
    g.d3ReheatSimulation()
  }, [data])

  useEffect(() => {
    const r = p.routeIds
    if (!r) return
    const t = setTimeout(() => fg.current?.zoomToFit(700, 90, (n) => r.has((n as GNode).id)), 120)
    return () => clearTimeout(t)
  }, [p.routeIds])

  useEffect(() => {
    const t = setTimeout(() => fg.current?.zoomToFit(700, 60), 1600)
    return () => clearTimeout(t)
  }, [p.onlyKnown, p.visibleCats])

  useImperativeHandle(ref, () => ({
    focus(id, doFlash = true) {
      const n = data.nodes.find((x) => x.id === id)
      if (doFlash) flash.current = { id, t: performance.now() }
      if (n && n.x != null && n.y != null && fg.current) {
        fg.current.centerAt(n.x, n.y, 900)
        fg.current.zoom(n.isPos ? 2.2 : 3.2, 900)
      }
    },
    fit() {
      fg.current?.zoomToFit(700, 40)
    },
  }))

  const route = p.routeIds

  return (
    <ForceGraph2D
      ref={fg}
      width={p.width}
      height={p.height}
      graphData={data}
      backgroundColor="rgba(0,0,0,0)"
      cooldownTicks={180}
      autoPauseRedraw={false}
      onEngineStop={() => undefined}
      nodeId="id"
      nodeRelSize={4}
      enableNodeDrag
      onNodeHover={(n) => setHover(n ? (n as GNode).id : null)}
      onNodeClick={(n) => p.onSelect((n as GNode).id)}
      onBackgroundClick={() => p.onSelect(null)}
      linkColor={(l) => {
        const link = l as GLink
        const a = typeof link.source === 'string' ? link.source : link.source.id
        const b = typeof link.target === 'string' ? link.target : link.target.id
        if (route) return route.has(a) && route.has(b) ? '#F2B33D' : 'rgba(255,255,255,0.03)'
        if (neighbours) return neighbours.has(a) && neighbours.has(b) && (a === focusId || b === focusId) ? 'rgba(245,240,230,0.55)' : 'rgba(255,255,255,0.03)'
        const known = lvl(p.state, a) > 0 && lvl(p.state, b) > 0
        if (known) return 'rgba(242,179,61,0.35)'
        return link.kind === 'concept' ? 'rgba(255,138,216,0.08)' : 'rgba(170,180,200,0.10)'
      }}
      linkWidth={(l) => {
        const link = l as GLink
        const a = typeof link.source === 'string' ? link.source : link.source.id
        const b = typeof link.target === 'string' ? link.target : link.target.id
        if (route && route.has(a) && route.has(b)) return 2.5
        return 0.6
      }}
      linkDirectionalArrowLength={(l) => ((l as GLink).kind === 'concept' ? 0 : 2.2)}
      linkDirectionalArrowRelPos={0.9}
      linkLineDash={(l) => ((l as GLink).kind === 'concept' ? [2, 2] : null)}
      nodeCanvasObject={(node, ctx, scale) => {
        const n = node as GNode & { x: number; y: number }
        const it = n.item
        const level = lvl(p.state, n.id)
        const color = CAT_META[catOf(it)].color
        const r = n.isPos ? 8 + level * 1.2 : 3 + level * 0.7
        let alpha = level > 0 ? 1 : n.isPos ? 0.6 : 0.42
        if (route) alpha = route.has(n.id) ? 1 : 0.08
        else if (neighbours) alpha = neighbours.has(n.id) ? Math.max(alpha, 0.95) : 0.08

        // glow for things you know
        if (level > 0 && alpha > 0.5) {
          ctx.shadowColor = color
          ctx.shadowBlur = 6 + level * 5
        }
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        if (n.isPos) {
          ctx.fillStyle = level > 0 ? hexA('#F2B33D', alpha) : hexA('#1A1E26', 0.95)
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.lineWidth = 1.6
          ctx.strokeStyle = level > 0 ? hexA('#F5F0E6', alpha) : hexA('#F5F0E6', alpha * 0.8)
          ctx.stroke()
        } else {
          ctx.fillStyle = level > 0 ? hexA(color, alpha) : 'rgba(0,0,0,0)'
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.lineWidth = 1
          ctx.strokeStyle = hexA(color, Math.max(alpha, level > 0 ? 1 : 0.0) || alpha)
          ctx.stroke()
          // level pips
          if (level >= 2) {
            ctx.beginPath()
            ctx.arc(n.x, n.y, r + 1.8, 0, Math.PI * 2 * (level / 3))
            ctx.strokeStyle = hexA('#F5F0E6', alpha * 0.9)
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
        if (p.selected === n.id) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2)
          ctx.strokeStyle = '#F5F0E6'
          ctx.lineWidth = 1.2
          ctx.stroke()
        }
        // flash pulse after logging
        const f = flash.current
        if (f && f.id === n.id) {
          const dt = (performance.now() - f.t) / 1000
          if (dt < 3.2) {
            for (let k = 0; k < 3; k++) {
              const ph = (dt * 1.1 + k / 3) % 1
              ctx.beginPath()
              ctx.arc(n.x, n.y, r + 4 + ph * 30, 0, Math.PI * 2)
              ctx.strokeStyle = hexA('#F2B33D', (1 - ph) * 0.9)
              ctx.lineWidth = 2 / Math.sqrt(scale)
              ctx.stroke()
            }
          } else flash.current = null
        }
        // labels
        const showLabel =
          n.isPos ||
          p.selected === n.id ||
          hover === n.id ||
          (route && route.has(n.id)) ||
          (neighbours && neighbours.has(n.id)) ||
          scale > 2.4 ||
          (level > 0 && scale > 1.3)
        if (showLabel && alpha > 0.2) {
          const fs = (n.isPos ? 11 : 9) / Math.min(Math.max(scale, 0.6), 2.2)
          ctx.font = `${n.isPos ? 700 : 500} ${fs}px "Archivo", system-ui, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          const label = n.isPos ? it.name.toUpperCase() : it.name
          const y = n.y + r + 2.5
          ctx.lineWidth = 3 / scale
          ctx.strokeStyle = 'rgba(11,12,15,0.9)'
          ctx.strokeText(label, n.x, y)
          ctx.fillStyle = n.isPos ? hexA('#F5F0E6', Math.max(alpha, 0.75)) : hexA(level > 0 ? '#F5F0E6' : '#AEB6C6', alpha)
          ctx.fillText(label, n.x, y)
        }
      }}
      nodePointerAreaPaint={(node, color, ctx) => {
        const n = node as GNode & { x: number; y: number }
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.isPos ? 11 : 6, 0, Math.PI * 2)
        ctx.fill()
      }}
    />
  )
})

export default Graph
