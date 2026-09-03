import "./easings.js";
import { ScrollTrigger } from "./gsap-setup.js";
import { initLenis } from "./lenis-setup.js";
import { initCustomCursor } from "../animations/custom-cursor.js";
import { initPageTransitionExit } from "../animations/page-transition.js";

initLenis();
initCustomCursor();
initPageTransitionExit();

// Most ScrollTrigger instances are created synchronously on load, before the
// webfont swaps in — the resulting reflow shifts everything below the fold,
// leaving every trigger's start/end measured against the pre-swap layout.
// That desync is what made pinned/scrubbed sections (e.g. sobre-mi.html's
// hero-to-content fade) look "stuck" mid-transition. Re-measuring once the
// font is actually in is the standard fix.
document.fonts.ready.then(() => ScrollTrigger.refresh());

document.querySelectorAll("video[data-start]").forEach((video) => {
  const start = parseFloat(video.dataset.start) || 0;
  let lastTime = start;
  const seekToStart = () => {
    try {
      video.currentTime = start;
    } catch (e) {}
  };
  if (video.readyState >= 1) seekToStart();
  else video.addEventListener("loadedmetadata", seekToStart, { once: true });
  video.addEventListener("timeupdate", () => {
    if (video.currentTime < lastTime - 1) seekToStart();
    lastTime = video.currentTime;
  });
});
