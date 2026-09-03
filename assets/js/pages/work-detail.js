import "../core/common.js";
import { gsap, ScrollTrigger } from "../core/gsap-setup.js";
import { prefersReducedMotion } from "../core/viewport.js";
import { initPaintReveal } from "../animations/paint-reveal.js";
import { initPinnedSection } from "../animations/pinned-section.js";
import { initScrollParallax } from "../animations/scroll-parallax.js";
import { initPageTransitionEnter } from "../animations/page-transition.js";
import { initPhotoStack } from "../animations/photo-stack.js";
import { initRowReveal } from "../animations/row-reveal.js";
import { initSectionDivider } from "../animations/section-divider.js";

initPageTransitionEnter();

const cover = document.querySelector(".case-study__cover");
if (cover) initPaintReveal(cover);

const heroNoise = document.querySelector(".case-study__hero-noise");
const heroCopy = document.querySelector(".case-study__header-copy");
const heroSection = document.querySelector(".case-study__header--hero");
// Below 768px the hero stops being a sticky/pinned overlay (see
// components.css's mobile reflow) — .case-study__header--hero becomes
// display: contents there, which has no box for ScrollTrigger to measure,
// and there's no overlaid text to scroll away from anyway.
if (heroSection && !prefersReducedMotion() && window.matchMedia("(min-width: 768px)").matches) {
  if (heroNoise) {
    gsap.to(heroNoise, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  if (heroCopy) {
    gsap.to(heroCopy, {
      yPercent: -400,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  const heroFrame = document.querySelector(".case-study__hero-frame");
  const heroFrameImg = document.querySelector(".case-study__hero-frame-img");
  if (heroFrame && heroFrameImg) {
    const setupFrameScroll = () => {
      const displayedHeight =
        (heroFrame.clientWidth / heroFrameImg.naturalWidth) * heroFrameImg.naturalHeight;
      const distance = (displayedHeight - heroFrame.clientHeight) * 0.85;
      if (distance > 0) {
        gsap.to(heroFrameImg, {
          y: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    };
    if (heroFrameImg.complete) setupFrameScroll();
    else heroFrameImg.addEventListener("load", setupFrameScroll, { once: true });
  }
}

const heroPinParallax = document.querySelector(".case-study__hero-pin--rows-parallax");
const heroPinIntro = heroPinParallax?.nextElementSibling;
const heroRows =
  heroPinIntro?.classList.contains("case-study__intro") ? heroPinIntro.nextElementSibling : null;
if (
  heroPinParallax &&
  heroPinIntro &&
  heroRows?.classList.contains("case-study__rows") &&
  !prefersReducedMotion() &&
  window.matchMedia("(min-width: 768px)").matches
) {
  // Extend the pin by exactly the intro's own height, and pull the intro up by
  // that same extra amount, so the hero only releases once .case-study__rows
  // has reached the top — no dead pinned time, no bleed into what follows.
  const introHeight = Math.round(heroPinIntro.getBoundingClientRect().height);
  heroPinParallax.style.height = `calc(200vh + ${introHeight}px)`;
  heroPinIntro.style.marginTop = `calc(-100vh - ${introHeight}px)`;

  // heroCopy's own tween above (yPercent: -400, relative to its own small
  // height) doesn't move it far enough to actually clear the viewport, so it
  // parks near the top edge and clashes with .case-study__intro sliding up
  // behind it. Retarget it to a pixel distance that fully clears the screen,
  // still finishing within the hero's own first 100vh (same short window) so
  // it's long gone before the intro becomes prominent.
  if (heroCopy) {
    gsap.killTweensOf(heroCopy);
    const exitDistance = Math.round(heroCopy.getBoundingClientRect().bottom) + 40;
    gsap.to(heroCopy, {
      y: -exitDistance,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // As .case-study__rows slides up into view, pan the still-pinned hero video
  // upward too, but at a fraction of that speed — a classic parallax cue.
  const heroBgVideo = heroPinParallax.querySelector(".case-study__hero-bg-video");
  if (heroBgVideo) {
    gsap.fromTo(
      heroBgVideo,
      { yPercent: 0 },
      {
        yPercent: -40,
        ease: "none",
        scrollTrigger: {
          trigger: heroRows,
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      },
    );
  }
}

document.querySelectorAll(".case-study__row").forEach(initRowReveal);
document.querySelectorAll(".case-study__section-divider").forEach(initSectionDivider);

const photoStack = document.querySelector(".case-study__stack");
if (photoStack) initPhotoStack(photoStack);

const wideVideo = document.querySelector(".case-study__wide-video video");
if (wideVideo) initScrollParallax(wideVideo, { mode: "background", distance: 10 });

const pinned = document.querySelector(".pinned-section");
if (pinned) {
  const media = pinned.querySelector(".pinned-section__media");
  initPinnedSection(pinned, media);

  pinned.querySelectorAll("[data-parallax]").forEach((el) => {
    initScrollParallax(el, { mode: el.dataset.parallax });
  });
}
