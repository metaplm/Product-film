import { Composition } from "remotion";

import "./fonts";
import { DURATION } from "./videos/verifai-loop/cues";
import { VerifaiLoop, type FilmProps } from "./videos/verifai-loop/Film";

export function Root() {
  return (
    <Composition
      id="VerifaiLoop"
      component={VerifaiLoop}
      width={1920}
      height={1080}
      fps={60}
      durationInFrames={Math.round(DURATION * 60)}
      defaultProps={{ fps: 60, debug: false } satisfies FilmProps}
      calculateMetadata={({ props }) => ({ fps: props.fps, durationInFrames: Math.round(DURATION * props.fps) })}
    />
  );
}
