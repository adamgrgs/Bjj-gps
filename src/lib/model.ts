import { POSITIONS, POSITION_BY_ID, type Position, type Role } from '../data/positions'
import { TECHNIQUES, type Category, type Technique } from '../data/techniques'

export type Level = 0 | 1 | 2 | 3 // 0 unknown, 1 learned, 2 drilled, 3 hit it live
export const LEVEL_LABEL: Record<Level, string> = { 0: 'Not yet', 1: 'Learned', 2: 'Drilled', 3: 'Hit it live' }

export interface JournalEntry {
  id: string
  itemId: string
  level: Level
  note: string
  date: string // ISO
}

export interface State {
  v: 1
  status: Record<string, { level: Level; updated: string }>
  journal: JournalEntry[]
  custom: Technique[]
}

export type Item =
  | { kind: 'position'; id: string; name: string; level: 1 | 2 | 3 | 4; desc: string; aliases: string[]; pos: Position }
  | { kind: 'technique'; id: string; name: string; level: 1 | 2 | 3 | 4; desc: string; aliases: string[]; tech: Technique }

export const CAT_META: Record<Category | 'position', { label: string; color: string; plural: string }> = {
  position: { label: 'Position', plural: 'Positions', color: '#F5F0E6' },
  submission: { label: 'Submission', plural: 'Submissions', color: '#FF5A4E' },
  sweep: { label: 'Sweep', plural: 'Sweeps', color: '#F2B33D' },
  pass: { label: 'Pass', plural: 'Passes', color: '#4DA3FF' },
  escape: { label: 'Escape', plural: 'Escapes & defences', color: '#1FD1A5' },
  takedown: { label: 'Takedown', plural: 'Takedowns', color: '#B78CFF' },
  transition: { label: 'Transition', plural: 'Transitions & back takes', color: '#9AA4B8' },
  retention: { label: 'Guard retention', plural: 'Guard retention', color: '#5EEAD4' },
  concept: { label: 'Concept / hack', plural: 'Concepts, tricks & hacks', color: '#FF8AD8' },
  movement: { label: 'Movement', plural: 'Movements & drills', color: '#B5E655' },
}

export const TIER: Record<1 | 2 | 3 | 4, { label: string; belt: string; color: string }> = {
  1: { label: 'Fundamentals', belt: 'White belt', color: '#F5F0E6' },
  2: { label: 'Intermediate', belt: 'Blue belt', color: '#3B82F6' },
  3: { label: 'Advanced', belt: 'Purple belt', color: '#9B5DE5' },
  4: { label: 'Expert', belt: 'Brown / Black', color: '#8B5A2B' },
}

const KEY = 'bjj-gps:v1'
export const emptyState = (): State => ({ v: 1, status: {}, journal: [], custom: [] })

export function loadState(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState()
    const s = JSON.parse(raw)
    if (s && s.v === 1) return { ...emptyState(), ...s }
  } catch {
    /* ignore */
  }
  return emptyState()
}
export function saveState(s: State) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function allTechniques(s: State): Technique[] {
  return [...TECHNIQUES, ...s.custom]
}

export function allItems(s: State): Item[] {
  const items: Item[] = POSITIONS.map((pos) => ({ kind: 'position', id: pos.id, name: pos.name, level: pos.level, desc: pos.desc, aliases: pos.aliases ?? [], pos }))
  for (const t of allTechniques(s)) items.push({ kind: 'technique', id: t.id, name: t.name, level: t.level, desc: t.desc, aliases: t.aliases ?? [], tech: t })
  return items
}

export const catOf = (it: Item): Category | 'position' => (it.kind === 'position' ? 'position' : it.tech.cat)
export const lvl = (s: State, id: string): Level => s.status[id]?.level ?? 0

// ───────── search ─────────
const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9/ ]+/g, ' ').replace(/\s+/g, ' ').trim()

export function search(items: Item[], q: string, limit = 8): Item[] {
  const nq = norm(q)
  if (!nq) return []
  const words = nq.split(' ')
  const scored: { it: Item; score: number }[] = []
  for (const it of items) {
    const names = [it.name, ...it.aliases].map(norm)
    let best = 0
    for (const n of names) {
      let sc = 0
      if (n === nq) sc = 100
      else if (n.startsWith(nq)) sc = 80
      else if (n.includes(nq)) sc = 60
      else if (words.every((w) => n.includes(w))) sc = 45
      else {
        const hits = words.filter((w) => w.length > 2 && n.includes(w)).length
        if (hits) sc = 10 + hits * 8
      }
      best = Math.max(best, sc)
    }
    if (best > 0) scored.push({ it, score: best - (it.kind === 'technique' && it.tech.custom ? 0 : 0) })
  }
  return scored.sort((a, b) => b.score - a.score || a.it.name.length - b.it.name.length).slice(0, limit).map((x) => x.it)
}

// ───────── progress ─────────
export interface Progress {
  pct: number
  known: number
  total: number
}
const prog = (s: State, ids: string[]): Progress => {
  const total = ids.length
  const sum = ids.reduce((a, id) => a + lvl(s, id) / 3, 0)
  return { pct: total ? (sum / total) * 100 : 0, known: ids.filter((id) => lvl(s, id) > 0).length, total }
}

export function progressReport(s: State) {
  const items = allItems(s)
  const overall = prog(s, items.map((i) => i.id))
  const byCat = (Object.keys(CAT_META) as (Category | 'position')[]).map((c) => ({ cat: c, ...prog(s, items.filter((i) => catOf(i) === c).map((i) => i.id)) }))
  const byTier = ([1, 2, 3, 4] as const).map((t) => ({ tier: t, ...prog(s, items.filter((i) => i.level === t).map((i) => i.id)) }))
  // "belt estimate": first tier under 60% knowledge breadth
  let belt: 1 | 2 | 3 | 4 = 1
  for (const t of byTier) {
    if (t.known / Math.max(t.total, 1) >= 0.6) belt = Math.min(4, t.tier + 1) as 1 | 2 | 3 | 4
    else break
  }
  return { overall, byCat, byTier, beltFocus: belt }
}

// ───────── GPS routing ─────────
export const stateKey = (posId: string, role: Role) => `${posId}:${role}`
export function stateLabel(key: string) {
  if (key === 'FINISH') return 'Submission'
  const [pid, role] = key.split(':') as [string, Role]
  const pos = POSITION_BY_ID[pid]
  if (!pos) return key
  return pos.roles[role] ?? pos.name
}
export function allStates(): { key: string; label: string; pos: Position }[] {
  const out: { key: string; label: string; pos: Position }[] = []
  for (const pos of POSITIONS) for (const r of ['t', 'b', 'n'] as Role[]) if (pos.roles[r]) out.push({ key: stateKey(pos.id, r), label: `${pos.name} — ${pos.roles[r]}`, pos })
  return out
}

export interface Route {
  steps: { from: string; tech: Technique; to: string }[]
  cost: number
}

/** Dijkstra over (position, role) states. Known techniques are cheaper so the route favours your game. */
export function findRoute(s: State, from: string, goal: string, onlyKnown: boolean): Route | null {
  const techs = allTechniques(s).filter((t) => t.cat !== 'concept' && t.cat !== 'movement')
  const out = new Map<string, Technique[]>()
  for (const t of techs) for (const f of t.from) {
    if (!out.has(f)) out.set(f, [])
    out.get(f)!.push(t)
  }
  const dist = new Map<string, number>([[from, 0]])
  const prev = new Map<string, { from: string; tech: Technique }>()
  const done = new Set<string>()
  const isGoal = (k: string) => (goal === 'FINISH' ? k === 'FINISH' : goal.startsWith('SUB:') ? false : k === goal)
  while (true) {
    let cur: string | null = null
    let best = Infinity
    for (const [k, d] of dist) if (!done.has(k) && d < best) { best = d; cur = k }
    if (cur === null) return null
    if (isGoal(cur) || (goal.startsWith('SUB:') && cur === goal)) break
    done.add(cur)
    if (cur === 'FINISH' || cur.startsWith('SUB:')) continue
    for (const t of out.get(cur) ?? []) {
      const known = lvl(s, t.id) > 0
      if (onlyKnown && !known) continue
      if (t.to === cur) continue
      const nxt = t.to ?? (goal.startsWith('SUB:') ? `SUB:${t.id}` : 'FINISH')
      const w = (known ? 1 : 3) + (t.level - 1) * 0.25
      const nd = best + w
      if (nd < (dist.get(nxt) ?? Infinity)) { dist.set(nxt, nd); prev.set(nxt, { from: cur, tech: t }) }
    }
  }
  const steps: Route['steps'] = []
  let k = goal
  while (k !== from) {
    const p = prev.get(k)
    if (!p) return null
    steps.unshift({ from: p.from, tech: p.tech, to: k })
    k = p.from
  }
  return { steps, cost: dist.get(goal) ?? 0 }
}

export const uid = () => Math.random().toString(36).slice(2, 10)
export const slug = (x: string) => norm(x).replace(/[ /]+/g, '-')
export { POSITIONS, POSITION_BY_ID, TECHNIQUES }
export type { Technique, Category, Position, Role }
