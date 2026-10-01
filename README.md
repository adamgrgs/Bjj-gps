# BJJ GPS

A knowledge graph of Brazilian jiu-jitsu: **35 positions and 230 techniques**, linked as *from position → technique → to position*. Log what you learn and watch your map light up.

- **Log** – type what you learned ("scissor sweep", "rnc", "knee cut"…), pick *Learned / Drilled / Hit it live*, add notes. The node lights up and the map flies to it. Not on the map? Add it as a custom technique.
- **Progress** – overall % of the map, plus by belt tier (Fundamentals → Expert) and by category.
- **GPS** – pick where you are and where you want to go (a position, any submission, or a specific one). It finds the shortest chain of techniques, favouring the ones you already know.
- **Journal** – every log, dated, with notes.

Progress is saved in your browser (localStorage). Use ⋯ → Export / Import to back up or move devices.

## Dev
```
npm i
npm run dev
npm run validate   # checks every graph reference (bun)
```
Data lives in `src/data/positions.ts` and `src/data/techniques.ts`.
