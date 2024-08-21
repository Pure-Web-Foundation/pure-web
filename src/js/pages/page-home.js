import { html } from "lit";
import { PureSPA } from "../spa";

export class PageHome extends PureSPA.Page {
  render() {
    return html`
      <div>
        <input
          name="test"
          placeholder="Test input..."
          type="text"
          data-label="Test"
        />


        <svg-icon icon="menu"></svg-icon>


      </div>
    `;
  }
}
