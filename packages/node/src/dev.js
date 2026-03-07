import { createServer, mergeConfig } from "vite";
import { createSlidesViteConfig } from "./slides/build/createSlidesViteConfig.ts";
import {
  createSuccessResult,
  parseBooleanFlag,
  parsePositiveIntegerOption,
  resolveSlidesCommandContext,
} from "./context.js";

function readOptionValue(argv, index, optionName) {
  const current = argv[index];
  if (current.startsWith(`${optionName}=`)) {
    return {
      value: current.slice(optionName.length + 1),
      nextIndex: index,
    };
  }

  const nextValue = argv[index + 1];
  if (!nextValue || nextValue.startsWith("--")) {
    throw new Error(`Missing value for ${optionName}.`);
  }

  return {
    value: nextValue,
    nextIndex: index + 1,
  };
}

function parseDevArgs(argv) {
  let slidesFile;
  let host;
  let port;
  let open;
  let strictPort;
  let base;
  let mode;

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];
    if (!entry.startsWith("--")) {
      if (!slidesFile) {
        slidesFile = entry;
        continue;
      }

      throw new Error(`Unknown dev argument "${entry}".`);
    }

    if (entry === "--open") {
      open = true;
      continue;
    }

    if (entry === "--strictPort") {
      strictPort = true;
      continue;
    }

    if (entry === "--host" || entry.startsWith("--host=")) {
      const result = readOptionValue(argv, index, "--host");
      host = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry === "--port" || entry.startsWith("--port=")) {
      const result = readOptionValue(argv, index, "--port");
      port = parsePositiveIntegerOption("--port", result.value);
      index = result.nextIndex;
      continue;
    }

    if (entry === "--base" || entry.startsWith("--base=")) {
      const result = readOptionValue(argv, index, "--base");
      base = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry === "--mode" || entry.startsWith("--mode=")) {
      const result = readOptionValue(argv, index, "--mode");
      mode = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry === "--open=false" || entry === "--open=true") {
      open = parseBooleanFlag(entry.slice("--open=".length));
      continue;
    }

    if (entry === "--strictPort=false" || entry === "--strictPort=true") {
      strictPort = parseBooleanFlag(entry.slice("--strictPort=".length));
      continue;
    }

    throw new Error(`Unknown dev option "${entry}".`);
  }

  return {
    slidesFile,
    host,
    port,
    open,
    strictPort,
    base,
    mode,
  };
}

export async function startSlidesDevServer(options = {}) {
  const parsedArgs = parseDevArgs(options.viteArgs ?? []);
  const context = resolveSlidesCommandContext({
    ...options,
    slidesFile: options.slidesFile ?? parsedArgs.slidesFile,
  });
  const server = await createServer(
    mergeConfig(createSlidesViteConfig(context), {
      configFile: false,
      clearScreen: false,
      mode: parsedArgs.mode,
      base: parsedArgs.base,
      server: {
        host: parsedArgs.host,
        port: parsedArgs.port,
        open: parsedArgs.open,
        strictPort: parsedArgs.strictPort,
      },
    }),
  );

  await server.listen();

  if (options.printUrls !== false) {
    server.printUrls();
  }

  return server;
}

function waitForServerShutdown(server) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const signalHandlers = new Map();

    const cleanup = async (signal) => {
      if (settled) return;
      settled = true;

      for (const [eventName, handler] of signalHandlers) {
        process.off(eventName, handler);
      }

      try {
        await server.close();
        resolve({
          code: 0,
          signal,
        });
      } catch (error) {
        reject(error);
      }
    };

    for (const signal of ["SIGINT", "SIGTERM"]) {
      const handler = () => {
        void cleanup(signal);
      };
      signalHandlers.set(signal, handler);
      process.on(signal, handler);
    }
  });
}

export async function runSlidesDev(options = {}) {
  const server = await startSlidesDevServer(options);
  return waitForServerShutdown(server);
}

export async function stopSlidesDevServer(server) {
  await server.close();
}

export { createSuccessResult };
