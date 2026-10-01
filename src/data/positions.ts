// Positions are the "map". Each position can be held from two sides (roles).
// t = top / attacker / controlling side, b = bottom / defending side, n = neutral (symmetric).

export type Role = 't' | 'b' | 'n'

export type PositionGroup = 'standing' | 'guard' | 'pin' | 'back' | 'legs'

export interface Position {
  id: string
  name: string
  group: PositionGroup
  level: 1 | 2 | 3 | 4
  roles: Partial<Record<Role, string>> // human label for each side
  desc: string
  aliases?: string[]
}

const p = (
  id: string,
  name: string,
  group: PositionGroup,
  level: 1 | 2 | 3 | 4,
  roles: Partial<Record<Role, string>>,
  desc: string,
  aliases: string[] = [],
): Position => ({ id, name, group, level, roles, desc, aliases })

const guard = (top = 'Passing their guard', bottom = 'Playing guard') => ({ t: top, b: bottom })
const pin = (top: string, bottom: string) => ({ t: top, b: bottom })

export const POSITIONS: Position[] = [
  // Standing
  p('standing', 'Standing', 'standing', 1, { n: 'On the feet' }, 'Both athletes on their feet. Grip fighting, takedowns and guard pulls start here.', ['feet', 'stand up', 'neutral']),
  p('clinch', 'Clinch', 'standing', 1, { n: 'Tied up on the feet' }, 'Upper-body tie-ups: collar tie, over-under, body lock, two-on-one.', ['tie up', 'over under', 'collar tie']),
  p('front-headlock', 'Front Headlock', 'standing', 2, pin('Controlling their head', 'Head trapped'), 'You control their head and an arm from the front, usually after a snap-down. Gateway to guillotines, darces, anacondas and go-behinds.', ['snap down', 'front head lock', 'fhl']),

  // Guards
  p('closed-guard', 'Closed Guard', 'guard', 1, guard('In their closed guard', 'Closed guard (legs locked)'), 'Legs locked around the opponent\'s waist. The first guard everyone learns: sweeps, armbars, triangles, kimuras.', ['full guard', 'closed']),
  p('open-guard', 'Open Guard', 'guard', 1, guard(), 'Generic seated / supine open guard with feet on hips, knees or biceps. Hub for every specialised guard.', ['seated guard', 'open']),
  p('half-guard', 'Half Guard', 'guard', 1, guard('Top half guard', 'Bottom half guard'), 'One of the opponent\'s legs trapped between yours. Underhook battles, knee cuts, old-school sweeps.', ['half', 'halfguard']),
  p('knee-shield', 'Knee Shield (Z-Guard)', 'guard', 2, guard(), 'Half guard with the top knee wedged across their chest as a frame.', ['z guard', 'z-guard', 'knee shield half guard']),
  p('deep-half', 'Deep Half Guard', 'guard', 3, guard(), 'You are underneath the opponent, wrapped around their leg, hips off the line. Waiter and back-door sweeps.', ['deep half']),
  p('lockdown', 'Lockdown', 'guard', 3, guard(), 'Half guard with a figure-four on their trapped leg (Eddie Bravo system). Electric chair and old-school sweeps.', ['lock down', '10th planet half']),
  p('butterfly', 'Butterfly Guard', 'guard', 1, guard(), 'Seated, both insteps hooked inside their thighs. Elevation sweeps, arm drags and leg entries.', ['butterfly', 'hooks guard']),
  p('dlr', 'De La Riva Guard', 'guard', 2, guard(), 'Outside hook wrapped around their lead leg from the outside, usually with an ankle and sleeve/collar grip.', ['de la riva', 'dlr', 'delariva']),
  p('rdlr', 'Reverse De La Riva', 'guard', 3, guard(), 'Hook from the inside of their lead leg. Kiss of the dragon, berimbolo and leg entries.', ['reverse dlr', 'rdlr', 'reverse de la riva']),
  p('spider', 'Spider Guard', 'guard', 2, guard(), 'Gi guard: sleeve grips with feet on the biceps. Strong distance control.', ['spider']),
  p('lasso', 'Lasso Guard', 'guard', 2, guard(), 'Gi guard: leg wrapped around their arm while holding the sleeve. Very sticky, great sweeps.', ['lasso', 'lasso guard']),
  p('collar-sleeve', 'Collar-Sleeve Guard', 'guard', 2, guard(), 'Collar grip plus sleeve grip, foot on the bicep or hip. Tripod and sickle sweeps, triangles.', ['collar sleeve', 'collar and sleeve']),
  p('x-guard', 'X-Guard', 'guard', 3, guard('Standing in their X-guard', 'Under them in X-guard'), 'Under the opponent with both legs making an X on one leg. Elevation and technical stand-up sweeps.', ['x guard']),
  p('slx', 'Single Leg X', 'guard', 3, guard('Standing in their single-leg X', 'Single leg X (ashi)'), 'Under one leg: bottom leg across the hip, top foot on the butt. Sweeps and straight ankle locks.', ['single leg x', 'slx', 'ashi garami (gi)', 'single x']),
  p('k-guard', 'K-Guard', 'guard', 4, guard(), 'Inverted, inside-position guard from under the leg. Entries to matrix back take and leg entanglements.', ['k guard', 'matrix']),
  p('worm-guard', 'Worm / Lapel Guard', 'guard', 4, guard(), 'Gi guard using the opponent\'s own lapel fed around their leg (Keenan Cornelius).', ['worm guard', 'lapel guard']),
  p('rubber-guard', 'Rubber Guard', 'guard', 3, guard(), 'High closed guard with the shin clamped over their back (mission control). Requires hip flexibility.', ['rubber guard', 'mission control', 'high guard']),

  // Pins
  p('mount', 'Mount', 'pin', 1, pin('Mounted on them', 'Mounted (bottom)'), 'Sitting on the opponent\'s torso, knees on the mat. The most dominant pin after the back.', ['full mount', 'mounted']),
  p('s-mount', 'S-Mount', 'pin', 2, pin('In S-mount', 'Under S-mount'), 'High mount with one knee up by their head and the other foot near the hip. Armbar and triangle factory.', ['s mount']),
  p('technical-mount', 'Technical Mount', 'pin', 2, pin('Technical mount', 'Under technical mount'), 'Mount to the side when they turn, one knee posted behind their back. Bridge between mount and back.', ['tech mount', 'side mount']),
  p('side-control', 'Side Control', 'pin', 1, pin('Side control (top)', 'Side control (bottom)'), 'Chest-to-chest across the opponent. Crossface, underhook, hip pressure.', ['side mount', 'cross side', 'hundred kilos', '100 kilos', 'cross body']),
  p('kesa', 'Kesa Gatame (Scarf Hold)', 'pin', 2, pin('Scarf hold', 'Under scarf hold'), 'Sitting by their side facing their head, arm trapped under your armpit, head controlled.', ['scarf hold', 'kesa gatame']),
  p('north-south', 'North-South', 'pin', 2, pin('North-south (top)', 'North-south (bottom)'), 'Chest on chest, head to their feet. Chokes and kimuras.', ['north south']),
  p('knee-on-belly', 'Knee on Belly', 'pin', 1, pin('Knee on belly', 'Under knee on belly'), 'Knee across their stomach, other leg posted. Mobile and painful pressure.', ['kob', 'knee on stomach', 'knee ride']),
  p('turtle', 'Turtle', 'pin', 1, pin('Attacking the turtle', 'Turtled up'), 'On knees and elbows, tight ball. Back takes, clock choke, crucifix.', ['turtle']),
  p('crucifix', 'Crucifix', 'pin', 3, pin('Crucifix (top)', 'Caught in a crucifix'), 'Both of their arms tied up — one by your legs, one by your arms. Chokes and armlocks with zero defence.', ['crucifix']),
  p('truck', 'Truck', 'pin', 4, pin('In the truck', 'Trucked'), '10th Planet position: lockdown on their leg from the back side of turtle. Twister, calf slicer, banana split.', ['the truck']),

  // Back
  p('back-control', 'Back Control', 'back', 1, pin('You have their back', 'They have your back'), 'Chest to their back, seatbelt grip, hooks or body triangle in. The most dominant position in BJJ.', ['back mount', 'rear mount', 'back', 'hooks in', 'seatbelt']),

  // Leg entanglements
  p('ashi', 'Ashi Garami (Straight Ashi)', 'legs', 3, pin('Attacking the leg', 'Leg trapped'), 'Basic leg entanglement: one leg across their hip, the other behind the knee. Straight ankle locks.', ['ashi garami', 'straight ashi', 'standard ashi']),
  p('saddle', 'Inside Sankaku (Saddle)', 'legs', 4, pin('In the saddle', 'Stuck in the saddle'), 'Triangle locked between their legs, knee line controlled. The premier heel hook position.', ['saddle', 'honey hole', 'inside sankaku', '411', '4-11']),
  p('outside-ashi', 'Outside Ashi', 'legs', 4, pin('Outside ashi (attacking)', 'Caught in outside ashi'), 'Outside leg crossed over the hip. Outside heel hooks and kneebars.', ['outside ashi garami', 'outside ashi']),
  p('fifty-fifty', '50/50', 'legs', 3, { n: 'In 50/50' }, 'Mirrored leg entanglement — both people have the same leg. Heel hooks, sweeps, back takes.', ['50 50', 'fifty fifty', '5050']),
]

export const POSITION_BY_ID = Object.fromEntries(POSITIONS.map((x) => [x.id, x])) as Record<string, Position>
