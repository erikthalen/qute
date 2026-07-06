# `match` option on `TargetConfig`

## Problem

`TargetConfig.replace` can select multiple elements (e.g. `#list li`). Today, `swap()` resolves the incoming element with a single `querySelector` and applies that *one* incoming element to every matched current element — there's no way to pair each current element with its correct counterpart in the incoming document.

## Solution

Add an optional `match` field: an attribute name used to pair each current element with the incoming element sharing the same attribute value.

```ts
export type TargetConfig = {
  replace: string
  with?: string | string[]
  /** Attribute name used to pair each `replace` element with its counterpart
   *  in the incoming document, when `replace` matches multiple elements */
  match?: string
  if?: (current: Element, next: Element) => boolean
  mode?: SwapStrategy
  transition?: string | ((context: AjaxContext) => string)
}
```

## Behavior

- Incoming elements are resolved via `querySelectorAll` on the first `with`/`replace` selector (in array order) that returns any elements — mirrors today's fallback semantics for picking *which* selector to use, but now collects all matches instead of one.
- For each current element:
  - If `match` is set: find the incoming element where `incoming.getAttribute(match) === current.getAttribute(match)`. If none found, skip that current element entirely (no swap, `if` is not called).
  - If `match` is not set: behavior is unchanged — the first incoming element found is used for every current element.
- The `if` predicate continues to run per matched current/incoming pair, same as today.
- `resolveTransitions` applies the same pairing logic when deciding whether a swap will happen and which `transition` value to use, so transition detection matches actual swap behavior.

## Backward compatibility

`match` is optional. Omitting it preserves exact current behavior (single incoming element, applied to all current elements). No existing configs change behavior.

## Testing

- `replace: '#list li'`, `match: 'id'`, incoming document with `<li>`s in a different order/subset than current: each current `<li>` should be updated from the incoming `<li>` sharing its `id`, and current `<li>`s with no matching incoming `id` should be left untouched.
- Existing swap tests without `match` continue to pass unchanged.
