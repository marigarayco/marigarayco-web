import { gsap } from "../core/gsap-setup.js";
import { prefersReducedMotion } from "../core/viewport.js";

export function initTypeWriter(el, { delay = 0.4, charDuration = 0.06 } = {}) {
  const text = el.dataset.text || el.textContent;
  el.textContent = "";

  const cursor = document.createElement("span");
  cursor.className = "type-writer__cursor";
  cursor.setAttribute("aria-hidden", "true");

  if (prefersReducedMotion()) {
    el.textContent = text;
    return;
  }

  const chars = document.createElement("span");
  el.append(chars, cursor);

  gsap.to(
    { i: 0 },
    {
      i: text.length,
      duration: text.length * charDuration,
      delay,
      ease: "none",
      onUpdate: function () {
        chars.textContent = text.slice(0, Math.round(this.targets()[0].i));
      },
    },
  );
}
