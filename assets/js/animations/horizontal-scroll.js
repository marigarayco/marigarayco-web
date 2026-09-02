import { gsap } from "../core/gsap-setup.js";
import { MEDIA } from "../core/viewport.js";
import { getLenis } from "../core/lenis-setup.js";

export function initHorizontalScroll(wrapper, track, { centerIndex, pinTarget, pinStart } = {}) {
  const mm = gsap.matchMedia();

  mm.add(MEDIA.desktopPointerFineMotion, () => {
    // track sits inside wrapper's own left/right padding, so at x:0 it's
    // already inset by paddingLeft before any transform runs. Scrolling only
    // scrollWidth - clientWidth ignores that inset entirely: it lands the
    // track's raw right edge flush with wrapper's outer edge, which cuts off
    // that same amount of padding's worth of the last card instead of
    // leaving it inset by paddingRight to mirror the first card's gutter.
    // Adding both paddings back gives the last card the same breathing room
    // on the right that the first card already has on the left.
    const getDistance = () => {
      const wrapperStyle = getComputedStyle(wrapper);
      const horizontalPadding =
        parseFloat(wrapperStyle.paddingLeft) + parseFloat(wrapperStyle.paddingRight);
      return track.scrollWidth - wrapper.clientWidth + horizontalPadding;
    };

    const tween = gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: pinTarget || wrapper,
        start: pinStart || "top top",
        end: () => `+=${getDistance()}`,
        scrub: true,
        pin: true,
        invalidateOnRefresh: true,
      },
    });

    if (typeof centerIndex === "number") {
      const card = track.children[centerIndex];
      const st = tween.scrollTrigger;
      if (card && st) {
        const distance = getDistance();
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const progress =
          distance > 0
            ? gsap.utils.clamp(0, 1, (cardCenter - wrapper.clientWidth / 2) / distance)
            : 0;
        const targetY = st.start + progress * (st.end - st.start);
        // A raw window.scrollTo() only sticks for this one frame — Lenis
        // keeps its own scroll target/limit and overwrites the position back
        // on its next rAF tick, so jumping to a specific card only through
        // window.scrollTo drifts the "centered" card on every toggle even
        // with no user scrolling in between. Going through Lenis keeps its
        // internal target in sync — but Lenis also caches the document's
        // measured height, and pinning this ScrollTrigger just grew that
        // height (via the pin spacer) after Lenis last measured it, so its
        // cached scroll limit is stale and would clamp the target back to 0
        // without an explicit resize() first.
        const lenis = getLenis();
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(targetY, { immediate: true });
        } else {
          window.scrollTo(0, targetY);
        }
        // Jumping straight into the middle of the pinned range like this
        // (skipping the natural scroll-through-start that would normally
        // engage it) leaves ScrollTrigger's own pin bookkeeping unaware
        // it's already inside [start, end] — a plain .update() re-syncs
        // progress/x, but not that pinned/engaged state. Left alone, the
        // section reads as "not yet pinned" until the user's own next
        // scroll gesture crosses the threshold for real, which looks like
        // the whole thing shooting up off-screen before snapping back into
        // place. st.refresh() re-measures this one trigger against the
        // scroll position we just set and engages the pin immediately, in
        // the same tick — not deferred, so there's no window for a user
        // scroll to race ahead of it.
        st.refresh();
      }
    }

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  });

  return mm;
}
