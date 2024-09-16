import { html, LitElement, css } from "lit";
import { until } from "lit/directives/until.js";

//#region Constants

const toWords = (text) => {
  text = text.replace(/([A-Z])/g, " $1");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const kebabToPascal = (str) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

const toBoolean = (value) => {
  switch (typeof value) {
    case "boolean":
      return value;
    case "string":
      return ["true", "false"].includes(value.toLowerCase());
    case "number":
      return value !== 0;
    default:
      return false;
  }
};

const isWellFormedConfig = (config) => {
  return typeof config?.routes === "object";
};

const BOOLEAN_ATTRIBUTES = "hidden,required,disabled,readonly".split(",");
//#endregion

const debug = ["localhost", "127.0.0.1"].includes(location.hostname);

/**
 * Pure App Configuration
 */
class PureSPAConfig {
  #rawConfig;
  #routes = {};
  #pages;
  #widgets;

  constructor(rawConfig) {
    this.#rawConfig = rawConfig;
    this.readConfig();
  }

  readConfig() {
    if (!isWellFormedConfig(this.#rawConfig))
      throw Error("PureSPA static config property mising or malformed.");

    const createRender = (path, tagName, widget, properties) => {
      return (routeData, pageData) => {
        properties = PureSPA.mapRouterVariables(tagName, properties, routeData);
        if (pageData) properties.pageData = pageData;

        return PureSPA.createCustomTagLitHtml(tagName, {
          routeKey: path,
          widget: widget,
          routeData: routeData,
          ...properties,
        });
      };
    };

    const traverseRoutes = (configPart, basePath = "") => {
      for (const [route, options] of Object.entries(configPart)) {
        const path = basePath + route;
        const parentConfig = this.#routes[basePath];
        let widgetSettings = {};

        if (options.run && options.run.widgetSettings) {
          widgetSettings = options.run.widgetSettings;
        }

        let subRouteName = route.substring(1);

        let cleanSubRouteName = (subRouteName || "home")
          .split("?")[0]
          .toLowerCase();
        const hasPattern =
          subRouteName.indexOf(":") !== -1 ||
          subRouteName.indexOf("?") !== -1 ||
          subRouteName.indexOf("#") !== -1 ||
          subRouteName.indexOf("*") !== -1;

        if (hasPattern)
          cleanSubRouteName = cleanSubRouteName.replace(
            new RegExp("/|:|#", "g"),
            ""
          );

        let tagName = options.tagName;
        if (!tagName) {
          if (hasPattern) {
            if (!parentConfig) {
              if (!options.run)
                throw Error(
                  "Invalid routing config for subroute (" + basePath + ")"
                );
            } else {
              tagName = parentConfig.tagName;

              if (options.run && parentConfig.run !== options.run) {
                tagName = `${parentConfig.tagName}-${cleanSubRouteName}`.trim();
              }
              //     throw("Cannot use other component on sub-pattern child pages")
            }
          } else {
            if (parentConfig) {
              tagName = `${parentConfig.tagName}-${subRouteName}`.trim();
            } else {
              tagName = `page-${cleanSubRouteName
                .toLowerCase()
                .replace(new RegExp("/", "g"), "-")}`;
            }
          }
        }

        if (tagName && options.run) {
          const existing = customElements.getName(options.run);

          if (!existing) {
            customElements.define(tagName, options.run);
          }
        }

        this.#routes[path] = {
          id: tagName.replace(/-/g, "_"),
          route: path,
          path: path.split("?")[0],
          parentRoute: basePath || undefined,
          isDetail: hasPattern,
          hidden: options.hidden ?? hasPattern,
          customPage: options.renderPage,
          renderPage: options.renderPage ?? createRender(path, tagName),
          widgetSettings: widgetSettings,
          customWidget: options.renderWidget,
          renderWidget:
            options.renderWidget ?? createRender(path, tagName, true),
          name: options.name ?? toWords(subRouteName),
          tagName: tagName,
          definedBy: options.className ?? kebabToPascal(tagName),
          ...options,
        };
        if (options.routes) {
          traverseRoutes(options.routes, path);
        }
      }
    };

    traverseRoutes(this.#rawConfig.routes);

    this.#pages = Object.values(this.#routes)
      .map((options) => {
        return {
          ...options,
        };
      })
      .filter((p) => !p.hidden);
  }

  /**
   * Returns all widgets (either custom ones defined in the config,
   * or page classes extending WidgetEnabledPage)
   */
  get widgets() {
    const createElement = (t) => {
      try {
        return document.createElement(t);
      } catch {
        return {};
      }
    };
    if (!this.#widgets)
      this.#widgets = Object.values(this.#routes)
        .filter((options) => !options.isDetail)
        .map((options) => {
          return {
            ...options,
            widget:
              options.customWidget ||
              createElement(options.tagName) instanceof
                PureSPA.WidgetEnabledPage,
          };
        })
        .filter((i) => i.widget);

    return this.#widgets;
  }

  get routes() {
    return this.#routes;
  }

  get pages() {
    return this.#pages;
  }
}

class RoutePage extends LitElement {
  static get properties() {
    return {
      routeKey: { type: String },
      routeData: { type: Object },
    };
  }

  /**
   * Returns the current route's properties as defined in the configuration
   */
  get routeProperties() {
    return app.config.routes[this.routeKey];
  }

  // use light DOM
  createRenderRoot() {
    return this;
  }
}

/**
 * Extends page components to become Widget-enabled
 */
class WidgetEnabledRoutePage extends RoutePage {
  static get properties() {
    return {
      ...RoutePage.properties,
      widget: {
        type: Boolean,
        attribute: true,
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    const isFn = typeof this.constructor.getWidgetSettings === "function";
    const settings = isFn ? this.constructor.getWidgetSettings() : {};
    if (settings?.full) {
      this.setAttribute("full", "");
    }
    this.setAttribute("priority", settings.priority ?? 0);
  }

  render() {
    if (this.widget) return this.renderWidget();

    return this.renderPage();
  }

  /**
   * Renders a widget to display elsewhere
   */
  renderWidget() {
    throw new Error("renderWidget() must be implemented.");
  }

  /**
   * Gets the widget's settings
   */
  getWidgetSettings() {
    return {
      priority: 0,
      full: false,
    };
  }

  /**
   * Renders the page as a route component
   */
  renderPage() {
    throw new Error("renderPage() must be implemented.");
  }
}

/**
 * Progressive enhancers registry
 */
class PureSPAEnhancementRegistry {
  #list = new Map();

  add(selector, enhancementFn) {
    this.#list.set(selector, enhancementFn);
  }

  run(element) {
    const length = this.#list.size;
    if (length === 0) return;
    for (const [selector, fn] of this.#list) {
      const enhance = (n, s, fn) => {
        if (n.hasAttribute("data-enhanced")) return;
        const result = fn(n);
        n.setAttribute("data-enhanced", result?.toString() ?? "");
      };

      if (element.matches(selector)) enhance(element, selector, fn);

      const nodes = [...element.querySelectorAll(selector)];

      for (const node of nodes) enhance(node, selector, fn);
    }
  }
}

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
    const me = this;

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

    window.navigation.addEventListener("navigate", (event) => {
      if (event.hashChange) return;

      const route = this.#getRoute(event.destination.url);
      if (!route) return;

      document.documentElement.dataset.transition = this.getTransitionType();

      event.intercept({
        async handler() {
          document.startViewTransition(() => {
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
    });

    console.log(this.config);

    await this.beforeRouting();
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
    new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) me.enhancers.run(node);
          }
        }
      }
    }).observe(this, { childList: true, subtree: true });
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
   * Makes router navigate to given URL
   * @param {String} url path to navigate to
   * @param {Object} options - Use {strict: false} to always navigate (even if the path doesn't match any route)
   */
  goTo(
    url,
    options = {
      strict: true,
    }
  ) {
    const fullURL = new URL(url, location.origin);
    if (fullURL.origin === location.origin) {
      const path = fullURL.pathname + fullURL.hash;

      if (options.checkRoute) {
        const route = this.#findRoute(fullURL, options?.strict);
        if (route) {
          window.history.pushState({}, "", path);
          return;
        }
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
