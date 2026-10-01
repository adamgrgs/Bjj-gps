import { POSITIONS, POSITION_BY_ID } from '../src/data/positions'
import { TECHNIQUES } from '../src/data/techniques'
import { findRoute, emptyState } from '../src/lib/model'
const ids = new Set<string>(); let bad = 0
for (const x of [...POSITIONS, ...TECHNIQUES]) { if (ids.has(x.id)) { console.log('dup', x.id); bad++ } ids.add(x.id) }
const chk = (ref: string, who: string) => { const [p, r] = ref.split(':'); const pos = POSITION_BY_ID[p]; if (!pos || !(pos.roles as any)[r]) { console.log('badref', who, ref); bad++ } }
for (const t of TECHNIQUES) { t.from.forEach(f => chk(f, t.id)); if (t.to) chk(t.to, t.id) }
console.log('positions', POSITIONS.length, 'techniques', TECHNIQUES.length, 'bad', bad)
const s = emptyState()
console.log(findRoute(s, 'mount:b', 'FINISH', false)?.steps.map(x => x.tech.name))
console.log(findRoute(s, 'standing:n', 'back-control:t', false)?.steps.map(x => x.tech.name))
console.log(findRoute(s, 'half-guard:b', 'SUB:rnc', false)?.steps.map(x => x.tech.name))
