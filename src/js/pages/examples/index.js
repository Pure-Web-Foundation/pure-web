import { html } from "lit";
import { PureSPA } from "../../spa";
import { repeat } from "lit/directives/repeat.js";

export class PageExamples extends PureSPA.Page {
  static get properties(){
    return {
      pageData: {type: Object}
    }
  }
  render() {


    const exampleNodes = app.config.pages.filter((p) => {
      return p.parentRoute === "/examples";
    });

    return html`
    <ul>
      ${repeat(exampleNodes, (node) => {
        return html`<li>
          <a href="${node.route}">${node.name}</a>
        </li>`;
      })}
      </ul>`;
  }
}
