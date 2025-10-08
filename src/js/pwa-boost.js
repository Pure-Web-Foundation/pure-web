/* eslint-disable no-empty */
/**
 * <pwa-boost> — Airbnb‑style PWA adoption banner
 *
 * Docs: see pwa-boost-readme.md
 *
 * Public domain (CC0).
 */
import { LitElement, html, css, nothing } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

export class PwaBoost extends LitElement {
  static properties = {
    // Public attributes/props
    appName: { type: String, attribute: "app-name" },
    icon: { type: String },
    locale: { type: String }, // 'auto'|'en'|...
    activationParam: { type: String, attribute: "activation-param" },
    snoozeDays: { type: Number, attribute: "snooze-days" },
    forceShow: { type: Boolean, attribute: "force-show", reflect: true },
    showOnIab: { type: Boolean, attribute: "show-on-iab" },
    desktopQr: { type: Boolean, attribute: "desktop-qr" },
    qrUrl: { type: String, attribute: "qr-url" },
    iabEscapeUrl: { type: String, attribute: "iab-escape-url" },
    theme: { type: String }, // 'auto'|'light'|'dark'
    storageKey: { type: String, attribute: "storage-key" },
    ctaText: { type: String, attribute: "cta-text" },
    subtitle: { type: String },
    openUrl: { type: String, attribute: "open-url" },

    // External config (objects)
    messages: { attribute: false },
    guides: { attribute: false },
    matchers: { attribute: false },
  };

  static styles = css`
    :host {
      --pb-bg: var(--pwa-boost-bg, #ffffff);
      --pb-fg: var(--pwa-boost-fg, #111);
      --pb-sub: var(--pwa-boost-sub, #6b7280);
      --pb-border: var(--pwa-boost-border, rgba(0, 0, 0, 0.08));
      --pb-btn-bg: var(--pwa-boost-btn-bg, #1f75fe);
      --pb-btn-fg: var(--pwa-boost-btn-fg, #fff);
      --pb-radius: var(--pwa-boost-radius, 14px);
      --pb-shadow: var(--pwa-boost-shadow, 0 8px 24px rgba(0, 0, 0, 0.12));
      --pb-z: var(--pwa-boost-z, 2147483000);
      --pb-maxw: var(--pwa-boost-maxw, 680px);
      --pb-font: var(
        --pwa-boost-font,
        system-ui,
        -apple-system,
        Segoe UI,
        Roboto,
        Inter,
        Arial,
        sans-serif
      );
      --pb-gap: 12px;
      --pb-vv-offset: 0px;

      position: fixed;
      inset: auto 16px
        calc(16px + env(safe-area-inset-bottom, 0px) + var(--pb-vv-offset)) 16px;
      display: none;
      z-index: var(--pb-z);
      color: var(--pb-fg);
      font-family: var(--pb-font);
    }
    :host([data-visible]) {
      display: block;
    }
    :host([theme="dark"]) {
      --pb-bg: #0f1115;
      --pb-fg: #f5f5f6;
      --pb-sub: #a1a1aa;
      --pb-border: rgba(255, 255, 255, 0.12);
      --pb-btn-bg: #2563eb;
      --pb-btn-fg: #fff;
    }
    .hostbox {
      
      display: grid;
      justify-items: center;
    }

    .banner {
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: var(--pb-gap);
      background: var(--pb-bg);
      border: 1px solid var(--pb-border);
      box-shadow: var(--pb-shadow);
      border-radius: var(--pb-radius);
      padding: 10px 12px;
      max-width: var(--pb-maxw);
      width: min(100%, var(--pb-maxw));
    }

    .left {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 10px;
    }
    .icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      object-fit: cover;
      background: #f2f2f2;
    }
    .title {
      font-size: 15px;
      font-weight: 700;
      line-height: 1.1;
    }
    .subtitle {
      font-size: 12px;
      color: var(--pb-sub);
      margin-top: 2px;
    }

    .cta {
      appearance: none;
      border: 0;
      background: var(--pb-btn-bg);
      color: var(--pb-btn-fg);
      font-weight: 700;
      border-radius: 999px;
      padding: 10px 14px;
      cursor: pointer;
      outline-offset: 3px;
    }

    .close {
      position: absolute;
      top: 5px;
      right: 0px;
      background-color: transparent;
      color: var(--pb-fg);
      
      border: 0;
      display: grid;
      place-items: center;
      cursor: pointer;
      fill: var(--pb-fg);
    }
    .x {
      width: 12px;
      height: 12px;
    }

    .flyout {
      position: absolute;
      left: 50%;
      bottom: calc(100% + 10px);
      transform: translate(-50%, 8px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.18s ease, opacity 0.18s ease;
      z-index: calc(var(--pb-z) + 1);
    }
    .flyout::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      height: 14px;
    }
    .flyout-card {
      display: grid;
      place-items: center;
      gap: 6px;
      padding: 8px 10px;
      border: 1px solid var(--pb-border);
      border-radius: 12px;
      background: var(--pb-bg);
      color: var(--pb-fg);
      box-shadow: var(--pb-shadow);
      min-width: min(92vw, 320px);
    }
    .flyout-card img,
    .flyout-card svg {
      width: 116px;
      height: 116px;
    }
    .flyout-card small {
      color: var(--pb-sub);
    }
    .qr-actions {
      display: flex;
      gap: 8px;
    }
    .ghost {
      background: transparent;
      border: 1px solid var(--pb-border);
      color: var(--pb-fg);
      border-radius: 999px;
      padding: 8px 12px;
      cursor: pointer;
    }

    @media (hover: hover) and (pointer: fine) {
      .hostbox:hover .flyout,
      .hostbox:focus-within .flyout,
      .flyout:hover {
        transform: translate(-50%, 0);
        opacity: 1;
        pointer-events: auto;
      }
    }
    :host([data-flyout="1"]) .flyout {
      transform: translate(-50%, 0);
      opacity: 1;
      pointer-events: auto;
    }
  `;

  constructor() {
    super();
    // Public defaults
    this.appName = document?.title || "App";
    this.icon = "";
    this.locale = "auto";
    this.activationParam = "useapp";
    this.snoozeDays = 7;
    this.forceShow = false;
    this.showOnIab = true;
    this.desktopQr = true;
    this.qrUrl = "";
    this.iabEscapeUrl = "";
    this.theme = "auto";
    this.storageKey = "pwa-boost";
    this.openUrl = "";

    // Built‑in English messages only (consumers add their own in @init)
    this.messages = {
      en: {
        bannerLabel: "Get the app banner",
        closeAria: "Close",
        title: "Get the {app} app",
        subtitle: "The fastest, easiest way to use {app}",
        useApp: "USE APP",
        openApp: "OPEN APP",
        openInBrowser: "OPEN IN BROWSER",
        installTitle: "Install {app}",
        scanOnPhone: "Scan with your phone to open the app",
        refreshQR: "Refresh QR",
        copyLink: "Copy link",
        copied: "Copied!",
        // IAB help (Instagram/TikTok etc.)
        iabHelpTitle: "Open in your browser",
        iabHelpIntro:
          "You’re inside an in‑app browser (like Instagram or TikTok). These apps limit what websites can do.",
        iabHelpStep1: "Tap the ••• or menu icon",
        iabHelpStep2: "Choose “Open in Browser”",
        iabHelpStep3: "Then return here to install or use the app",
      },
    };

    // Minimal built‑in guides
    this.guides = {
      iosSafari: [
        "Tap the Share button",
        "Choose “Add to Home Screen”",
        "Find the icon on your Home Screen",
      ],
      androidChrome: [
        "Open the menu (⋮) → Install app",
        "Confirm to add to your Home screen",
      ],
      desktopGeneric: [
        "Look for the Install icon in the address bar, or",
        "Open the browser menu and find “Install app”",
      ],
    };

    // Default UA→guide matchers (first match wins). Consumers may override in @init.
    this.matchers = [
      { when: "ios", guide: "iosSafari" },
      { when: "android", ua: "Android.*Chrome/\\d+", guide: "androidChrome" },
      { when: "desktop", ua: "Edg/\\d+", guide: "edgeDesktop" },
      { when: "desktop", ua: "(OPR/\\d+|Opera)", guide: "operaDesktop" },
      { when: "desktop", ua: "Vivaldi/\\d+", guide: "vivaldiDesktop" },
      {
        when: "desktop",
        ua: "(Chrome/\\d+|Chromium/\\d+)",
        guide: "desktopGeneric",
      },
      { when: "android", guide: "androidGeneric" },
      { when: "desktop", guide: "desktopGeneric" },
    ];

    // True‑private state (non‑reactive)
    this.#visible = false;
    this.#deferredPrompt = null;
    this.#showInstallHelp = false;
    this.#qrSvg = "";
    this.#copied = false;
    this.#hasInstalledApp = false;
    this.#iabHelpMode = false;

    this.#isStandalone = false;
    this.#isIAB = false;
    this.#isMobile = false;
    this.#isIOS = false;
    this.#installOk = true;
    this.#installReasons = [];
  }

  connectedCallback() {
    super.connectedCallback();

    // Environment detection
    this.#isStandalone =
      matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true;
    this.#isMobile = /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(
      navigator.userAgent
    );
    this.#isIOS = this.#detectIOS();
    this.#isIAB = this.#detectInAppBrowser();
    // Installability assessment (manifest, icons, SW, etc.)
    this.#assessInstallability().then(({ ok, reasons }) => {
      this.#installOk = ok;
      this.#installReasons = reasons || [];
      if (!ok && !this.forceShow) {
        this.#visible = false;
        this.removeAttribute("data-visible");
        console.warn(
          "[pwa-boost] Not installable yet:",
          this.#installReasons.join(", ")
        );
      }
      this.requestUpdate();
    });

    // Theme
    if (this.theme === "auto") {
      const dark = matchMedia("(prefers-color-scheme: dark)").matches;
      if (dark) this.setAttribute("theme", "dark");
    } else {
      this.setAttribute("theme", this.theme);
    }

    // Visibility
    if (!this.forceShow && this.#isStandalone) {
      this.#visible = false;
    } else if (this.#isSnoozed()) {
      this.#visible = false;
    } else if (this.#isIAB && !this.showOnIab) {
      this.#visible = false;
    } else {
      const url = new URL(location.href);
      const hasActivation = url.searchParams.has(this.activationParam);
      if (hasActivation) this.#visible = true;
      else if (this.#isIAB) this.#visible = true;
      else if (this.#isMobile)
        this.#visible = !this.#isStandalone || this.forceShow;
      else this.#visible = true;
    }
    if (this.#visible) this.setAttribute("data-visible", "");

    // Viewport lift for iOS bottom chrome
    if (this.#isIOS && "visualViewport" in window) {
      window.visualViewport.addEventListener("resize", this.#vvUpdate);
      window.visualViewport.addEventListener("scroll", this.#vvUpdate);
      this.#vvUpdate();
    }

    // Listeners
    addEventListener("beforeinstallprompt", this.#onBip);
    addEventListener("keydown", this.#onKeydown, { passive: true });
    // Aggressive capture on window & document (capture phase)
    window.addEventListener("beforeinstallprompt", this.#onBip, {
      capture: true,
    });
    document.addEventListener("beforeinstallprompt", this.#onBip, {
      capture: true,
    });
    // Installed app?
    this.#detectInstalledApp();

    // Emit init event for external customization
    try {
      this.dispatchEvent(
        new CustomEvent("init", {
          detail: { el: this },
          bubbles: true,
          composed: true,
        })
      );
    } catch {}

    // Announce visibility (optional analytics)
    if (this.#visible) {
      this.#dispatch("pwa-boost:visible", {
        reason: this.#isIAB ? "iab" : this.#isMobile ? "mobile" : "desktop",
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener("beforeinstallprompt", this.#onBip);
    removeEventListener("keydown", this.#onKeydown);
    try {
      window.removeEventListener("beforeinstallprompt", this.#onBip, {
        capture: true,
      });
      document.removeEventListener("beforeinstallprompt", this.#onBip, {
        capture: true,
      });
    } catch {}
    if (this.#isIOS && "visualViewport" in window) {
      try {
        window.visualViewport.removeEventListener("resize", this.#vvUpdate);
        window.visualViewport.removeEventListener("scroll", this.#vvUpdate);
      } catch {}
    }
  }

  firstUpdated() {
    if (!this.qrUrl) {
      const u = new URL(location.href);
      u.searchParams.set(this.activationParam, "1");
      this.qrUrl = u.toString();
    }
    if (!this.iabEscapeUrl) this.iabEscapeUrl = location.href;
  }

  render() {
    if (this.#installOk === false && !this.forceShow) return nothing;
    if (!this.#visible) return nothing;
    const m = this.#m();

    return html`
      <div class="hostbox">
        <div class="banner" role="region" aria-label=${m("bannerLabel")}>
          <button
            title=${m("closeAria")}
            class="close"
            @click=${this.#dismiss}
            aria-label=${m("closeAria")}
          >
            ${this.#iconX()}
          </button>

          <div class="left">
            ${this.icon
              ? html`<img class="icon" src=${this.icon} alt="" />`
              : this.#fallbackIcon()}
            <div>
              <div class="title">
                ${m("title").replace("{app}", this.appName)}
              </div>
              <div class="subtitle">
                ${(this.subtitle || m("subtitle")).replace(
                  "{app}",
                  this.appName
                )}
              </div>
            </div>
          </div>

          ${this.#isIAB
            ? html`
                <button class="cta" @click=${this.#escapeIAB}>
                  ${m("openInBrowser")}
                </button>
              `
            : html`
                <button class="cta" @click=${this.promptInstall}>
                  ${this.ctaText ||
                  (this.#hasInstalledApp ? m("openApp") : m("useApp"))}
                </button>
              `}
        </div>

        ${(!this.#isMobile && this.desktopQr) || this.#showInstallHelp
          ? html`
              <div
                class="flyout"
                role="dialog"
                aria-label=${this.#showInstallHelp
                  ? m("installTitle").replace("{app}", this.appName)
                  : m("scanOnPhone")}
              >
                ${this.#showInstallHelp
                  ? this.#renderInstallHelpFlyout(m)
                  : this.#renderQRFlyout(m)}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  // ===== Public methods =====
  show() {
    this.#visible = true;
    this.setAttribute("data-visible", "");
    this.requestUpdate();
  }
  hide() {
    this.#visible = false;
    this.removeAttribute("data-visible");
    this.requestUpdate();
  }
  clearSnooze() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {}
  }

  async promptInstall() {
    // If installed (Android), deep‑open
    if (this.#hasInstalledApp && !this.#isIOS) {
      this.#openInApp();
      return;
    }

    // BIP flow
    if (this.#deferredPrompt) {
      try {
        this.#dispatch("pwa-boost:install-prompt", {});
        this.#deferredPrompt.prompt();
        const choice = await this.#deferredPrompt.userChoice;
        this.#dispatch("pwa-boost:install-prompt", {
          outcome: choice?.outcome || "unknown",
        });
        if (choice?.outcome === "accepted") this.#snooze(30);
      } catch {
        this.#dispatch("pwa-boost:install-prompt", { outcome: "error" });
      }
      return;
    }

    // iOS / suppressed BIP
    this.#showInstallHelp = true;
    this.setAttribute("data-flyout", "1");
    this.requestUpdate();
  }

  // ===== Private (true‑private) =====
  #visible;
  #deferredPrompt;
  #showInstallHelp;
  #qrSvg;
  #copied;
  #hasInstalledApp;
  #iabHelpMode;
  #isStandalone;
  #isIAB;
  #isMobile;
  #isIOS;
  #installOk;
  #installReasons;

  #onBip = (e) => {
    try {
      e.preventDefault();
    } catch {}
    this.#deferredPrompt = e;
    this.requestUpdate();
  };
  #onKeydown = (e) => {
    if (e.key === "Escape") {
      if (this.hasAttribute("data-flyout")) {
        this.removeAttribute("data-flyout");
        this.#showInstallHelp = false;
      } else if (this.#visible) this.#dismiss();
      this.requestUpdate();
    }
  };

  #vvUpdate = () => {
    try {
      const vv = window.visualViewport;
      if (!vv) return;
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      this.style.setProperty(
        "--pb-vv-offset",
        (offset > 0 ? offset + 8 : 0) + "px"
      );
    } catch {}
  };

  #dismiss() {
    this.#snooze(this.snoozeDays);
    this.hide();
    this.#dispatch("pwa-boost:dismiss", { snoozeDays: this.snoozeDays });
  }
  #snooze(days = 7) {
    try {
      localStorage.setItem(this.storageKey, String(Date.now() + days * 864e5));
    } catch {}
  }
  #isSnoozed() {
    try {
      const v = +localStorage.getItem(this.storageKey) || 0;
      return v && Date.now() < v;
    } catch {
      return false;
    }
  }

  async #ensureQr() {
    try {
      const mod = await import(
        "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"
      );
      const svg = await mod.default.toString(this.qrUrl, {
        type: "svg",
        margin: 1,
        width: 116,
      });
      this.#qrSvg = svg;
      this.requestUpdate();
      this.#dispatch("pwa-boost:qr-shown", { url: this.qrUrl });
    } catch {}
  }
  async #copyLink() {
    try {
      await navigator.clipboard.writeText(this.qrUrl);
      this.#copied = true;
      this.requestUpdate();
      setTimeout(() => {
        this.#copied = false;
        this.requestUpdate();
      }, 1800);
      this.#dispatch("pwa-boost:cta", { action: "copy-link" });
    } catch {}
  }

  #escapeIAB = async () => {
    this.#dispatch("pwa-boost:cta", { action: "escape-iab" });
    const url = this.iabEscapeUrl || location.href;
    // 1) Android intent ladder
    if (/Android/i.test(navigator.userAgent)) {
      try {
        const u = new URL(url, location.href).toString();
        const intent =
          "intent://" +
          u.replace(/^https?:\/\//, "") +
          "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" +
          encodeURIComponent(u) +
          ";end";
        const a = document.createElement("a");
        a.href = intent;
        a.rel = "noopener";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.#dispatch("pwa-boost:escape-iab", { attempted: "android-intent" });
        return;
      } catch {}
    }
    // 2) target=_blank attempt
    try {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.#dispatch("pwa-boost:escape-iab", { attempted: "blank" });
      return;
    } catch {}
    // 3) Fallback help
    this.#iabHelpMode = true;
    this.#showInstallHelp = true;
    this.setAttribute("data-flyout", "1");
    this.requestUpdate();
    this.#dispatch("pwa-boost:escape-iab", { attempted: "help" });
  };

  #renderQRFlyout(m) {
    return html`
      <div class="flyout-card">
        ${this.#qrSvg
          ? unsafeSVG(this.#qrSvg)
          : html`<img alt="QR" src=${this.#fallbackQR()} />`}
        <small>${m("scanOnPhone")}</small>
        <div class="qr-actions">
          <button class="ghost" @click=${this.#ensureQr}>
            ${m("refreshQR")}
          </button>
          <button class="ghost" @click=${this.#copyLink}>
            ${this.#copied ? m("copied") : m("copyLink")}
          </button>
        </div>
      </div>
    `;
  }

  #renderInstallHelpFlyout(m) {
    if (this.#iabHelpMode) {
      const steps = [m("iabHelpStep1"), m("iabHelpStep2"), m("iabHelpStep3")];
      return html`
        <div class="flyout-card">
          <h3 style="margin:0 0 6px; font-size:14px;">${m("iabHelpTitle")}</h3>
          <p style="margin:0 0 6px; font-size:13px; color:var(--pb-sub);">
            ${m("iabHelpIntro")}
          </p>
          <ol style="margin:0; padding-left:18px;">
            ${steps.map((s) => html`<li>${s}</li>`)}
          </ol>
          <div class="qr-actions" style="margin-top:8px;">
            <button class="ghost" @click=${this.#copyLink}>
              ${this.#copied ? m("copied") : m("copyLink")}
            </button>
          </div>
        </div>
      `;
    }
    const steps = this.#guideSteps().map((s) =>
      s.replace("[app]", this.appName)
    );
    return html`
      <div class="flyout-card">
        <h3 style="margin:0 0 6px; font-size:14px;">
          ${m("installTitle").replace("{app}", this.appName)}
        </h3>
        <ol style="margin:0; padding-left:18px;">
          ${steps.map((s) => html`<li>${s}</li>`)}
        </ol>
        <div class="qr-actions" style="margin-top:8px;">
          <button
            class="ghost"
            @click=${() => {
              this.#showInstallHelp = false;
              this.removeAttribute("data-flyout");
              this.requestUpdate();
            }}
          >
            ${m("closeAria")}
          </button>
        </div>
      </div>
    `;
  }

  #m() {
    const wanted =
      this.locale && this.locale !== "auto"
        ? this.locale
        : (navigator.language || "en").toLowerCase().startsWith("nl")
        ? "nl"
        : "en";
    const dict =
      (this.messages && this.messages[wanted]) ||
      (this.messages && this.messages.en) ||
      {};
    return (key) => dict[key] ?? key;
  }

  #guideSteps() {
    const key = this.#pickGuideKey();
    const g = this.guides || {};
    const steps = (key && g[key]) || g.desktopGeneric || [];
    return steps;
  }

  #pickGuideKey() {
    const list = Array.isArray(this.matchers) ? this.matchers : [];
    const ua = navigator.userAgent;
    const ctx = {
      ios: this.#isIOS,
      android: this.#isMobile && /Android/i.test(ua),
      desktop: !this.#isMobile,
      iab: this.#isIAB,
    };
    for (const m of list) {
      if (!m) continue;
      // when gate
      const when = m.when || "any";
      if (when !== "any") {
        if (when === "ios" && !ctx.ios) continue;
        if (when === "android" && !ctx.android) continue;
        if (when === "desktop" && !ctx.desktop) continue;
        if (when === "iab" && !ctx.iab) continue;
        if (when === "mobile" && ctx.desktop) continue;
      }
      // UA regex
      if (m.ua) {
        try {
          const re = new RegExp(m.ua, "i");
          if (!re.test(ua)) continue;
        } catch {}
      }
      // Version (major) gate (optional)
      if (m.minVersion || m.maxVersion) {
        const verMatch = ua.match(
          /(?:Chrome|Chromium|Edg|OPR|Version)\/(\d+)/i
        );
        const ver = verMatch ? parseInt(verMatch[1], 10) : null;
        if (m.minVersion && (ver === null || ver < m.minVersion)) continue;
        if (m.maxVersion && ver !== null && ver > m.maxVersion) continue;
      }
      if (m.guide) return m.guide;
    }
    return null;
  }

  async #assessInstallability() {
    const reasons = [];

    // 1) Secure context (HTTPS or localhost)
    const isSecure =
      location.protocol === "https:" ||
      ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
    if (!isSecure) reasons.push("not-https");

    // 2) Manifest link present
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      reasons.push("no-manifest-link");
      return { ok: false, reasons };
    }

    // 3) Manifest fetchable + JSON
    let manifest = null;
    let manifestURL = "";
    try {
      manifestURL = new URL(
        link.getAttribute("href") || "",
        document.baseURI
      ).toString();
      const res = await fetch(manifestURL, { credentials: "same-origin" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      manifest = await res.json();
    } catch {
      reasons.push("manifest-unfetchable");
      return { ok: false, reasons };
    }

    // 4) name/short_name
    const nameOk = !!(manifest.name || manifest.short_name);
    if (!nameOk) reasons.push("no-name");

    // 5) Valid display mode
    const displayOk = [
      "standalone",
      "fullscreen",
      "minimal-ui",
      "window-controls-overlay",
    ].includes(manifest.display);
    if (!displayOk) reasons.push("display-not-standalone");

    // 6) start_url exists and is within scope (if scope set)
    const startURL = manifest.start_url || "/";
    const scopeURL = manifest.scope || null;
    const absStart = new URL(startURL, manifestURL).href;
    const absScope = scopeURL ? new URL(scopeURL, manifestURL).href : null;
    if (!startURL) reasons.push("no-start_url");
    if (absScope && !absStart.startsWith(absScope))
      reasons.push("start_url-outside-scope");

    // 7) Required PNG icons: 192x192 and 512x512
    let has192 = false,
      has512 = false;
    let chosenIcon = null;
    let smallestSize = Infinity;

    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    for (const icon of icons) {
      const sizes = (icon.sizes || "").split(/\s+/);
      const type = (icon.type || "").toLowerCase();
      if (!type.includes("png")) continue;

      for (const s of sizes) {
        const [w, h] = s.split("x").map(Number);
        if (w && h) {
          const area = w * h;
          if (area < smallestSize) {
            smallestSize = area;
            chosenIcon = new URL(icon.src, manifestURL).href;
          }
        }
      }

      if (sizes.includes("192x192")) has192 = true;
      if (sizes.includes("512x512")) has512 = true;
    }

    // If no icon attribute provided, fall back to manifest’s smallest PNG
    if (!this.icon && chosenIcon) {
      this.icon = chosenIcon;
    }

    const ok =
      nameOk &&
      displayOk &&
      startURL &&
      (!absScope || absStart.startsWith(absScope)) &&
      has192 &&
      has512 &&
      isSecure;
    return { ok, reasons };
  }

  #detectIOS() {
    const ua = navigator.userAgent;
    return (
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }
  #detectInAppBrowser() {
    const ua = navigator.userAgent;
    const tags = [
      "FBAN",
      "FBAV",
      "Instagram",
      "Line",
      "TikTok",
      "Snapchat",
      "Pinterest",
      "WeChat",
      "WhatsApp",
      "Messenger",
      "LinkedInApp",
      "KAKAOTALK",
      "Viber",
    ];
    return tags.some((t) => ua.includes(t));
  }
  async #detectInstalledApp() {
    try {
      if (!("getInstalledRelatedApps" in navigator)) return;
      const apps = await navigator.getInstalledRelatedApps();
      if (Array.isArray(apps) && apps.length) {
        const isOurs = apps.some(
          (a) =>
            a.platform === "webapp" ||
            (a.url && a.url.includes(location.origin))
        );
        if (isOurs || apps.length > 0) {
          this.#hasInstalledApp = true;
          this.requestUpdate();
        }
      }
    } catch {}
  }

  #openInApp() {
    try {
      const base =
        this.openUrl ||
        document.querySelector('link[rel="canonical"]')?.href ||
        location.origin + "/";
      const url = new URL(base, location.href);
      url.searchParams.set("openapp", "1");
      url.searchParams.set("_ts", String(Date.now()));
      location.href = url.toString();
    } catch {
      try {
        window.open(this.openUrl || location.href, "_self");
      } catch {}
    }
  }

  #dispatch(type, detail) {
    try {
      this.dispatchEvent(
        new CustomEvent(type, { detail, bubbles: true, composed: true })
      );
    } catch {}
  }

  #iconX() {
    return html`<svg class="x" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"
      />
    </svg>`;
  }
  #fallbackIcon() {
    return html`<svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#f43f5e"></rect>
      <path
        d="M30 12l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z"
        fill="#fff"
        opacity=".9"
      ></path>
    </svg>`;
  }
  #fallbackQR() {
    const u = encodeURIComponent(this.qrUrl || location.href);
    return `https://api.qrserver.com/v1/create-qr-code/?size=116x116&data=${u}`;
  }
}

customElements.define("pwa-boost", PwaBoost);
