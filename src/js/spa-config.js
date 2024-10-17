import { PureSPA } from "./spa";
import { toWords, kebabToPascal } from "./common";
/**
 * Pure App Configuration
 */
export class PureSPAConfig {
  #rawConfig;
  #routes = {};
  #pages;
  #widgets;
  #elementNames = new Map(); // use element map for Safari 17- customElements.getName() not supported

  constructor(rawConfig) {
    this.#rawConfig = rawConfig;
    this.readConfig();
  }

  /**
   * Does some sanity checks on the config object passed in.
   * @param {Object} config 
   * @returns { Boolean } true if config is valid, false otherwise
   */
  static isWellFormedConfig(config) {
    return typeof config?.routes === "object";
  }

  readConfig() {
    if (!PureSPAConfig.isWellFormedConfig(this.#rawConfig))
      throw Error("Static config property missing or malformed.");

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
          const existing = this.getElementName(options.run);

          if (!existing) {
            this.defineElement(tagName, options.run);
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

  // use element map for Safari 17- customElements.getName() not supported
  getElementName(constructor) {
    return this.#elementNames.get(constructor) || null;
  }

  // use element map for Safari 17- customElements.getName() not supported
  defineElement(tagName, type) {
    customElements.define(tagName, type);
    this.#elementNames.set(type, tagName);
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
