import { gsap } from "../core/gsap-setup.js";
import { prefersReducedMotion } from "../core/viewport.js";

export function initScrollParallax(elOrEls, { mode = "text", speed = 0.3, distance } = {}) {
  if (prefersReducedMotion()) return;

  const els = elOrEls instanceof Element ? [elOrEls] : Array.from(elOrEls);
  if (!els.length) return;

  distance ??= (mode === "background" ? 120 : 60) * speed;

  gsap.fromTo(
    els,
    { yPercent: -distance },
    {
      yPercent: distance,
      ease: "none",
      scrollTrigger: {
        trigger: els[0].parentElement || els[0],
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );
}
