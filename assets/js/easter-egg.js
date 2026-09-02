const lang = document.documentElement.lang === 'en' ? 'en' : 'es';

const messages = {
  es: {
    title: '👀 Ey, te descubrí!',
    body: 'Si estás mirando el código es porque algo de esto te interesa. ¡Mejor hablemos! → marigarayco@gmail.com'
  },
  en: {
    title: '👀 Hey, caught you!',
    body: 'If you\'re looking at the code, something here caught your interest. Let\'s talk! → marigarayco@gmail.com'
  }
};

const msg = messages[lang];

console.log(
  `%c${msg.title}`,
  'font-size: 20px; font-weight: 800; color: #f5f0e8; background: #1c1917; padding: 6px 10px; border-radius: 4px; font-family: "Space Grotesk", sans-serif;'
);
console.log(
  `%c${msg.body}`,
  'font-size: 13px; font-family: "IBM Plex Mono", monospace; color: #78716c;'
);

const awayMessages = {
  es: '👀 volvé...',
  en: '👀 come back...'
};

const favicon = document.querySelector('link[rel="icon"]');
const originalFaviconHref = favicon ? favicon.getAttribute('href') : null;
const originalTitle = document.title;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (favicon) favicon.setAttribute('href', '/assets/img/favicon-away.svg');
    document.title = awayMessages[lang];
  } else {
    if (favicon) favicon.setAttribute('href', originalFaviconHref);
    document.title = originalTitle;
  }
});
