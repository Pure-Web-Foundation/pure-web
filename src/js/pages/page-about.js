import { html } from "lit";
import { PureSPA } from "../spa";

export class PageAbout extends PureSPA.WidgetEnabledPage {
  renderPage() {
    return html`About`;
  }

  renderWidget() {
    return html`About (widget)`;
  }
}
