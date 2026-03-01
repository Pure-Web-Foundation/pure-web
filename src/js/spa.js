import { html, LitElement, css } from "lit";
import { until } from "lit/directives/until.js";
import { PureSPAConfig } from "./spa-config";
import { PureSPAEnhancementRegistry } from "./spa-enhancements";
import { RoutePage } from "./spa-route-page";
import { WidgetEnabledRoutePage } from "./spa-widget-route-page";
import { startViewTransition, toBoolean } from "./common";

//#region Constants

const BOOLEAN_ATTRIBUTES = "hidden,required,disabled,readonly".split(",");
//#endregion

const debug = ["localhost", "127.0.0.1"].includes(location.hostname);

/**
 * Light-DOM Lit Container Base Class for SPA routing.
 *
 * - Uses URLPattern for routing with expressions
 * - Uses View Transitions between routes
 * - Uses Navigator.navigate Event for route switching
 * - Facilitates Progressive enhancement by applying your enhancement rules at DOM changes
 */
export class PureSPA extends LitElement {
  #config;

  #routeMap = new Map();
  #enhancers = new PureSPAEnhancementRegistry();

  constructor() {
    super();
    window.app = this;
  }

  // Lit properties
  static get properties() {
    return {
      config: { type: Object },
      activeRoute: { type: Object },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    try {
      this.#config = new PureSPAConfig(this.constructor.config); // take static config() property from implementing class
      this.#setGlobalAttributes();

      this.routerReady = this.#initializeRouting(); // Compile url patterns
    } catch (ex) {
      throw Error(`PureSPA configuration error: ${ex.toString()}`);
    }
  }

  /**
   * @returns { PureSPAEnhancementRegistry } enhancers registry
   */
  get enhancers() {
    return this.#enhancers;
  }

  /**
   * @returns {PureSPAConfig} configuration
   */
  get config() {
    return this.#config;
  }

  async #initializeRouting() {
    await this.beforeInitialize();

    const routes = {};
    for (const [path, options] of Object.entries(this.config.routes)) {
      routes[path] = options;
    }

    for (const r in routes) {
      this.#routeMap.set(new URLPattern(r, window.location.origin), routes[r]);
    }

    this.#routeMap.set(
      new URLPattern({
        pathname: "*",
        search: "*",
        baseURL: location.origin,
      }),
      {
        route: "unknown",
        renderPage: this.notFoundPage,
        isNotFound: true,
      }
    );

    this.enableInterception();

    await this.beforeRouting();
  }

  enableInterception() {
    this.boundNavigate = this.navigate.bind(this);
    window.navigation.addEventListener("navigate", this.boundNavigate);
  }

  disableInterception() {
    window.navigation.removeEventListener("navigate", this.boundNavigate);
  }

  navigate(event) {
    const me = this;
    if (event.hashChange) return;

    const route = this.#getRoute(event.destination.url);
    if (!route) return;

    document.documentElement.dataset.transition = this.getTransitionType();

    event.intercept({
      async handler() {
        startViewTransition(() => {
          me.#setRoute(route);

          // Scroll to top of page.
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
          });
        });
      },
    });
  }

  /**
   * Gets the transition type for the view transition,
   * by comparing the current and future URLs.
   */
  getTransitionType() {
    const getDirection = (currentPath, newPath) => {
      if (newPath === currentPath) return;
      if (newPath.startsWith(currentPath)) return "forwards";
      else if (currentPath.startsWith(newPath)) return "backwards";
    };

    const cUrl = (u) => {
      if (! u.startsWith('http')) u = location.origin + u;
      const url = new URL(u);
      return url.pathname + url.hash;
    };

    return getDirection(cUrl(location.href), cUrl(event.destination.url));
  }

  /**
   * Dispatch app-level event
   * @param {String} eventName
   * @param {Object} detail Optional details to pass along with event
   */
  fire(eventName, detail = {}) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: detail || {},
      })
    );
  }

  /**
   * Listen for app-level event
   * @param {String} eventName
   * @param {Function} func
   */
  on(eventName, func) {
    this.addEventListener(eventName, func);
    return this;
  }

  /**
   * Stop listening to app-level event
   * @param {String} eventName
   * @param {Function} func
   */
  off(eventName, func) {
    this.removeEventListener(eventName, func);
    return this;
  }

  /**
    Subclass  beforeInitialize() to load polyfills and do other async initialization
  */
  async beforeInitialize() {}
  /**
   * Subclass beforeRouting() to do stuff when all routes have been created but before the first page is served.
   */
  async beforeRouting() {}

  #findRoute(url, strict = false) {
    for (const [pattern, options] of this.#routeMap) {
      const patternResult = pattern.exec(url);
      if (patternResult && (!strict || !options.isNotFound))
        return {
          ...options,
          pattern,
          patternResult,
        };
    }
    return;
  }

  #getRoute(urlString) {
    try {
      const url = new URL(urlString, location);

      const route = this.#findRoute(url);

      try {
        return {
          pattern: route.pattern,
          data:
            typeof route.renderPage === "function"
              ? route.renderPage(route.patternResult, this.getPageData(route))
              : route.renderPage,
          options: route,
        };
      } finally {
        this.fireRouteComplete();
      }
    } catch (ex) {
      console.error("getRoute error: ", ex);
    }
  }

  /**
   * Subclass to pass specific data to a page as a property
   * @param {Object} route
   */
  // eslint-disable-next-line no-unused-vars
  getPageData(route) {}

  fireRouteComplete() {
    this.fire("routecomplete", {
      route: this.activeRoute,
    });
  }

  async matchRouteWhenReady() {
    await this.routerReady; // Wait for compiled patterns and polyfills (if needed)

    const url = window.location.href; //.split("?")[0];
    const route = this.#getRoute(url);

    this.#setRoute(route, true);

    try {
      return typeof route.renderPage === "function"
        ? route.renderPage(route.patternResult)
        : route.renderPage;
    } finally {
      this.fireRouteComplete();
    }
  }

  matchRoute() {
    // Use until directive to show "Loading..." message while polyfills are being loaded.
    // https://lit.dev/docs/templates/directives/#until
    return until(this.matchRouteWhenReady(), this.loadingPage);
  }

  /**
   * Subclass this to set the 404 page
   */
  get notFoundPage() {
    return html`<section class="block callout error">
      <h2>Not found</h2>
      <div class="center">
        <svg-icon icon="error" size="200px" color="#931620"></svg-icon>
      </div>
      <div>
        <h3>This page could not be found</h3>
      </div>
    </section>`;
  }

  updated() {
    super.updated();
    this.waitForFullRendering();
  }

  async waitForFullRendering() {
    await this.getUpdateComplete();
    this.enhancers.run(this);
  }

  firstUpdated() {
    const me = this;
    const enhance = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        me.enhancers.run(node);
      }
    };

    new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            enhance(node);
          }
        } else if (mutation.type === "attributes") {
          enhance(mutation.target);
        }
      }
    }).observe(this, { childList: true, subtree: true, attributes: true });
  }

  /**
   * Sublass this to set the loading page html.
   */
  get loadingPage() {
    return html` <div class="fill skeleton">
      <app-shimmer class="title"></app-shimmer>
      <app-shimmer class="image"></app-shimmer>
      <app-shimmer></app-shimmer>
    </div>`;
  }

  goBack(fallback) {
    if (navigation.canGoBack) {
      history.back();
      return;
    }

    history.replaceState({}, "", fallback);
  }

  /**
   * @typedef {Object} GoToOptions Options for the goTo method.
   * @property {Boolean} strict - If false, makes goTo() always navigate (even if the path doesn't match any route)
   * @property {Boolean} force - If true, forces a reload of the page even when the path matches an existing route
   */

  /**
   * Makes router navigate to given URL
   * @param {String} url path to navigate to
   * @param {GoToOptions} options Options for navigation
   */
  goTo(
    url,
    options = {
      strict: true,
      force: false,
    }
  ) {
    const fullURL = new URL(url, location.origin);
    if (fullURL.origin === location.origin) {
      const path = fullURL.pathname + fullURL.hash;
      const route = this.#findRoute(fullURL, options?.strict);

      if (route) {
        // no support for window.navigation, or bypass navigation interception
        if (window._polyfillState?.navigation || options?.force) {
          this.disableInterception();
          window.location.href = path;
        } else {
          window.history.pushState({}, "", path);
        }
        return;
      }
    }

    if (!options?.strict) location.href = url;
    else throw new Error("Invalid route");
  }

  /**
   * Called from router
   * @param {Object} route - route to render
   */
  #setRoute(route) {
    this.activeRoute = route;
    this.routeSet();
    this.content = route.data;
    this.requestUpdate();
    requestAnimationFrame(this.routeComplete.bind(this));
  }

  /**
   * Called when the active route has changed
   * @abstract
   */
  routeSet() {}

  /**
   * Called when a route change is completed.
   * @abstract
   */
  routeComplete() {
    // for subclassing...
  }

  /**
   * Called on first page request.
   * On route changes (via router), setRouteContent()
   * is called from router, which forces re-render.
   */
  getRouteContent() {
    const route = this.matchRoute();

    this.content = new Promise((resolve) => {
      this.readyToRoute().then(() => {
        resolve(route);
        requestAnimationFrame(this.routeComplete.bind(this));
      });
    });
  }

  render() {
    if (!this.content) this.getRouteContent();

    return html`${until(this.content, this.loadingPage)}`;
  }

  // PureApp is a Light DOM Web Component
  createRenderRoot() {
    return this;
  }

  /**
   * Subclass this for any initialization stuff that needs to run before the first route is rendered.
   * @returns {Boolean}
   * @abstract
   */
  async readyToRoute() {
    // add more stuff that needs to run before routing starts...
    return true;
  }

  // set <html> element attributes
  #setGlobalAttributes() {
    const htm = document.documentElement;
    if (debug) htm.setAttribute("debug", "");
  }

  /**
   * @returns {WidgetEnabledPage} Class that can be extended from in Routes that also have a Widget.
   */
  static get WidgetEnabledPage() {
    return WidgetEnabledRoutePage;
  }

  /**
   * @returns {RoutePage} Class that can be extended from in Routes.
   */
  static get Page() {
    return RoutePage;
  }

  /**
   * Returns Lit Safe html to render any Web Component
   * @param {String} tagName
   * @param {Object} keyValuePairs
   * @returns { html }
   */
  static createCustomTagLitHtml(tagName, keyValuePairs) {
    const body = `return html\`<${tagName} ${PureSPA.generateAttributeString(
      keyValuePairs
    )}></${tagName}>\``;

    const renderCustomElement = Function.apply(null, [
      "html, css, field",
      body,
    ]);

    return html`${renderCustomElement(html, css, keyValuePairs)}`;
  }

  /**
   * Generates an attribute string dynamically.
   * @param {Object} keyValuePairs
   * @returns { String } html attribute string
   */
  static generateAttributeString(keyValuePairs) {
    const body = [];
    Object.entries(keyValuePairs).forEach(([key, value]) => {
      const type = typeof value;
      switch (key) {
        case "label":
          body.push(`data-label="${value}" `);
          break;
        case "subType":
          body.push(`type="${value}" `);
          break;
        default:
          if (["boolean"].includes(type) || BOOLEAN_ATTRIBUTES.includes(key)) {
            body.push((toBoolean(value) ? key : "") + " ");
          } else if (["string", "number"].includes(type)) {
            body.push(`${key}="${value}" `);
          } else body.push(`.${key}=$` + `{field['${key}']` + `} `);
          break;
      }
    });
    return body.join("");
  }

  /**
   * Maps routing URLPattern variables for Lit element dynamic rendering
   * @param {String} tagName
   * @param {Object} properties
   * @param {Object} routeData
   * @returns
   */
  static mapRouterVariables(tagName, properties, routeData) {
    properties = { ...(properties ?? {}) };
    const element = window.customElements.get(tagName);
    if (element && element.properties) {
      for (const [propertyName, options] of Object.entries(
        element.properties
      )) {
        if (options.routeOrigin)
          properties[propertyName] =
            routeData[options.routeOrigin]?.groups[propertyName];
      }
    }
    return properties;
  }

  /**
   * Gets the breadcrumps of the given route
   * @param {Object} route
   * @returns {Array} array with the breadcrumbs.
   */
  getBreadCrumbs(route) {
    const path = route.options.path;

    const ar = [];

    const recurse = (p) => {
      const route = this.config.routes[p];
      if (!route) return;

      if (!route.hidden && !route.isDetail)
        ar.push({
          name: route.name,
          url: route.route,
        });
      if (route.parentRoute) recurse(route.parentRoute);
    };

    recurse(path);
    return ar.reverse();
  }
}
