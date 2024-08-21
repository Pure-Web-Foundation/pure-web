/**
 * This module intended to be included in the main app bundle
 * In case if browser does not need a polyfill, it will return a fulfilled promise
 * See https://developer.chrome.com/articles/urlpattern/ & https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 */
async function LoadPolyfillsIfNeeded() {
  if (!(globalThis && "URLPattern" in globalThis)) {
    console.log("URLPattern polyfill is needed...");
    const path = "/assets/js/polyfills/urlpattern-polyfill.js";
    await import(path);
  }
  if (!(globalThis && "navigation" in globalThis)) {
    console.log("Navigation polyfill is needed...");
    const path = "/assets/js/polyfills/navigation-polyfill.js";
    await import(path);
  }

  if (!(document && "startViewTransition" in document)) {
    console.log("View-transition polyfill is needed...");
    const path = "/assets/js/polyfills/view-transition-polyfill.js";
    await import(path);
  }
}

export const polyfillsLoaded = LoadPolyfillsIfNeeded();
