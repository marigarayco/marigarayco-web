import { gsap } from "../core/gsap-setup.js";
import { EASE_OUT_EXPO } from "../core/easings.js";
import { prefersReducedMotion } from "../core/viewport.js";

export function initWordSwap(el, { revealDelay = 0.3, holdDuration = 1.6 } = {}) {
  const words = (el.dataset.words || "")
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length < 2) return;

  const [firstWord, nextWord] = words;
  el.textContent = firstWord;

  if (prefersReducedMotion()) {
    el.textContent = nextWord;
    return;
  }

  gsap.set(el, { yPercent: 110, opacity: 0 });

  gsap
    .timeline({ delay: revealDelay })
    .to(el, { yPercent: 0, opacity: 1, duration: 1, ease: EASE_OUT_EXPO })
    .to(
      el,
      { yPercent: -100, opacity: 0, duration: 0.45, ease: EASE_OUT_EXPO },
      `+=${holdDuration}`,
    )
    .call(() => {
      el.textContent = nextWord;
    })
    .fromTo(
      el,
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.45, ease: EASE_OUT_EXPO },
    );
}
