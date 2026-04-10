# `pure-web/action-router`

```js
import { ActionRoute, ActionRouteController } from "pure-web/action-router";
```

`ActionRoute` is a tiny path-based action router for MPAs and same-document UI flows.

It lets the **URL be the source of truth** for local UI state:

- open a drawer when the user goes to `/browse`
- close it again when they leave that path
- react to sub-routes, query-string updates, and hash changes
- support Back/Forward and reload automatically

---

## When to use it

Use `ActionRoute` when you want route-aware UI behavior without a full SPA router.

Typical examples:

- drawers and side panels
- modals and lightboxes
- nested article or browse views
- MPA pages that still need same-document route behavior
- hybrid apps that want lightweight local routing

---

## Basic route registration

Register a route once at startup:

```js
ActionRoute.create("/journal", {
  to: ({ searchParams }) => {
    app.drawer.show();
    app.loadJournal(searchParams.get("tag"));
  },
  from: () => {
    app.drawer.close();
  },
  in: ({ exact, segments, searchParams, hash }) => {
    // called again when the user stays inside /journal
    // including query-string and hash updates
  },
});
```

Then activate it later:

```js
ActionRoute.run("/journal");
```

### Lifecycle

- `to(payload)` → runs once when entering the route
- `in(payload)` → runs for every navigation that stays within the same route
- `from()` → runs once when leaving the route

---

## Route payload

The `payload` object passed to `to()` and `in()` contains:

```js
{
  base,        // registered base path, for example "/journal"
  path,        // current matched path
  url,         // pathname + search + hash
  pathname,
  search,
  searchParams,
  hash,
  exact,
  subpath,
  segments,
  params,
  previous
}
```

This makes it easy to react to:

- sub-routes such as `/journal/edit/42`
- query params such as `?tab=drafts`
- hash changes such as `#comments`

---

## Navigation helpers

### `ActionRoute.run(path)`

Activates a registered route by navigating to it.

```js
ActionRoute.run("/browse");
```

### `ActionRoute.navigate(path)`

Updates the URL for a registered route and lets the router react immediately.

```js
ActionRoute.navigate("/browse");
```

### `ActionRoute.end(path?)`

Closes an active route and returns to the most appropriate previous URL.

```js
ActionRoute.end("/browse");
```

### `ActionRoute.isActive(path)`

Checks whether a route is currently open.

```js
if (ActionRoute.isActive("/browse")) {
  console.log("browse is open");
}
```

### `ActionRoute.link(element, path)`

Convenience helper for buttons or custom UI controls.

```js
const cleanup = ActionRoute.link(button, "/browse");
```

---

## Lazy route controllers

Besides a plain `{ to, from, in }` object, `ActionRoute.create()` also accepts an `ActionRouteController` instance.

```js
const controller = new ActionRouteController(
  "/assets/routes/browse-controller.js",
  { apiClient, featureFlag: true }
);

ActionRoute.create("/browse", controller);
```

This is useful when route logic should be **loaded only on first use**.

### What it does

The base `ActionRouteController`:

- lazy-imports the module on first route entry
- caches the resolved handlers
- forwards `to()`, `from()`, and `in()` to the loaded route logic
- exposes `controller.state` and also passes that shared state as the second hook argument
- can be subclassed for custom behavior

### Lazy-loaded module example

```js
// /assets/routes/browse-controller.js
export function to({ segments }, { apiClient }) {
  app.browse.open(segments);
  apiClient.prefetch("browse");
}

export function from(state) {
  state?.apiClient?.cancel?.("browse");
  app.browse.close();
}

export function in({ searchParams }, state) {
  state?.apiClient?.track?.("browse-filter", searchParams.get("q"));
  app.browse.filter(searchParams.get("q"));
}
```

You can also export a default object:

```js
export default {
  to(payload, state) {
    app.browse.open(payload.segments);
    state?.apiClient?.prefetch?.("browse");
  },
  from(state) {
    state?.apiClient?.cancel?.("browse");
    app.browse.close();
  },
  in(payload, state) {
    state?.apiClient?.track?.("browse-sync", payload.searchParams.toString());
    app.browse.sync(payload.searchParams);
  },
};
```

Or a class / subclass instance:

```js
export default class BrowseRoute {
  constructor(state) {
    this.state = state;
  }

  to(payload) {
    this.state?.apiClient?.prefetch?.("browse");
  }

  from() {}
  in(payload) {}
}
```

> The resolved route logic must provide both `to()` and `from()`.

---

## Subclassing `ActionRouteController`

If you want a reusable or inheritable controller, extend the class:

```js
class BrowseController extends ActionRouteController {
  constructor() {
    super("/assets/routes/browse-controller.js");
  }

  match(full, helpers) {
    if (helpers.isExact(full)) {
      return { matched: true, exact: true };
    }

    const segments = helpers.segments(full);
    return {
      matched: true,
      exact: false,
      subpath: helpers.relative(full),
      segments,
      params: {
        section: segments[0] ?? null,
      },
    };
  }
}

ActionRoute.create("/browse", new BrowseController());
```

You can override:

- `match(full, helpers)`
- `resolve(module)`
- `load()` / `preload()`
- or even `to()` / `from()` / `in()` directly

---

## Custom matching

By default, a route matches:

- exactly its own path, or
- child paths below it

Example:

- `/journal` matches `/journal`
- `/journal` also matches `/journal/edit/42`

For more advanced rules, provide a `match()` function:

```js
ActionRoute.create("/docs", {
  to: ({ params }) => openDoc(params.slug),
  from: () => closeDoc(),
  match(full, helpers) {
    const segments = helpers.segments(full);
    if (segments[0] !== "article") return null;

    return {
      matched: true,
      exact: false,
      subpath: helpers.relative(full),
      segments,
      params: {
        slug: segments[1] ?? null,
      },
      score: 100,
    };
  },
});
```

---

## Passive routes and interception

A route can be registered without intercepting normal browser navigation:

```js
ActionRoute.create("/", {
  to: () => {},
  from: () => {},
  intercept: false,
});
```

Notes:

- unregistered URLs are left to the browser
- passive routes stay known to the router, but do not hijack normal navigation
- exact root routes (`"/"`) are passive by default unless they define `in()`, a custom `match()`, or `intercept: true`

---

## Configuration

Call `ActionRoute.configure()` **before** registering routes:

```js
ActionRoute.configure({
  mode: "path", // or "hash"
  base: "/app",
});
```

Options:

- `mode: "path"` → uses `location.pathname`
- `mode: "hash"` → uses `location.hash`
- `base` → optional base prefix for registered routes

---

## Typical pattern

```js
ActionRoute.configure({ mode: "path" });

ActionRoute.create("/browse", new ActionRouteController("/assets/routes/browse-controller.js"));
ActionRoute.create("/help", {
  to: () => helpDialog.show(),
  from: () => helpDialog.close(),
});
```

Then let links, buttons, or code navigate normally:

```js
ActionRoute.run("/browse");
ActionRoute.end("/help");
```

---

## Summary

`ActionRoute` is meant to stay small and predictable:

- route-aware UI behavior
- URL-driven state
- Back/Forward friendly
- custom match support
- lazy controller loading via `ActionRouteController`

For local UI flows, it gives you router behavior without bringing in a full SPA router.
