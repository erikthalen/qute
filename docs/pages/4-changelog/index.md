# Changelog

## 0.0.2

### Breaking changes

- **`ctx.nextDocument` renamed to `ctx.incomingDocument`** — update any custom plugins that read this property.

- **`preloader.invalidate()` now returns a `Plugin`** — it no longer clears the cache immediately when called. Pass the return value into a `plugins` array to clear the cache at swap time:

  ```js
  // before
  preloader.invalidate('/cart')

  // after — as a plugin in a registration
  ajax.register({
    plugins: [preloader.invalidate('/cart')],
    ...
  })
  ```

### New features

- **`head` plugin** — updates `document.title` from the incoming page after each swap:

  ```js
  ajax.use(head({ title: true }))
  ```

- **`ctx.replace`** — a `Replacer` function on `AjaxContext` that controls how each element pair is written into the DOM. Override it in a `swap` hook to provide a custom replacement strategy. `defaultReplace` is exported from `@erikt/ajax` for use as a fallback.

- **`transitions` accepts a callback** — in addition to `string[]`, `transitions` now accepts `(ctx: AjaxContext) => string[]`, letting you pick transition types based on the completed response:

  ```js
  ajax.register({
    transitions: (ctx) => ctx.response?.status === 404 ? ['fade'] : ['slide-left'],
    ...
  })
  ```

- **`transition` on swap configs** — each entry in `swaps` now accepts a `transition` option (`string` or `(ctx) => string`) that contributes a transition type scoped to that specific swap. If the swap's `if()` callback returns `false` (meaning no DOM change occurs), the transition is excluded from the `startViewTransition` call entirely:

```js
ajax.register({
  target: '#cart-page form',
  swaps: [
    {
      replace: '#cart-list',
      transition: 'update-list',
      if: (current, next) => current.children.length !== next.children.length,
    },
    {
      replace: '#cart-button',
      transition: 'update-count',
    },
  ],
})
```

- **`match` on swap configs** — when a `replace` selector matches multiple elements, `match` names an attribute used to pair each current element with the correct counterpart in the fetched page (instead of every matched element receiving the same one):

```js
ajax.register({
  target: '#todo-list',
  swaps: [{ replace: '#todo-list li', match: 'id' }],
})
```

### Bug fixes

- **`morph` now correctly participates in the swap pipeline** — it previously reimplemented the full element-finding loop and never called `next()`, which meant `debug`, `scripts`, and any other swap-phase plugins were skipped when morph was active. It now sets `ctx.replace` and calls `next()`, leaving the loop to the shared swap logic.

- **`preload` no longer intercepts POST requests** — the preloaded document cache is now only consulted for `GET` requests. Previously, submitting a `<form>` whose action URL had been preloaded would silently skip the fetch and send no form data to the server.
