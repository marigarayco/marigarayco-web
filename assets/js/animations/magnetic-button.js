import { gsap } from "../core/gsap-setup.js";

export function initMagneticButton(el) {
  const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.5)" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.5)" });

  el.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    xTo((e.clientX - rect.left - rect.width / 2) * 0.4);
    yTo((e.clientY - rect.top - rect.height / 2) * 0.4);
  });

  el.addEventListener("pointerleave", () => {
    xTo(0);
    yTo(0);
  });
}
