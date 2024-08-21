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
      throw Error("Config mising or malformed");

    const createRender = (path, tagName, widget, properties) => {
      return (routeData) => {
        properties = PureSPA.mapRouterVariables(tagName, properties, routeData);

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
          subRouteName.indexOf("#") !== -1;

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
          customElements.define(tagName, options.run);
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
    for (const [selector, fn] of this.#list) {
      const nodes = element.querySelectorAll(selector);

      for (const node of nodes) {
        if (!node.hasAttribute("data-enhanced")) {
          const result = fn(node);
          node.setAttribute("data-enhanced", result?.toString() ?? "");
        }
      }
    }
  }
}

/**
 * Lit base class for SPA routing.
 *
 * - Uses URLPattern for routing with expressions
 * -
 */
export class PureSPA extends LitElement {
  #config;
  #currentRoute;
  #routeMap = new Map();
  #enhancers = new PureSPAEnhancementRegistry();

  constructor() {
    super();
    window.app = this;
  }

  connectedCallback() {
    super.connectedCallback();

    try {
      this.#config = new PureSPAConfig(this.constructor.config); // take static config() property from implementing class
      this.#setGlobalAttributes();

      this.routerReady = this.initializeRouting(); // Compile url patterns
    } catch (ex) {
      console.error("Configuration error: ", ex.toString());
    }
  }

  get enhancers() {
    return this.#enhancers;
  }

  /**
   * @returns {PureSPAConfig} configuration
   */
  get config() {
    return this.#config;
  }

  async initializeRouting() {
    const me = this;
    //await polyfillsLoaded; //Make sure that polyfills are loaded before using URLPattern API

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
      }
    );

    window.navigation.addEventListener("navigate", (event) => {
      if (event.hashChange) return;

      const route = this.#getRoute(event.destination.url);
      if (!route) return;

      event.intercept({
        async handler() {
          document.startViewTransition(() => {
            me.setRouteContent(route.data);

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
   * get active route
   */
  get activeRoute() {
    return this.#currentRoute;
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
   * Subclass this
   */
  async beforeRouting() {
    console.warn("Subclass async beforeRouting() to load polyfills and do other async initialzation")
  }

  #getRoute(urlString) {
    try {
      const url = new URL(urlString, location);

      const route = this.#findRoute(url);
      this.#setActiveRoute(route);

      try {
        return {
          route: route.pattern,
          data:
            typeof route.renderPage === "function"
              ? route.renderPage(route.patternResult)
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

  #setActiveRoute(route) {
    if (this.#currentRoute) {
      this.fire("leaveroute", {
        route: this.#currentRoute.route,
      });
    }

    this.#currentRoute = route;

    this.fire("activateroute", {
      route: this.#currentRoute,
    });

    console.warn("Active Route: ", route.path ?? "INVALID");
  }

  #findRoute(url) {
    for (const [pattern, options] of this.#routeMap) {
      const patternResult = pattern.exec(url);
      if (patternResult)
        return {
          ...options,
          pattern,
          patternResult,
        };
    }
    return;
  }

  fireRouteComplete() {
    this.fire("routecomplete", {
      route: this.#currentRoute,
    });
  }

  async matchRouteWhenReady() {
    await this.routerReady; // Wait for compiled patterns and polyfills (if needed)

    const url = window.location.href.split("?")[0];
    const route = this.#findRoute(url);

    this.#setActiveRoute(route);

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
    setTimeout(() => {
      this.enhancers.run(this);
    }, 1);
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
   * Called from router
   * @param {Object} content - route data to render
   */
  setRouteContent(content) {
    this.content = content;
    this.requestUpdate();
    requestAnimationFrame(this.routeComplete.bind(this));
  }

  /**
   * Called when a route change is completed.
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

  // Lit properties
  static get properties() {
    return {
      config: { type: Object },
    };
  }

  /**
   * Subclass this for any initialization stuff that needs to run before the first route is rendered.
   * @returns {Boolean}
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
   * Maps routing UrlPattern variables for Lit element dynamic rendering
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
}
