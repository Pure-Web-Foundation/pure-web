import { html } from "lit";
import { PureSPA } from "../spa";

export class PageAbout extends PureSPA.WidgetEnabledPage {
  renderPage() {
    return html`

    <div>
    <input
      name="test"
      placeholder="Test input..."
      type="text"
      data-label="Test"
      maxlength="20"
    />
    </div>

    `;
  }

  renderWidget() {
    return html`About (widget)`;
  }
}
