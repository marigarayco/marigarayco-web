import { gsap, SplitText } from "../core/gsap-setup.js";
import { EASE_OUT_EXPO } from "../core/easings.js";
import { prefersReducedMotion } from "../core/viewport.js";

// Draws the row's top border (a CSS var read by its ::before, since GSAP
// can't tween a pseudo-element directly) and only once that's underway
// reveals the label/content word by word — so each row visibly builds
// itself as it enters instead of just appearing. Each piece is its own
// scrollTrigger tween rather than children of one timeline: nested timeline
// tweens only default immediateRender on the first one, so the fade
// wouldn't have rendered hidden ahead of time and would've just popped in.
export function initRowReveal(row) {
  if (prefersReducedMotion()) return;

  const scrollTrigger = { trigger: row, start: "top 80%", toggleActions: "play none none none" };

  gsap.fromTo(
    row,
    { "--row-line-scale": 0 },
    { "--row-line-scale": 1, duration: 0.6, ease: EASE_OUT_EXPO, scrollTrigger },
  );

  const textEls = [row.querySelector(".case-study__row-label"), row.querySelector(".case-study__row-content")].filter(
    Boolean,
  );
  if (!textEls.length) return;

  document.fonts.ready.then(() => {
    const words = textEls.flatMap(
      (el) => SplitText.create(el, { type: "words", mask: "words", aria: "none" }).words,
    );
    if (!words.length) return;

    gsap.fromTo(
      words,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        delay: 0.35,
        ease: EASE_OUT_EXPO,
        stagger: 0.02,
        scrollTrigger,
      },
    );
  });
}
