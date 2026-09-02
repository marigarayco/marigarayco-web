// Aviso de cookies minimalista + Google Analytics (GA4).
// GA4 se carga por defecto; "Rechazar" lo desactiva para las próximas visitas.
(function () {
  var GA_MEASUREMENT_ID = "G-7NSJWW43CX";
  var STORAGE_KEY = "cookie-consent"; // "granted" | "denied"
  var isEnglish = document.documentElement.lang === "en";

  function loadGA() {
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
  }

  function showNotice() {
    var text = isEnglish
      ? "This site uses cookies for analytics."
      : "Este sitio usa cookies para analítica.";
    var okLabel = isEnglish ? "Got it" : "Entendido";
    var declineLabel = isEnglish ? "Decline" : "Rechazar";

    var style = document.createElement("style");
    style.textContent =
      "#cookie-banner{position:fixed;right:16px;bottom:16px;z-index:9999;" +
      "display:flex;align-items:center;gap:10px;flex-wrap:nowrap;max-width:calc(100vw - 32px);" +
      "padding:10px 14px;border-radius:10px;background:rgba(20,20,20,0.92);color:#fff;" +
      "font:13px/1.4 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,0.2);white-space:nowrap;}" +
      "#cookie-banner button{cursor:pointer;border:none;border-radius:6px;padding:5px 10px;" +
      "font:inherit;font-size:12px;flex:none;}" +
      "#cookie-banner .cb-accept{background:#fff;color:#111;}" +
      "#cookie-banner .cb-decline{background:transparent;color:#fff;text-decoration:underline;padding:5px 2px;}";
    document.head.appendChild(style);

    var banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML =
      "<span>" + text + "</span>" +
      '<button type="button" class="cb-accept">' + okLabel + "</button>" +
      '<button type="button" class="cb-decline">' + declineLabel + "</button>";
    document.body.appendChild(banner);

    banner.querySelector(".cb-accept").addEventListener("click", function () {
      localStorage.setItem(STORAGE_KEY, "granted");
      banner.remove();
    });
    banner.querySelector(".cb-decline").addEventListener("click", function () {
      localStorage.setItem(STORAGE_KEY, "denied");
      window["ga-disable-" + GA_MEASUREMENT_ID] = true;
      banner.remove();
    });
  }

  var consent = null;
  try {
    consent = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    loadGA();
    return;
  }

  if (consent === "denied") {
    window["ga-disable-" + GA_MEASUREMENT_ID] = true;
  } else {
    loadGA();
  }

  if (consent === null) {
    document.addEventListener("DOMContentLoaded", showNotice);
  }
})();
