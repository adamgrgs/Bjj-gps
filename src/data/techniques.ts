// Techniques are the "roads" between positions.
// from: "positionId:role" (where you start), to: "positionId:role" (where you end up) or null (fight ends: submission).
// Concepts/movements have no to — they attach to the positions where they matter.

export type Category =
  | 'submission'
  | 'sweep'
  | 'pass'
  | 'escape'
  | 'takedown'
  | 'transition'
  | 'retention'
  | 'concept'
  | 'movement'

export type SubKind = 'choke' | 'arm' | 'shoulder' | 'leg' | 'other'

export interface Technique {
  id: string
  name: string
  cat: Category
  from: string[]
  to: string | null
  level: 1 | 2 | 3 | 4
  desc: string
  aliases?: string[]
  sub?: SubKind
  custom?: boolean
}

type Lvl = 1 | 2 | 3 | 4
const arr = (x: string | string[]) => (Array.isArray(x) ? x : [x])

const S = (id: string, name: string, sub: SubKind, from: string | string[], level: Lvl, desc: string, aliases: string[] = []): Technique =>
  ({ id, name, cat: 'submission', sub, from: arr(from), to: null, level, desc, aliases })
const M = (cat: Category) => (id: string, name: string, from: string | string[], to: string | null, level: Lvl, desc: string, aliases: string[] = []): Technique =>
  ({ id, name, cat, from: arr(from), to, level, desc, aliases })

const SW = M('sweep')
const PA = M('pass')
const ES = M('escape')
const TD = M('takedown')
const TR = M('transition')
const RE = M('retention')
const C = (id: string, name: string, at: string | string[], level: Lvl, desc: string, aliases: string[] = []): Technique =>
  ({ id, name, cat: 'concept', from: arr(at), to: null, level, desc, aliases })
const MV = (id: string, name: string, at: string | string[], level: Lvl, desc: string, aliases: string[] = []): Technique =>
  ({ id, name, cat: 'movement', from: arr(at), to: null, level, desc, aliases })

export const TECHNIQUES: Technique[] = [
  // ───────────── SUBMISSIONS ─────────────
  // Chokes
  S('rnc', 'Rear Naked Choke', 'choke', 'back-control:t', 1, 'Arm under the chin, hand to bicep, other hand behind the head. The highest-percentage finish in the sport.', ['rnc', 'mata leao', 'rear naked', 'lion killer']),
  S('bow-arrow', 'Bow and Arrow Choke', 'choke', 'back-control:t', 2, 'Gi: deep collar grip, grab the pants, extend the body like drawing a bow.', ['bow & arrow', 'bow and arrow']),
  S('collar-choke-back', 'Sliding Collar Choke', 'choke', ['back-control:t', 'turtle:t'], 1, 'Gi: feed the lapel with one hand, take the deep collar with the other and slide.', ['sliding collar', 'lapel choke from back']),
  S('short-choke', 'Short Choke', 'choke', 'back-control:t', 3, 'Choke with the chin-strap arm when you can\'t get under the chin — palm on their head, squeeze the jaw.', ['short choke', 'jaw choke']),
  S('cross-collar', 'Cross Collar Choke', 'choke', ['closed-guard:b', 'mount:t'], 1, 'Gi: both hands deep in the collar, thumbs inside, elbows pull to the floor.', ['cross choke', 'x choke', 'cross collar choke']),
  S('triangle', 'Triangle Choke', 'choke', ['closed-guard:b', 'collar-sleeve:b', 'spider:b', 'open-guard:b', 'rubber-guard:b'], 1, 'One arm in, one arm out, legs lock a figure-four around neck and shoulder. Cut the angle.', ['sankaku jime', 'triangle']),
  S('mounted-triangle', 'Mounted Triangle', 'choke', ['mount:t', 's-mount:t'], 2, 'Step over the head from high mount and lock the triangle on top.', ['triangle from mount']),
  S('reverse-triangle', 'Reverse Triangle', 'choke', ['side-control:t', 'north-south:t', 'turtle:t'], 3, 'Triangle locked from the side or behind, usually from top pressure or turtle.', ['reverse triangle']),
  S('arm-triangle', 'Arm Triangle', 'choke', ['mount:t', 'side-control:t', 'half-guard:t'], 1, 'Head and arm trapped, finish by stepping off to the side and dropping the shoulder.', ['kata gatame', 'head and arm choke', 'arm triangle choke']),
  S('darce', "D'Arce Choke", 'choke', ['front-headlock:t', 'turtle:t', 'half-guard:t'], 2, 'Arm threads under their neck and armpit, lock a figure-four behind your own head. Walk and squeeze.', ['darce', 'brabo', 'brabo choke']),
  S('anaconda', 'Anaconda Choke', 'choke', ['front-headlock:t', 'turtle:t'], 2, 'Arm under the neck from the front, gator-roll them onto their back and finish.', ['anaconda', 'gator roll']),
  S('guillotine', 'Guillotine', 'choke', ['standing:n', 'closed-guard:b', 'front-headlock:t', 'butterfly:b', 'half-guard:b'], 1, 'Arm around the neck from the front, hips forward, squeeze with the forearm. Arm-in or neck-only.', ['guillotine choke']),
  S('high-elbow-guillotine', 'High-Elbow Guillotine', 'choke', ['front-headlock:t', 'closed-guard:b'], 3, 'Guillotine with the choking elbow driven high over the shoulder — finishes from many angles.', ['marcelotine', 'high elbow']),
  S('ezekiel', 'Ezekiel Choke', 'choke', ['mount:t', 'back-control:t', 'closed-guard:t'], 2, 'Choke with your own sleeve (gi) or your hand inside your forearm (no-gi). Sneaky, even from inside guard.', ['sode guruma jime', 'ezequiel']),
  S('north-south-choke', 'North-South Choke', 'choke', 'north-south:t', 3, 'Arm under the neck, drop your weight and hide your head — the lat does the choking.', ['n/s choke']),
  S('paper-cutter', 'Paper Cutter Choke', 'choke', 'side-control:t', 2, 'Gi: deep collar grip from side control, forearm slides across the throat.', ['paper cutter']),
  S('baseball-bat', 'Baseball Bat Choke', 'choke', ['knee-on-belly:t', 'side-control:t', 'half-guard:t'], 2, 'Gi: two collar grips like holding a bat, then spin around their head.', ['baseball choke', 'baseball bat']),
  S('loop-choke', 'Loop Choke', 'choke', ['open-guard:b', 'closed-guard:b', 'half-guard:b'], 2, 'Gi: collar grip, push the head through the loop and roll — punishes a passer who drops their head.', ['loop choke']),
  S('clock-choke', 'Clock Choke', 'choke', 'turtle:t', 2, 'Gi: deep collar grip on a turtled opponent, walk around them like a clock hand.', ['clock choke']),
  S('peruvian-necktie', 'Peruvian Necktie', 'choke', ['turtle:t', 'front-headlock:t'], 3, 'Front headlock arm-in choke, legs drape over the back of the head to finish.', ['peruvian']),
  S('von-flue', 'Von Flue Choke', 'choke', 'side-control:t', 2, 'Counter to a guillotine: get to side control and drive your shoulder into their neck.', ['von flue', 'von preux']),
  S('gogoplata', 'Gogoplata', 'choke', 'rubber-guard:b', 3, 'Shin across the throat from rubber guard, pull the head down.', ['gogo']),
  S('crucifix-choke', 'Crucifix Choke', 'choke', 'crucifix:t', 3, 'With both arms trapped, choke with the free arm or the collar.', ['crucifix neck crank']),
  S('bulldog', 'Bulldog Choke', 'choke', ['turtle:t', 'side-control:t'], 2, 'Headlock-style choke on a turtle or from the side when they turn away.', ['bulldog']),
  S('japanese-necktie', 'Japanese Necktie', 'choke', 'front-headlock:t', 4, 'Front headlock choke: drape the body across the back, crush down on the neck.', []),
  S('head-arm-mount', 'Head-and-Arm Choke from Mount', 'choke', 'mount:t', 2, 'Arm triangle hunt from mount when they push on your chest — knock the arm over and lock.', ['mount arm triangle']),

  // Arm locks
  S('armbar-guard', 'Armbar from Guard', 'arm', ['closed-guard:b', 'open-guard:b', 'spider:b'], 1, 'Control the arm, foot on the hip, swing the leg over the head, hips up against the elbow.', ['juji gatame', 'arm bar', 'armbar']),
  S('armbar-mount', 'Armbar from Mount', 'arm', ['mount:t', 's-mount:t'], 1, 'Climb to S-mount, isolate the arm, swing the leg over the head and fall back.', ['mount armbar', 'juji gatame']),
  S('armbar-side', 'Armbar from Side / Knee on Belly', 'arm', ['side-control:t', 'knee-on-belly:t'], 2, 'Spin over the head when they push away and finish the far or near arm.', ['spinning armbar', 'near side armbar']),
  S('armbar-back', 'Armbar from the Back', 'arm', 'back-control:t', 2, 'When they defend the choke by pulling down the arm, swing out and extend.', []),
  S('flying-armbar', 'Flying Armbar', 'arm', 'standing:n', 4, 'Jump straight into an armbar from collar-sleeve grips. High risk, high reward.', ['flying juji']),
  S('kimura-guard', 'Kimura from Guard', 'shoulder', ['closed-guard:b', 'half-guard:b'], 1, 'Figure-four on the wrist, sit up, angle out, rotate the arm behind their back.', ['kimura', 'double wrist lock', 'gyaku ude garami']),
  S('kimura-top', 'Kimura from Top', 'shoulder', ['side-control:t', 'north-south:t', 'half-guard:t'], 1, 'Figure-four the far arm from side control or north-south and bring it behind them.', ['top kimura']),
  S('americana', 'Americana', 'shoulder', ['mount:t', 'side-control:t'], 1, 'Pin the wrist to the mat, figure-four, paint-brush the elbow toward their hip.', ['keylock', 'ude garami', 'paintbrush']),
  S('omoplata', 'Omoplata', 'shoulder', ['closed-guard:b', 'lasso:b', 'open-guard:b'], 2, 'Leg wraps the shoulder, sit up and sit through, drive the shoulder forward.', ['ashi sankaku garami', 'omo plata']),
  S('tarikoplata', 'Tarikoplata', 'shoulder', ['half-guard:b', 'closed-guard:b'], 4, 'Kimura-trap variation: your arm acts as the lever behind their shoulder.', ['tariko']),
  S('straight-armlock', 'Straight Armlock (Ude Gatame)', 'arm', ['closed-guard:b', 'mount:t', 'clinch:n'], 2, 'Straight arm against your shoulder or chest, press the elbow.', ['ude gatame', 'straight armbar']),
  S('biceps-slicer', 'Biceps Slicer', 'arm', ['closed-guard:b', 'mount:t', 'side-control:t'], 3, 'Forearm or shin wedged in their elbow crease, fold the arm.', ['bicep slicer', 'bicep crusher']),
  S('wrist-lock', 'Wrist Lock', 'arm', ['closed-guard:b', 'side-control:t', 'mount:t'], 2, 'Bend the wrist back, often from a collar grip. Fast — tap early.', ['wristlock', 'kote gaeshi']),
  S('crucifix-armlock', 'Crucifix Armlock', 'arm', 'crucifix:t', 3, 'Trapped arm extended across your hips from the crucifix.', []),
  S('baratoplata', 'Baratoplata', 'shoulder', 'closed-guard:b', 4, 'Omoplata variant finished while sitting up close to the shoulder.', []),

  // Leg locks
  S('straight-ankle', 'Straight Ankle Lock', 'leg', ['ashi:t', 'slx:b', 'outside-ashi:t'], 2, 'Ankle in your armpit, blade the wrist on the Achilles, arch back.', ['achilles lock', 'straight footlock', 'ankle lock']),
  S('heel-hook-inside', 'Inside Heel Hook', 'leg', ['saddle:t', 'fifty-fifty:n'], 4, 'Heel in the crook of the elbow, rotate across the body. Brown/black or no-gi rules only.', ['inside heel hook', 'ihh']),
  S('heel-hook-outside', 'Outside Heel Hook', 'leg', ['outside-ashi:t', 'ashi:t', 'fifty-fifty:n'], 4, 'Rotate the heel to the outside of their body. Control the knee line first.', ['outside heel hook', 'ohh']),
  S('kneebar', 'Kneebar', 'leg', ['ashi:t', 'outside-ashi:t', 'half-guard:t', 'side-control:t'], 3, 'Like an armbar on the leg: hips against the knee, pull the foot to your chest.', ['knee bar', 'hiza juji gatame']),
  S('toe-hold', 'Toe Hold', 'leg', ['ashi:t', 'half-guard:t', 'fifty-fifty:n'], 3, 'Figure-four on the foot, rotate the ankle inward.', ['toehold', 'figure four foot lock']),
  S('estima-lock', 'Estima Lock', 'leg', 'ashi:t', 4, 'Foot-lock variant: trap their foot against your body and turn. Notorious for quick taps.', ['estima']),
  S('calf-slicer', 'Calf Slicer', 'leg', ['truck:t', 'back-control:t'], 4, 'Leg folded over your shin, compress the calf.', ['calf crush', 'calf slicer']),
  S('banana-split', 'Banana Split', 'leg', 'truck:t', 4, 'Splits their legs apart from the truck. Groin stretch, not a joint lock.', ['groin stretch']),
  S('twister', 'Twister', 'other', 'truck:t', 4, 'Spinal lock from the truck: lock the leg, pull the head away. Illegal in most IBJJF divisions.', ['twister']),
  S('electric-chair', 'Electric Chair', 'leg', 'lockdown:b', 3, 'From lockdown, come up under them and stretch the leg into a groin/hip submission.', ['electric chair']),

  // ───────────── SWEEPS ─────────────
  SW('scissor-sweep', 'Scissor Sweep', 'closed-guard:b', 'mount:t', 1, 'Shin across the belly, chop the bottom leg, pull the collar/sleeve, land in mount.', ['scissors sweep']),
  SW('hip-bump', 'Hip Bump Sweep', 'closed-guard:b', 'mount:t', 1, 'Sit up when they posture, post a hand, bump the hips and roll them over.', ['sit up sweep', 'hip bump']),
  SW('flower-sweep', 'Flower Sweep', 'closed-guard:b', 'mount:t', 1, 'Pendulum the leg, hook the far leg, roll them over the trapped arm.', ['pendulum sweep', 'flower']),
  SW('star-sweep', 'Star Sweep', 'closed-guard:b', 'mount:t', 3, 'When they stand in your guard, grab a leg and spin underneath.', ['star']),
  SW('pendulum-sweep', 'Elevator Sweep', 'butterfly:b', 'mount:t', 1, 'Hook lifts the leg as you fall to the side, follow over the top.', ['butterfly sweep', 'hook sweep', 'elevator']),
  SW('arm-drag-sweep', 'Arm Drag Sweep', ['butterfly:b', 'open-guard:b'], 'side-control:t', 2, 'Drag the arm across, climb up and knock them over.', []),
  SW('old-school', 'Old School Sweep', ['half-guard:b', 'lockdown:b'], 'half-guard:t', 1, 'Underhook, come up to the knees, grab the far ankle and drive.', ['old school sweep', 'half guard sweep']),
  SW('dogfight', 'Dogfight / Knee Tap', 'half-guard:b', 'side-control:t', 2, 'Win the underhook, come up to the knees and tip them over.', ['dogfight', 'knee tap', 'dog fight']),
  SW('knee-shield-sweep', 'Knee Shield Sweep', 'knee-shield:b', 'mount:t', 2, 'Shield lifts and rotates them as you underhook the leg.', ['z guard sweep']),
  SW('waiter-sweep', 'Waiter Sweep', 'deep-half:b', 'side-control:t', 3, 'From deep half, lift their far leg like a waiter tray and roll them.', ['waiter']),
  SW('homer-simpson', 'Homer Simpson Sweep', 'deep-half:b', 'half-guard:t', 4, 'Deep half sweep: roll underneath to come out behind them.', []),
  SW('tripod-sweep', 'Tripod Sweep', ['collar-sleeve:b', 'open-guard:b', 'dlr:b'], 'standing:n', 1, 'Foot on the hip, hook the ankle and push — they fall, you stand into top.', ['tripod']),
  SW('sickle-sweep', 'Sickle Sweep', ['collar-sleeve:b', 'open-guard:b'], 'side-control:t', 1, 'Tripod variation: foot on the hip, sickle the far ankle.', ['sickle']),
  SW('balloon-sweep', 'Balloon Sweep', ['spider:b', 'open-guard:b', 'collar-sleeve:b'], 'mount:t', 2, 'Feet on their hips, pull them over the top like a balloon (sumi gaeshi-style).', ['overhead sweep']),
  SW('lasso-sweep', 'Lasso Sweep', 'lasso:b', 'mount:t', 2, 'Use the lasso to off-balance them as you pull — classic gi sweep.', []),
  SW('spider-sweep', 'Spider Guard Sweep', 'spider:b', 'mount:t', 2, 'Pull one sleeve, push with the feet, roll them over.', []),
  SW('dlr-sweep', 'De La Riva Sweep', 'dlr:b', 'standing:n', 2, 'Classic DLR off-balance: kick the far leg, pull the sleeve, follow up to top.', ['dlr off balance']),
  SW('berimbolo', 'Berimbolo', 'dlr:b', 'back-control:t', 4, 'Invert under them from DLR and spin behind to take the back.', ['bolo', 'berimbolo']),
  SW('kiss-of-dragon', 'Kiss of the Dragon', 'rdlr:b', 'back-control:t', 4, 'Inverted reverse-DLR entry between their legs to the back.', ['kotd']),
  SW('x-guard-sweep', 'X-Guard Sweep', 'x-guard:b', 'side-control:t', 3, 'Extend the X, push the hip, they fall backward.', ['x sweep']),
  SW('technical-standup-sweep', 'Technical Stand-Up Sweep', ['x-guard:b', 'slx:b'], 'standing:n', 3, 'Stand up in base while holding their leg — they fall back.', ['stand up sweep']),
  SW('slx-sweep', 'Single Leg X Sweep', 'slx:b', 'ashi:t', 3, 'Kick the hip, they sit, you follow into the leg lock or top.', ['slx sweep']),
  SW('fifty-sweep', '50/50 Sweep', 'fifty-fifty:n', 'half-guard:t', 3, 'Come up on top from 50/50 by pulling their leg.', []),
  SW('matrix', 'Matrix Back Take', 'k-guard:b', 'back-control:t', 4, 'From K-guard, invert, pin the leg and spin to the back.', ['matrix']),
  SW('worm-sweep', 'Worm Guard Sweep', 'worm-guard:b', 'mount:t', 4, 'Use their own lapel to off-balance and come up.', []),
  SW('peterson-roll', 'Peterson Roll', 'turtle:b', 'side-control:t', 3, 'From turtle, roll the attacker over your shoulder.', ['peterson']),
  SW('hip-heist-sweep', 'Hip Heist Sweep (Butterfly)', 'butterfly:b', 'side-control:t', 2, 'Overhook, post, hip heist and drive them to the mat.', []),

  // ───────────── PASSES ─────────────
  PA('break-closed-standing', 'Standing Closed-Guard Break', 'closed-guard:t', 'open-guard:t', 1, 'Posture, hands on hips, stand and step back to pop the ankles open.', ['standing guard break', 'open the guard']),
  PA('break-closed-kneeling', 'Kneeling Closed-Guard Break', 'closed-guard:t', 'open-guard:t', 1, 'Posture, knee into the tailbone, slide the other knee back to open.', ['kneeling guard break']),
  PA('toreando', 'Toreando (Bullfighter)', ['open-guard:t', 'butterfly:t', 'spider:t', 'dlr:t'], 'side-control:t', 1, 'Grab both knees/pants, throw the legs aside and run around.', ['torreando', 'bullfighter', 'toreando pass']),
  PA('knee-cut', 'Knee Cut (Knee Slice)', ['open-guard:t', 'half-guard:t', 'knee-shield:t', 'dlr:t'], 'side-control:t', 1, 'Slice the knee across their thigh, crossface and underhook as you slide through.', ['knee slice', 'knee slide', 'knee through']),
  PA('leg-drag', 'Leg Drag', ['open-guard:t', 'dlr:t'], 'side-control:t', 2, 'Drag their legs across your hip, pin, then settle into side control or back.', ['leg drag']),
  PA('over-under', 'Over-Under Pass', ['open-guard:t', 'half-guard:t', 'butterfly:t'], 'side-control:t', 2, 'One arm over, one arm under the legs, pressure and walk around.', ['over under']),
  PA('double-under', 'Double-Under (Stack) Pass', ['closed-guard:t', 'open-guard:t'], 'side-control:t', 1, 'Both arms under the legs, stack them on their neck, walk around.', ['stack pass', 'double under']),
  PA('x-pass', 'X-Pass', ['open-guard:t', 'butterfly:t'], 'side-control:t', 2, 'Fast standing pass: step across and around their knees in an X pattern.', ['x pass']),
  PA('long-step', 'Long Step', ['half-guard:t', 'open-guard:t'], 'side-control:t', 3, 'Free your leg by stepping back and over, hips facing their feet.', ['longstep']),
  PA('smash-pass', 'Smash Pass', ['open-guard:t', 'half-guard:t'], 'side-control:t', 2, 'Fold their legs to one side, hip-to-hip pressure, crossface.', ['smash']),
  PA('body-lock-pass', 'Body Lock Pass', ['open-guard:t', 'butterfly:t', 'half-guard:t', 'closed-guard:t'], 'side-control:t', 2, 'Lock your hands around their waist, pin the hips, step over a leg.', ['bodylock pass', 'body lock']),
  PA('float-pass', 'Float Pass', ['half-guard:t', 'butterfly:t'], 'mount:t', 3, 'Float your hips over their leg while staying chest-heavy.', []),
  PA('backstep', 'Backstep Pass', ['half-guard:t', 'open-guard:t'], 'side-control:t', 3, 'Turn your back, step over and around to free the trapped leg.', ['back step']),
  PA('kesa-pass', 'Hip Switch (Kesa) Pass', ['half-guard:t', 'butterfly:t'], 'kesa:t', 2, 'Switch your hips to face their feet and slide into scarf hold.', ['hip switch', 'kesa pass']),
  PA('tripod-pass', 'Tripod Pass', 'half-guard:t', 'side-control:t', 2, 'Underhook, post on your head/feet, free the knee.', []),
  PA('half-to-mount', 'Half Guard to Mount', 'half-guard:t', 'mount:t', 2, 'Free your trapped foot with the other foot and slide straight to mount.', ['half to mount']),
  PA('headquarters', 'Headquarters (HQ) Entry', ['open-guard:t', 'dlr:t', 'rdlr:t'], 'half-guard:t', 2, 'Knee between their legs, outside foot posted — central passing hub.', ['hq', 'headquarters', 'combat base']),
  PA('lasso-pass', 'Lasso / Spider Grip Break Pass', ['spider:t', 'lasso:t'], 'open-guard:t', 2, 'Break the sleeve grips and circle the arm out to neutralise the guard.', ['grip break']),
  PA('x-guard-escape', 'X-Guard Step-Out', 'x-guard:t', 'open-guard:t', 3, 'Stay heavy, kill the far hook and step out.', []),
  PA('leg-weave', 'Leg Weave Pass', ['open-guard:t', 'half-guard:t'], 'side-control:t', 3, 'Weave your arm through their legs, staple a leg and pass around.', ['leg weave']),
  PA('cartwheel-pass', 'Cartwheel Pass', ['open-guard:t', 'spider:t'], 'side-control:t', 4, 'Dynamic acrobatic pass over the guard.', []),

  // ───────────── ESCAPES ─────────────
  ES('upa', 'Upa (Trap and Roll)', 'mount:b', 'closed-guard:t', 1, 'Trap the arm and foot on the same side, bridge over that shoulder, land in their guard.', ['bridge and roll', 'trap and roll', 'upa escape']),
  ES('elbow-knee-mount', 'Elbow-Knee Escape (Mount)', 'mount:b', 'half-guard:b', 1, 'Frame, shrimp, bring the elbow to the knee, recover half guard or guard.', ['shrimp escape', 'hip escape mount', 'elbow knee']),
  ES('heel-drag', 'Heel Drag Escape', 'mount:b', 'half-guard:b', 2, 'Drag your heel out from under their leg to recover half guard.', []),
  ES('kipping', 'Kipping Escape', 'mount:b', 'closed-guard:b', 3, 'Bridge their weight forward, kip your knees in to recover guard.', ['kip escape']),
  ES('side-shrimp', 'Side Control Shrimp to Guard', 'side-control:b', 'open-guard:b', 1, 'Frame on neck and hip, shrimp away, insert the knee, recover guard.', ['frame and shrimp', 'replace guard']),
  ES('side-underhook', 'Underhook to Knees', 'side-control:b', 'turtle:b', 1, 'Get the underhook, turn in and come to your knees.', ['come to knees', 'side control escape to knees']),
  ES('side-bridge', 'Bridge and Roll from Side Control', 'side-control:b', 'half-guard:b', 2, 'Bridge into them to create space, then hip away and recover half guard.', []),
  ES('ghost', 'Ghost Escape', 'side-control:b', 'turtle:b', 3, 'Slip out the back door underneath their hips.', ['ghost escape']),
  ES('north-south-escape', 'North-South Turn-In', 'north-south:b', 'turtle:b', 2, 'Shrimp, turn into them and come to your knees.', []),
  ES('kob-escape', 'Knee-on-Belly Escape', 'knee-on-belly:b', 'open-guard:b', 1, 'Push the knee, shrimp away, re-guard.', []),
  ES('kesa-escape', 'Scarf Hold Escape', 'kesa:b', 'side-control:t', 2, 'Free the trapped arm, bridge and back-roll or take their back.', ['kesa escape']),
  ES('back-escape', 'Shoulder-to-Mat Back Escape', 'back-control:b', 'half-guard:t', 1, 'Two-on-one the choking arm, slide your shoulder to the mat on the seatbelt side, turn in.', ['back escape']),
  ES('back-escape-guard', 'Back Escape to Guard', 'back-control:b', 'closed-guard:t', 2, 'Clear the hook, slide down, turn into their guard.', []),
  ES('turtle-sitout', 'Sit-Out', 'turtle:b', 'standing:n', 2, 'Kick your leg through and come out facing them or stand.', ['sit out']),
  ES('turtle-granby', 'Granby Roll to Guard', 'turtle:b', 'open-guard:b', 2, 'Roll over your shoulder to bring your legs back in front.', ['granby']),
  ES('crucifix-escape', 'Crucifix Escape', 'crucifix:b', 'turtle:b', 3, 'Free the trapped arm before they lock the legs, turn into them.', []),
  ES('hitchhiker', 'Hitchhiker Armbar Escape', 'mount:b', 'half-guard:t', 3, 'Thumb out, turn toward their legs and rotate out of the armbar.', ['hitchhiker escape']),
  ES('stack-armbar', 'Stack Armbar Escape', 'closed-guard:t', 'side-control:t', 2, 'Stack them on their neck and pull the elbow out.', ['armbar defense']),
  ES('triangle-escape', 'Triangle Defense (Posture & Pass)', 'closed-guard:t', 'side-control:t', 2, 'Posture, push the hips down, step around and pass.', ['triangle escape']),
  ES('guillotine-escape', 'Guillotine Escape', 'closed-guard:t', 'side-control:t', 2, 'Hand-fight, pass to the side of the choking arm.', ['guillotine defense']),
  ES('kimura-escape', 'Kimura Defense', 'closed-guard:t', 'closed-guard:t', 2, 'Grab your own belt/lat, keep elbow tight, re-posture.', []),
  ES('rnc-defense', 'RNC Defense', 'back-control:b', 'back-control:b', 1, 'Two-on-one the choking hand, chin down, keep shoulders to the mat.', ['choke defense']),
  ES('leglock-escape', 'Knee Line Clearing (Leg Lock Escape)', ['saddle:b', 'ashi:b', 'outside-ashi:b'], 'standing:n', 4, 'Clear the knee line, hide the heel, stand out or turn in.', ['heel hook escape', 'leg lock escape']),
  ES('truck-escape', 'Truck Escape', 'truck:b', 'turtle:b', 4, 'Free the trapped leg before they lock the twister.', []),

  // ───────────── TAKEDOWNS ─────────────
  TD('double-leg', 'Double Leg', 'standing:n', 'side-control:t', 1, 'Level change, penetration step, drive through both legs.', ['double leg takedown', 'morote gari']),
  TD('single-leg', 'Single Leg', 'standing:n', 'half-guard:t', 1, 'Capture one leg, finish with run-the-pipe or a trip.', ['single leg takedown']),
  TD('high-crotch', 'High Crotch', 'standing:n', 'side-control:t', 2, 'Head outside, deep on the leg, lift and finish.', []),
  TD('ankle-pick', 'Ankle Pick', 'standing:n', 'side-control:t', 2, 'Pull their head down to stop the step, pick the ankle.', []),
  TD('osoto-gari', 'Osoto Gari', ['standing:n', 'clinch:n'], 'side-control:t', 1, 'Major outer reap: break balance backward, reap the leg.', ['osoto', 'outside reap']),
  TD('ouchi-gari', 'Ouchi Gari', ['standing:n', 'clinch:n'], 'closed-guard:t', 2, 'Major inner reap: hook inside their leg and drive.', ['ouchi', 'inside trip']),
  TD('kouchi-gari', 'Kouchi Gari', 'standing:n', 'half-guard:t', 2, 'Minor inner reap at the heel.', ['kouchi']),
  TD('seoi-nage', 'Seoi Nage', 'standing:n', 'side-control:t', 2, 'Shoulder throw: turn in under their arm and throw them over.', ['shoulder throw', 'ippon seoi']),
  TD('uchi-mata', 'Uchi Mata', 'clinch:n', 'side-control:t', 3, 'Inner thigh throw.', ['uchimata']),
  TD('o-goshi', 'O Goshi', 'clinch:n', 'kesa:t', 1, 'Basic hip throw — the first throw most people learn.', ['hip throw', 'ogoshi']),
  TD('harai-goshi', 'Harai Goshi', 'clinch:n', 'side-control:t', 3, 'Sweeping hip throw.', []),
  TD('de-ashi-barai', 'De Ashi Barai', 'standing:n', 'side-control:t', 3, 'Advanced foot sweep timed on their step.', ['foot sweep', 'deashi']),
  TD('tai-otoshi', 'Tai Otoshi', 'standing:n', 'side-control:t', 3, 'Body drop: trip their leg as you rotate them over.', []),
  TD('tomoe-nage', 'Tomoe Nage', 'standing:n', 'mount:t', 3, 'Sacrifice throw: drop under them, foot on the belly, throw overhead.', ['circle throw']),
  TD('sumi-gaeshi', 'Sumi Gaeshi', 'clinch:n', 'mount:t', 3, 'Corner sacrifice throw: drop back, instep hooks inside their thigh, lift them over.', []),
  TD('body-lock-takedown', 'Body Lock Takedown', 'clinch:n', 'side-control:t', 2, 'Lock around the waist, trip or mat-return.', ['bodylock takedown', 'mat return']),
  TD('snap-down', 'Snap Down', 'standing:n', 'front-headlock:t', 2, 'Pull the head down to the mat into a front headlock.', ['snapdown']),
  TD('arm-drag-back', 'Arm Drag to Back (Standing)', 'standing:n', 'back-control:t', 2, 'Drag the arm across and step behind.', ['arm drag']),
  TD('collar-drag', 'Collar Drag', 'standing:n', 'back-control:t', 2, 'Gi: pull the collar while stepping off to the side.', []),
  TD('fireman', "Fireman's Carry", 'standing:n', 'side-control:t', 3, 'Duck under the arm, shoulder in the hip, lift and throw.', ['fireman']),
  TD('guard-pull-closed', 'Guard Pull (Closed)', 'standing:n', 'closed-guard:b', 1, 'Grips first, then sit to closed guard safely.', ['pull guard']),
  TD('guard-pull-open', 'Guard Pull (Open)', 'standing:n', 'open-guard:b', 1, 'Sit to open guard with grips and a foot on the hip.', ['sit guard']),
  TD('imanari', 'Imanari Roll', 'standing:n', 'saddle:t', 4, 'Roll across the body into a leg entanglement.', ['imanari']),
  TD('kani-basami', 'Kani Basami', 'standing:n', 'ashi:t', 4, 'Scissor takedown into the legs. Dangerous — banned in many rulesets.', ['flying scissor']),
  TD('outside-trip', 'Outside Trip', 'clinch:n', 'side-control:t', 1, 'Simple trip from the clinch.', []),
  TD('clinch-entry', 'Enter the Clinch', 'standing:n', 'clinch:n', 1, 'Close distance safely into an upper-body tie.', ['clinch']),

  // ───────────── TRANSITIONS ─────────────
  TR('side-to-mount', 'Side Control to Mount', 'side-control:t', 'mount:t', 1, 'Slide the knee across the belly or step over while pinning the far arm.', ['knee slide to mount']),
  TR('side-to-kob', 'Side Control to Knee on Belly', 'side-control:t', 'knee-on-belly:t', 1, 'Pop up and drop the knee onto their belly.', []),
  TR('kob-to-mount', 'Knee on Belly to Mount', 'knee-on-belly:t', 'mount:t', 1, 'Slide the knee over as they push.', []),
  TR('side-to-ns', 'Side Control to North-South', 'side-control:t', 'north-south:t', 2, 'Walk around the head maintaining chest pressure.', []),
  TR('side-to-kesa', 'Side Control to Kesa', 'side-control:t', 'kesa:t', 2, 'Hip switch to face their head into scarf hold.', []),
  TR('mount-to-s', 'Mount to S-Mount', 'mount:t', 's-mount:t', 2, 'Climb high, bring one knee by their head.', []),
  TR('mount-to-tech', 'Mount to Technical Mount', 'mount:t', 'technical-mount:t', 2, 'When they turn, follow them onto their side.', []),
  TR('tech-to-back', 'Technical Mount to Back', 'technical-mount:t', 'back-control:t', 2, 'Insert the hook as they turn away.', []),
  TR('mount-to-back', 'Mount to Back (Gift Wrap)', 'mount:t', 'back-control:t', 2, 'Gift-wrap the arm across their neck, roll to the back.', ['gift wrap', 'giftwrap']),
  TR('turtle-to-back', 'Turtle to Back (Seatbelt & Hooks)', 'turtle:t', 'back-control:t', 1, 'Seatbelt, drop your hip and insert hooks.', ['seatbelt hooks', 'back take']),
  TR('spiral-ride', 'Spiral Ride', 'turtle:t', 'back-control:t', 3, 'Wrestling ride that rotates them into the back exposure.', []),
  TR('crucifix-entry', 'Crucifix Entry', 'turtle:t', 'crucifix:t', 3, 'Trap the near arm with your legs as you roll.', []),
  TR('truck-entry', 'Truck Entry', 'turtle:t', 'truck:t', 4, 'Lockdown their leg while rolling over the hip.', []),
  TR('truck-to-back', 'Truck to Back', 'truck:t', 'back-control:t', 4, 'Slide into the back from the truck.', []),
  TR('fhl-go-behind', 'Go-Behind from Front Headlock', 'front-headlock:t', 'back-control:t', 2, 'Spin behind while controlling the head.', ['go behind']),
  TR('fhl-to-turtle', 'Front Headlock to Turtle Ride', 'front-headlock:t', 'turtle:t', 1, 'Circle to the side and settle on top of the turtle.', []),
  TR('arm-drag-guard', 'Arm Drag to Back (Guard)', ['open-guard:b', 'butterfly:b', 'closed-guard:b'], 'back-control:t', 2, 'Drag the arm across and climb to the back.', ['arm drag back take']),
  TR('half-to-deep', 'Half Guard to Deep Half', 'half-guard:b', 'deep-half:b', 3, 'Dive under their hips into deep half.', []),
  TR('half-to-shield', 'Half Guard to Knee Shield', 'half-guard:b', 'knee-shield:b', 2, 'Insert the knee across their chest.', []),
  TR('half-to-lockdown', 'Half Guard to Lockdown', 'half-guard:b', 'lockdown:b', 3, 'Figure-four the trapped leg.', []),
  TR('butterfly-to-x', 'Butterfly to X-Guard', 'butterfly:b', 'x-guard:b', 3, 'Elevate with a hook and slide under into X.', []),
  TR('butterfly-to-ashi', 'Butterfly to Ashi', 'butterfly:b', 'ashi:t', 3, 'Shoot under one leg into a leg entanglement.', []),
  TR('slx-to-ashi', 'SLX to Ashi', 'slx:b', 'ashi:t', 3, 'Switch your leg into the ashi position.', []),
  TR('ashi-to-saddle', 'Ashi to Saddle', 'ashi:t', 'saddle:t', 4, 'Triangle your legs on the inside.', ['inside sankaku entry']),
  TR('dlr-to-fifty', 'DLR to 50/50', 'dlr:b', 'fifty-fifty:n', 3, 'Spin under and mirror the leg.', []),
  TR('dlr-to-x', 'DLR to X-Guard', 'dlr:b', 'x-guard:b', 3, 'Slide under and hook the far leg.', []),
  TR('spider-to-lasso', 'Spider to Lasso', 'spider:b', 'lasso:b', 2, 'Circle the leg around the arm.', []),
  TR('open-to-dlr', 'Open Guard to DLR', 'open-guard:b', 'dlr:b', 2, 'Hook the lead leg from the outside.', []),
  TR('open-to-collar-sleeve', 'Open Guard to Collar-Sleeve', 'open-guard:b', 'collar-sleeve:b', 2, 'Establish collar and sleeve grips with a foot on the bicep.', []),
  TR('open-to-butterfly', 'Open Guard to Butterfly', 'open-guard:b', 'butterfly:b', 1, 'Sit up and insert the hooks.', []),
  TR('open-to-spider', 'Open Guard to Spider', 'open-guard:b', 'spider:b', 2, 'Grip the sleeves and place feet on the biceps.', []),
  TR('closed-to-rubber', 'Closed to Rubber Guard', 'closed-guard:b', 'rubber-guard:b', 3, 'Break posture, climb the leg high, clamp with the shin.', []),
  TR('rdlr-to-kguard', 'RDLR to K-Guard', 'rdlr:b', 'k-guard:b', 4, 'Invert under their leg into K-guard.', []),
  TR('open-to-worm', 'Open Guard to Worm Guard', 'open-guard:b', 'worm-guard:b', 4, 'Feed their lapel around their leg.', []),
  TR('dlr-to-rdlr', 'DLR to Reverse DLR', 'dlr:b', 'rdlr:b', 3, 'Switch hooks as they knee cut.', []),
  TR('back-body-triangle', 'Back: Hooks to Body Triangle', 'back-control:t', 'back-control:t', 2, 'Lock a body triangle to tighten back control.', ['body triangle']),
  TR('kimura-trap', 'Kimura Trap System', ['closed-guard:b', 'half-guard:b', 'side-control:t'], 'back-control:t', 3, 'Use the kimura grip to transition to the back or sweep.', ['kimura trap']),

  // ───────────── GUARD RETENTION ─────────────
  RE('shrimp-recover', 'Hip Escape Recovery', ['open-guard:b', 'half-guard:b'], 'open-guard:b', 1, 'Shrimp to recover space and reinsert your knee.', ['hip escape', 'shrimp']),
  RE('inversion-retention', 'Inversion Recovery', 'open-guard:b', 'open-guard:b', 3, 'Invert onto your shoulders to re-square your legs.', ['inversion']),
  RE('shin-to-shin', 'Shin-to-Shin Guard', 'open-guard:b', 'slx:b', 2, 'Shin against their shin to off-balance and enter SLX.', []),
  RE('granby-retention', 'Granby Recovery', ['open-guard:b', 'turtle:b'], 'open-guard:b', 3, 'Roll over the shoulder to recover guard.', []),
  RE('frames-retention', 'Frame & Re-guard', ['side-control:b', 'open-guard:b'], 'open-guard:b', 1, 'Frames on the hip and neck to retain the guard.', []),

  // ───────────── CONCEPTS / TRICKS / HACKS ─────────────
  C('frames', 'Frames (Not Pushes)', ['mount:b', 'side-control:b', 'knee-on-belly:b'], 1, 'Use bone structure to hold space — never push with straight arms.', ['frame']),
  C('posture', 'Posture in Closed Guard', 'closed-guard:t', 1, 'Spine straight, hips forward, hands on the hips. Most guard attacks need a broken posture.', []),
  C('break-posture', 'Break Posture', 'closed-guard:b', 1, 'Pull the head down with legs and grips before attacking.', []),
  C('underhook', 'Underhook Wins Half Guard', ['half-guard:b', 'half-guard:t', 'clinch:n'], 1, 'Whoever wins the underhook usually wins the exchange.', ['underhook']),
  C('crossface', 'Crossface', ['half-guard:t', 'side-control:t'], 1, 'Shoulder across the jaw to turn their head away and kill their hips.', []),
  C('whizzer', 'Whizzer / Overhook', ['half-guard:t', 'standing:n'], 2, 'Overhook to counter an underhook or single leg.', ['overhook']),
  C('head-position', 'Head Position', ['standing:n', 'half-guard:t', 'half-guard:b'], 2, 'Head inside, high, or over the shoulder controls the exchange.', []),
  C('elbow-knee', 'Elbow-Knee Connection', ['open-guard:b', 'half-guard:b', 'side-control:b'], 1, 'Keep elbows to knees to prevent passes.', []),
  C('inside-position', 'Inside Position', ['open-guard:b', 'open-guard:t'], 2, 'Whoever has inside position controls the guard.', []),
  C('knee-line', 'Knee Line', ['open-guard:t', 'half-guard:t'], 2, 'Getting past their knees is the real start of a pass.', []),
  C('seatbelt', 'Seatbelt Grip', ['back-control:t', 'turtle:t'], 1, 'Over-under grip from behind — the foundation of back control.', []),
  C('hand-fighting-back', 'Hand Fighting on the Back', ['back-control:t', 'back-control:b'], 2, 'Strip the defending hands before setting up the choke.', []),
  C('chin-tuck', 'Chin Tuck', ['back-control:b', 'front-headlock:b'], 1, 'Chin down, shoulders up to defend chokes.', []),
  C('hide-elbows', 'Hide the Elbows', ['mount:b', 'side-control:b'], 1, 'Keep elbows tight to protect from armbars and kimuras.', []),
  C('gift-wrap', 'Gift Wrap', ['mount:t', 'back-control:t'], 2, 'Pull their arm across their neck to set up back takes and chokes.', []),
  C('low-mount', 'Low Mount & Grapevine', 'mount:t', 1, 'Low mount with grapevines to survive bridges.', ['grapevine']),
  C('shoulder-pressure', 'Shoulder Pressure', ['half-guard:t', 'side-control:t'], 2, 'Drive shoulder into the jaw to flatten them.', []),
  C('make-them-carry', 'Make Them Carry Your Weight', ['side-control:t', 'mount:t', 'knee-on-belly:t'], 2, 'Put your weight on their body, not the mat.', []),
  C('base', 'Base', ['closed-guard:t', 'standing:n'], 1, 'Wide knees, good posture, weight distributed.', []),
  C('grip-fighting', 'Grip Fighting', ['standing:n', 'open-guard:b', 'open-guard:t'], 2, 'Win grips before you attack, break theirs first.', []),
  C('two-on-one', 'Two-on-One', ['standing:n', 'back-control:b', 'open-guard:b'], 2, 'Control one arm with both of yours.', ['russian tie']),
  C('pummeling', 'Pummeling', 'clinch:n', 1, 'Swim for underhooks in the clinch.', []),
  C('collar-tie', 'Collar Tie', ['standing:n', 'clinch:n'], 1, 'Hand behind the neck to control the head.', []),
  C('wrist-control-back', 'Wrist Control on the Back', 'back-control:t', 2, 'Control the wrist to stop them from defending.', []),
  C('stay-heavy', 'Stay Heavy', ['side-control:t', 'mount:t', 'north-south:t'], 1, 'Relax and sink weight — don’t muscle.', []),
  C('breathe', 'Breathe & Relax', ['mount:b', 'side-control:b', 'back-control:b'], 1, 'Breathe and stay calm under pressure.', []),
  C('angle-attack', 'Cut an Angle', ['closed-guard:b', 'open-guard:b'], 2, 'Turn your hips off the line to finish submissions.', []),
  C('chain-attacks', 'Chain Attacks', ['closed-guard:b', 'mount:t', 'back-control:t'], 2, 'String armbar → triangle → omoplata so every defense opens the next.', []),
  C('tap-early', 'Tap Early, Tap Often', ['standing:n'], 1, 'Protect your joints — tapping is part of learning.', []),

  // ───────────── MOVEMENTS ─────────────
  MV('shrimp-drill', 'Shrimp (Hip Escape)', ['side-control:b', 'mount:b', 'open-guard:b'], 1, 'The most important solo drill in BJJ.', ['hip escape', 'shrimp']),
  MV('bridge-drill', 'Bridge (Upa)', ['mount:b', 'side-control:b'], 1, 'Explosive hip lift used in escapes.', ['bridge drill']),
  MV('technical-standup', 'Technical Stand-Up', ['open-guard:b', 'standing:n'], 1, 'Stand up safely from the ground with base.', ['technical stand up']),
  MV('breakfall', 'Breakfall (Ukemi)', 'standing:n', 1, 'Fall safely when thrown.', ['ukemi', 'breakfall']),
  MV('granby-drill', 'Granby Roll', ['turtle:b', 'open-guard:b'], 2, 'Roll across your shoulders without putting weight on the head.', []),
  MV('hip-heist', 'Hip Heist', ['butterfly:b', 'side-control:b', 'turtle:b'], 1, 'Post a hand, swing the leg through to come up.', []),
  MV('sprawl', 'Sprawl', 'standing:n', 1, 'Shoot your hips back and down to stop a takedown.', []),
  MV('penetration-step', 'Penetration Step', 'standing:n', 1, 'Level change and step deep for takedowns.', []),
  MV('forward-roll', 'Forward / Backward Roll', ['standing:n', 'turtle:b'], 1, 'Basic rolling over the shoulder.', []),
  MV('inversion-drill', 'Inversion', 'open-guard:b', 3, 'Rotate on your shoulders for guard retention and leg entries.', []),
]
