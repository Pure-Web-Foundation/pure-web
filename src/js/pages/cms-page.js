import { html } from "lit";
import { PureSPA } from "../spa";
import { repeat } from "lit/directives/repeat.js";

export class PageCMS extends PureSPA.Page {

  render() {

    const page = app.pageData;

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
