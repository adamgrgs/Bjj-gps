import { useEffect, useMemo, useRef, useState } from 'react'
import Graph, { type GraphHandle } from './components/Graph'
import {
  CAT_META, LEVEL_LABEL, POSITION_BY_ID, TIER, allItems, allStates, catOf, emptyState, findRoute, loadState, lvl,
  progressReport, saveState, search, slug, stateLabel, uid,
  type Category, type Item, type Level, type State, type Technique,
} from './lib/model'

type Tab = 'log' | 'progress' | 'gps' | 'journal'
const CATS = Object.keys(CAT_META) as (Category | 'position')[]
const today = () => new Date().toISOString().slice(0, 10)
const fmtDate = (iso: string) => new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

function useSize(ref: React.RefObject<HTMLElement | null>) {
  const [s, setS] = useState({ w: 800, h: 600 })
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setS({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return s
}

function Bar({ pct, color = '#F2B33D', h = 6 }: { pct: number; color?: string; h?: number }) {
  return (
    <div className="bar" style={{ height: h }}>
      <div className="bar-fill" style={{ width: `${Math.max(pct, pct > 0 ? 1.5 : 0)}%`, background: color }} />
    </div>
  )
}

function Chip({ item, state, onClick }: { item: Item; state: State; onClick?: () => void }) {
  const c = CAT_META[catOf(item)]
  const l = lvl(state, item.id)
  return (
    <button className={`chip ${l ? 'on' : ''}`} style={{ '--c': c.color } as React.CSSProperties} onClick={onClick} title={c.label}>
      <span className="dot" />
      {item.name}
      {l > 0 && <span className="pip">{'●'.repeat(l)}</span>}
    </button>
  )
}

export default function App() {
  const [state, setState] = useState<State>(() => loadState())
  const [tab, setTab] = useState<Tab>('log')
  const [selected, setSelected] = useState<string | null>(null)
  const [visibleCats, setVisibleCats] = useState<Set<string>>(() => new Set(CATS))
  const [onlyKnown, setOnlyKnown] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [routeIds, setRouteIds] = useState<Set<string> | null>(null)
  const graphRef = useRef<GraphHandle>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const size = useSize(stageRef)

  useEffect(() => saveState(state), [state])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3800)
    return () => clearTimeout(t)
  }, [toast])

  const items = useMemo(() => allItems(state), [state.custom]) // eslint-disable-line react-hooks/exhaustive-deps
  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])) as Record<string, Item>, [items])
  const report = useMemo(() => progressReport(state), [state])

  function setLevel(id: string, level: Level, note = '', date = today(), log = true) {
    setState((s) => {
      const status = { ...s.status }
      if (level === 0) delete status[id]
      else status[id] = { level, updated: new Date().toISOString() }
      const journal = log && level > 0 ? [{ id: uid(), itemId: id, level, note, date }, ...s.journal] : s.journal
      return { ...s, status, journal }
    })
  }

  function logItem(id: string, level: Level, note: string, date: string) {
    const it = byId[id]
    const before = lvl(state, id)
    setLevel(id, level, note, date)
    setSelected(id)
    setTimeout(() => graphRef.current?.focus(id), 60)
    const verb = before === 0 ? 'lit up on your map' : `→ ${LEVEL_LABEL[level]}`
    setToast(`${it?.name ?? id} ${verb}`)
  }

  function addCustom(t: Technique) {
    setState((s) => ({ ...s, custom: [...s.custom, t] }))
  }

  const sel = selected ? byId[selected] : null

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <div className="logo">
            <span className="logo-mark">◉</span> BJJ<span>GPS</span>
          </div>
          <div className="tag">Your map of the gentle art</div>
        </div>
        <div className="overall">
          <div className="overall-row">
            <span className="big">{report.overall.pct.toFixed(1)}%</span>
            <span className="muted">
              of the map · <b>{report.overall.known}</b> / {report.overall.total} nodes lit · focus: <b style={{ color: TIER[report.beltFocus].color === '#8B5A2B' ? '#C08850' : TIER[report.beltFocus].color }}>{TIER[report.beltFocus].label}</b>
            </span>
          </div>
          <Bar pct={report.overall.pct} h={8} />
        </div>
        <Menu state={state} setState={setState} setToast={setToast} />
      </header>

      <div className="main">
        <aside className="side">
          <nav className="tabs">
            {(['log', 'progress', 'gps', 'journal'] as Tab[]).map((t) => (
              <button key={t} className={tab === t ? 'active' : ''} onClick={() => { setTab(t); if (t !== 'gps') setRouteIds(null) }}>
                {{ log: 'Log', progress: 'Progress', gps: 'GPS', journal: 'Journal' }[t]}
              </button>
            ))}
          </nav>
          <div className="side-body">
            {tab === 'log' && <LogPanel state={state} items={items} byId={byId} onLog={logItem} onAddCustom={addCustom} onOpen={(id) => { setSelected(id); graphRef.current?.focus(id, false) }} />}
            {tab === 'progress' && <ProgressPanel report={report} state={state} />}
            {tab === 'gps' && <GpsPanel state={state} onRoute={setRouteIds} onOpen={(id) => { setSelected(id); graphRef.current?.focus(id, false) }} />}
            {tab === 'journal' && <JournalPanel state={state} byId={byId} setState={setState} onOpen={(id) => { setSelected(id); graphRef.current?.focus(id, false) }} />}
          </div>
        </aside>

        <section className="stage" ref={stageRef}>
          <div className="filters">
            {CATS.map((c) => (
              <button
                key={c}
                className={`fchip ${visibleCats.has(c) ? 'on' : ''}`}
                style={{ '--c': CAT_META[c].color } as React.CSSProperties}
                disabled={c === 'position'}
                onClick={() => setVisibleCats((v) => { const n = new Set(v); if (n.has(c)) n.delete(c); else n.add(c); return n })}
              >
                <span className="dot" />
                {CAT_META[c].plural}
              </button>
            ))}
            <button className={`fchip toggle ${onlyKnown ? 'on' : ''}`} onClick={() => setOnlyKnown((x) => !x)}>
              {onlyKnown ? '✓ ' : ''}Only what I know
            </button>
            <button className="fchip toggle" onClick={() => graphRef.current?.fit()}>⤢ Fit</button>
          </div>
          <Graph
            ref={graphRef}
            state={state}
            items={items}
            visibleCats={visibleCats}
            onlyKnown={onlyKnown}
            selected={selected}
            routeIds={routeIds}
            onSelect={setSelected}
            width={size.w}
            height={size.h}
          />
          <div className="legend">
            <span><i className="lg-pos" /> Position</span>
            <span><i className="lg-off" /> Not yet</span>
            <span><i className="lg-on" /> Learned</span>
            <span><i className="lg-on ring" /> Drilled / Hit live</span>
          </div>
          {sel && (
            <Detail
              item={sel}
              state={state}
              items={items}
              byId={byId}
              onClose={() => setSelected(null)}
              onOpen={(id) => { setSelected(id); graphRef.current?.focus(id, false) }}
              onLevel={(l) => { setLevel(sel.id, l, '', today(), l > lvl(state, sel.id)); if (l > 0) graphRef.current?.focus(sel.id) }}
              onDelete={() => {
                setState((s) => ({ ...s, custom: s.custom.filter((t) => t.id !== sel.id), journal: s.journal.filter((j) => j.itemId !== sel.id) }))
                setSelected(null)
              }}
            />
          )}
          {toast && <div className="toast">✦ {toast}</div>}
        </section>
      </div>
    </div>
  )
}

// ───────────────────────── Log ─────────────────────────
function LogPanel({ state, items, byId, onLog, onAddCustom, onOpen }: {
  state: State; items: Item[]; byId: Record<string, Item>
  onLog: (id: string, l: Level, note: string, date: string) => void
  onAddCustom: (t: Technique) => void
  onOpen: (id: string) => void
}) {
  const [q, setQ] = useState('')
  const [pick, setPick] = useState<Item | null>(null)
  const [level, setLevel] = useState<Level>(1)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())
  const [hi, setHi] = useState(0)
  const [creating, setCreating] = useState(false)
  const results = useMemo(() => (pick ? [] : search(items, q)), [items, q, pick])

  function choose(it: Item) {
    setPick(it)
    setQ(it.name)
    setLevel(Math.min(3, Math.max(1, lvl(state, it.id) + 1)) as Level)
    setCreating(false)
  }
  function reset() {
    setPick(null); setQ(''); setNote(''); setLevel(1); setCreating(false); setDate(today())
  }
  function submit() {
    if (!pick) return
    onLog(pick.id, level, note.trim(), date)
    reset()
  }

  const frontier = useMemo(() => {
    // unknown techniques starting from positions where you already know something — your natural next steps
    const knownPos = new Set<string>()
    for (const it of items) if (lvl(state, it.id) > 0) {
      if (it.kind === 'position') knownPos.add(it.id)
      else { it.tech.from.forEach((f) => knownPos.add(f.split(':')[0])); if (it.tech.to) knownPos.add(it.tech.to.split(':')[0]) }
    }
    const pool = items.filter((it) => it.kind === 'technique' && lvl(state, it.id) === 0 && it.tech.cat !== 'concept' && it.tech.cat !== 'movement')
    const scored = pool.map((it) => {
      const t = (it as Extract<Item, { kind: 'technique' }>).tech
      const near = t.from.some((f) => knownPos.has(f.split(':')[0]))
      return { it, score: (near ? 10 : 0) - it.level * 3 + (knownPos.size === 0 && it.level === 1 ? 5 : 0) }
    })
    return scored.sort((a, b) => b.score - a.score || a.it.name.localeCompare(b.it.name)).slice(0, 6).map((x) => x.it)
  }, [items, state])

  return (
    <div className="panel">
      <h2>What did you learn today?</h2>
      <div className="search">
        <input
          value={q}
          autoFocus
          placeholder="e.g. scissor sweep, kimura, knee cut…"
          onChange={(e) => { setQ(e.target.value); setPick(null); setHi(0); setCreating(false) }}
          onKeyDown={(e) => {
            if (pick && e.key === 'Enter') { submit(); return }
            if (e.key === 'ArrowDown') { setHi((h) => Math.min(h + 1, results.length)); e.preventDefault() }
            if (e.key === 'ArrowUp') { setHi((h) => Math.max(h - 1, 0)); e.preventDefault() }
            if (e.key === 'Enter') {
              if (results[hi]) choose(results[hi])
              else if (q.trim()) setCreating(true)
            }
            if (e.key === 'Escape') reset()
          }}
        />
        {!pick && q.trim() && !creating && (
          <div className="results">
            {results.map((it, i) => {
              const c = CAT_META[catOf(it)]
              const l = lvl(state, it.id)
              return (
                <button key={it.id} className={`res ${i === hi ? 'hi' : ''}`} onMouseMove={() => setHi(i)} onClick={() => choose(it)}>
                  <span className="dot" style={{ background: c.color }} />
                  <span className="res-name">{it.name}</span>
                  <span className="res-meta">{c.label}{l ? ` · ${LEVEL_LABEL[l]}` : ''}</span>
                </button>
              )
            })}
            <button className={`res add ${hi === results.length ? 'hi' : ''}`} onClick={() => setCreating(true)}>
              ＋ Add “{q.trim()}” to the map
            </button>
          </div>
        )}
      </div>

      {creating && <CustomForm name={q.trim()} existing={byId} onCancel={() => setCreating(false)} onCreate={(t) => { onAddCustom(t); const it: Item = { kind: 'technique', id: t.id, name: t.name, level: t.level, desc: t.desc, aliases: [], tech: t }; choose(it) }} />}

      {pick && (
        <div className="pick" style={{ '--c': CAT_META[catOf(pick)].color } as React.CSSProperties}>
          <div className="pick-head">
            <span className="dot" />
            <div>
              <div className="pick-name">{pick.name}</div>
              <div className="muted small">{CAT_META[catOf(pick)].label} · {TIER[pick.level].label}{lvl(state, pick.id) ? ` · now: ${LEVEL_LABEL[lvl(state, pick.id)]}` : ''}</div>
            </div>
          </div>
          <div className="levels">
            {([1, 2, 3] as Level[]).map((l) => (
              <button key={l} className={level === l ? 'on' : ''} onClick={() => setLevel(l)}>
                <span>{'●'.repeat(l)}{'○'.repeat(3 - l)}</span>
                {LEVEL_LABEL[l]}
              </button>
            ))}
          </div>
          <textarea placeholder="Notes: key details, who taught it, what clicked…" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          <div className="row">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button className="ghost" onClick={reset}>Cancel</button>
            <button className="primary" onClick={submit}>Light it up</button>
          </div>
        </div>
      )}

      <h3>Next on your map</h3>
      <p className="muted small">Fundamentals that branch off positions you already know.</p>
      <div className="chips">
        {frontier.map((it) => <Chip key={it.id} item={it} state={state} onClick={() => { choose(it); onOpen(it.id) }} />)}
      </div>

      <h3>Recent</h3>
      {state.journal.length === 0 && <p className="muted small">Nothing logged yet. Type your first technique above — it will light up on the map.</p>}
      <ul className="journal">
        {state.journal.slice(0, 6).map((j) => {
          const it = byId[j.itemId]
          if (!it) return null
          return (
            <li key={j.id} onClick={() => onOpen(it.id)}>
              <span className="dot" style={{ background: CAT_META[catOf(it)].color }} />
              <div>
                <div className="j-name">{it.name} <span className="muted">· {LEVEL_LABEL[j.level]}</span></div>
                {j.note && <div className="j-note">{j.note}</div>}
              </div>
              <span className="j-date">{fmtDate(j.date)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CustomForm({ name, existing, onCancel, onCreate }: { name: string; existing: Record<string, Item>; onCancel: () => void; onCreate: (t: Technique) => void }) {
  const [cat, setCat] = useState<Category>('submission')
  const [from, setFrom] = useState('closed-guard:b')
  const [to, setTo] = useState('')
  const [desc, setDesc] = useState('')
  const states = useMemo(() => allStates(), [])
  const needsTo = !['submission', 'concept', 'movement'].includes(cat)
  return (
    <div className="pick custom">
      <div className="pick-name">New: {name}</div>
      <label>Type
        <select value={cat} onChange={(e) => setCat(e.target.value as Category)}>
          {(Object.keys(CAT_META) as (Category | 'position')[]).filter((c) => c !== 'position').map((c) => <option key={c} value={c}>{CAT_META[c].label}</option>)}
        </select>
      </label>
      <label>Starts from
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          {states.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </label>
      {needsTo && (
        <label>Ends in
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">—</option>
            {states.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
      )}
      <textarea placeholder="Short description (optional)" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
      <div className="row">
        <button className="ghost" onClick={onCancel}>Cancel</button>
        <button className="primary" disabled={!name} onClick={() => {
          let id = 'c-' + slug(name)
          while (existing[id]) id += '-' + uid().slice(0, 3)
          onCreate({ id, name, cat, from: [from], to: needsTo && to ? to : null, level: 2, desc: desc || 'Added by you.', aliases: [], custom: true, sub: cat === 'submission' ? 'other' : undefined })
        }}>Add to map</button>
      </div>
    </div>
  )
}

// ───────────────────────── Progress ─────────────────────────
function ProgressPanel({ report, state }: { report: ReturnType<typeof progressReport>; state: State }) {
  const streak = useMemo(() => {
    const days = new Set(state.journal.map((j) => j.date.slice(0, 10)))
    let n = 0
    const d = new Date()
    for (let i = 0; i < 400; i++) {
      const k = d.toISOString().slice(0, 10)
      if (days.has(k)) n++
      else if (i > 0) break
      d.setDate(d.getDate() - 1)
    }
    return n
  }, [state.journal])
  const week = state.journal.filter((j) => Date.now() - new Date(j.date).getTime() < 7 * 864e5).length
  return (
    <div className="panel">
      <h2>The grand scheme</h2>
      <div className="stats">
        <div><b>{report.overall.known}</b><span>nodes lit</span></div>
        <div><b>{week}</b><span>logs this week</span></div>
        <div><b>{streak}</b><span>day streak</span></div>
      </div>
      <h3>By belt tier</h3>
      {report.byTier.map((t) => (
        <div className="prow" key={t.tier}>
          <div className="prow-head">
            <span><i className="belt" style={{ background: TIER[t.tier].color }} />{TIER[t.tier].label} <span className="muted">· {TIER[t.tier].belt}</span></span>
            <span className="muted">{t.known}/{t.total} · {t.pct.toFixed(0)}%</span>
          </div>
          <Bar pct={t.pct} color={t.tier === 1 ? '#F5F0E6' : TIER[t.tier].color} />
        </div>
      ))}
      <p className="muted small">Score weights each node: learned ⅓, drilled ⅔, hit it live = full. Tier focus moves up once you have touched 60% of a tier.</p>
      <h3>By category</h3>
      {report.byCat.map((c) => (
        <div className="prow" key={c.cat}>
          <div className="prow-head">
            <span><i className="belt" style={{ background: CAT_META[c.cat].color }} />{CAT_META[c.cat].plural}</span>
            <span className="muted">{c.known}/{c.total} · {c.pct.toFixed(0)}%</span>
          </div>
          <Bar pct={c.pct} color={CAT_META[c.cat].color} />
        </div>
      ))}
    </div>
  )
}

// ───────────────────────── GPS ─────────────────────────
function GpsPanel({ state, onRoute, onOpen }: { state: State; onRoute: (s: Set<string> | null) => void; onOpen: (id: string) => void }) {
  const states = useMemo(() => allStates(), [])
  const subs = useMemo(() => allItems(state).filter((i) => i.kind === 'technique' && i.tech.cat === 'submission'), [state])
  const [from, setFrom] = useState('mount:b')
  const [goal, setGoal] = useState('FINISH')
  const [onlyMine, setOnlyMine] = useState(false)
  const route = useMemo(() => findRoute(state, from, goal, onlyMine), [state, from, goal, onlyMine])
  useEffect(() => {
    if (!route) { onRoute(null); return }
    const ids = new Set<string>()
    for (const s of route.steps) { ids.add(s.tech.id); ids.add(s.from.split(':')[0]); if (!s.to.startsWith('SUB:') && s.to !== 'FINISH') ids.add(s.to.split(':')[0]) }
    ids.add(from.split(':')[0])
    onRoute(ids)
  }, [route, from, onRoute])
  useEffect(() => () => onRoute(null), [onRoute])
  const known = route ? route.steps.filter((s) => lvl(state, s.tech.id) > 0).length : 0
  return (
    <div className="panel">
      <h2>Route planner</h2>
      <p className="muted small">Where are you, and where do you want to go? GPS finds the shortest chain of techniques — favouring the ones you already know.</p>
      <label>I’m in
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          {states.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </label>
      <label>Take me to
        <select value={goal} onChange={(e) => setGoal(e.target.value)}>
          <option value="FINISH">Any submission</option>
          <optgroup label="Positions">
            {states.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </optgroup>
          <optgroup label="A specific submission">
            {subs.map((s) => <option key={s.id} value={`SUB:${s.id}`}>{s.name}</option>)}
          </optgroup>
        </select>
      </label>
      <label className="check"><input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} /> Only use techniques I know</label>
      {!route && <div className="empty">No route {onlyMine ? 'with what you know yet — untick the box to see what to learn.' : 'found.'}</div>}
      {route && (
        <>
          <div className="route-sum">{route.steps.length} step{route.steps.length === 1 ? '' : 's'} · {known}/{route.steps.length} already in your game</div>
          <ol className="route">
            <li className="node"><span className="rp" />{stateLabel(from)}</li>
            {route.steps.map((s, i) => {
              const l = lvl(state, s.tech.id)
              return (
                <li key={i}>
                  <button className={`step ${l ? 'known' : ''}`} style={{ '--c': CAT_META[s.tech.cat].color } as React.CSSProperties} onClick={() => onOpen(s.tech.id)}>
                    <span className="dot" /> {s.tech.name} <span className="muted small">{CAT_META[s.tech.cat].label}{l ? '' : ' · to learn'}</span>
                  </button>
                  <div className="node"><span className="rp" />{s.to.startsWith('SUB:') || s.to === 'FINISH' ? 'Tap 🏁' : stateLabel(s.to)}</div>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}

// ───────────────────────── Journal ─────────────────────────
function JournalPanel({ state, byId, setState, onOpen }: { state: State; byId: Record<string, Item>; setState: React.Dispatch<React.SetStateAction<State>>; onOpen: (id: string) => void }) {
  const groups = useMemo(() => {
    const m = new Map<string, typeof state.journal>()
    for (const j of [...state.journal].sort((a, b) => b.date.localeCompare(a.date))) {
      const k = j.date.slice(0, 10)
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(j)
    }
    return [...m.entries()]
  }, [state.journal])
  return (
    <div className="panel">
      <h2>Training journal</h2>
      {groups.length === 0 && <p className="muted small">Every log lands here with its date and notes.</p>}
      {groups.map(([d, list]) => (
        <div key={d}>
          <h3>{fmtDate(d)}</h3>
          <ul className="journal">
            {list.map((j) => {
              const it = byId[j.itemId]
              if (!it) return null
              return (
                <li key={j.id}>
                  <span className="dot" style={{ background: CAT_META[catOf(it)].color }} />
                  <div onClick={() => onOpen(it.id)} style={{ cursor: 'pointer', flex: 1 }}>
                    <div className="j-name">{it.name} <span className="muted">· {LEVEL_LABEL[j.level]}</span></div>
                    {j.note && <div className="j-note">{j.note}</div>}
                  </div>
                  <button className="x" title="Delete entry" onClick={() => setState((s) => ({ ...s, journal: s.journal.filter((x) => x.id !== j.id) }))}>×</button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

// ───────────────────────── Detail drawer ─────────────────────────
function Detail({ item, state, items, onClose, onOpen, onLevel, onDelete }: {
  item: Item; state: State; items: Item[]; byId: Record<string, Item>
  onClose: () => void; onOpen: (id: string) => void; onLevel: (l: Level) => void; onDelete: () => void
}) {
  const c = CAT_META[catOf(item)]
  const l = lvl(state, item.id)
  const notes = state.journal.filter((j) => j.itemId === item.id && j.note)
  const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent('bjj ' + item.name + ' tutorial')}`

  let body: React.ReactNode
  if (item.kind === 'position') {
    const starts = items.filter((i) => i.kind === 'technique' && i.tech.from.some((f) => f.startsWith(item.id + ':')))
    const arrive = items.filter((i) => i.kind === 'technique' && i.tech.to?.startsWith(item.id + ':') && !i.tech.from.some((f) => f.startsWith(item.id + ':')))
    const groups = (Object.keys(CAT_META) as (Category | 'position')[]).map((cat) => ({ cat, list: starts.filter((s) => catOf(s) === cat) })).filter((g) => g.list.length)
    const knownHere = starts.filter((s) => lvl(state, s.id) > 0).length
    body = (
      <>
        <div className="roles">{Object.values(item.pos.roles).map((r) => <span key={r}>{r}</span>)}</div>
        <div className="prow">
          <div className="prow-head"><span>Mastery of this position</span><span className="muted">{knownHere}/{starts.length}</span></div>
          <Bar pct={starts.length ? (knownHere / starts.length) * 100 : 0} />
        </div>
        {groups.map((g) => (
          <div key={g.cat}>
            <h4>{CAT_META[g.cat].plural} from here</h4>
            <div className="chips">{g.list.map((s) => <Chip key={s.id} item={s} state={state} onClick={() => onOpen(s.id)} />)}</div>
          </div>
        ))}
        {arrive.length > 0 && (
          <>
            <h4>Ways to get here</h4>
            <div className="chips">{arrive.map((s) => <Chip key={s.id} item={s} state={state} onClick={() => onOpen(s.id)} />)}</div>
          </>
        )}
      </>
    )
  } else {
    const t = item.tech
    const isConcept = t.cat === 'concept' || t.cat === 'movement'
    const posChip = (ref: string) => {
      const [pid, role] = ref.split(':')
      const pos = POSITION_BY_ID[pid]
      return pos ? (
        <button key={ref} className="poschip" onClick={() => onOpen(pid)}>
          {pos.name} <span className="muted">· {pos.roles[role as 't']}</span>
        </button>
      ) : null
    }
    body = (
      <>
        <h4>{isConcept ? 'Where it matters' : 'Starts from'}</h4>
        <div className="chips">{t.from.map(posChip)}</div>
        {!isConcept && (
          <>
            <h4>Ends in</h4>
            <div className="chips">{t.to ? posChip(t.to) : <span className="finish">🏁 Submission — they tap</span>}</div>
          </>
        )}
      </>
    )
  }

  return (
    <div className="detail" style={{ '--c': c.color } as React.CSSProperties}>
      <button className="close" onClick={onClose}>×</button>
      <div className="d-cat"><span className="dot" />{c.label}{item.kind === 'technique' && item.tech.sub ? ` · ${item.tech.sub}` : ''} · {TIER[item.level].label}</div>
      <h2>{item.name}</h2>
      {item.aliases.length > 0 && <div className="muted small">aka {item.aliases.slice(0, 4).join(', ')}</div>}
      <p>{item.desc}</p>
      <div className="levels">
        {([0, 1, 2, 3] as Level[]).map((x) => (
          <button key={x} className={l === x ? 'on' : ''} onClick={() => onLevel(x)}>
            <span>{x === 0 ? '—' : '●'.repeat(x) + '○'.repeat(3 - x)}</span>
            {LEVEL_LABEL[x]}
          </button>
        ))}
      </div>
      {body}
      {notes.length > 0 && (
        <>
          <h4>Your notes</h4>
          <ul className="notes">{notes.map((n) => <li key={n.id}><span className="muted small">{fmtDate(n.date)}</span> {n.note}</li>)}</ul>
        </>
      )}
      <div className="d-actions">
        <a href={yt} target="_blank" rel="noreferrer">▶ Watch tutorials</a>
        {item.kind === 'technique' && item.tech.custom && <button className="ghost danger" onClick={onDelete}>Delete custom</button>}
      </div>
    </div>
  )
}

// ───────────────────────── Menu ─────────────────────────
function Menu({ state, setState, setToast }: { state: State; setState: (s: State) => void; setToast: (s: string) => void }) {
  const [open, setOpen] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  return (
    <div className="menu">
      <button className="ghost" onClick={() => setOpen((o) => !o)}>⋯</button>
      {open && (
        <div className="menu-pop" onMouseLeave={() => setOpen(false)}>
          <button onClick={() => {
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `bjj-gps-backup-${today()}.json`
            a.click()
            setOpen(false)
          }}>Export backup (.json)</button>
          <button onClick={() => file.current?.click()}>Import backup…</button>
          <button className="danger" onClick={() => { if (confirm('Wipe all progress on this device?')) { setState(emptyState()); setOpen(false) } }}>Reset progress</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            try {
              const s = JSON.parse(await f.text())
              if (s.v !== 1) throw new Error('bad file')
              setState({ ...emptyState(), ...s })
              setToast('Backup restored')
            } catch { setToast('That file is not a BJJ GPS backup') }
            setOpen(false)
          }} />
        </div>
      )}
    </div>
  )
}
