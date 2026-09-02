import "../core/common.js";
import { initSplitTextReveal } from "../animations/split-text-reveal.js";
import { initWordSwap } from "../animations/word-swap.js";
import { initHorizontalScroll } from "../animations/horizontal-scroll.js";
import { initFitToViewport } from "../animations/fit-to-viewport.js";
import { initScrollParallax } from "../animations/scroll-parallax.js";
import { initMagneticButton } from "../animations/magnetic-button.js";
import { initImageMaskReveal } from "../animations/image-mask-reveal.js";

const swapWord = document.querySelector(".hero__word-swap");
if (swapWord) initWordSwap(swapWord);

document
  .querySelectorAll("#contacto .page-header__title")
  .forEach((el) => initSplitTextReveal(el, { type: "words" }));

const firstSectionTitle = document.querySelector("#trabajo .page-header__title, #work .page-header__title");
if (firstSectionTitle)
  initSplitTextReveal(firstSectionTitle, {
    type: "words",
    duration: 1.4,
    yPercent: 160,
    stagger: 0.08,
  });

document
  .querySelectorAll("#sobre-mi .page-header__title, #about .page-header__title")
  .forEach((el) =>
    initSplitTextReveal(el, {
      type: "words",
      duration: 1.4,
      yPercent: 160,
      stagger: 0.08,
      scrollTrigger: {},
    }),
  );

const workSection = document.querySelector("#trabajo, #work");
const workWrapper = document.querySelector(".work-scroll");
const workTrack = document.querySelector(".work-track");
if (workWrapper) initFitToViewport(workWrapper);
if (workSection && workWrapper && workTrack)
  initHorizontalScroll(workWrapper, workTrack, { pinTarget: workSection });

initImageMaskReveal(document.querySelectorAll(".work-track .project-card__media"));

const parallaxGroups = new Map();
document.querySelectorAll(".about-grid [data-parallax]").forEach((el) => {
  const group = parallaxGroups.get(el.parentElement) || [];
  group.push(el);
  parallaxGroups.set(el.parentElement, group);
});
parallaxGroups.forEach((els) => {
  initScrollParallax(els, { mode: els[0].dataset.parallax });
});

document.querySelectorAll(".email-link").forEach(initMagneticButton);
