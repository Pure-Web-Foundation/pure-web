import { config } from "./app.config";

import {
  enhanceButtonWithIcon,
  enhanceInputWithLabel,
  enhanceMasonryGrid,
  enhanceNavDropdownButton,
  parseHTML,
} from "./common";
import { PureSPA } from "./spa";
import { html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { polyfillsLoaded } from "./polyfills/polyfillsLoader";
import "./svg-icon";

customElements.define(
  "pure-web",
  class MyApp extends PureSPA {
    #h1 = createRef();
    #aside = createRef();

    /**
     * Set app.config structure
     */
    static get config() {
      return config;
    }

    constructor() {
      super();

      this.enhancers.add("[data-label]", enhanceInputWithLabel);
      this.enhancers.add("nav[data-dropdown]", enhanceNavDropdownButton);
      this.enhancers.add(
        "button[data-prepend-icon], button[data-append-icon]",
        enhanceButtonWithIcon
      );
      this.enhancers.add(".masonry", enhanceMasonryGrid);
    }

    async beforeRouting() {
      return await polyfillsLoaded;
    }

    render() {
      return html`
        <header>
          <h1 ${ref(this.#h1)}></h1>
        </header>
        <aside ${ref(this.#aside)}></aside>
        <main>${super.render()}</main>
        <footer>&copy; ${new Date().getFullYear()} Neerventure</footer>
      `;
    }

    firstUpdated() {
      super.firstUpdated();

      this.addMenu();

      this.on("routecomplete", () => {
        this.#h1.value.innerHTML = this.getBreadCrumbs(this.activeRoute)
          .map((r) => {
            return `<a href=${r.url}>${r.name}</a>`;
          })
          .join("/");
      });

      app.on("activateroute", (e) => {
        const activeUrl = e.detail.route.path + "/";

        this.renderRoot.querySelectorAll("[href]").forEach((anchor) => {
          const href = anchor.getAttribute("href") + "/";

          const isActive = activeUrl.indexOf(href) !== -1;
          anchor.classList.toggle("active", isActive);
        });
      });
    }

    addMenu() {
      const menu = document.createElement("menu");
      for (const page of this.config.pages.filter((p) => {
        return !p.parentRoute;
      })) {
        const li = parseHTML(
          /*html*/ `<li><a href="${page.path}">${page.name}</a></li>`
        )[0];
        menu.appendChild(li);
      }
      this.#aside.value.appendChild(menu);
    }
  }
);
