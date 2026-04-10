/**
 * @module ActionRoute
 * @description Lightweight, locally-scoped route controller for browser UI state.
 * `ActionRoute` only owns paths that have been explicitly registered via
 * `ActionRoute.create()`. Unregistered URLs are left to normal browser navigation.
 *
 * Matching is path-based. When the current route stays active and only the
 * query string or hash changes, the route's `in()` callback is invoked again
 * with the latest URL details.
 */

/**
 * Called once when navigation enters a route.
 *
 * @callback ActionRouteToHandler
 * @param {ActionRoutePayload} payload Details about the current matched route and URL state.
 * @param {unknown} [state] Optional shared controller state/config.
 * @returns {void}
 */

/**
 * Called once when navigation leaves a route.
 *
 * @callback ActionRouteFromHandler
 * @param {unknown} [state] Optional shared controller state/config.
 * @returns {void}
 */

/**
 * Called for every navigation that remains within the same matched route,
 * including query-string and hash-only changes.
 *
 * @callback ActionRouteInHandler
 * @param {ActionRoutePayload} payload Details about the current matched route and URL state.
 * @param {unknown} [state] Optional shared controller state/config.
 * @returns {void}
 */

/**
 * Helper methods exposed to a custom matcher.
 *
 * @typedef {object} ActionRouteMatchHelpers
 * @property {string} base Normalized registered base path.
 * @property {(path: string) => boolean} isExact Returns `true` when `path` exactly matches the route base.
 * @property {(path: string) => string} relative Returns the path remainder relative to the route base.
 * @property {(path: string) => string[]} segments Returns decoded path segments for `path`.
 */

/**
 * Match information returned by a custom matcher.
 *
 * @typedef {object} ActionRouteMatchResult
 * @property {boolean} matched Whether the route owns the candidate path.
 * @property {boolean} [exact=false] Whether the match is an exact path match.
 * @property {string} [subpath=""] Path remainder relative to the route base.
 * @property {string[]} [segments=[]] Decoded path segments for `subpath`.
 * @property {Record<string, unknown>} [params={}] Optional values extracted by the matcher.
 * @property {number} [score] Match priority; higher scores win.
 */

/**
 * Optional custom path matcher for a route.
 *
 * @callback ActionRouteMatchFunction
 * @param {string} full Normalized candidate path without query string or hash.
 * @param {ActionRouteMatchHelpers} helpers Helper utilities for advanced matching.
 * @returns {boolean|ActionRouteMatchResult|null|undefined}
 */

/**
 * Lifecycle callbacks and options for a registered route.
 *
 * @typedef {object} ActionRouteDefinition
 * @property {ActionRouteToHandler} to Called once when the route becomes active.
 * @property {ActionRouteFromHandler} from Called once when the route stops being active.
 * @property {ActionRouteInHandler} [in] Called on every navigation that remains within the owned route, including query/hash changes.
 * @property {ActionRouteMatchFunction} [match] Optional custom matcher for advanced or catch-all behavior.
 * @property {boolean} [intercept] Overrides whether normal link navigation to this route should be intercepted. Defaults to `true` for owned feature routes, and to `false` for an exact `"/"` route with no `in()` or custom `match` so dummy root routes do not hijack exits.
 */

/**
 * Options for `ActionRoute.configure()`.
 *
 * @typedef {object} ActionRouteConfigureOptions
 * @property {"path"|"hash"} [mode="path"] Whether routing should use `location.pathname` or `location.hash`.
 * @property {string} [base=""] Optional base prefix applied to registered route paths.
 */

/**
 * Options for navigation helper methods.
 *
 * @typedef {object} ActionRouteNavigationOptions
 * @property {boolean} [replace=false] Reuse the current history entry instead of pushing a new one.
 * @property {string} [baseKey] Internal route-key override used by the router itself. Application code should normally omit this.
 */

/**
 * Details passed to a route's `to()` and `in()` callbacks.
 *
 * @typedef {object} ActionRoutePayload
 * @property {string} base Normalized registered base path for the matched route.
 * @property {string} path Current normalized matched path, without query string or hash.
 * @property {string} url Current same-origin URL as `pathname + search + hash`.
 * @property {string} pathname Current `window.location.pathname` value.
 * @property {string} search Current `window.location.search` value.
 * @property {URLSearchParams} searchParams Parsed query parameters for the current URL.
 * @property {string} hash Current `window.location.hash` value.
 * @property {boolean} exact Whether the route matched exactly.
 * @property {string} subpath Path remainder relative to the route base.
 * @property {string[]} segments Decoded segments for `subpath`.
 * @property {Record<string, unknown>} params Optional matcher-supplied values.
 * @property {ActionRoutePayload|null} previous Previous payload for this route, or `null` on first entry.
 */

/**
 * Accepted second argument for `ActionRoute.create()`.
 *
 * @typedef {ActionRouteDefinition|ActionRouteController} ActionRouteRegistration
 */

/**
 * Normalizes a plain route definition or controller instance into callable handlers.
 *
 * @param {unknown} definition Route definition, module export, or controller instance.
 * @param {{ allowControllerBase?: boolean }} [options]
 * @returns {{
 *   source: object,
 *   to: ActionRouteToHandler|null,
 *   from: ActionRouteFromHandler|null,
 *   in: ActionRouteInHandler|null,
 *   match: ActionRouteMatchFunction|undefined,
 *   intercept: boolean|undefined,
 *   hasCustomIn: boolean,
 * }}
 */
function normalizeActionRouteSource(
  definition,
  { allowControllerBase = true } = {}
) {
  let source = definition ?? {};
  if (
    source &&
    typeof source === "object" &&
    "default" in source &&
    source.default != null
  ) {
    source = source.default;
  }

  const target =
    source && (typeof source === "object" || typeof source === "function")
      ? source
      : {};
  const isController = target instanceof ActionRouteController;

  const bindHandler = (name) => {
    const handler = target?.[name];
    if (typeof handler !== "function") return null;
    if (
      !allowControllerBase &&
      isController &&
      handler === ActionRouteController.prototype[name]
    ) {
      return null;
    }
    return handler.bind(target);
  };

  return {
    source: target,
    to: bindHandler("to"),
    from: bindHandler("from"),
    in: bindHandler("in"),
    match:
      typeof target?.match === "function" ? target.match.bind(target) : undefined,
    intercept: typeof target?.intercept === "boolean" ? target.intercept : undefined,
    hasCustomIn:
      typeof target?.in === "function" &&
      (!isController || target.in !== ActionRouteController.prototype.in),
  };
}

/**
 * Lazy route controller that can defer route logic until first use.
 *
 * Pass an instance to `ActionRoute.create(path, controller)` instead of a plain
 * `{ to, from, in }` object. The base implementation imports the configured
 * module the first time the route becomes active and then forwards lifecycle
 * calls to the resolved handlers.
 */
export class ActionRouteController {
  #modulePath = "";
  #state = undefined;
  #loadedRoute = null;
  #loadingRoute = null;
  #version = 0;
  #active = false;

  /**
   * @param {string|URL|unknown} [modulePath] Optional module URL or specifier to lazy-load on first entry.
   * When a non-string value is passed as the only argument, it is treated as shared controller state.
   * @param {unknown} [state] Optional shared state/config forwarded to resolved route logic.
   */
  constructor(modulePath = "", state = undefined) {
    const hasExplicitState = arguments.length > 1;
    const looksLikeModulePath =
      typeof modulePath === "string" || modulePath instanceof URL;

    if (!hasExplicitState && !looksLikeModulePath) {
      this.#modulePath = "";
      this.#state = modulePath;
      return;
    }

    this.#modulePath = modulePath ?? "";
    this.#state = state;
  }

  /**
   * Returns the configured lazy module specifier.
   *
   * @returns {string|URL}
   */
  get modulePath() {
    return this.#modulePath;
  }

  /**
   * Returns the shared controller state/config.
   *
   * @returns {unknown}
   */
  get state() {
    return this.#state;
  }

  /**
   * Returns `true` after the route module has been loaded successfully.
   *
   * @returns {boolean}
   */
  get isLoaded() {
    return !!this.#loadedRoute;
  }

  /**
   * Preloads the controller logic without activating the route.
   *
   * @returns {Promise<unknown>}
   */
  preload() {
    return this.load();
  }

  /**
   * Loads and resolves the controller's route definition once.
   *
   * @returns {Promise<ReturnType<typeof normalizeActionRouteSource>>}
   */
  async load() {
    if (this.#loadedRoute) return this.#loadedRoute;

    if (!this.#loadingRoute) {
      this.#loadingRoute = this.#loadRoute()
        .then((resolved) => {
          const route = normalizeActionRouteSource(resolved, {
            allowControllerBase: false,
          });
          if (!route.to || !route.from) {
            throw new Error(
              'ActionRouteController.load requires the resolved module to provide both "to" and "from" functions.'
            );
          }
          this.#loadedRoute = route;
          return route;
        })
        .catch((error) => {
          this.#loadingRoute = null;
          throw error;
        });
    }

    return this.#loadingRoute;
  }

  /**
   * Resolves an imported module into a concrete route definition.
   *
   * Supported shapes include named exports, a default object, or a default
   * class instance/class with `to()` and `from()` methods.
   *
   * @param {unknown} module Imported module namespace or default export.
   * @returns {Promise<unknown>}
   */
  async resolve(module) {
    let resolved =
      module && typeof module === "object" && "default" in module
        ? module.default ?? module
        : module;

    if (
      typeof resolved === "function" &&
      resolved.prototype &&
      (resolved.prototype instanceof ActionRouteController ||
        typeof resolved.prototype?.to === "function" ||
        typeof resolved.prototype?.from === "function")
    ) {
      resolved = new resolved(this.#state);
    }

    if (
      resolved &&
      (typeof resolved === "object" || typeof resolved === "function")
    ) {
      try {
        if (!("state" in resolved)) {
          Object.defineProperty(resolved, "state", {
            configurable: true,
            enumerable: false,
            get: () => this.#state,
          });
        }
      } catch {
        // Ignore non-extensible module namespace objects.
      }
    }

    return resolved ?? {};
  }

  /**
   * Handles route entry and lazily imports the backing module if needed.
   *
   * @param {ActionRoutePayload} payload Details about the current matched route and URL state.
   * @returns {Promise<void>}
   */
  async to(payload) {
    this.#active = true;
    const version = ++this.#version;

    try {
      const route = await this.load();
      if (!this.#active || version !== this.#version) return;
      await route.to?.(payload, this.#state);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Handles route exit.
   *
   * @returns {Promise<void>}
   */
  async from() {
    this.#active = false;
    const version = ++this.#version;

    try {
      const route = await this.load();
      if (version !== this.#version) return;
      await route.from?.(this.#state);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Handles in-route updates for the active route.
   *
   * @param {ActionRoutePayload} payload Details about the current matched route and URL state.
   * @returns {Promise<void>}
   */
  async in(payload) {
    if (!this.#active) return;
    const version = this.#version;

    try {
      const route = await this.load();
      if (!this.#active || version !== this.#version) return;
      await route.in?.(payload, this.#state);
    } catch (error) {
      console.error(error);
    }
  }

  async #loadRoute() {
    if (!this.#modulePath) {
      return this;
    }

    const specifier = this.#resolveModuleSpecifier(this.#modulePath);
    const imported = await import(specifier);
    return this.resolve(imported);
  }

  #resolveModuleSpecifier(modulePath) {
    if (modulePath instanceof URL) {
      return modulePath.href;
    }

    const raw = String(modulePath ?? "").trim();
    if (!raw) return raw;

    try {
      return new URL(raw, window.location.href).href;
    } catch {
      return raw;
    }
  }
}

const isNavigationPolyfill = !!window.navigation?.polyfill;
let handlingNavigation = false;

/**
 * Locally-scoped action router for same-document UI flows.
 *
 * Routes are registered per path and remain callback-driven:
 * - `to()` runs once when entering a route
 * - `in()` runs on every navigation that stays within that route, including
 *   query-string and hash changes
 * - `from()` runs once when leaving the route
 *
 * This class does not claim unrelated URLs; unowned navigation is left to the browser.
 * A dummy `"/"` route is not required for leaving an owned path; if an exact
 * root route is registered only as a passive return target, it will not hijack
 * normal exits unless `intercept: true` is explicitly requested.
 *
 * @example
 * ActionRoute.create("/recipes", {
 *   to: () => drawer.open(),
 *   from: () => drawer.close(),
 *   in: ({ searchParams }) => {
 *     filterRecipes(searchParams.get("facet"));
 *   },
 * });
 */
export class ActionRoute {
  // config + state
  static #mode = "path"; // "path" | "hash"
  static #base = ""; // optional prefix, e.g. "/this-page"
  static #routes = new Map(); // key -> { to, from, in, match, intercept, opened, last }
  static #started = false;
  static #navigationHandler;
  static #pendingClose = null;
  static #queuedNavigation = null;
  static #forcedRun = null;

  /**
   * Configures the routing strategy before the first route is registered.
   *
   * Calls made after the router has started are ignored.
   *
   * @param {ActionRouteConfigureOptions} [options={}] Router configuration.
   * @returns {void}
   */
  static configure({ mode, base } = {}) {
    if (this.#started) return;
    if (mode === "path" || mode === "hash") this.#mode = mode;
    if (typeof base === "string") this.#base = base.replace(/\/$/, "");
  }

  /**
   * Registers or updates a locally-owned route.
   *
   * Registering a route does not force navigation to it. After registration,
   * `ActionRoute` will react when the current URL matches the route's path or
   * custom matcher.
   *
   * @param {string} path Route base path to own, such as `"/recipes"`.
   * @param {ActionRouteRegistration} handlers Lifecycle handlers, controller instance, match rules, and interception behavior.
   * @returns {void}
   * @throws {Error} Thrown when `path` is missing or when `to` / `from` are not functions.
   */
  static create(path, handlers = {}) {
    if (!path)
      throw new Error(
        'ActionRoute.create(path, { to, from }) requires "path".'
      );

    const route = normalizeActionRouteSource(handlers);
    const { to, from, in: inside, match, intercept, hasCustomIn } = route;

    if (typeof to !== "function" || typeof from !== "function") {
      throw new Error(
        'ActionRoute.create requires both "to" and "from" functions.'
      );
    }

    this.#ensureStarted();

    const key = this.#normalize(path);
    const rec = this.#routes.get(key) ?? { opened: false, last: null };
    const defaultIntercept =
      key !== "/" || hasCustomIn || typeof match === "function";

    rec.to = to;
    rec.from = from; // allow updating callbacks
    rec.in = typeof inside === "function" ? inside : null;
    rec.match = this.#wrapMatcher(key, match);
    rec.intercept =
      typeof intercept === "boolean" ? intercept : defaultIntercept;
    this.#routes.set(key, rec);

    // Re-evaluate routes now that configuration changed
    this.#onNav();
  }

  /**
   * Navigates to a registered route and lets the router lifecycle react to the new URL.
   *
   * This is equivalent to making the URL the source of truth and then allowing
   * the matching route's `to()` / `in()` handlers to run.
   *
   * @param {string} path Registered route path to activate.
   * @param {ActionRouteNavigationOptions} [options={}] Navigation behavior.
   * @returns {void}
   * @throws {Error} Thrown when the target route has not been registered.
   */
  static run(path, { replace = false } = {}) {
    const full = this.#normalize(path);
    const match = this.#findBestMatch(full);
    if (!match)
      throw new Error(`ActionRoute.run: route not registered: "${path}"`);

    this.#forcedRun = { key: match.key, path: full };
    this.navigate(full, { replace, baseKey: match.key });
  }

  /**
   * Closes an active route and returns to its most appropriate previous URL.
   *
   * In most cases the browser Back button is sufficient; this helper exists for
   * components that need an explicit close action.
   *
   * @param {string} [path] Specific route path to close. When omitted, the current active route is used.
   * @param {ActionRouteNavigationOptions} [options={}] Close behavior.
   * @returns {void}
   */
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

    const steps = Math.max(1, depth + 1);
    const canTraverse =
      !replace && sameStep && this.#canTraverseClose(rec, target, steps);

    if (canTraverse) {
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

    this.#pendingClose = null;
    history.replaceState(cleaned ?? null, "", target.url);
    queueMicrotask(() => this.#onNav(target.path));
  }

  /**
   * Updates the browser URL for a registered route without directly invoking handlers.
   *
   * The router still processes the navigation immediately afterwards, which means
   * the matched route's lifecycle callbacks remain the single source of truth.
   *
   * @param {string} path Target route path.
   * @param {ActionRouteNavigationOptions} [options={}] Navigation behavior.
   * @returns {void}
   * @throws {Error} Thrown when the target route has not been registered.
   */
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
    if (this.#pendingClose?.awaitingPop) {
      this.#queuedNavigation = { path: full, replace, baseKey: key };
      return;
    }

    if (this.#pendingClose) {
      this.#pendingClose = null;
    }

    this.#queuedNavigation = null;

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

  /**
   * Returns whether a route is currently active.
   *
   * @param {string} path Route path to check.
   * @returns {boolean} `true` when the route is currently open.
   */
  static isActive(path) {
    const full = this.#normalize(path);
    if (this.#routes.get(full)?.opened) return true;
    const match = this.#findBestMatch(full);
    return !!(match && this.#routes.get(match.key)?.opened);
  }
  /**
   * Binds a click handler that activates a registered route.
   *
   * This is a convenience wrapper around `ActionRoute.run()` for non-anchor UI
   * controls or custom interactive elements.
   *
   * @param {Element} el Element that should trigger the route on click.
   * @param {string} path Registered route path to activate.
   * @param {ActionRouteNavigationOptions} [options={}] Navigation behavior.
   * @returns {() => void} Cleanup function that removes the click listener.
   */
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
      const queued = this.#queuedNavigation;
      this.#queuedNavigation = null;

      history.replaceState(cleanedState ?? null, "", targetUrl);
      queueMicrotask(() => {
        this.#onNav(targetPath);
        if (queued) {
          this.navigate(queued.path, {
            replace: queued.replace,
            baseKey: queued.baseKey,
          });
        }
      });
      return;
    }

    for (const [key, rec] of this.#routes) {
      const match = rec.match?.(full);

      if (match?.matched) {
        const previous = rec.last;
        const payload = this.#buildPayload(key, full, match, previous);
        const forced = this.#consumeForcedRun(key, full);

        if (!rec.opened || forced) {
          if (!rec.opened) {
            rec.opened = true;

            // Tag this entry if it was not already tagged by #onNavigationEvent.
            // Handles full-page navigations (no Navigation API) and re-entry after
            // external replaceState(null, …) has wiped the state.
            if (!history.state?.__ar) {
              const navInfo = this.#buildNavState(key);

              // Try to recover a same-origin return URL from document.referrer.
              try {
                const ref = new URL(document.referrer);
                if (ref.origin === location.origin) {
                  const refUrl  = ref.pathname + ref.search + ref.hash;
                  const refPath = this.#cleanPath(ref.pathname);
                  // Only use the referrer if it does NOT match this route (avoid returning to same view).
                  if (!rec.match?.(refPath)?.matched) {
                    navInfo.state.__arRootUrl  = refUrl;
                    navInfo.state.__arRootPath = refPath;
                    navInfo.state.__arPrevUrl  = refUrl;
                    navInfo.state.__arPrevPath = refPath;
                  }
                }
              } catch {
                // Referrer unavailable or cross-origin — keep defaults from #buildNavState.
              }

              history.replaceState(
                navInfo.state,
                "",
                location.pathname + location.search + location.hash,
              );
            }
          }

          try {
            rec.to(payload);
          } catch (e) {
            console.error(e);
          }
        }

        if (rec.in) {
          // Notify in() for every navigation that stays within this route,
          // including query-string and hash changes on the active path.
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

    // Leaving an owned route for an unowned or passive destination must fall
    // back to normal browser navigation. No dummy `"/"` route is required.
    if (!match) return;

    const matchedRoute = this.#routes.get(match.key);
    if (!matchedRoute?.intercept) return;

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

      // Keep `/` locally bound: by default it only owns the exact root path.
      // Catch-all behavior should be explicit via a custom matcher.
      if (base === "/") {
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
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;

    return {
      base,
      path: full,
      url: pathname + search + hash,
      pathname,
      search,
      searchParams: new URLSearchParams(search),
      hash,
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

  static #consumeForcedRun(key, full) {
    const forced = this.#forcedRun;
    if (!forced) return false;

    const sameKey = forced.key === key;
    const samePath = this.#cleanPath(forced.path) === this.#cleanPath(full);

    if (!sameKey || !samePath) return false;

    this.#forcedRun = null;
    return true;
  }

  static #pathFromUrl(url) {
    if (!url) return "/";
    return this.#mode === "path"
      ? this.#cleanPath(url.pathname)
      : this.#cleanPath(url.hash ? url.hash.slice(1) : "/");
  }

  static #canTraverseClose(rec, target, steps) {
    const nav = window.navigation;
    if (!nav?.entries || !nav.currentEntry) return false;

    let entries;
    try {
      entries = nav.entries();
    } catch {
      return false;
    }

    const currentIndex = nav.currentEntry?.index;
    if (!Number.isInteger(currentIndex)) return false;

    const safeSteps = Math.max(1, steps);
    const targetIndex = currentIndex - safeSteps;
    if (targetIndex < 0) return false;

    const targetPath = this.#cleanPath(target?.path ?? this.#fallbackPath());

    for (let index = targetIndex; index < currentIndex; index += 1) {
      const entry = entries[index];
      if (!entry?.url) return false;
      if ("sameDocument" in entry && entry.sameDocument === false) {
        return false;
      }

      let entryUrl;
      try {
        entryUrl = new URL(entry.url, location.href);
      } catch {
        return false;
      }

      if (entryUrl.origin !== location.origin) return false;

      const entryPath = this.#pathFromUrl(entryUrl);
      if (index === targetIndex) {
        if (entryPath !== targetPath) return false;
        if (rec?.match?.(entryPath)?.matched) return false;
      }
    }

    return true;
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
