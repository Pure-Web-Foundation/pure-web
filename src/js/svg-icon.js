import { LitElement, css, html } from "lit";

customElements.define(
  "svg-icon",
  /**
   * Renders SVG icon using SVG sprites defined in /assets/img/icons.svg
   */
  class SVGIcon extends LitElement {
    static get styles() {
      return [
        css`
          :host(.rounded) {
            pointer-events: none;
            border-radius: 50%;
            aspect-ratio: 1/1;
            padding: 0.3rem 0.8rem 0 0.2rem;
          }

          @keyframes rotation {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          svg {
            pointer-events: none;
            fill: var(--icon-fill-color);
            stroke: var(--icon-stroke-color);
            display: block;
            transition: fill var(--transition-duration) ease-in-out;
          }
          .icon {
            width: var(--icon-size, 32px);
            height: var(--icon-size, 32px);
          }
          :host([spinner]) .icon {
            animation: rotation 1s linear infinite;
          }
        `,
      ];
    }

    static get properties() {
      return {
        icon: {
          attribute: true,
        },
        color: {
          attribute: true,
        },
        stroke: {
          type: Boolean,
          attribute: true,
        },
        size: {
          attribute: true,
        },
        spinner: { type: Boolean, reflect: true, attribute: true },
      };
    }

    render() {
      let style = "";
      if (this.size) style += ";--icon-size: " + this.size;
      if (this.color) style += ";--icon-fill-color: " + this.color;
      if (this.stroke) style += ";--icon-stroke-color: " + this.color;

      return html`<svg style=${style} class="icon" xmlns="http://www.w3.org/2000/svg">
        <use href="/assets/img/icons.svg#${this.icon}" />
      </svg>`;
    }
  }
);
