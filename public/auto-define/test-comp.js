customElements.define(
  "test-comp",
  class TestComp extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<p>This text is outputted by <em>&lt;test-comp&gt;&lt;/test-comp&gt;</em> that got automatically defined by using 
    <em>AutoDefiner</em>, and by putting its defining code in the <em>/auto-define/</em> folder.</p>
    <p>
    📄 <a href="https://github.com/Pure-Web-Foundation/pure-web?tab=readme-ov-file#autodefiner" target="_blank">Read more about AutoDefiner</a>
    </p>`;
    }
  }
);
