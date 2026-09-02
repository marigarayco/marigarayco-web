import "./easings.js";
import { initLenis } from "./lenis-setup.js";
import { initCustomCursor } from "../animations/custom-cursor.js";
import { initPageTransitionExit } from "../animations/page-transition.js";

initLenis();
initCustomCursor();
initPageTransitionExit();

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
