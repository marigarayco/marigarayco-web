import { gsap, ScrollTrigger } from "../core/gsap-setup.js";
import { MEDIA } from "../core/viewport.js";

// Shrinks the cards inside `inner` down (never up) so its natural height,
// plus whatever vertical space its siblings (e.g. the section title above it
// and the CTA below it) already take up, fits within the viewport height.
// Unlike a transform on `inner` itself, this drives real layout size (via
// the --work-card-scale custom property consumed in components.css), so
// `inner` keeps its own full width instead of shrinking and centering with
// dead space on either side — cards that still don't fit simply overflow
// past it, same as at full size.
export function initFitToViewport(inner) {
  const mm = gsap.matchMedia();

  mm.add(MEDIA.desktopPointerFineMotion, () => {
    const siblingsHeight = () =>
      [...inner.parentElement.children]
        .filter((el) => el !== inner)
        .reduce((sum, el) => sum + el.offsetHeight, 0);

    const fit = () => {
      inner.style.setProperty("--work-card-scale", "1");
      const naturalHeight = inner.offsetHeight;
      const availableHeight = window.innerHeight - siblingsHeight();
      const ratio = Math.min(1, Math.max(0.1, availableHeight / naturalHeight));

      inner.style.setProperty("--work-card-scale", ratio < 1 ? String(ratio) : "1");
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
      inner.style.removeProperty("--work-card-scale");
    };
  });

  return mm;
}
