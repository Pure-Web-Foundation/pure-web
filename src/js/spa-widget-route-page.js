import { RoutePage } from "./spa-route-page";

/**
 * Extends page components to become Widget-enabled
 */
export class WidgetEnabledRoutePage extends RoutePage {
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
