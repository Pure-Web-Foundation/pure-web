# pure-web - essential components for Modern Web Development
```cli
  npm i pure-web --save-dev
```

# pure-web/spa 

A routing Lit container (Light DOM) _Base Class_ for modern Web Component-based SPA apps.

[More info](./spa-readme.md)

# pure-web/ac 

An AutoComplete box, reinvented for the Modern Web.

A versatile, accessible autocompletion Web Component that works everywhere and has zero dependencies.

[More info](./ac-readme.md)

# pure-web/common

Common utility methods for daily use.

# pure-web/svg-icon

A web component for SVG sprite display.

```html
<svg-icon icon="menu"></svg-icon>
```

# pwa-boost

![pwa-boost desktop banner example](public/assets/img/pwa-boost-desktop.png)

A tiny, framework‑agnostic web component that helps users install or open your PWA with an Airbnb‑style bottom banner, plus a fly‑out for QR or install instructions. 

It handles Android install prompt, iOS Add to Home Screen help, in‑app browsers (IG/TikTok) with a best‑effort escape ladder, and desktop QR.

Multilingual support. Fully customizable.

[More info](./pwa-boost-readme.md)

# AutoDefiner

Imagine your web components work like any other (built-in) html element, by just using the tag in your HTML 🤯...

AutoDefiner automatically notices web components when they're becoming part of the DOM, loading their defining code automatically at runtime.

You can have a really smart bundle splitter, but AutoDefiner will always be smarter.

It effectively handles 'load code on demand' scenarios in by far the best way possible: when it's being used - using only the native DOM and its APIs 🤯.

```js

  import { AutoDefiner } from "pure-web/auto-definer";

  async yourAsyncInit() {
    // Start watching the whole document. Components are in /auto-define/<tag>.js
    this.auto = new AutoDefiner({
      baseURL: "/auto-define/",
      // If you have odd filenames:
      // mapper: (tag) => `wc-${tag}.js`,
      // The mapper may also return a full URL (or a URL object),
      // which lets you load from other folders or a CDN:
      // mapper: (tag) => `https://cdn.example.com/components/${tag}.js`,
      // or
      // mapper: (tag) => new URL(`/components/${tag}.js`, location.href),
      // Only auto-define for your own namespace:
      // predicate: (tag) => tag.startsWith("myprefix-"),
    });
  }

```

If you need to initialize some component before it's auto-discovered in the html:

```js
AutoDefiner.define(["tag-name", ...])

```


# ActionRoute 

A tiny path-based action router for MPAs, that runs an action when the user navigates to and from a path.

1) Register on startup: ActionRoute.create("/open-drawer", { to, from })
2) Trigger later: ActionRoute.run("/open-drawer")

Back/Forward restore automatically; reload restores if you're already on that path.

```js
// show drawer with journal UI when the user navigates to /journal
ActionRoute.create("/journal", {
  to: () => app.drawer.show(html`<journal-ui></journal-ui>`),
  from: () => app.drawer.close()
});
```
