// action-route.js
// Tiny path-based action router for MPAs (no query param).
// 1) Register on startup:  ActionRoute.create("/open-drawer", { to, from })
// 2) Trigger later:        ActionRoute.run("/open-drawer")
// Back/Forward restore automatically; reload restores if you're already on that path.
let dispatch;

if (!window.__urlchange_patched) {
  window.__urlchange_patched = true;

  dispatch = (type, url, state) =>
    window.dispatchEvent(
      new CustomEvent("urlchange", {
        detail: { type, url, state },
        bubbles: false,
        cancelable: false,
        composed: false,
      })
    );
}
  

export class ActionRoute {
  // config + state
  static #mode = "path"; // "path" | "hash"
  static #base = ""; // optional prefix, e.g. "/this-page"
  static #routes = new Map(); // key -> { to, from, opened }
  static #started = false;
  

  // public: configure before first create()
  static configure({ mode, base } = {}) {
    if (this.#started) return;
    if (mode === "path" || mode === "hash") this.#mode = mode;
    if (typeof base === "string") this.#base = base.replace(/\/$/, "");
  }

  // public: register a route (does not run it)
  static create(path, { to, from } = {}) {
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
    const rec = this.#routes.get(key) ?? { to, from, opened: false };
    rec.to = to;
    rec.from = from; // allow updating callbacks
    this.#routes.set(key, rec);

    // If we are already at this path on load, auto-restore
    if (this.#isCurrent(key) && !rec.opened) {
      rec.opened = true;
      try {
        rec.to();
      } catch (e) {
        console.error(e);
      }
    }
  }

  // public: just navigate to the registered route.
  // We treat navigation as the source of truth; router reacts & runs `to()`.
  static run(path, { replace = false } = {}) {
    const key = this.#normalize(path);
    if (!this.#routes.has(key))
      throw new Error(`ActionRoute.run: route not registered: "${path}"`);
    this.navigate(key, { replace });
  }

  // public: optional programmatic close (usually Back is enough)
  static end(path, { replace = false } = {}) {
    if (!path) {
      // close current active route if any
      const currentKey = this.#currentKey();
      path = this.#isCurrent(currentKey) ? currentKey : null;
    }
    const key = this.#normalize(path);
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
      this.#onNav(); // apply new URL
    }
  }

  // public: programmatic navigation helper (no immediate to(); router applies)
  static navigate(path, { replace = false } = {}) {
    const key = this.#normalize(path);
    const url =
      this.#mode === "path" ? key + location.search + location.hash : "#" + key;
    const tagged = { ...(history.state ?? {}), __ar: key }; // tag entry for smart end()

    if (replace) history.replaceState(tagged, "", url);
    else history.pushState(tagged, "", url);
    dispatch("navigate", url, history.state);

    // pushState/replaceState don't emit popstate; apply now
    this.#onNav();
  }

  // public: utilities
  static isActive(path) {
    return this.#isCurrent(this.#normalize(path));
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

    this.#started = true;
    queueMicrotask(boundNav); // apply current URL once at startup
  }

  static #onNav() {
    const key = this.#currentKey();

    // open/close according to current key
    for (const [k, rec] of this.#routes) {
      const active = k === key;
      if (active && !rec.opened) {
        rec.opened = true;
        try {
          rec.to();
        } catch (e) {
          console.error(e);
        }
      } else if (!active && rec.opened) {
        rec.opened = false;
        try {
          rec.from();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  static #normalize(path) {
    let p =
      (this.#base ? this.#base + (path.startsWith("/") ? "" : "/") : "") + path;
    if (!p.startsWith("/")) p = "/" + p;
    p = p.replace(/\/{2,}/g, "/");
    return p;
  }
  static #currentKey() {
    if (this.#mode === "path") {
      return (location.pathname || "/").replace(/\/{2,}/g, "/");
    } else {
      const h = location.hash.startsWith("#")
        ? location.hash.slice(1)
        : location.hash;
      const key = h || "/";
      return key.startsWith("/") ? key : "/" + key;
    }
  }
  static #isCurrent(key) {
    return this.#currentKey() === key;
  }
}
