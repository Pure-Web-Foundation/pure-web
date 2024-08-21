import { config } from "./app.config";
import { AutoComplete } from "./autocomplete";
import { parseHTML } from "./common";
import { PureSPA } from "./spa";
import { html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { polyfillsLoaded } from "./polyfills/polyfillsLoader";

customElements.define(
  "my-app",
  class MyApp extends PureSPA {
    #h1 = createRef();
    #aside = createRef();

    /**
     * Set app.config structure
     */
    static get config() {
      return config;
    }

    async beforeRouting() {
      return await polyfillsLoaded;
    }

    render() {
      return html`
        <header>
          <h1 ${ref(this.#h1)}></h1>
          <label id="omnibox"
            ><span data-label>Omnibox</span
            ><input
              @focus=${(e) => {
                AutoComplete.connect(e, this.autoCompleteOptions);
              }}
              type="search"
          /></label>
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
        this.#h1.value.textContent = this.activeRoute?.name;
      });
    }

    addMenu() {
      const menu = document.createElement("menu");
      for (const page of this.config.pages) {
        const li = parseHTML(
          /*html*/ `<li><a href="${page.path}">${page.name}</a></li>`
        )[0];
        menu.appendChild(li);
      }
      this.#aside.value.appendChild(menu);
    }

    get autoCompleteOptions() {
      return {
        // debug: true,
        categories: {
          Search: {
            trigger: (options) => {
              return options.search.length > 0;
            },
            getItems: (options) => {
              const fltr = AutoComplete.textFilter(options);
              return ["Pete", "Jane", "John", "Maria", "Robert", "Zack"]
                .filter(fltr)
                .map((i) => {
                  return { text: i };
                });
            },
          },
        },
      };
    }
  }
);
