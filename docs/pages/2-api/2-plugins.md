# Plugins

Plugins extend Ajax's request and swap lifecycle. A plugin is a plain object
with optional hooks, registered globally via `ajax.use()` or per-registration
via the `plugins` array on `ajax.register()`.

## Plugin interface

```ts
type Plugin = {
  key?: string    // optional identifier — per-registration plugins with the same key
                  // override the global plugin of the same key

  // Called once when an element is matched and attached to a registration
  attach?: (element: HTMLElement, config: AjaxConfig) => void

  // Wraps the fetch. Call next() to continue. Modify ctx.headers or ctx.body here.
  request?: (ctx: AjaxContext, next: () => Promise<void>) => Promise<void> | void

  // Wraps the DOM swap. Call next() to run the default swap (or the next plugin).
  // Omit next() to fully replace the default swap.
  swap?: (ctx: AjaxContext, next: () => Promise<void>) => Promise<void> | void

  // Called when an error is thrown anywhere in the pipeline
  error?: (error: unknown, ctx: AjaxContext) => void
}
```

## Global plugin

```js
ajax.use(myPlugin)
```

## Per-registration plugin

Pass plugins in the `plugins` array on a registration. A per-registration plugin
with a matching `key` replaces the global plugin of the same key for that request:

```js
ajax.register({
  target: "#form",
  plugins: [myPlugin],
  swaps: [{ replace: "#result" }],
})
```

## AjaxContext

The `ctx` object is passed to every `request`, `swap`, and `error` hook. It carries
everything known about the current request, and can be mutated by plugins to influence
what happens next.

```ts
type AjaxContext = {
  trigger: string        // DOM event name that fired (e.g. 'click', 'submit')
  element: HTMLElement   // the element the user interacted with
  url: string            // URL being fetched — from href or form action
  method: MethodType     // 'GET' for links; the form's method attribute for forms
  body?: FormData        // only present for form submissions
  headers: Record<string, string>  // mutate in a request hook to set custom headers

  config: AjaxConfig     // the full registration config for this request

  // populated after the fetch completes (available inside swap hooks):
  response?: Response
  incomingDocument?: Document

  // populated after the swap runs:
  swappedElements: Element[]
}
```

The typical read/write pattern by hook:

| Hook | Typical reads | Typical writes |
|---|---|---|
| `request` | `url`, `method`, `body` | `headers`, `body` |
| `swap` | `incomingDocument`, `swappedElements` | `incomingDocument` (to modify before swap) |
| `error` | `url`, `config` | — |

## Writing a plugin

```js
const timingPlugin = {
  async request(ctx, next) {
    const start = performance.now()
    await next()
    console.log(`${ctx.url} fetched in ${performance.now() - start}ms`)
  },
}

ajax.use(timingPlugin)
```

## Lifecycle events

Ajax dispatches custom events on `document` at each stage. These are emitted
by the built-in `events` plugin and are available to any listener on the page:

| Event | Detail |
|---|---|
| `ajax:attach` | `{ element, config }` |
| `ajax:before-request` | `AjaxContext` |
| `ajax:after-request` | `AjaxContext` |
| `ajax:before-swap` | `AjaxContext` |
| `ajax:after-swap` | `AjaxContext` |
| `ajax:error` | `{ error, context }` |
