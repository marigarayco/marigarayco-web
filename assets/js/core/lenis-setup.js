import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap-setup.js";

let lenisInstance = null;

export function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });
  lenisInstance = lenis;

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// Lenis keeps driving the scroll position on its own rAF loop toward an
// internal target — a raw window.scrollTo() bypasses that target, so on the
// next tick Lenis silently overwrites it back. Anything that needs to jump
// the scroll position programmatically has to go through Lenis itself.
export function getLenis() {
  return lenisInstance;
}
