# Verifai films

Product films for Verifai, made with the [product-film skill](https://github.com/Rieranthony/product-film-skill) and Remotion.

- `BRAND.md`: the video kit (brief, colors, type, claims).
- `verifai-loop-prompt.md`, `beat-sheet.md`: the 30 s landing loop.
- `src/videos/verifai-loop/`: the film (cues, layout, acts).

```bash
npm install                      # also copies fonts into public/fonts
npm run studio                   # preview
bun scripts/stills.ts out/review/v1 300 900 --composition VerifaiLoop
npm run render                   # 240 fps master -> out/verifai-loop/
uv run --with numpy --with imageio-ffmpeg python3 scripts/verify.py out/verifai-loop --duration 30 --bg 10,11,13
bun scripts/beat-sheet.ts        # regenerate beat-sheet.md
```

Remotion has its own license: free for individuals and small teams, a company license for larger companies (remotion.dev/license).
