// Final render for the VerifAI loop:  node render.mjs
//
// 1. Cue sheet → synthesized score (-14 LUFS) → beat grid measured from the drums.
// 2. A 240 fps master (4 subframes per 60 fps frame), blended with ffmpeg tmix into 60 fps motion blur.
// 3. Deliverables: H.264 yuv420p CRF 16 (muted loop and with score), VP9 WebM, poster, loop-seam sheet.
//
// Every frame is a pure function of time (Remotion's frame index), so any frame can be rendered alone.
// ffmpeg comes from imageio-ffmpeg through uv: Remotion's own build has no tmix, select or tile.
// Set REMOTION_BROWSER_EXECUTABLE where Remotion cannot download its Chrome.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const root = import.meta.dirname;
const COMPOSITION = "VerifaiLoop";
const NAME = "verifai-loop";
const DURATION = 30;
const POSTER = 27.8;
const CRF = "16";
const concurrency = process.env.CONCURRENCY ?? "4";

const out = join(root, "out", NAME);
mkdirSync(out, { recursive: true });
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: "inherit" });
const ffmpeg = execFileSync("uv", ["run", "--quiet", "--with", "imageio-ffmpeg", "python3", "-c", "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())"], { encoding: "utf8" }).trim();
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? ["--browser-executable", process.env.REMOTION_BROWSER_EXECUTABLE] : [];

// 1. Sound.
run("bun", ["scripts/export-cues.ts"]);
run("uv", ["run", "--quiet", "--with", "numpy", "--with", "pyloudnorm", "--with", "scipy", "python3", "scripts/score.py"]);
run("uv", ["run", "--quiet", "--with", "numpy", "--with", "imageio-ffmpeg", "python3", "scripts/beats.py", "--drums", "public/audio/verifai-loop/drums.wav", "--out", "src/videos/verifai-loop/beats.json"]);
const grid = JSON.parse(readFileSync(join(root, "src/videos/verifai-loop/beats.json"), "utf8"));
if (Math.abs(grid.bpm - 120) > 0.05 || grid.gridCheckMs.spread > 10) throw new Error(`Beat grid off: ${grid.bpm} BPM, spread ${grid.gridCheckMs.spread} ms`);
const score = join(root, "public/audio/verifai-loop/score.wav");

// 2. Master and motion blur. The master is untagged LIMITED range, BT.601: say so, or blacks lift.
const master = join(out, "master-240.mp4");
const blurred = join(out, "blurred-60.mov");
const frames = Math.round(DURATION * 60);
run("npx", ["remotion", "render", "src/index.ts", COMPOSITION, master, "--props", JSON.stringify({ fps: 240 }), "--codec", "h264", "--crf", "8", "--pixel-format", "yuv444p", "--image-format", "png", "--muted", "--concurrency", concurrency, "--log", "error", ...browser]);
run(ffmpeg, [
  "-v", "error", "-y", "-i", master,
  "-vf", "tmix=frames=4:weights='1 1 1 1',select='not(mod(n+1\\,4))',setpts=N/(60*TB),scale=in_range=tv:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv444p10le",
  "-r", "60", "-c:v", "prores_ks", "-profile:v", "4444", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
  blurred,
]);

// 3. Deliverables.
const h264 = ["-c:v", "libx264", "-preset", "slow", "-crf", CRF, "-pix_fmt", "yuv420p", "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv", "-movflags", "+faststart"];
run(ffmpeg, ["-v", "error", "-y", "-i", blurred, ...h264, "-an", join(out, `${NAME}-1080p60.mp4`)]);
run(ffmpeg, ["-v", "error", "-y", "-i", blurred, "-i", score, ...h264, "-c:a", "aac", "-b:a", "256k", "-shortest", join(out, `${NAME}-1080p60-audio.mp4`)]);
run(ffmpeg, ["-v", "error", "-y", "-i", blurred, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30", "-row-mt", "1", "-pix_fmt", "yuv420p", "-an", join(out, `${NAME}-1080p60.webm`)]);
run(ffmpeg, ["-v", "error", "-y", "-ss", String(POSTER), "-i", blurred, "-frames:v", "1", "-q:v", "2", join(out, "poster.jpg")]);
run(ffmpeg, ["-v", "error", "-y", "-stream_loop", "1", "-i", join(out, `${NAME}-1080p60.mp4`), "-vf", `select='between(n\\,${frames - 8}\\,${frames + 7})',scale=320:180,tile=8x2`, "-frames:v", "1", "-fps_mode", "vfr", join(out, "loop-seam.png")]);

rmSync(master);
rmSync(blurred);
for (const file of [`${NAME}-1080p60.mp4`, `${NAME}-1080p60-audio.mp4`, `${NAME}-1080p60.webm`, "poster.jpg"]) {
  console.log(`${file}: ${(statSync(join(out, file)).size / 1e6).toFixed(1)} MB`);
}
