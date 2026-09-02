import { gsap } from "../core/gsap-setup.js";
import { EASE_OUT_EXPO } from "../core/easings.js";
import { prefersReducedMotion } from "../core/viewport.js";

// Same technique as row-reveal.js: draws the top border (a CSS var read by
// its ::before, since GSAP can't tween a pseudo-element directly) and only
// once that's underway fades in the year/products text.
export function initSectionDivider(el) {
  if (prefersReducedMotion()) return;

  const text = el.querySelectorAll(
    ".case-study__section-divider__year, .case-study__section-divider__products",
  );

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });

  tl.fromTo(
    el,
    { "--divider-line-scale": 0 },
    { "--divider-line-scale": 1, duration: 0.6, ease: EASE_OUT_EXPO },
  );

  if (text.length) {
    tl.fromTo(
      text,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power1.out", stagger: 0.08 },
      "-=0.25",
    );
  }
}
