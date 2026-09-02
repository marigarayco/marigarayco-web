import { gsap, ScrollTrigger } from "../core/gsap-setup.js";
import { MEDIA } from "../core/viewport.js";

// Scales `inner` down (never up) so its natural height fits within the
// viewport height. This must run on a plain descendant, not on whatever
// ancestor GSAP pins — ScrollTrigger snapshots/restores a pinned element's
// own inline styles on every refresh(), which silently reverted a
// max-height set directly on it. Capping `inner`'s own max-height instead
// works because max-height genuinely constrains a box's layout size (unlike
// a transform, which only affects paint), so the pinned ancestor's natural
// auto-height shrinks to match without GSAP ever needing to know about it.
export function initFitToViewport(inner) {
  const mm = gsap.matchMedia();

  mm.add(MEDIA.desktopPointerFineMotion, () => {
    const fit = () => {
      inner.style.transform = "none";
      inner.style.maxHeight = "none";
      const naturalHeight = inner.offsetHeight;
      const ratio = Math.min(1, window.innerHeight / naturalHeight);

      inner.style.maxHeight = `${naturalHeight * ratio}px`;
      inner.style.overflow = "hidden";
      inner.style.transform = ratio < 1 ? `scale(${ratio})` : "none";
      ScrollTrigger.refresh();
    };

    fit();

    let raf;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      inner.style.maxHeight = "";
      inner.style.overflow = "";
      inner.style.transform = "";
    };
  });

  return mm;
}
