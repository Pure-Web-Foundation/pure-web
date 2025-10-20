customElements.define(
  "test-comp",
  class TestComp extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<p>This is a test component (test-comp) that got automatically defined by using 
    <em>AutoDefiner</em>, and by putting it in the <em>/auto-define/</em> folder.</p>
    <p>📄 <a href="https://github.com/Pure-Web-Foundation/pure-web?tab=readme-ov-file#autodefiner" target="_blank">Read more about AutoDefiner</a></p>`;
    }
  }
);
