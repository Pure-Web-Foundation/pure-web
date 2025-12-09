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
  static #pendingClose = null;

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

    if (rec.closing) return;

    try {
      rec.closing = true;
      rec.from();
    } catch (e) {
      console.error(e);
    } finally {
      rec.opened = false;
      rec.last = null;
      rec.closing = false;
    }

    const st = history.state;
    const target = this.#pickCloseTarget(rec, st);
    const cleaned = this.#cleanRouteState(st);
    const depth = Number.isFinite(st?.__arDepth) ? Number(st.__arDepth) : 0;
    const sameStep = !!st && st.__ar === key;

    if (!replace && sameStep) {
      const steps = Math.max(1, depth + 1);
      this.#pendingClose = {
        key,
        targetPath: target.path,
        targetUrl: target.url,
        steps,
        awaitingPop: false,
      };
      this.#drainPendingClose();
      return;
    }

    history.replaceState(cleaned ?? null, "", target.url);
    queueMicrotask(() => this.#onNav(target.path));
  }

  // public: programmatic navigation helper (no immediate to(); router applies)
  static navigate(path, { replace = false, baseKey } = {}) {
    const full = this.#normalize(path);
    let key = baseKey;
    if (!key) {
      const match = this.#findBestMatch(full);
      key = match?.key;
      if (!key)
        throw new Error(
          `ActionRoute.navigate: route not registered: "${path}"`
        );
    }
    const url =
      this.#mode === "path"
        ? full + location.search + location.hash
        : "#" + full;
    const navInfo = this.#buildNavState(key); // tag entry for smart end()
    const tagged = navInfo.state;
    const current = this.#currentPath();
    const sameKey = history.state?.__ar === key;
    const shouldReplace = replace || (sameKey && current === full);

    if (shouldReplace && navInfo.sameRoute) {
      tagged.__arDepth = navInfo.existingDepth >= 0 ? navInfo.existingDepth : 0;
    }

    if (shouldReplace) {
      history.replaceState(tagged, "", url);
    } else {
      history.pushState(tagged, "", url);
    }

    this.#onNav(full);
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

  static #onNav(pathOverride) {
    if (!this.#started) return;

    const full =
      pathOverride != null
        ? this.#cleanPath(pathOverride)
        : this.#currentPath();

    const pending = this.#pendingClose;
    if (pending) {
      if (pending.awaitingPop) pending.awaitingPop = false;

      if (pending.steps > 0) {
        pending.steps -= 1;
        if (pending.steps > 0) {
          this.#drainPendingClose();
          return;
        }
      }

      const targetPath = this.#cleanPath(pending.targetPath ?? full);
      const targetUrl =
        typeof pending.targetUrl === "string" && pending.targetUrl.length > 0
          ? pending.targetUrl
          : this.#buildUrlForPath(targetPath);
      const cleanedState = this.#cleanRouteState(history.state);

      this.#pendingClose = null;

      history.replaceState(cleanedState ?? null, "", targetUrl);
      queueMicrotask(() => this.#onNav(targetPath));
      return;
    }

    for (const [key, rec] of this.#routes) {
      const match = rec.match?.(full);

      if (match?.matched) {
        const previous = rec.last;
        const payload = this.#buildPayload(key, full, match, previous);
        if (!rec.opened) {
          rec.opened = true;
          try {
            rec.to(payload);
          } catch (e) {
            console.error(e);
          }
        }

        if (rec.in) {
          // Notify in() for every navigation that stays within this route
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

    if (
      this.#base &&
      (path === this.#base || path.startsWith(this.#base + "/"))
    ) {
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
    if (
      !isNavigationPolyfill &&
      "canIntercept" in event &&
      !event.canIntercept
    ) {
      return;
    }

    // Native Navigation API: let Back/Forward proceed without our own push.
    if (!isNavigationPolyfill && event.navigationType === "traverse") {
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

    const fullPath =
      this.#mode === "path"
        ? this.#cleanPath(url.pathname)
        : this.#cleanPath(url.hash ? url.hash.slice(1) : "/");

    const match = this.#findBestMatch(fullPath);

    if (!match) return;

    const replaceNav =
      event.navigationType === "replace" || event.info?.replace === true;

    const handler = () => {
      const current = this.#currentPath();
      const alreadyAtPath = current === fullPath;

      if (handlingNavigation) return;
      handlingNavigation = true;
      const navInfo = this.#buildNavState(match.key);
      const tagged = navInfo.state;

      const targetUrl =
        this.#mode === "path"
          ? url.pathname + url.search + url.hash
          : "#" + fullPath.replace(/^\//, "");

      try {
        const willReplace = alreadyAtPath || isNavigationPolyfill || replaceNav;
        const preserveDepth = (alreadyAtPath || replaceNav) && navInfo.sameRoute;

        if (preserveDepth) {
          tagged.__arDepth = navInfo.existingDepth >= 0 ? navInfo.existingDepth : 0;
        }

        if (willReplace) {
          history.replaceState(tagged, "", targetUrl);
        } else {
          history.pushState(tagged, "", targetUrl);
        }      

        this.#onNav(fullPath);
      } finally {
        handlingNavigation = false;
      }
    };

    if (typeof event.intercept === "function") {
      
      event.intercept({ handler });
      return;
    }

    if (typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    handler();
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

  static #buildPayload(base, full, match, previous) {
    return {
      base,
      path: full,
      exact: match.exact,
      subpath: match.subpath,
      segments: match.segments,
      params: match.params,
      previous,
    };
  }

  static #buildNavState(key) {
    const baseState =
      history.state && typeof history.state === "object"
        ? { ...history.state }
        : {};

    const currentPath = this.#currentPath();
    const currentUrl = location.pathname + location.search + location.hash;
    const sameRoute = baseState.__ar === key;
    const existingDepth = sameRoute && Number.isFinite(baseState.__arDepth)
      ? Number(baseState.__arDepth)
      : -1;

    const rootPath =
      sameRoute && typeof baseState.__arRootPath === "string"
        ? baseState.__arRootPath
        : currentPath;
    const rootUrl =
      sameRoute && typeof baseState.__arRootUrl === "string"
        ? baseState.__arRootUrl
        : currentUrl;

    baseState.__ar = key;
    baseState.__arPrevPath = currentPath;
    baseState.__arPrevUrl = currentUrl;
    baseState.__arRootPath = rootPath;
    baseState.__arRootUrl = rootUrl;
    baseState.__arDepth = sameRoute
      ? existingDepth + 1
      : 0;

    return {
      state: baseState,
      sameRoute,
      existingDepth,
    };
  }

  static #cleanRouteState(state) {
    if (!state) return state;
    const cleaned = { ...state };
    delete cleaned.__ar;
    delete cleaned.__arPrevPath;
    delete cleaned.__arPrevUrl;
    delete cleaned.__arRootPath;
    delete cleaned.__arRootUrl;
    delete cleaned.__arDepth;
    return cleaned;
  }

  static #pickCloseTarget(rec, state) {
    const fallbackPath = this.#cleanPath(this.#fallbackPath());
    const seen = new Set();
    const candidates = [];

    const buildUrl = (path, urlOverride) => {
      if (typeof urlOverride === "string" && urlOverride.length > 0) {
        return urlOverride;
      }
      return this.#buildUrlForPath(path);
    };

    const addCandidate = (path, urlOverride) => {
      if (path == null && typeof urlOverride !== "string") return;
      const cleanPath = path == null ? fallbackPath : this.#cleanPath(path);
      if (seen.has(cleanPath)) return;
      seen.add(cleanPath);
      candidates.push({ path: cleanPath, url: buildUrl(cleanPath, urlOverride) });
    };

    if (state && (typeof state.__arRootPath === "string" || typeof state.__arRootUrl === "string")) {
      addCandidate(state.__arRootPath ?? fallbackPath, state.__arRootUrl);
    }

    if (state && (typeof state.__arPrevPath === "string" || typeof state.__arPrevUrl === "string")) {
      addCandidate(state.__arPrevPath ?? fallbackPath, state.__arPrevUrl);
    }

    addCandidate(fallbackPath);

    if (fallbackPath !== "/") {
      addCandidate("/");
    }

    if (!candidates.length) {
      const defaultPath = "/";
      candidates.push({ path: defaultPath, url: buildUrl(defaultPath) });
    }

    const matchesRoute = (path) => {
      if (!rec?.match) return false;
      try {
        return !!rec.match(path)?.matched;
      } catch (error) {
        console.error(error);
        return false;
      }
    };

    const choice = candidates.find((candidate) => !matchesRoute(candidate.path));
    return choice ?? candidates[candidates.length - 1];
  }

  static #fallbackPath() {
    return this.#base || "/";
  }

  static #buildUrlForPath(path) {
    const clean = this.#cleanPath(path);
    if (this.#mode === "path") {
      return clean;
    }
    const trimmed = clean.startsWith("/") ? clean.slice(1) : clean;
    return trimmed ? "#" + trimmed : "#";
  }


  static #drainPendingClose() {
    const pending = this.#pendingClose;
    if (!pending) return;
    if (pending.steps <= 0) return;
    if (pending.awaitingPop) return;

    pending.awaitingPop = true;
    history.go(-1);
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
