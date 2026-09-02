import { gsap } from "../core/gsap-setup.js";
import { prefersReducedMotion } from "../core/viewport.js";

const DURATION = 0.7;
const EASE = "power3.inOut";

// Matches the work case-study detail pages only (not the /trabajo/ and
// /en/work/ index listings themselves), in both languages.
const DETAIL_PATH = /^\/(trabajo|en\/work)\/[^/]+\.html$/;

function getOverlay() {
  return document.querySelector(".page-transition-overlay");
}

function isEligibleLink(link) {
  if (!link || !link.href) return false;
  if (link.target && link.target !== "_self") return false;
  if (link.hasAttribute("download")) return false;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname) return false;

  return DETAIL_PATH.test(url.pathname);
}

// Call on pages that link INTO a work detail page (home, work index): covers
// the screen with an overlay sliding up from the bottom before navigating,
// so the next page's own entrance animation picks up seamlessly.
export function initPageTransitionExit() {
  document.addEventListener(
    "click",
    (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest("a");
      if (!isEligibleLink(link)) return;

      const href = link.href;
      if (prefersReducedMotion()) return;

      event.preventDefault();

      const overlay = document.createElement("div");
      overlay.className = "page-transition-overlay";
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);

      gsap.fromTo(
        overlay,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: DURATION,
          ease: EASE,
          onComplete: () => {
            window.location.href = href;
          },
        }
      );
    },
    true
  );
}

// Call on the work detail pages themselves: the overlay markup ships inline
// in the HTML (covering the screen before any script runs, so there's no
// flash of the page underneath), then slides up and off-screen to reveal the
// page as if it were rising into view from the bottom.
export function initPageTransitionEnter() {
  const overlay = getOverlay();
  if (!overlay) return;

  if (prefersReducedMotion()) {
    overlay.remove();
    return;
  }

  gsap.to(overlay, {
    yPercent: -100,
    duration: DURATION,
    ease: EASE,
    onComplete: () => overlay.remove(),
  });
}
