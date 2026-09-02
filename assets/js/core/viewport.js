export const MEDIA = {
  desktopPointerFine: "(pointer: fine) and (min-width: 1024px)",
  desktopPointerFineMotion:
    "(pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
};

export function prefersReducedMotion() {
  return window.matchMedia(MEDIA.reducedMotion).matches;
}
