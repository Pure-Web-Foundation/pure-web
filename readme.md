# pure-web - essential components for Modern Web Development
```cli
  npm i pure-web --save-dev
```

# pure-web/spa 

```js
import { PureSPA } from "pure-web/spa";
```

A routing Lit container (Light DOM) _Base Class_ for modern Web Component-based SPA apps.

## Introduction

`PureSPA` is a Lit Web Component that renders your SPA pages based on an extensible JavaScript configuration file that contains the routes and each route's responsible logic (the SPA pages).

## Main Ingredients

- A (Light DOM) [Lit](https://lit.dev/) Element base class to base your apps on.
- Using the [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) class to match routes and pass dynamic route data.
- Using [View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) when switching between routes.
- [Navigation:navigate Event](https://developer.mozilla.org/en-US/docs/Web/API/Navigation/navigate_event) to intercept user navigation.

> Because PureSPA uses relatively new Browser APIs, *polyfills* are provided for functionality that is not yet available in some browsers, like Safari and Firefox.

## Getting started

Create a class that extends `PureSPA`, and return a router config in the static `config` property:

```js
import { PureSPA } from "pure/spa";
import { config } from "./my-app-config.js";

customElements.define(
  "my-app",
  class MyApp extends PureSPA {
    /**
     * Set app.config structure
     */
    static get config() {
      return config;
    }
  }
);
```

## Sample config: my-app-config.js

```js
import { PageAbout } from "./pages/page-about";
import { PageHome } from "./pages/page-home";

export const config = {
  routes: {
    "/": {
      name: "Home",
      run: PageHome,
    },
    "/about": {
      run: PageAbout,
    },
  },
};
```

## Rendering the base SPA structure

`PureSPA`'s Lit render() method renders a route based on the page a user navigates to.

```js
import { config } from "./my-app-config";
import { PureSPA } from "pure-spa";
import { html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

customElements.define(
  "my-app",
  class MyApp extends PureSPA {
    #h1 = createRef();

    static get config() {
      return config;
    }

    render() {
      return html`
        <header>
          <h1 ${ref(this.#h1)}></h1>
        </header>
        <main>${super.render()}</main>
      `;
    }

    firstUpdated() {
      super.firstUpdated();

      this.on("routecomplete", () => {
        this.#h1.value.textContent = this.activeRoute.name;
      });
    }
  }
);
```


## Nested routes

Sub routes are declared as a `routes` nesting on a route:

```js
 "/program": {
    run: PageProgram,
    routes: {
      "/activation": {
        run: PageProgramActivation,
      },
    },
```

## Capturing route data

In the case of an `URLPattern` (RegExp) capturing, the captured data will be passed to a Lit property in the page component:

```js
import { PageAbout } from "./pages/page-about";
import { PageHome } from "./pages/page-home";
import { PageProfile } from "./pages/page-profile";

export const config = {
  routes: {
    "/": {
      name: "Home",
      run: PageHome,
    },
    "/about": {
      run: PageAbout,
    },
    "/profile": {
      run: PageProfile,
      routes: {
        "/:selector": {},
      },
    },
  },
};
```

In this case, the `PageProfile` class can retrieve the captured route data using the Lit static properties, using `routeOrigin`:

```js
  static get properties() {
    return {
      profile: { type: Object },
      selector: { type: String, attribute: true, routeOrigin: 'pathname' },
      loading: { type: Boolean },
    };
  }

```

As you can see in the example above, if you use this subroute syntax, the parent route's configured component will also be triggered for the sub route.


# pure-web/ac 

```js
import { AutoComplete } from "pure-web/ac";
```

```css
@import "<your node modules prefix>/src/scss/autocomplete";
```
...or...
```css
@import "<your node modules prefix>/public/assets/css/autocomplete.css";
```

## Usage

```html
  <!-- Lit code -->
  <input @focus=${e => AutoComplete.attach(e, this.acOptions )}/>
```
... or ...
```js
  const input = document.querySelector("#omnibox");
  input.addEventListener("focus", e=>{
    AutoComplete.attach(e, this.acOptions )
  })
```

```js
  get acOptions() {
    return {
      categories: {
        Menu: {
          // category handling 
        }
      }
    }
  }
```

# pure-web/common

Common utility methods for daily use.


# pure-web/svg-icon

A web component for SVG sprite display.

```html
<svg-icon icon="menu"></svg-icon>
```
