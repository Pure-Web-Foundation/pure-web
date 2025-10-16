/* eslint-disable no-console */
/**
 * Dynamically load and (idempotently) define a set of web components by tag name.
 */
async function defineWebComponents(...args) {
  let opts = {};
  if (args.length && typeof args[args.length - 1] === "object") {
    opts = args.pop() || {};
  }
  const tags = args;

  const {
    baseURL,
    mapper = (tag) => `${tag}.js`,
    onError = (tag, err) => console.error(`[defineWebComponents] ${tag}:`, err),
  } = opts;

  const base = baseURL
    ? new URL(
        baseURL,
        typeof location !== "undefined" ? location.href : import.meta.url
      )
    : new URL("./", import.meta.url);

  const toPascal = (tag) =>
    tag.toLowerCase().replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());

  const loadOne = async (tag) => {
    try {
      if (customElements.get(tag)) return { tag, status: "already-defined" };

      const href = new URL(mapper(tag), base).href;
      const mod = await import(href);
      const Named = mod?.default ?? mod?.[toPascal(tag)];

      if (!Named) {
        if (customElements.get(tag)) return { tag, status: "self-defined" };
        throw new Error(
          `No export found for ${tag}. Expected default export or named export "${toPascal(
            tag
          )}".`
        );
      }

      if (!customElements.get(tag)) {
        customElements.define(tag, Named);
        return { tag, status: "defined" };
      }
      return { tag, status: "race-already-defined" };
    } catch (err) {
      onError(tag, err);
      throw err;
    }
  };

  return Promise.all(tags.map(loadOne));
}

/**
 * Auto-definer that also works inside open Shadow DOM.
 * Automatically defines unknown custom elements (tags with a dash)
 * and attach progressive enhancers to given selectors.
 *
 * Options:
 *   baseURL: string | URL
 *   mapper: (tag) => string
 *   onError: (tag, err) => void
 *   predicate: (tag, el) => boolean
 *   attributeModule: string = "data-module"
 *   root: Node = document
 *   scanExisting: boolean = true
 *   debounceMs: number = 16
 *   observeShadows: boolean = true
 *   enhancers: Array<{selector: string, run: (elem: Element) => void}> = []
 *   patchAttachShadow: boolean = true
 *
 * Returns: { stop(): void, flush(): Promise<void> }
 */
export class AutoDefiner {
  constructor(options = {}) {
    const {
      baseURL,
      mapper,
      onError,
      predicate = () => true,
      attributeModule = "data-module",
      root = document,
      scanExisting = true,
      debounceMs = 16,
      observeShadows = true,
      enhancers = [], // [{String selector, Function run(elem)}]
      patchAttachShadow = true,
    } = options;

  const pending = new Set(); // tags queued for definition
  const inFlight = new Set(); // tags currently importing
  const knownMissing = new Set(); // tags that failed before
  const perTagModulePath = new Map(); // tag -> explicit module path (from data-module)
  const shadowObservers = new WeakMap(); // ShadowRoot -> MutationObserver
  const enhancerApplied = new WeakMap(); // element -> Set of applied enhancer selectors
  let timer = 0;
  let stopped = false;
    let restoreAttachShadow = null;

    const applyEnhancers = (element) => {
      // Skip if no enhancers provided
      if (!element || !enhancers.length) return;

      // Get or create the set of applied enhancers for this element
      let appliedEnhancers = enhancerApplied.get(element);
      if (!appliedEnhancers) {
        appliedEnhancers = new Set();
        enhancerApplied.set(element, appliedEnhancers);
      }

      // Check each enhancer
      for (const enhancer of enhancers) {
        if (!enhancer.selector || !enhancer.run) continue;
        
        // Skip if this enhancer was already applied to this element
        if (appliedEnhancers.has(enhancer.selector)) continue;

        try {
          // Check if element matches the selector
          if (element.matches && element.matches(enhancer.selector)) {
            enhancer.run(element);
            // Mark this enhancer as applied to this element
            appliedEnhancers.add(enhancer.selector);
          }
        } catch (err) {
          console.warn(
            `[AutoDefiner] Error applying enhancer for selector "${enhancer.selector}":`,
            err
          );
        }
      }
    };

    const queueTag = (tag, el /* optional */) => {
      if (stopped) return;
      if (!tag || !tag.includes("-")) return;
      if (customElements.get(tag)) return;
      if (inFlight.has(tag)) return;
      if (knownMissing.has(tag)) return;

      // Capture per-instance module override from the element itself (works in shadow DOM)
      if (el && el.getAttribute) {
        const override = el.getAttribute(attributeModule);
        if (override && !perTagModulePath.has(tag)) {
          perTagModulePath.set(tag, override);
        }
      }

      pending.add(tag);
      schedule();
    };

    const schedule = () => {
      if (timer) return;
      timer = setTimeout(flush, debounceMs);
    };

    const crawlTree = (rootNode) => {
      // rootNode can be Document, Element, ShadowRoot
      if (!rootNode) return;
      
      // Process the root node if it's an element
      if (rootNode.nodeType === 1) {
        const el = /** @type {Element} */ (rootNode);
        const tag = el.tagName?.toLowerCase();
        if (
          tag &&
          tag.includes("-") &&
          !customElements.get(tag) &&
          predicate(tag, el)
        ) {
          queueTag(tag, el);
        }

        // Apply enhancers to this element
        applyEnhancers(el);

        // Observe/open shadow roots we encounter
        if (observeShadows && el.shadowRoot) {
          observeShadowRoot(el.shadowRoot);
        }
      }

      // Process all descendant elements (but not the root node again)
      if (rootNode.querySelectorAll) {
        rootNode.querySelectorAll("*").forEach((e) => {
          const t = e.tagName?.toLowerCase();
          if (
            t &&
            t.includes("-") &&
            !customElements.get(t) &&
            predicate(t, e)
          ) {
            queueTag(t, e);
          }

          // Apply enhancers to descendant elements
          applyEnhancers(e);

          if (observeShadows && e.shadowRoot) {
            observeShadowRoot(e.shadowRoot);
          }
        });
      }
    };

    const observeShadowRoot = (sr) => {
      if (!sr || shadowObservers.has(sr)) return;
      // Initial scan inside this shadow
      crawlTree(sr);

      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes?.forEach((n) => {
            crawlTree(n);
          });
          if (m.type === "attributes" && m.target) {
            crawlTree(m.target);
          }
        }
      });
      mo.observe(sr, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          attributeModule,
          ...enhancers
            .map((e) => e.selector)
            .filter((s) => s.startsWith("data-")),
        ],
      });
      shadowObservers.set(sr, mo);
    };

    async function flush() {
      clearTimeout(timer);
      timer = 0;
      if (!pending.size) return;

      const tags = Array.from(pending);
      pending.clear();
      tags.forEach((t) => inFlight.add(t));

      try {
        const effectiveMapper = (tag) =>
          perTagModulePath.get(tag) ?? (mapper ? mapper(tag) : `${tag}.js`);

        await defineWebComponents(...tags, {
          baseURL,
          mapper: effectiveMapper,
          onError: (tag, err) => {
            knownMissing.add(tag);
            onError?.(tag, err);
          },
        });
      } catch {
        // errors per tag recorded via onError
      } finally {
        tags.forEach((t) => inFlight.delete(t));
      }
    }

    // Root observer (document or provided root)
    const mountNode = root === document ? document.documentElement : root;
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes?.forEach((n) => {
          crawlTree(n);
        });
        if (m.type === "attributes" && m.target) {
          crawlTree(m.target);
        }
      }
    });
    obs.observe(mountNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        attributeModule,
        ...enhancers
          .map((e) => e.selector)
          .filter((s) => s.startsWith("data-")),
      ],
    });

    // Patch attachShadow to auto-observe newly created open shadows
    if (observeShadows && patchAttachShadow && Element.prototype.attachShadow) {
      const orig = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function patchedAttachShadow(init) {
        const sr = orig.call(this, init);
        if (init && init.mode === "open") {
          observeShadowRoot(sr);
          // queue potential unknown host tag too
          const tag = this.tagName?.toLowerCase();
          if (tag && tag.includes("-") && !customElements.get(tag)) {
            queueTag(tag, this);
          }
        }
        return sr;
      };
      restoreAttachShadow = () => (Element.prototype.attachShadow = orig);
    }

    // Initial scan
    if (scanExisting) {
      crawlTree(mountNode);
    }

    return {
      stop() {
        stopped = true;
        obs.disconnect();
        if (restoreAttachShadow) restoreAttachShadow();
        if (timer) {
          clearTimeout(timer);
          timer = 0;
        }
        // Disconnect all shadow observers
        shadowObservers.forEach((mo) => mo.disconnect());
      },
      flush,
    };
  }
}
