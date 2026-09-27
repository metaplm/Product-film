import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { cue, DURATION, grid } from "../src/videos/verifai-loop/cues";

/** Writes the cue sheet as JSON for the score synthesizer (scripts/score.py). */
const out = join(resolve(import.meta.dirname, ".."), "public/audio/verifai-loop/cues.json");
writeFileSync(out, JSON.stringify({ duration: DURATION, grid, cue }, null, 2));
console.log(out);
