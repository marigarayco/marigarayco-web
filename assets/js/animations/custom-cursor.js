import { gsap } from "../core/gsap-setup.js";

const MEDIA_FINE_POINTER = "(pointer: fine)";
const CLICKABLE_SELECTOR = "a, button, [role='button'], input, select, textarea, label, summary, [onclick]";

export function initCustomCursor() {
  if (!window.matchMedia(MEDIA_FINE_POINTER).matches) return;

  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.innerHTML = '<span class="custom-cursor__dot"></span>';
  document.body.appendChild(cursor);
  document.documentElement.classList.add("has-custom-cursor");

  const setX = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3.out" });
  const setY = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3.out" });

  window.addEventListener("mousemove", (e) => {
    setX(e.clientX);
    setY(e.clientY);
    cursor.classList.add("is-visible");
    cursor.classList.toggle("is-active", Boolean(e.target?.closest?.(CLICKABLE_SELECTOR)));
  });

  document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
}
