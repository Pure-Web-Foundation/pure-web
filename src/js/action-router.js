/* eslint-disable no-console */
// action-route.js
// Tiny path-based action router for MPAs (no query param).
// 1) Register on startup:  ActionRoute.create("/open-drawer", { to, from, in })
// 2) Trigger later:        ActionRoute.run("/open-drawer")
// Back/Forward restore automatically; reload restores if you're already on that path.
const isNavigationPolyfill = !!window.navigation?.polyfill;
let handlingNavigation = false;

export class ActionRoute {
  // config + state
  static #mode = "path"; // "path" | "hash"
  static #base = ""; // optional prefix, e.g. "/this-page"
  static #routes = new Map(); // key -> { to, from, in, match, opened, last }
  static #started = false;
  static #navigationHandler;
  

  // public: configure before first create()
  static configure({ mode, base } = {}) {
    if (this.#started) return;
    if (mode === "path" || mode === "hash") this.#mode = mode;
    if (typeof base === "string") this.#base = base.replace(/\/$/, "");
  }

  // public: register a route (does not run it)
  static create(path, { to, from, in: inside, match } = {}) {
    if (!path)
      throw new Error(
        'ActionRoute.create(path, { to, from }) requires "path".'
      );
    if (typeof to !== "function" || typeof from !== "function") {
      throw new Error(
        'ActionRoute.create requires both "to" and "from" functions.'
      );
    }

    this.#ensureStarted();

    const key = this.#normalize(path);
    const rec = this.#routes.get(key) ?? { opened: false, last: null };
    rec.to = to;
    rec.from = from; // allow updating callbacks
    rec.in = typeof inside === "function" ? inside : null;
    rec.match = this.#wrapMatcher(key, match);
    this.#routes.set(key, rec);

    // Re-evaluate routes now that configuration changed
    this.#onNav();
  }

  // public: just navigate to the registered route.
  // We treat navigation as the source of truth; router reacts & runs `to()`.
  static run(path, { replace = false } = {}) {
    const full = this.#normalize(path);
    const match = this.#findBestMatch(full);
    if (!match)
      throw new Error(`ActionRoute.run: route not registered: "${path}"`);
    this.navigate(full, { replace, baseKey: match.key });
  }

  // public: optional programmatic close (usually Back is enough)
  static end(path, { replace = false } = {}) {
    let key;
    let fullPath = null;
    if (!path) {
      const stateKey = history.state?.__ar;
      if (stateKey && this.#routes.has(stateKey)) {
        key = stateKey;
      } else {
        fullPath = this.#currentPath();
        const best = this.#findBestMatch(fullPath);
        key = best?.key;
      }
    } else {
      fullPath = this.#normalize(path);
      const best = this.#findBestMatch(fullPath);
      key = best?.key ?? (this.#routes.has(fullPath) ? fullPath : null);
    }

    const rec = this.#routes.get(key);
    if (!rec || !rec.opened) return;

    // close UI
    try {
      rec.from();
    } catch (e) {
      console.error(e);
    }
    rec.opened = false;

    // smart URL change: if we created this step, pop; otherwise replace
    rec.opened = false;
    rec.last = null;

    const st = history.state;
    const sameStep = !!st && st.__ar === key;
    if (!replace && sameStep) {
      history.back();
    } else {
      const fallback = this.#base || "/";
      const newURL =
        this.#mode === "path"
          ? fallback + location.search + location.hash
          : "#";
      const cleaned = st
        ? (() => {
            const c = { ...st };
            delete c.__ar;
            return c;
          })()
        : st;
      history.replaceState(cleaned, "", newURL);
      this.#onNav();
    }
  }

  // public: programmatic navigation helper (no immediate to(); router applies)
  static navigate(path, { replace = false, baseKey } = {}) {
    const full = this.#normalize(path);
    let key = baseKey;
    if (!key) {
      const match = this.#findBestMatch(full);
      key = match?.key;
      if (!key)
        throw new Error(`ActionRoute.navigate: route not registered: "${path}"`);
    }
    const url =
      this.#mode === "path" ? full + location.search + location.hash : "#" + full;
    const tagged = { ...(history.state ?? {}), __ar: key }; // tag entry for smart end()

      if (replace) {
        history.replaceState(tagged, "", url);
        this.#onNav();
      } else {
        history.pushState(tagged, "", url);
      }

    this.#onNav();
  }

  // public: utilities
  static isActive(path) {
    const full = this.#normalize(path);
    if (this.#routes.get(full)?.opened) return true;
    const match = this.#findBestMatch(full);
    return !!(match && this.#routes.get(match.key)?.opened);
  }
  static link(el, path, { replace = false } = {}) {
    const handler = (e) => {
      e.preventDefault();
      ActionRoute.run(path, { replace });
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }

  // ── internals ───────────────────────────────────────────────────────────────
  static #ensureStarted() {
    if (this.#started) return;

    const boundNav = () => this.#onNav();
    addEventListener("popstate", boundNav);
    addEventListener("hashchange", boundNav);
    addEventListener("pageshow", boundNav, { once: true });

    if (!this.#navigationHandler && window.navigation?.addEventListener) {
      this.#navigationHandler = (event) => this.#onNavigationEvent(event);
      window.navigation.addEventListener("navigate", this.#navigationHandler);
    }

    this.#started = true;
    queueMicrotask(boundNav); // apply current URL once at startup
  }

  static #onNav() {
    if (!this.#started) return;

    const full = this.#currentPath();

    for (const [key, rec] of this.#routes) {
      const match = rec.match?.(full);

      if (match?.matched) {
        const payload = this.#buildPayload(key, full, match);

        if (!rec.opened) {
          rec.opened = true;
          try {
            rec.to(payload);
          } catch (e) {
            console.error(e);
          }
        }

        const changed = !rec.last || rec.last.path !== payload.path;

        if (rec.in && (changed || !rec.last)) {
          try {
            rec.in(payload);
          } catch (e) {
            console.error(e);
          }
        }

        rec.last = payload;
      } else if (rec.opened) {
        rec.opened = false;
        rec.last = null;
        try {
          rec.from();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  static #normalize(path) {
    if (typeof path !== "string") path = "" + path;

    if (this.#base && (path === this.#base || path.startsWith(this.#base + "/"))) {
      return this.#cleanPath(path);
    }

    let p =
      (this.#base ? this.#base + (path.startsWith("/") ? "" : "/") : "") + path;
    return this.#cleanPath(p);
  }
  static #currentPath() {
    if (this.#mode === "path") {
      return this.#cleanPath(location.pathname || "/");
    } else {
      const h = location.hash.startsWith("#")
        ? location.hash.slice(1)
        : location.hash;
      const key = h || "/";
      return this.#cleanPath(key.startsWith("/") ? key : "/" + key);
    }
  }
  static #onNavigationEvent(event) {
    if (!event || handlingNavigation) return;

    // Native Navigation API exposes canIntercept; respect it when present.
    if (!isNavigationPolyfill && "canIntercept" in event && !event.canIntercept) {
      return;
    }

    const destinationUrl = event.destination?.url;
    if (!destinationUrl) return;

    let url;
    try {
      url = new URL(destinationUrl, location.href);
    } catch (e) {
      console.error(e);
      return;
    }

    if (url.origin !== location.origin) return;

    const fullPath = this.#mode === "path"
      ? this.#cleanPath(url.pathname)
      : this.#cleanPath(url.hash ? url.hash.slice(1) : "/");

    const match = this.#findBestMatch(fullPath);
    if (!match) return;

    const replaceNav =
      event.navigationType === "replace" ||
      event.info?.replace === true;

    const handler = () => {
      const current = this.#currentPath();
      if (match.key === current) return;

      if (handlingNavigation) return;
      handlingNavigation = true;
      const tagged = { ...(history.state ?? {}), __ar: match.key };

      const targetUrl = this.#mode === "path"
        ? url.pathname + url.search + url.hash
        : "#" + fullPath.replace(/^\//, "");

      try {
        if (isNavigationPolyfill || replaceNav) {
          history.replaceState(tagged, "", targetUrl);
        } else {
          history.pushState(tagged, "", targetUrl);
        }

        this.#onNav();
      } finally {
        handlingNavigation = false;
      }
    };

    if (typeof event.intercept === "function") {
      event.intercept({ handler });
    }
  }
  static #wrapMatcher(base, match) {
    const fb = this.#defaultMatch(base);
    const candidate = typeof match === "function" ? match : fb;
    return (full) => {
      const helpers = this.#matcherHelpers(base);
      let raw;
      try {
        raw = candidate(full, helpers);
      } catch (e) {
        console.error(e);
        return null;
      }
      return this.#coerceMatchResult(raw, base, full);
    };
  }

  static #defaultMatch(base) {
    return (full) => {
      if (full === base) {
        return { matched: true, exact: true };
      }

      if (base === "/") {
        if (full !== "/") return { matched: true, exact: false };
        return null;
      }

      if (full.startsWith(base + "/")) {
        return { matched: true, exact: false };
      }

      return null;
    };
  }

  static #coerceMatchResult(result, base, full) {
    if (!result) return null;
    if (result === false) return null;
    if (result === true) result = { matched: true };
    if (typeof result !== "object") return null;
    if (result.matched === false) return null;

    const subpath =
      "subpath" in result
        ? result.subpath ?? ""
        : this.#relativePath(base, full);
    const exact =
      "exact" in result ? !!result.exact : !subpath.length && full === base;
    const segments =
      "segments" in result && Array.isArray(result.segments)
        ? result.segments
        : subpath
        ? subpath
            .split("/")
            .filter(Boolean)
            .map((part) => {
              try {
                return decodeURIComponent(part);
              } catch {
                return part;
              }
            })
        : [];
    const params = result.params ?? {};
    const score =
      typeof result.score === "number"
        ? result.score
        : exact
        ? Number.MAX_SAFE_INTEGER
        : Math.max(1, base.length);

    return {
      matched: true,
      exact,
      subpath,
      segments,
      params,
      score,
    };
  }

  static #relativePath(base, full) {
    if (full === base) return "";
    if (base === "/") {
      return full.startsWith("/") ? full.slice(1) : full;
    }
    if (full.startsWith(base + "/")) {
      return full.slice(base.length + 1);
    }
    return "";
  }

  static #matcherHelpers(base) {
    return {
      base,
      isExact: (path) => path === base,
      relative: (path) => this.#relativePath(base, path),
      segments: (path) => {
        const sub = this.#relativePath(base, path);
        return sub
          ? sub
              .split("/")
              .filter(Boolean)
              .map((part) => {
                try {
                  return decodeURIComponent(part);
                } catch {
                  return part;
                }
              })
          : [];
      },
    };
  }

  static #buildPayload(base, full, match) {
    return {
      base,
      path: full,
      exact: match.exact,
      subpath: match.subpath,
      segments: match.segments,
      params: match.params,
    };
  }

  static #findBestMatch(full) {
    let best = null;
    for (const [key, rec] of this.#routes) {
      const match = rec.match?.(full);
      if (match?.matched) {
        if (!best || match.score > best.score) {
          best = { key, match };
        }
      }
    }
    return best;
  }

  static #cleanPath(path) {
    if (!path) return "/";
    let p = String(path);
    if (!p.startsWith("/")) p = "/" + p;
    p = p.replace(/\/{2,}/g, "/");
    if (p.length > 1 && p.endsWith("/")) p = p.replace(/\/+$/, "");
    return p || "/";
  }
}
