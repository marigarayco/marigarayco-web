import "../core/common.js";
import { gsap, ScrollTrigger } from "../core/gsap-setup.js";
import { MEDIA, prefersReducedMotion } from "../core/viewport.js";
import { initScrollWordReveal } from "../animations/split-text-reveal.js";
import { initMagneticButton } from "../animations/magnetic-button.js";
import { initTypeWriter } from "../animations/type-writer.js";
import { initHorizontalScroll } from "../animations/horizontal-scroll.js";

const heroGreeting = document.querySelector("[data-typewriter]");
if (heroGreeting) initTypeWriter(heroGreeting);

const heroPin = document.querySelector(".about-hero-pin");
const heroFade = document.querySelector(".about-hero__fade");
const heroDivider = document.querySelector(".divider");
if (heroPin && heroFade && heroDivider) {
  gsap.fromTo(
    heroFade,
    { opacity: 0 },
    {
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: heroPin,
        start: "top top",
        endTrigger: heroDivider,
        end: "top top",
        scrub: true,
      },
    },
  );
}

const dividerTitle = document.querySelector(".divider .page-header__title");
if (dividerTitle) initScrollWordReveal(dividerTitle);

const gridMedia = document.querySelector(".about-grid__media");
const skillsList = document.querySelector(".skills-list");
const gridMediaImg = gridMedia?.querySelector("img");

if (gridMediaImg && !prefersReducedMotion()) {
  gsap.fromTo(
    gridMediaImg,
    { filter: "blur(28px)", scale: 1.15 },
    {
      filter: "blur(0px)",
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: gridMedia,
        start: "top 85%",
        end: "top 15%",
        scrub: true,
      },
    },
  );
}

if (gridMedia && skillsList) {
  const mm = gsap.matchMedia();
  mm.add(MEDIA.desktopPointerFineMotion, () => {
    // GSAP's pin freezes an element exactly at its own current viewport
    // position when the trigger fires — it can't "snap" a tall ancestor to
    // the top from wherever it happens to be mid-scroll. So instead of
    // trying to pin the whole (mostly off-screen by this point) section,
    // each half of what's actually still visible gets pinned on its own:
    // the media keeps going instead of releasing, and skills-list — which
    // really is at the top right then — picks up its own pin for the same
    // extra viewport's worth of scroll. .work-section--rise's negative
    // margin (components.css) is what makes #trabajo ride up over both of
    // them during that shared window.
    const getSkillsTop = () => skillsList.getBoundingClientRect().top + window.scrollY;

    const mediaPin = ScrollTrigger.create({
      trigger: gridMedia,
      start: "top top",
      end: () => getSkillsTop() + window.innerHeight,
      pin: true,
    });

    const skillsPin = ScrollTrigger.create({
      trigger: skillsList,
      start: "top top",
      end: () => `+=${window.innerHeight}`,
      pin: true,
    });

    return () => {
      mediaPin.kill();
      skillsPin.kill();
    };
  });
}

const workSection = document.querySelector("#trabajo, #work");
const workWrapper = document.querySelector(".work-scroll");
const workTrack = document.querySelector(".work-track");
if (workWrapper && workTrack) {
  initHorizontalScroll(workWrapper, workTrack, { pinTarget: workSection });
}

document.querySelectorAll(".email-link").forEach(initMagneticButton);
