import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Local files (copied from @fontsource by scripts/copy-fonts.sh) so renders never hit the network.
const faces = [
  ["Inter", "inter-latin-400-normal.woff2", "400"],
  ["Inter", "inter-latin-500-normal.woff2", "500"],
  ["Inter", "inter-latin-600-normal.woff2", "600"],
  ["Inter", "inter-latin-700-normal.woff2", "700"],
  ["JetBrains Mono", "jetbrains-mono-latin-400-normal.woff2", "400"],
  ["JetBrains Mono", "jetbrains-mono-latin-500-normal.woff2", "500"],
] as const;

export const fontsReady = Promise.all(
  faces.map(([family, file, weight]) => loadFont({ family, url: staticFile(`fonts/${file}`), weight })),
);
