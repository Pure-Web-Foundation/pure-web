import { html } from "lit";
import { PureSPA } from "../spa";

import { repeat } from "lit/directives/repeat.js";
import { TinyCMS } from "../tiny-cms";

export class PageCMS extends PureSPA.Page {
  static get properties() {
    return {
      cms_id: {
        type: String,
        routeOrigin: "pathname",
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.cms = new TinyCMS();
  }

  render() {
    const page = this.cms.getPage(location.pathname);

    if(!page)
      return app.notFoundPage;

    if (!page.childPages.length) {
      return html`
        <article>
          <h2>${page.title}</h2>
          <div>${page.body}</div>
        </article>
      `;
    } else {
      return html` <ul>
        ${repeat(page.childPages, (item) => {
          return html`<li>
            <a href="${item.fullSlug}">${item.title}</a>
          </li>`;
        })}
      </ul>`;
    }
  }
}
