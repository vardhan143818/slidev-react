import type { HighlighterCore } from "shiki";
import { useEffect, useMemo, useState } from "react";
import { createHighlighter } from "shiki";
import { ShikiMagicMove } from "shiki-magic-move/react";

const STEPS = [
  `const message = 'Hello'
const target = 'world'

console.log(message, target)`,
  `const message = 'Hi'
const target = user.name

console.log(\`${"${message}"}, ${"${target}"}!\`)`,
  `function greet(target: string) {
  const message = 'Hi'

  return \`${"${message}"}, ${"${target}"}!\`
}`,
];

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["vitesse-light"],
      langs: ["javascript", "typescript"],
    });
  }

  return highlighterPromise;
}

export function MagicMoveDemo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlighter, setHighlighter] = useState<HighlighterCore>();

  useEffect(() => {
    let cancelled = false;

    const initializeHighlighter = async () => {
      const instance = await getHighlighter();
      if (!cancelled) setHighlighter(instance);
    };

    void initializeHighlighter();

    return () => {
      cancelled = true;
    };
  }, []);

  const code = useMemo(() => STEPS[stepIndex], [stepIndex]);

  if (!highlighter) {
    return (
      <div className="rounded-xl border border-slate-300/70 bg-white/70 p-3 text-sm text-slate-700">
        Preparing highlighter...
      </div>
    );
  }

  return (
    <div className="magic-move-demo grid gap-4">
      <div className="magic-move-demo-shell overflow-hidden rounded-xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <ShikiMagicMove
          lang="ts"
          theme="vitesse-light"
          highlighter={highlighter}
          code={code}
          className="magic-move-demo-pre"
          options={{
            duration: 750,
            stagger: 3,
            delayMove: 0,
            delayEnter: 0,
            delayLeave: 0,
            lineNumbers: false,
            splitTokens: false,
            enhanceMatching: true,
            animateContainer: false,
            containerStyle: false,
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-45"
          onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
          disabled={stepIndex === 0}
        >
          Prev Step
        </button>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-45"
          onClick={() => setStepIndex((index) => Math.min(index + 1, STEPS.length - 1))}
          disabled={stepIndex >= STEPS.length - 1}
        >
          Next Step
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-600 px-3 py-1.5 text-sm text-white"
          onClick={() => setStepIndex(0)}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
