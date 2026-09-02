import { gsap } from "../core/gsap-setup.js";
import { prefersReducedMotion } from "../core/viewport.js";

export function initPhotoStack(section) {
  const photos = section.querySelectorAll(".case-study__stack-photo");
  if (!photos.length) return;

  const finalRotation = (el) => parseFloat(el.dataset.rotate) || 0;
  const finalScale = (el) => parseFloat(el.dataset.scale) || 1;

  if (prefersReducedMotion()) {
    photos.forEach((el) =>
      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        rotation: finalRotation(el),
        scale: finalScale(el),
        opacity: 1,
      }),
    );
    return;
  }

  photos.forEach((el) => {
    gsap.set(el, {
      xPercent: -50,
      yPercent: -50,
      rotation: finalRotation(el),
      scale: finalScale(el),
      opacity: 0,
    });
  });

  gsap.to(photos, {
    opacity: 1,
    duration: 0,
    stagger: 0.5,
    scrollTrigger: {
      trigger: section,
      start: "top 75%",
      once: true,
    },
  });
}
