import { html } from "lit";
import { PureSPA } from "../spa";
import { name, version, description, repository } from "../../../package.json";

export class PageAbout extends PureSPA.Page {
  render() {
    return html`
      <h3>${name} ${version}</h3>
      <p>${description}</p>
      <nav class="icons x-large">
        <a href="${repository.url}" target="_blank" title="GitHub"><svg-icon icon="github"></svg-icon></a>
        <a href="https://www.npmjs.com/package/${name}" target="_blank" title="NPM"><svg-icon icon="npm"></svg-icon></a>
     </nav>
    `;
  }
}

