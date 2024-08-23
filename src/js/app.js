import { config } from "./app.config";

import {
  enhanceButtonWithIcon,
  enhanceInputWithLabel,
  enhanceMasonryGrid,
  enhanceNavDropdownButton,
  enhanceRangeStars,
} from "./common";
import { PureSPA } from "./spa";
import { html, nothing } from "lit";
import { polyfillsLoaded } from "./polyfills/polyfillsLoader";
import { repeat } from "lit/directives/repeat.js";
import "./svg-icon";

customElements.define(
  "pure-web",
  class MyApp extends PureSPA {
    /**
     * Set app.config structure
     */
    static get config() {
      return config;
    }

    constructor() {
      super();

      this.enhancers.add("nav[data-dropdown]", enhanceNavDropdownButton);
      this.enhancers.add(
        "button[data-prepend-icon], button[data-append-icon]",
        enhanceButtonWithIcon
      );
      this.enhancers.add(".masonry", enhanceMasonryGrid);

      this.enhancers.add("input[type='range'].stars-rating", enhanceRangeStars);

      this.enhancers.add("[data-label]", enhanceInputWithLabel);
    }

    async beforeRouting() {
      return await polyfillsLoaded;
    }

    render() {
      return html`
        <header>
          <h1>${this.renderBreadCrumbs()}</h1>
        </header>
        <aside>${this.renderMenu()}</aside>
        <main>${super.render()}</main>
        <footer>&copy; ${new Date().getFullYear()} Neerventure</footer>
      `;
    }

    firstUpdated() {
      super.firstUpdated();

      app.on("activateroute", (e) => {
        const activeUrl = e.detail.route.path + "/";
        this.renderRoot.querySelectorAll("[href]").forEach((anchor) => {
          const href = anchor.getAttribute("href") + "/";

          const isActive = activeUrl.indexOf(href) !== -1;
          anchor.classList.toggle("active", isActive);
        });
      });
    }

    renderMenu() {
      const items = this.config.pages.filter((p) => {
        return !p.parentRoute && !p.hidden;
      });
      return html`<menu>
        ${repeat(items, (item) => {
          return html`<li><a href="${item.path}">${item.name}</a></li>`;
        })}
      </menu>`;
    }

    renderBreadCrumbs() {
      if (!this.activeRoute) return nothing;

      const breadcrumbs = this.getBreadCrumbs(this.activeRoute);

      return html`
        ${this.renderHomeLinkIfNeeded()}
        ${repeat(breadcrumbs, (item, index) => {
          return html`<a href=${item.url}>${item.name}</a> ${index <
            breadcrumbs.length - 1
              ? "/"
              : ""}`;
        })}
      `;
    }

    renderHomeLinkIfNeeded() {
      if (this.activeRoute?.path === "/") return nothing;
      return html`<a href="/">${app.config.routes["/"].name}</a>/`;
    }
  }
);
