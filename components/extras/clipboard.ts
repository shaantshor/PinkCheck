'use client';

import { useSyncExternalStore } from 'react';

/** Copy text; returns true on success. Works on http/localhost and older browsers via a textarea fallback. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

const noopSubscribe = () => () => {};
/** SSR-safe: false on the server and first render, real value after hydration. */
export function useCanShare(): boolean {
  return useSyncExternalStore(noopSubscribe, canNativeShare, () => false);
}
