# register()

`ajax.register(config)` is the main API. Call it once per interaction type —
each call wires up event listeners and teaches Ajax what to fetch and swap.

```js
import ajax from "@erikt/ajax"

ajax.register({
  target: "#link-about",
  swaps: [{ replace: "#main" }],
})
```

Ajax observes the DOM, so elements matching `target` that are added after the
call is made are picked up automatically.

---

## AjaxConfig

### `target`

```ts
target: string
```

A CSS selector for the element(s) that trigger requests. Every element in the
document matching this selector gets an event listener attached.

```js
ajax.register({ target: "a[data-ajax]", swaps: [...] })
ajax.register({ target: "#nav a", swaps: [...] })
```

---

### `swaps`

```ts
swaps: TargetConfig[]
```

An array of swap instructions. Each entry describes one element to update in the
current page using content from the fetched page. Multiple swaps run in order —
useful for updating a main content area and a sidebar in a single request.

See [TargetConfig](#targetconfig) below.

---

### `trigger`

```ts
trigger?: string | string[]
```

The DOM event(s) to listen for on matching elements. Defaults to `"click"` for
links and `"submit"` for forms. Pass a string or an array to listen for multiple
events.

```js
// fire on both focus and click
ajax.register({ target: "#btn", trigger: ["mouseenter", "click"], swaps: [...] })
```

---

### `transitions`

```ts
transitions?: string[]
```

Type names passed to the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
(`document.startViewTransition({ types })`). Use these to drive CSS `@keyframes`
tied to `::view-transition-*` pseudo-elements.

If the browser does not support `startViewTransition`, the swap runs without any
transition — no polyfill, no error.

```js
ajax.register({
  target: "#link-about",
  transitions: ["slide-left"],
  swaps: [...],
})
```

```css
@keyframes slide-in {
  from { translate: 100% 0; }
}

::view-transition-new(*):active-view-transition-type(slide-left) {
  animation: slide-in 200ms ease;
}
```

---

### `plugins`

```ts
plugins?: Plugin[]
```

Per-registration plugins that run in addition to (or instead of) globally
registered plugins. A per-registration plugin with the same `key` as a global
plugin replaces it for this registration only.

```js
import ajax, { loading } from "@erikt/ajax"

ajax.use(loading())  // default: spinner on the triggering element

ajax.register({
  target: "#search-form",
  plugins: [loading("#search-spinner")],  // override for this registration only
  swaps: [{ replace: "#results" }],
})
```

See the [Plugins](/api/plugins) page for the full plugin interface.

---

### `prevent`

```ts
prevent?: boolean
```

Whether to call `e.preventDefault()` on the triggering event. Defaults to
`true`, which is the right behaviour for links and forms (stops the browser from
navigating). Set to `false` only if you need the default browser action to also
run.

---

## TargetConfig

Each entry in `swaps` is a `TargetConfig`:

### `replace`

```ts
replace: string
```

CSS selector for the element(s) in the **current page** to update. All matching
elements are updated.

---

### `with`

```ts
with?: string | string[]
```

CSS selector(s) to find the replacement content in the **fetched page**. The
first selector that matches wins. Defaults to the value of `replace` when
omitted.

Pass an array as a fallback chain — useful when the fetched page might not always
include the same element:

```js
{ replace: "#sidebar", with: ["#sidebar-full", "#sidebar"] }
```

---

### `match`

```ts
match?: string
```

When `replace` matches multiple elements, `match` names an attribute used to
pair each current element with its counterpart in the fetched page, instead of
applying the first found element to all of them. Elements are paired when
`current.getAttribute(match) === next.getAttribute(match)`. A current element
with no matching counterpart is left untouched.

```js
{ replace: "#list li", match: "id" }
```

---

### `mode`

```ts
mode?: 'innerHTML' | 'outerHTML' | 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
```

How content is inserted. Defaults to `"innerHTML"`.

| Mode | Effect |
|---|---|
| `innerHTML` | Replace the inner content, keep the wrapper element |
| `outerHTML` | Replace the element itself |
| `beforebegin` | Insert before the element |
| `afterbegin` | Insert as the first child |
| `beforeend` | Insert as the last child |
| `afterend` | Insert after the element |

---

### `if`

```ts
if?: (current: Element, next: Element) => boolean
```

A guard function called for each matched element before the swap runs. Return
`false` to skip the swap for that element. Useful for conditional updates — for
example, skipping a swap when the new content is identical:

```js
{
  replace: "#cart-count",
  if: (current, next) => current.textContent !== next.textContent,
}
```
