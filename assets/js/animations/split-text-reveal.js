import { gsap, SplitText } from "../core/gsap-setup.js";
import { EASE_OUT_EXPO } from "../core/easings.js";
import { prefersReducedMotion } from "../core/viewport.js";

export function initScrollWordReveal(el, { start = "top 80%", end = "top 30%" } = {}) {
  if (prefersReducedMotion()) return;

  document.fonts.ready.then(() => {
    const split = SplitText.create(el, { type: "words" });

    gsap.set(split.words, { opacity: 0.15 });
    gsap.to(split.words, {
      opacity: 1,
      stagger: 0.05,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start,
        end,
        scrub: true,
      },
    });
  });
}

export function initSplitTextReveal(
  el,
  { type = "words", delay = 0, duration = 1, yPercent = 110, stagger = 0.02, scrollTrigger = null } = {},
) {
  if (prefersReducedMotion()) {
    el.classList.remove("reveal-on-load");
    return;
  }

  document.fonts.ready.then(() => {
    const split = SplitText.create(el, { type, mask: type });
    const targets = split[type];

    gsap.set(targets, { yPercent, opacity: 0 });
    el.classList.remove("reveal-on-load");
    gsap.to(targets, {
      yPercent: 0,
      opacity: 1,
      duration,
      delay,
      stagger,
      ease: EASE_OUT_EXPO,
      ...(scrollTrigger && {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
          ...scrollTrigger,
        },
      }),
    });
  });
}
