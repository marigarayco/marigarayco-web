import { gsap } from "../core/gsap-setup.js";
import { EASE_IN_OUT_QUART } from "../core/easings.js";
import { prefersReducedMotion } from "../core/viewport.js";

const WHEEL_THRESHOLD = 6;
const SWIPE_THRESHOLD = 40;
const DURATION = 0.7;

// Steps through items on wheel/touch input directly (not tied to document scroll
// position), so the reveal reacts on the very next gesture instead of waiting for
// scroll distance to accumulate.
//
// prefers-reduced-motion used to bail out of this whole function, which also
// skipped wiring up the prev/next buttons — meaning those buttons were
// permanently dead (not just un-animated) for anyone with that preference
// set, and the gallery was stuck on the first item forever. Instead, only the
// duration collapses to 0 under reduced motion: every state change below
// still goes through the same tween, it just applies instantly.
export function initMaskReveal(section, items, nav = {}) {
  if (items.length < 2) return;

  const duration = prefersReducedMotion() ? 0 : DURATION;

  const tweens = items.slice(0, -1).map((item) =>
    gsap.to(item, {
      clipPath: "inset(0 100% 0 0)",
      duration,
      ease: EASE_IN_OUT_QUART,
      paused: true,
    }),
  );

  const captions = [...section.querySelectorAll(".work-gallery__info")];

  // Direction mirrors the clip-path wipe: next() clips away to the right (a
  // right-to-left reveal) and its captions travel upward; prev() reverses
  // the wipe to left-to-right, so its captions travel downward to match.
  const exitCaption = (i, direction = "next") => {
    const caption = captions[i];
    if (!caption) return;
    gsap.to(caption, {
      y: direction === "prev" ? 40 : -40,
      opacity: 0,
      duration,
      ease: EASE_IN_OUT_QUART,
    });
  };

  const enterCaption = (i, delay = duration * 0.5, direction = "next") => {
    const caption = captions[i];
    if (!caption) return;
    gsap.fromTo(
      caption,
      { y: direction === "prev" ? -24 : 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: duration * 0.6,
        delay,
        ease: EASE_IN_OUT_QUART,
      },
    );
  };

  let index = 0;
  let locked = false;
  const unlock = () => {
    locked = false;
  };

  const next = () => {
    if (locked) return;
    if (index >= tweens.length) {
      exitCaption(items.length - 1);
      enterCaption(0);
      locked = true;
      tweens.slice(1).forEach((tween) => tween.pause(0));
      tweens[0].eventCallback("onReverseComplete", unlock);
      tweens[0].reverse();
      index = 0;
      return;
    }
    exitCaption(index);
    enterCaption(index + 1);
    locked = true;
    tweens[index].eventCallback("onComplete", unlock);
    tweens[index].play();
    index++;
  };

  const prev = () => {
    if (locked) return;
    if (index <= 0) {
      exitCaption(0, "prev");
      enterCaption(items.length - 1, undefined, "prev");
      locked = true;
      tweens.slice(0, -1).forEach((tween) => tween.pause(tween.duration()));
      const last = tweens[tweens.length - 1];
      last.eventCallback("onComplete", unlock);
      last.play();
      index = tweens.length;
      return;
    }
    exitCaption(index, "prev");
    enterCaption(index - 1, undefined, "prev");
    locked = true;
    index--;
    tweens[index].eventCallback("onReverseComplete", unlock);
    tweens[index].reverse();
  };

  const onWheel = (e) => {
    if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
    e.preventDefault();
    if (e.deltaY > 0) next();
    else prev();
  };

  let touchStartY = null;
  const onTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchStartY === null) return;
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
      if (deltaY > 0) next();
      else prev();
    }
    touchStartY = null;
  };

  section.addEventListener("wheel", onWheel, { passive: false });
  section.addEventListener("touchstart", onTouchStart, { passive: true });
  section.addEventListener("touchend", onTouchEnd, { passive: true });

  nav.prevButton?.addEventListener("click", prev);
  nav.nextButton?.addEventListener("click", next);

  // Instantly jumps to an arbitrary item with no animation — used when the
  // carousel view hands control back and a different item is now the active
  // one, so the gallery reveals the right item instead of whichever was left
  // showing before the view was switched away. Pass showCaption: false to
  // keep the active item's caption hidden (e.g. while its media is still
  // mid-flight) — call revealCaption once it should animate in.
  const setIndex = (newIndex, { showCaption = true } = {}) => {
    locked = false;
    tweens.forEach((tween, i) => {
      tween.pause(i < newIndex ? tween.duration() : 0);
    });
    captions.forEach((caption, i) => {
      if (i !== newIndex) {
        gsap.set(caption, { opacity: 0, y: 0 });
      } else if (showCaption) {
        gsap.set(caption, { opacity: 1, y: 0 });
      } else {
        gsap.set(caption, { opacity: 0, y: 24 });
      }
    });
    index = newIndex;
  };

  return {
    getIndex: () => index,
    setIndex,
    revealCaption: (i) => enterCaption(i, 0),
    destroy: () => {
      section.removeEventListener("wheel", onWheel);
      section.removeEventListener("touchstart", onTouchStart);
      section.removeEventListener("touchend", onTouchEnd);
      nav.prevButton?.removeEventListener("click", prev);
      nav.nextButton?.removeEventListener("click", next);
    },
  };
}
