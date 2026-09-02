import { gsap } from "../core/gsap-setup.js";
import { EASE_IN_OUT_QUART } from "../core/easings.js";
import { prefersReducedMotion } from "../core/viewport.js";

// Resolves once every img/video inside el has usable pixels. Firing the
// reveal before that point means the tween plays over a still-loading box —
// on cards with multi-MB media that reads as the animation stalling, since
// nothing actually changes on screen until the decode finishes anyway.
function waitForMedia(el) {
  const media = [...el.querySelectorAll("img, video")];
  if (!media.length) return Promise.resolve();

  return Promise.all(
    media.map((m) => {
      if (m.tagName === "VIDEO") {
        // loadedmetadata only needs dimensions/duration, not a decoded frame —
        // loadeddata never fires on preload="metadata" videos until autoplay
        // actually starts playback, so gating on it left the reveal (and the
        // card) permanently invisible whenever autoplay was blocked or delayed.
        if (m.readyState >= 1) return Promise.resolve();
        return new Promise((resolve) => {
          m.addEventListener("loadedmetadata", resolve, { once: true });
          m.addEventListener("error", resolve, { once: true });
        });
      }
      if (m.complete) return Promise.resolve();
      return new Promise((resolve) => {
        m.addEventListener("load", resolve, { once: true });
        m.addEventListener("error", resolve, { once: true });
      });
    }),
  );
}

// Reveals each element bottom-to-top: fully clipped away at the top edge,
// growing upward until visible. Elements are expected to start clipped via
// CSS (see .project-card__media under .home-page .work-track) so there's no
// flash of the final, unclipped image before this runs.
export function initImageMaskReveal(elements, { duration = 0.9, stagger = 0.08 } = {}) {
  const els = [...elements];
  if (!els.length) return;

  if (prefersReducedMotion()) {
    gsap.set(els, { clipPath: "inset(0% 0% 0% 0%)" });
    return;
  }

  gsap.set(els, { clipPath: "inset(100% 0% 0% 0%)" });

  els.forEach((el, i) => {
    waitForMedia(el).then(() => {
      gsap.to(el, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration,
        delay: i * stagger,
        ease: EASE_IN_OUT_QUART,
      });
    });
  });
}
