import { gsap } from "../core/gsap-setup.js";
import { prefersReducedMotion } from "../core/viewport.js";

export function initPaintReveal(el) {
  if (prefersReducedMotion()) {
    el.style.clipPath = "inset(0 0% 0 0)";
    return;
  }

  gsap.fromTo(
    el,
    { clipPath: "inset(0 100% 0 0)" },
    {
      clipPath: "inset(0 0% 0 0)",
      duration: 1.1,
      ease: "power4.inOut",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    },
  );
}
