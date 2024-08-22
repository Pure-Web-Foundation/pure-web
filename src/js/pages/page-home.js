import { html } from "lit";
import { PureSPA } from "../spa";
import { repeat } from "lit/directives/repeat.js";
import { exports as moduleExports, name } from "../../../package.json";

export class PageHome extends PureSPA.Page {
  render() {
    return html`
      <p>Welcome to <em>pure-web</em>.</p>
      <p>This is an <em>NPM</em> package with these exports:</p>
      <ul>
        ${repeat(Object.keys(moduleExports), (item) => {
          const id = item.substring(2);
          const hash = `#${name}${id}`;

          return html`<li>
            <a
              target="_blank"
              href="https://github.com/mvneerven/pure-web/blob/main/readme.md${hash}"
              >${name}/${id}</a
            >
          </li>`;
        })}
      </ul>
    `;
  }
}
