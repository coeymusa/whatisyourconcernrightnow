"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Focus trap + restoration for modal dialogs.
 *
 * On open: store the previously-focused element (the trigger) and move
 * focus into the dialog container. While open, trap Tab/Shift-Tab so it
 * cycles within the dialog and Escape closes it. On close: restore focus
 * to the original trigger.
 *
 * The dialog container should have `tabIndex={-1}` so it can be focused
 * as a fallback when no focusable child exists.
 */
export function useFocusTrap<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  open: boolean,
  onClose?: () => void,
) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;

    triggerRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    // Move focus into the dialog. Prefer the first focusable element;
    // fall back to the container itself.
    const focusables = getFocusableEls(container);
    const target = focusables[0] ?? container;
    queueMicrotask(() => target.focus({ preventScroll: true }));

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && onClose) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const els = getFocusableEls(container!);
      if (els.length === 0) {
        e.preventDefault();
        return;
      }
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !container!.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (active === last || !container!.contains(active))
      ) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      const trigger = triggerRef.current;
      if (trigger && typeof trigger.focus === "function") {
        try {
          trigger.focus({ preventScroll: true });
        } catch {
          /* ignore */
        }
      }
      triggerRef.current = null;
    };
  }, [open, containerRef, onClose]);
}

function getFocusableEls(root: HTMLElement): HTMLElement[] {
  const sel =
    'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll<HTMLElement>(sel)).filter(
    (el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null,
  );
}
