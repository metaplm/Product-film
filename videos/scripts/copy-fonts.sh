#!/bin/sh
# Copies the fonts the films use from node_modules into public/fonts (gitignored).
set -e
cd "$(dirname "$0")/.."
mkdir -p public/fonts
for w in 400 500 600 700; do cp node_modules/@fontsource/inter/files/inter-latin-$w-normal.woff2 public/fonts/; done
for w in 400 500; do cp node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-$w-normal.woff2 public/fonts/; done
