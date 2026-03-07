import { runSlidesLint } from "../packages/node/src/index.js";

try {
  const result = await runSlidesLint({
    appRoot: process.cwd(),
    cliArgs: process.argv.slice(2),
  });

  if (result.signal) {
    process.kill(process.pid, result.signal);
  } else {
    process.exitCode = result.code;
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Slides lint failed: ${message}`);
  process.exitCode = 1;
}
