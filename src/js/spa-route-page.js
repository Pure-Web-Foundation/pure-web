import { LitElement } from "lit";

export class RoutePage extends LitElement {
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
