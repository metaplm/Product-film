#!/bin/sh
# One still per beat (mid-beat, 60 fps frames) and a 10x6 contact sheet at phone width (320 px tiles).
# Usage: sh scripts/beat-sheet-frames.sh <out dir>
set -e
cd "$(dirname "$0")/.."
OUT=$1
FRAMES=$(python3 -c "print(' '.join(str(round((k*0.5+0.25)*60)) for k in range(60)))")
bun scripts/stills.ts "$OUT" $FRAMES --composition VerifaiLoop > /dev/null
FF=$(uv run --quiet --with imageio-ffmpeg python3 -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())")
ARGS=""; for f in $FRAMES; do ARGS="$ARGS -i $OUT/f$f.png"; done
$FF -v error -y $ARGS -filter_complex "$(i=0; for f in $FRAMES; do printf "[$i:v]scale=320:180[v$i];"; i=$((i+1)); done)$(i=0; for f in $FRAMES; do printf "[v$i]"; i=$((i+1)); done)xstack=inputs=60:layout=$(python3 -c "print('|'.join(f'{(k%10)*324}_{(k//10)*184}' for k in range(60)))"):fill=0x333333" "$OUT/beats.png"
echo "$OUT/beats.png"
