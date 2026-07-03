# events

The events plugin dispatches `CustomEvent`s on `document` at each stage of
the Ajax lifecycle. It is active by default — you do not need to import or
configure it.

## Events

| Event | Fired | Detail |
|---|---|---|
| `ajax:attach` | When an element is matched and registered | `{ element, config }` |
| `ajax:before-request` | Before the fetch is sent | `AjaxContext` |
| `ajax:after-request` | After the response is received | `AjaxContext` |
| `ajax:before-swap` | Before DOM mutation begins | `AjaxContext` |
| `ajax:after-swap` | After all fragments have been swapped | `AjaxContext` |
| `ajax:error` | When an error is thrown anywhere in the pipeline | `{ error, context }` |

## Usage

```js
document.addEventListener("ajax:after-swap", (e) => {
  console.log("swapped", e.detail.swappedElements)
})

document.addEventListener("ajax:before-request", (e) => {
  e.detail.headers["X-Custom"] = "value"
})

document.addEventListener("ajax:error", (e) => {
  const { error, context } = e.detail
  reportError(error, context.url)
})
```

## AjaxContext shape

The `detail` on request and swap events is the full request context:

```ts
type AjaxContext = {
  trigger: string
  element: HTMLElement
  url: string
  method: "GET" | "POST"
  body?: FormData
  headers: Record<string, string>
  config: AjaxConfig
  response?: Response
  incomingDocument?: Document
  swappedElements: Element[]
}
```
