import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// In sandboxes that cannot download Remotion's Chrome, point at a local one:
// REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell
if (process.env.REMOTION_BROWSER_EXECUTABLE) Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
