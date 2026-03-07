import { useEffect } from "react";
import { useReveal } from "../reveal/RevealContext";
import { resolveNavigationShortcutAction } from "./keyboardShortcuts";
import { useSlidesNavigation } from "./useSlidesNavigation";

function isTypingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function KeyboardController({
  enabled = true,
  onAdvance,
  onRetreat,
  onFirst,
  onLast,
}: {
  enabled?: boolean;
  onAdvance?: () => void;
  onRetreat?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
}) {
  const navigation = useSlidesNavigation();
  const reveal = useReveal();

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingElement(event.target)) return;

      if (typeof document !== "undefined" && document.body.dataset.presenterOverlay === "open")
        return;

      const action = resolveNavigationShortcutAction({
        key: event.key,
        shiftKey: event.shiftKey,
      });
      if (!action) return;

      event.preventDefault();

      if (action === "advance") {
        if (onAdvance) onAdvance();
        else if (reveal) reveal.advance();
        else navigation.next();
        return;
      }

      if (action === "retreat") {
        if (onRetreat) onRetreat();
        else if (reveal) reveal.retreat();
        else navigation.prev();
        return;
      }

      if (action === "first") {
        if (onFirst) onFirst();
        else navigation.first();
        return;
      }

      if (action === "last") {
        event.preventDefault();
        if (onLast) onLast();
        else navigation.last();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, navigation, onAdvance, onFirst, onLast, onRetreat, reveal]);

  return null;
}
