# &lt;pwa-boost&gt; — Airbnb‑style PWA adoption banner

A tiny, framework‑agnostic **web component** that helps users **install or open your PWA** with an **Airbnb‑style bottom banner**, plus a **fly‑out** for QR or install instructions.

> handles **Android install prompt**, **iOS Add to Home Screen help**, **in‑app browsers** (IG/TikTok) with a best‑effort escape ladder, and **desktop QR**.

## What it does for users

Shows a banner with your app’s name, icon, and a clear button.

### On Android

If the app isn’t installed yet, it can trigger the built-in “Install app” prompt.
If it’s already installed, the button changes to “Open app,” which jumps straight into the app.

### On iPhone/iPad (iOS)

Since Apple blocks automatic install prompts, it instead shows easy instructions in a fly-out,
guiding users through the hidden “Add to Home Screen” path.

### On desktop

Shows how to install the app there, or a QR code to open it on a phone.

### In in-app browsers (Instagram, Facebook, etc.)

Offers a quick “Open in Browser” button so people can escape those restricted environments.

### Why this handling is necessary

Progressive Web Apps were designed to work seamlessly everywhere, but in practice every platform behaves differently:

Google (Android) has embraced PWAs. Chrome shows a friendly native “Install app” prompt,
and installed apps behave almost like native ones.

Microsoft, Brave, Opera, Vivaldi support installation too, but sometimes hide or rename
the option in menus. That’s why the banner offers guidance.

Apple (iOS) unfortunately still treats PWAs as second-class citizens.

Safari does not allow apps to ask the user directly “Do you want to install me?”

Instead, users must dig through the Share menu and choose “Add to Home Screen.”
Most people don’t know this option exists.

Even when they do, it’s several extra taps.

And Apple provides no clear hints, because it benefits from keeping the App Store
as the main gateway.

Because of these inconsistencies, a simple, universal “Install / Open app” button
just doesn’t exist out-of-the-box. This component fills that gap: it detects the
situation and gives the right message or action, so users get a smooth experience
no matter which device or browser they’re on.

> In short: this banner compensates for the fragmented support of PWAs across platforms,
> and especially for Apple’s refusal to give them equal treatment — so your web app
> can still feel first-class to your users.

The component emits an **`init`** event so you can configure everything in one place.

### License

Public domain (CC0).

---

## Install

```bash
npm i pure-web
```

or copy `pwa-boost.js` into your project (ESM).

---

## Quick start (Lit)

Suppose a Lit environment, where your app *is* already a Lit component:

```js
import { LitElement, html } from "lit";
import "pure-web/pwa-boost";

class MyApp extends LitElement {

  render() {
    return html`
      <pwa-boost desktop-qr @init=${this.appInstallInit}></pwa-boost>
    `;
  }

  appInstallInit = (e) => {
    const el = e.detail.el;

    // Add extra languages (FR, DE, NL) — keep keys aligned with EN defaults
    el.messages = {
      ...el.messages,
      fr: {
        bannerLabel: "Bannière d’application",
        closeAria: "Fermer",
        title: "Obtenez l’app {app}",
        subtitle: "La manière la plus simple d’utiliser {app}",
        useApp: "UTILISER L’APP",
        openApp: "OUVRIR L’APP",
        openInBrowser: "OUVRIR DANS LE NAVIGATEUR",
        installTitle: "Installer {app}",
        scanOnPhone: "Scannez avec votre téléphone pour ouvrir l’app",
        refreshQR: "Actualiser le QR",
        copyLink: "Copier le lien",
        copied: "Copié !",
        iabHelpTitle: "Ouvrir dans le navigateur",
        iabHelpIntro:
          "Vous êtes dans un navigateur intégré (Instagram, TikTok…). Ces apps limitent ce que le web peut faire.",
        iabHelpStep1: "Touchez ••• ou le menu",
        iabHelpStep2: "Choisissez « Ouvrir dans le navigateur »",
        iabHelpStep3: "Revenez ici pour installer ou utiliser l’app",
      },
      de: {
        bannerLabel: "App‑Banner",
        closeAria: "Schließen",
        title: "Hol dir die {app}-App",
        subtitle: "Der schnellste, einfachste Weg, {app} zu nutzen",
        useApp: "APP NUTZEN",
        openApp: "APP ÖFFNEN",
        openInBrowser: "IM BROWSER ÖFFNEN",
        installTitle: "{app} installieren",
        scanOnPhone: "Mit dem Smartphone scannen, um die App zu öffnen",
        refreshQR: "QR aktualisieren",
        copyLink: "Link kopieren",
        copied: "Kopiert!",
        iabHelpTitle: "Im Browser öffnen",
        iabHelpIntro:
          "Du bist in einem In‑App‑Browser (z. B. Instagram oder TikTok). Diese Apps beschränken Webseiten.",
        iabHelpStep1: "Tippe auf ••• oder das Menü‑Symbol",
        iabHelpStep2: "Wähle „Im Browser öffnen“",
        iabHelpStep3:
          "Kehre dann hierher zurück, um die App zu verwenden oder zu installieren",
      },
      nl: {
        bannerLabel: "App‑banner",
        closeAria: "Sluiten",
        title: "Download de {app}-app",
        subtitle: "De snelste, makkelijkste manier om {app} te gebruiken",
        useApp: "APP GEBRUIKEN",
        openApp: "APP OPENEN",
        openInBrowser: "OPENEN IN BROWSER",
        installTitle: "Installeer {app}",
        scanOnPhone: "Scan met je telefoon om de app te openen",
        refreshQR: "Ververs QR",
        copyLink: "Link kopiëren",
        copied: "Gekopieerd!",
        iabHelpTitle: "Open in je browser",
        iabHelpIntro:
          "Je zit nu in een in‑app browser (zoals Instagram of TikTok). Deze apps beperken wat websites kunnen doen.",
        iabHelpStep1: "Tik op ••• of het menu‑icoon",
        iabHelpStep2: "Kies „Openen in browser“",
        iabHelpStep3:
          "Ga daarna hier verder om de app te gebruiken of te installeren",
      },
    };

    // Add/update install guides
    el.guides = {
      ...el.guides,
      iosSafariNew: [
        "Tik op Delen",
        "Kies „Zet op beginscherm“ (nieuwe iOS UI)",
        "Vind het icoon op je beginscherm",
      ],
      braveAndroid: [
        "Open het menu (⋮)",
        "Kies „Toevoegen aan startscherm“",
        "Bevestig de naam en tik op Toevoegen",
      ],
    };

    // UA/version routing — first match wins
    el.matchers = [
      { when: "ios", ua: "OS 18_\\d+", guide: "iosSafariNew" }, // iOS 18+ new UI
      { when: "android", ua: "Brave/\\d+", guide: "braveAndroid" },
      // keep fallbacks last
      ...el.matchers,
    ];

    // Optional tweaks
    el.locale = "nl";
    el.appName = "Qogni";
    el.icon = "/icons/192.png";
  };
  
}
customElements.define("my-app", MyApp);
```

> The component works in any web-component supporting environment. Only the syntax of hooking into its events will be different.


---

## Props

| Prop               | Type                          | Default             | Description                                                                              |
| ------------------ | ----------------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| `app-name`         | `string`                      | document `title`    | App name for strings                                                                     |
| `icon`             | `string`                      | `''`                | 36×36+ icon URL                                                                          |
| `locale`           | `'auto' \| string`            | `'auto'`            | Picks from `messages` (`auto` uses NL if `navigator.language` starts with `nl`, else EN) |
| `activation-param` | `string`                      | `'useapp'`          | URL param that forces visibility                                                         |
| `snooze-days`      | `number`                      | `7`                 | Days to snooze after dismiss                                                             |
| `force-show`       | `boolean`                     | `false`             | Force even in standalone                                                                 |
| `show-on-iab`      | `boolean`                     | `true`              | Show inside in‑app browsers                                                              |
| `desktop-qr`       | `boolean`                     | `true`              | Enable QR on desktop                                                                     |
| `qr-url`           | `string`                      | current URL + param | URL encoded in QR                                                                        |
| `iab-escape-url`   | `string`                      | current URL         | Target for IAB escape attempts                                                           |
| `theme`            | `'auto' \| 'light' \| 'dark'` | `'auto'`            | Visual theme                                                                             |
| `storage-key`      | `string`                      | `'pwa-boost'`       | LS key for snooze                                                                        |
| `cta-text`         | `string`                      | auto                | Overrides CTA                                                                            |
| `open-url`         | `string`                      | `''`                | Where **OPEN APP** goes                                                                  |
| `.messages`        | `object`                      | EN only             | i18n dictionary (you extend in `init`)                                                   |
| `.guides`          | `object`                      | basic               | step arrays per guide key                                                                |
| `.matchers`        | `Matcher[]`                   | basic               | rules that select a guide key                                                            |

### Matcher shape

```ts
type Matcher = {
  when?: "any" | "mobile" | "desktop" | "ios" | "android" | "iab";
  ua?: string; // regex (case-insensitive) matched against navigator.userAgent
  minVersion?: number; // optional major version gate
  maxVersion?: number;
  guide: string; // key in your guides object
};
```

---

## Events

| Event                      | Detail           | When                                                    |
| -------------------------- | ---------------- | ------------------------------------------------------- |
| `init`                     | `{ el }`         | Fired in `connectedCallback()` — customize here         |
| `pwa-boost:visible`        | `{ reason }`     | Banner decided to show                                  |
| `pwa-boost:dismiss`        | `{ snoozeDays }` | User closed banner                                      |
| `pwa-boost:install-prompt` | `{ outcome }`    | After BIP (`accepted`/`dismissed`/`error`)              |
| `pwa-boost:qr-shown`       | `{ url }`        | QR got generated                                        |
| `pwa-boost:cta`            | `{ action }`     | CTA actions (`install`/`open`/`escape-iab`/`copy-link`) |
| `pwa-boost:escape-iab`     | `{ attempted }`  | Which escape step ran (`android-intent`/`blank`/`help`) |

---

## Notes

- **In‑app browsers** often block forcing Safari. Android intents sometimes work; iOS typically does not. The component falls back to clear help + copy‑link.
- **Installed app detection** uses `getInstalledRelatedApps()` where available; otherwise **OPEN APP** relies on your `open-url` or canonical link.
- **Safe areas** & **visualViewport** are handled so the banner stays visible above iOS bottom chrome.

---

## License

CC0 (Public Domain). Use it anywhere.
