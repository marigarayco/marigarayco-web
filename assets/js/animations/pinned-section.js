import { ScrollTrigger } from "../core/gsap-setup.js";
import { prefersReducedMotion } from "../core/viewport.js";

export function initPinnedSection(wrapper, mediaEl) {
  if (prefersReducedMotion()) return;

  ScrollTrigger.create({
    trigger: wrapper,
    start: "top top",
    end: "bottom bottom",
    pin: mediaEl,
    pinSpacing: false,
  });
}
