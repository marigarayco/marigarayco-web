import "../core/common.js";
import { gsap } from "../core/gsap-setup.js";
import { initMaskReveal } from "../animations/mask-reveal.js";
import { initHorizontalScroll } from "../animations/horizontal-scroll.js";
import { MEDIA } from "../core/viewport.js";

const section = document.querySelector(".work-gallery");
const items = document.querySelectorAll(".work-gallery__item");
const prevButton = document.querySelector(".work-gallery__nav--prev");
const nextButton = document.querySelector(".work-gallery__nav--next");
const maskReveal =
  section && items.length ? initMaskReveal(section, [...items], { prevButton, nextButton }) : null;

const pageShell = document.querySelector(".page-shell");
const viewToggle = document.querySelector(".view-toggle");
const carousel = document.querySelector(".work-scroll--toggle");
const carouselTrack = carousel?.querySelector(".work-track");
const cards = carouselTrack ? [...carouselTrack.children] : [];
const siteHeader = document.querySelector(".site-header");
const siteFooter = document.querySelector(".work-gallery__footer");

// The exact same box element lives in either the gallery item or the
// carousel card at any given time — never copied, never left behind — so a
// playing video keeps its frame/currentTime and the FLIP animates one
// continuous element instead of matching two different ones.
const mediaBoxes = [...items].map((item) => item.querySelector(".work-gallery__media"));
const captions = [...document.querySelectorAll(".work-gallery__captions .work-gallery__info")];

// In the fullscreen gallery every item sits stacked full-viewport (only
// z-index tells them apart), so all videos there are always "visible" and
// this observer is a no-op for them. In the carousel, though, cards sit
// side by side across a track that can be several screens wide — without
// this, every project's autoplay video keeps decoding even while scrolled
// far off-screen, which is what made the horizontal scrub janky/stutter to
// a near-freeze once a few videos were playing at once.
const videosToObserve = mediaBoxes.map((box) => box.querySelector("video")).filter(Boolean);
if (videosToObserve.length) {
  const videoVisibility = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.play().catch(() => {});
        else entry.target.pause();
      });
    },
    { threshold: 0 },
  );
  videosToObserve.forEach((video) => videoVisibility.observe(video));
}

const relocateToCard = (i) => {
  const box = mediaBoxes[i];
  cards[i]?.prepend(box);
  box.classList.remove("work-gallery__media");
  box.classList.add("project-card__media");
};

const relocateToItem = (i) => {
  const box = mediaBoxes[i];
  items[i]?.prepend(box);
  box.classList.remove("project-card__media");
  box.classList.add("work-gallery__media");
};

if (pageShell && viewToggle && carousel && carouselTrack) {
  const MORPH_DURATION = 0.6;
  // Nav arrows rely on a translateY(-50%) CSS transform for centering — animating
  // "scale" on them through GSAP would clobber that, so they only fade. The site
  // header and the overlay footer never animate — they stay put across views.
  const fadeOnlyTargets = [prevButton, nextButton].filter(Boolean);
  let carouselScroll = null;
  let transitioning = false;

  const setToggleState = (toCarousel) => {
    viewToggle.setAttribute("aria-pressed", String(toCarousel));
    const label = viewToggle.dataset[toCarousel ? "labelCarousel" : "labelGallery"];
    viewToggle.setAttribute("aria-label", label);
    viewToggle.setAttribute("data-tooltip", label);
  };

  const finish = () => {
    transitioning = false;
    viewToggle.disabled = false;
  };

  // Which card currently sits centered in the carousel — used when jumping
  // back to full screen so the right item morphs, even after the user has
  // scrolled the carousel manually.
  const getCenteredCardIndex = () => {
    const centerX = window.innerWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  };

  // A true FLIP on the real media box (no clone, no swapping between two
  // elements, no transform trickery): its actual top/left/width/height are
  // animated directly from the "first" rect to the "last" one. Since the
  // box's real size changes every frame, object-fit: cover recrops the image
  // continuously along with it — box and image move as one thing instead of
  // the box snapping to its final layout size first and the image separately
  // catching up.
  const flip = (box, firstRect, lastRect, onComplete) => {
    const parent = box.parentElement;
    const nextSibling = box.nextSibling;

    // Taking the box out of flow (position: fixed) so it can freely occupy
    // any size/position on screen would collapse the space it held in a
    // flex layout (the carousel card) — hold that space with a placeholder
    // for the duration.
    const placeholder = document.createElement("div");
    placeholder.style.width = `${lastRect.width}px`;
    placeholder.style.height = `${lastRect.height}px`;
    placeholder.style.flexShrink = "0";
    parent.insertBefore(placeholder, box);

    const prevStyle = {
      position: box.style.position,
      top: box.style.top,
      left: box.style.left,
      width: box.style.width,
      height: box.style.height,
      margin: box.style.margin,
      transition: box.style.transition,
      zIndex: box.style.zIndex,
    };

    box.style.transition = "none";
    box.style.zIndex = "9998";
    box.style.margin = "0";
    box.style.position = "fixed";
    box.style.top = `${firstRect.top}px`;
    box.style.left = `${firstRect.left}px`;
    box.style.width = `${firstRect.width}px`;
    box.style.height = `${firstRect.height}px`;
    document.body.appendChild(box);

    // The box's z-index has to beat everything it flies over, but that also
    // puts it above the header/footer — lift them higher for the duration so
    // the box passing through their screen area never covers them.
    const prevHeaderZ = siteHeader?.style.zIndex;
    const prevFooterZ = siteFooter?.style.zIndex;
    if (siteHeader) siteHeader.style.zIndex = "9999";
    if (siteFooter) siteFooter.style.zIndex = "9999";

    gsap.to(box, {
      top: lastRect.top,
      left: lastRect.left,
      width: lastRect.width,
      height: lastRect.height,
      duration: MORPH_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        parent.insertBefore(box, nextSibling);
        placeholder.remove();
        Object.assign(box.style, prevStyle);
        if (siteHeader) siteHeader.style.zIndex = prevHeaderZ;
        if (siteFooter) siteFooter.style.zIndex = prevFooterZ;
        onComplete();
      },
    });
  };

  // Fullscreen -> carousel: the heading, the overlay and the media's FLIP
  // shrink all run together instead of one waiting for the previous to
  // finish, so the whole thing reads as a single simultaneous motion. The
  // overlay isn't part of the FLIP (it lives on the item, not the media box),
  // so .work-gallery is forced to stay rendered past the CSS data-view switch
  // — otherwise it would snap to display: none the instant we flip the
  // attribute and cut the overlay's fade off before it's visible at all.
  const morphToCarousel = () => {
    const activeIndex = maskReveal?.getIndex() ?? 0;
    const activeCaption = captions[activeIndex];
    const activeOverlay = items[activeIndex]?.querySelector(".work-gallery__overlay");
    const firstRect = mediaBoxes[activeIndex].getBoundingClientRect();

    let pending = activeOverlay ? 3 : 2;
    const maybeFinish = () => {
      pending -= 1;
      if (pending === 0) {
        items.forEach((item) => {
          item.style.visibility = "";
        });
        if (section) {
          section.style.removeProperty("display");
          section.style.removeProperty("position");
          section.style.removeProperty("inset");
        }
        finish();
      }
    };

    // These are cheap, paint-only tweens — start them immediately so the
    // transition visibly begins on this frame.
    gsap.to(fadeOnlyTargets, { opacity: 0, duration: MORPH_DURATION * 0.6, ease: "power2.in" });

    if (activeCaption) {
      gsap.to(activeCaption, { y: -40, opacity: 0, duration: 0.35, ease: "power2.in" });
    }

    if (activeOverlay) {
      gsap.to(activeOverlay, {
        opacity: 0,
        duration: MORPH_DURATION,
        ease: "power2.in",
        onComplete: maybeFinish,
      });
    }

    // Everything below is layout-heavy (relocating all 11 media boxes,
    // flipping data-view which cascades into pinning the carousel, then
    // measuring the FLIP target) — doing it synchronously in the same tick
    // as the tweens above forces a big layout pass before the browser can
    // paint even one frame of them, so the whole transition stalls for a
    // beat before anything visibly moves. Deferring it one frame lets that
    // first frame paint first.
    requestAnimationFrame(() => {
      // Every other gallery item currently sits "open" (unclipped, at full
      // screen size) behind the active one purely because of z-index —
      // that's invisible normally, but the active item is about to shrink
      // well below full size, so hide the rest for the duration or they'd
      // show through.
      items.forEach((item, i) => {
        if (i !== activeIndex) item.style.visibility = "hidden";
      });

      mediaBoxes.forEach((_, i) => relocateToCard(i));
      const otherBoxes = mediaBoxes.filter((_, i) => i !== activeIndex);
      // Mask-reveal them bottom-to-top rather than a plain fade: fully
      // clipped away at the top edge, growing upward until visible.
      gsap.set(otherBoxes, { clipPath: "inset(100% 0% 0% 0%)" });

      if (section) {
        section.style.setProperty("display", "block", "important");
        // Left in normal flow, this 100vh section would push .work-scroll--toggle
        // down by its own height for as long as it stays forced-visible here —
        // the carousel's pinned ScrollTrigger (created below) measures its start
        // against that inflated layout, so once this section finally hides again
        // in maybeFinish and the document shrinks back, the pin's start/end no
        // longer match the real scroll position and the carousel visibly jumps
        // to a different spot in its track. Taking it out of flow (fixed,
        // full-viewport) lets it keep fading out on top of the carousel without
        // pushing anything beneath it.
        section.style.position = "fixed";
        section.style.inset = "0";
      }
      pageShell.dataset.view = "carousel";
      setToggleState(true);
      // Defensive: there shouldn't be a live carouselScroll here (we only
      // reach this branch from gallery view), but leaving a stale pinned
      // ScrollTrigger around from an earlier trip would stack its spacer
      // under the new one and throw off the pin distance.
      carouselScroll?.revert();
      carouselScroll = initHorizontalScroll(carousel, carouselTrack, { centerIndex: activeIndex });

      const box = mediaBoxes[activeIndex];
      const lastRect = box.getBoundingClientRect();

      flip(box, firstRect, lastRect, maybeFinish);

      gsap.to(otherBoxes, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "power2.inOut",
        stagger: 0.08,
        onComplete: () => {
          gsap.set(otherBoxes, { clearProps: "clipPath" });
          maybeFinish();
        },
      });
    });
  };

  // Carousel -> fullscreen: mirrors the same relocate-then-FLIP, starting
  // from whichever card is currently centered. Same reasoning as
  // morphToCarousel: relocating all 11 media boxes, reverting the pinned
  // ScrollTrigger, and flipping data-view are all layout-heavy, so that work
  // is deferred a frame rather than run synchronously in the click handler —
  // otherwise the click-to-first-paint gap stalls before the FLIP even starts.
  const morphToGallery = () => {
    const activeIndex = getCenteredCardIndex();
    const firstRect = mediaBoxes[activeIndex].getBoundingClientRect();

    gsap.set(fadeOnlyTargets, { opacity: 0 });

    requestAnimationFrame(() => {
      mediaBoxes.forEach((_, i) => relocateToItem(i));

      carouselScroll?.revert();
      carouselScroll = null;
      maskReveal?.setIndex(activeIndex, { showCaption: false });
      pageShell.dataset.view = "gallery";
      setToggleState(false);

      // Items from activeIndex onward are all "unclipped" per setIndex
      // (that's fine once the active one is at full size, covering them by
      // z-index), but the active item starts this animation small — hide
      // the rest so nothing shows through around it while it's still
      // growing.
      items.forEach((item, i) => {
        if (i !== activeIndex) item.style.visibility = "hidden";
      });

      // The darkening overlay lives on the item, not the media box, so it
      // isn't part of the FLIP — without this it would just snap to full
      // opacity the instant .work-gallery goes from display: none to
      // visible. Hide it until the image itself has finished landing, same
      // as the caption. Every item's overlay is normalized here (not just
      // the active one) because a previous trip through morphToCarousel can
      // leave some other item's overlay faded to 0 — next/prev never
      // touches it, so it would otherwise stay invisible if the user
      // mask-reveals back to that item later.
      let activeOverlay = null;
      items.forEach((item, i) => {
        const overlay = item.querySelector(".work-gallery__overlay");
        if (!overlay) return;
        if (i === activeIndex) {
          activeOverlay = overlay;
          gsap.set(overlay, { opacity: 0 });
        } else {
          gsap.set(overlay, { opacity: 1 });
        }
      });

      const box = mediaBoxes[activeIndex];
      const lastRect = box.getBoundingClientRect();

      flip(box, firstRect, lastRect, () => {
        items.forEach((item) => {
          item.style.visibility = "";
        });
        gsap.to(fadeOnlyTargets, { opacity: 1, duration: MORPH_DURATION * 0.6, ease: "power2.out" });
        if (activeOverlay) {
          gsap.to(activeOverlay, { opacity: 1, duration: MORPH_DURATION * 0.6, ease: "power2.out" });
        }
        maskReveal?.revealCaption(activeIndex);
        finish();
      });
    });
  };

  viewToggle.addEventListener("click", () => {
    if (transitioning) return;
    transitioning = true;
    viewToggle.disabled = true;

    if (pageShell.dataset.view === "carousel") {
      morphToGallery();
    } else {
      morphToCarousel();
    }
  });

  // initHorizontalScroll's own gsap.matchMedia tears down its pin/tween the
  // moment the viewport drops below desktop+pointer-fine+motion-allowed (a
  // window resize, a tablet rotation, the OS switching on reduced motion) —
  // but that's the same query .view-toggle and .work-scroll--toggle are
  // gated on in CSS, so without this, dropping below it while parked in the
  // carousel hides the toggle (no way back) while .work-gallery stays
  // CSS-hidden, stranding the visitor on a now-inert, un-pinned card strip.
  // Snap straight back to the gallery, no animation — the carousel layout
  // is already gone underneath.
  window.matchMedia(MEDIA.desktopPointerFineMotion).addEventListener("change", (e) => {
    if (e.matches || pageShell.dataset.view !== "carousel") return;
    const activeIndex = transitioning ? 0 : getCenteredCardIndex();
    mediaBoxes.forEach((_, i) => relocateToItem(i));
    carouselScroll?.revert();
    carouselScroll = null;
    maskReveal?.setIndex(activeIndex);
    pageShell.dataset.view = "gallery";
    setToggleState(false);
    items.forEach((item) => {
      item.style.visibility = "";
    });
    gsap.set(fadeOnlyTargets, { opacity: 1 });
    items.forEach((item) => {
      const overlay = item.querySelector(".work-gallery__overlay");
      if (overlay) gsap.set(overlay, { clearProps: "opacity" });
    });
    finish();
  });
}
