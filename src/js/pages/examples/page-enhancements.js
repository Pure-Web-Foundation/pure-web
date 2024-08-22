import { html } from "lit";
import { PureSPA } from "../../spa";
import { AutoComplete } from "../../autocomplete";

export class PageEnhancements extends PureSPA.Page {
  render() {
    return html`
      <div>
        <h3>Enhanced inputs</h3>

        <code> import { enhanceInputWithLabel } from "pure-web/common"; </code>

        <input
          name="test"
          placeholder="Enter your full name..."
          type="text"
          data-label="Your name"
          maxlength="25"
        />
      </div>

      <div>
        <h3>Dropdown Button</h3>

        <code>
          import { enhanceNavDropdownButton } from "pure-web/common";
        </code>

        <nav data-dropdown class="align-left">
          <button data-prepend-icon="menu"></button>
          <menu>
            <li><a href="/account">Account</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="#" @click=${this.optionsClick}>Special options</a></li>
            <li><hr /></li>
            <li><a href="/sign-out">Sign out</a></li>
          </menu>
        </nav>
      </div>

      <div>
        <h3>AutoComplete</h3>

        <code> import { AutoComplete } from "pure-web/ac"; </code>

        <label
          ><span data-label>Omnibox</span
          ><input
            data-prefix="a"
            @focus=${(e) => {
              AutoComplete.connect(e, this.autoCompleteOptions);
            }}
            type="search"
            placeholder="Search everything..."
        /></label>
      </div>
    `;
  }

  get autoCompleteOptions() {
    return {
      // debug: true,
      categories: {
        Site:{
          trigger: (options) => {
            return options.search.length === 0;
          },
          action: options => {
            location.href = options.path
          },
          getItems: () => {
            return app.config.pages.filter(p=>!p.hidden).map(p=>{
              return {
                text: p.name,
                path: p.path,
                icon: "right"
              }
            })
          }
        },
        Search: {
          trigger: (options) => {
            return options.search.length > 0;
          },

          getItems: (options) => {
            const fltr = AutoComplete.textFilter(options);
            return ["Pete", "Jane", "John", "Maria", "Robert", "Zack"]
              .filter(fltr)
              .map((i) => {
                return { text: i, description: "User name", icon: "user" };
              });
          },
        },
      },
    };
  }
}
