# TargetConfig `match` Option Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `match` option to `TargetConfig` so that when a `replace` selector matches multiple elements, each one is paired with the correct counterpart in the incoming document by attribute value, instead of every matched element receiving the same single incoming element.

**Architecture:** `swap()` and `resolveTransitions()` in `packages/core/src/ajax.ts` both currently resolve a single incoming element per swap config (`querySelector`) and apply it to every current element. Both are changed to resolve *all* incoming elements matching the selector (`querySelectorAll`) and use a shared pairing helper that, when `match` is set, finds the incoming element sharing the same attribute value as each current element — falling back to "first incoming element for everyone" when `match` is omitted, which preserves today's behavior exactly.

**Tech Stack:** TypeScript, no test framework in this repo — verification is manual, via the `packages/example` app (matches existing project convention; no other `TargetConfig` field has automated tests).

## Global Constraints

- `match` is optional and must not change behavior for any `TargetConfig` that omits it (source: design spec, "Backward compatibility").
- Matching uses simple attribute-value equality only — no matcher function support in this version (source: design spec, "Match type" decision).
- When `match` is set and no incoming element has a matching attribute value for a given current element, that current element is skipped entirely — no swap, `if` is not called for it (source: design spec, "No match found" decision).
- Incoming elements are resolved from the first `with`/`replace` selector (array order) that returns any elements at all — same fallback selection as today, just collecting all matches instead of one (source: design spec, "With + match" decision).
- `resolveTransitions()` must use the same pairing logic as `swap()` so transition detection agrees with what will actually be swapped (source: design spec).

---

### Task 1: Add `match` field to `TargetConfig`

**Files:**
- Modify: `packages/core/src/types.ts:11-21`

**Interfaces:**
- Produces: `TargetConfig.match?: string` — consumed by Task 2's helper functions in `ajax.ts`.

- [ ] **Step 1: Add the `match` field to the type**

In `packages/core/src/types.ts`, update `TargetConfig`:

```ts
export type TargetConfig = {
  /** CSS selector for the element(s) in the current document to update */
  replace: string
  /** CSS selector(s) to pull content from in the fetched document. Falls back to `replace` if omitted */
  with?: string | string[]
  /** Attribute name used to pair each `replace` element with its counterpart
   *  in the incoming document, when `replace` matches multiple elements */
  match?: string
  /** Predicate to skip a swap for a specific element pair */
  if?: (current: Element, next: Element) => boolean
  /** How content is inserted. Defaults to `"innerHTML"` */
  mode?: SwapStrategy
  transition?: string | ((context: AjaxContext) => string)
}
```

- [ ] **Step 2: Typecheck**

Run: `cd packages/core && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/types.ts
git commit -m "feat: add match field to TargetConfig type"
```

---

### Task 2: Pair current/incoming elements by `match` attribute in `swap()` and `resolveTransitions()`

**Files:**
- Modify: `packages/core/src/ajax.ts:175-262`

**Interfaces:**
- Consumes: `TargetConfig.match` from Task 1.
- Produces: two module-private helpers, `resolveIncomingElements(incomingDocument: Document, swapConfig: TargetConfig): Element[]` and `matchIncoming(current: Element, incomingElements: Element[], match?: string): Element | undefined`, used by both `swap()` and `resolveTransitions()`.

- [ ] **Step 1: Add the two shared helpers**

In `packages/core/src/ajax.ts`, add these two functions directly above `function resolveTransitions(`:

```ts
function resolveIncomingElements(
  incomingDocument: Document,
  swapConfig: TargetConfig,
): Element[] {
  for (const selector of [swapConfig.with ?? swapConfig.replace].flat()) {
    const found = Array.from(incomingDocument.querySelectorAll(selector))
    if (found.length) return found
  }
  return []
}

function matchIncoming(
  current: Element,
  incomingElements: Element[],
  match?: string,
): Element | undefined {
  if (!match) return incomingElements[0]
  const value = current.getAttribute(match)
  if (value === null) return undefined
  return incomingElements.find((el) => el.getAttribute(match) === value)
}
```

- [ ] **Step 2: Use the helpers in `resolveTransitions()`**

Replace the body of the `for (const swapConfig of config.swaps)` loop inside `resolveTransitions` (currently lines ~187-218) with:

```ts
  for (const swapConfig of config.swaps) {
    if (!swapConfig.transition) continue

    const currentElements = Array.from(
      document.querySelectorAll(swapConfig.replace),
    )
    if (!currentElements.length) continue

    const incomingElements = resolveIncomingElements(incomingDocument, swapConfig)
    if (!incomingElements.length) continue

    const willSwap = currentElements.some((el) => {
      const incoming = matchIncoming(el, incomingElements, swapConfig.match)
      return incoming !== undefined && swapConfig.if?.(el, incoming) !== false
    })
    if (!willSwap) continue

    const t =
      typeof swapConfig.transition === 'function'
        ? swapConfig.transition(context)
        : swapConfig.transition

    if (t) perSwap.push(t)
  }
```

- [ ] **Step 3: Use the helpers in `swap()`**

Replace the body of `function swap(context: AjaxContext): void { ... }` (currently lines ~237-262) with:

```ts
function swap(context: AjaxContext): void {
  const { config, incomingDocument } = context
  if (!incomingDocument) return

  for (const swapConfig of config.swaps) {
    const mode: SwapStrategy = swapConfig.mode ?? 'innerHTML'
    const currentElements = document.querySelectorAll(swapConfig.replace)

    const incomingElements = resolveIncomingElements(incomingDocument, swapConfig)
    if (!incomingElements.length) return

    for (const currentElement of currentElements) {
      const incomingElement = matchIncoming(
        currentElement,
        incomingElements,
        swapConfig.match,
      )
      if (!incomingElement) continue
      if (swapConfig.if?.(currentElement, incomingElement) === false) continue
      const swapped = context.replace(currentElement, incomingElement, mode)
      if (swapped) context.swappedElements.push(swapped)
    }
  }
}
```

Note: the `if (!incomingElements.length) return` (exiting the whole `swap()` function, skipping any remaining swap configs) intentionally preserves today's exact behavior for "selector found nothing" — that's a pre-existing quirk, not something this task changes. The new `if (!incomingElement) continue` inside the inner loop is what implements per-element skipping when `match` finds no counterpart.

- [ ] **Step 4: Typecheck**

Run: `cd packages/core && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Build the core package**

Run: `cd packages/core && pnpm build`
Expected: build succeeds, `dist/index.js` and `dist/index.d.ts` are regenerated with the new `match` field visible in the `.d.ts` output.

Verify: `grep -A1 "match" packages/core/dist/index.d.ts` shows the new field.

- [ ] **Step 6: Manual verification — no `match` set (regression check)**

Run: `cd packages/example && pnpm dev` and open the app in a browser (e.g. `http://localhost:3000`).

Navigate to `/store`, click between variant links. Expected: the product panel (`#product`, single-element `replace`) still swaps correctly, exactly as before — this path never had multiple `currentElements`, so it's an unaffected-path sanity check.

- [ ] **Step 7: Manual verification — `match` with multiple elements**

Temporarily add a throwaway registration to `packages/example/src/pages/store.ts`'s `<script type="module">` block (do not commit this — it's just for manual verification) to swap the variant list itself using `match`:

```js
ajax.register({
  target: '.variant-link',
  transitions: ['variant-change'],
  plugins: [history('replace')],
  swaps: [
    { replace: '#product', with: '#product', mode: 'outerHTML' },
    {
      replace: '.variant-link',
      match: 'href',
      if: (current, next) => current.textContent !== next.textContent,
    },
  ],
})
```

Reload `/store`, click a variant link. Expected: no errors in the console, and each `.variant-link` element is paired with the incoming `.variant-link` sharing the same `href` (there's one per variant, so this is a 1:1 identity-attribute pairing — confirms multi-element `replace` no longer collapses onto a single incoming element). Remove this temporary snippet afterward — revert `store.ts` to its original content.

Run `git diff packages/example/src/pages/store.ts` afterward and confirm it's empty (snippet fully reverted).

- [ ] **Step 8: Commit**

```bash
git add packages/core/src/ajax.ts packages/core/dist
git commit -m "feat: pair current/incoming elements by match attribute in swap"
```

---

### Task 3: Document `match` in the API reference and changelog

**Files:**
- Modify: `docs/pages/2-api/0-register.md` (insert new section after the existing `### \`with\`` section, before `### \`mode\``)
- Modify: `docs/pages/4-changelog/index.md:3-7` (append a bullet under the existing `## 0.0.3` / `### New features` heading)

**Interfaces:**
- Consumes: final behavior from Task 2 (attribute equality matching, skip-on-no-match, `with`-array fallback-then-match semantics).

- [ ] **Step 1: Add the `match` doc section**

In `docs/pages/2-api/0-register.md`, insert this new section immediately after the `### \`with\`` section (after line 171's closing ` ``` ` and the `---` separator that follows it), and before `### \`mode\``:

```md
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
```

- [ ] **Step 2: Add the changelog bullet**

In `docs/pages/4-changelog/index.md`, add a new bullet under the existing `### New features` list (after the `transition` bullet's code block, before the `---` on line 26):

```md
- **`match` on swap configs** — when a `replace` selector matches multiple elements, `match` names an attribute used to pair each current element with the correct counterpart in the fetched page (instead of every matched element receiving the same one):

```js
ajax.register({
  target: "#todo-list",
  swaps: [{ replace: "#todo-list li", match: "id" }],
})
```
```

- [ ] **Step 3: Review rendered docs**

Run: `cd docs && pnpm dev`, open the register and changelog pages in a browser, and confirm the new sections render without markdown formatting issues (code fences closed correctly, list nesting correct).

- [ ] **Step 4: Commit**

```bash
git add docs/pages/2-api/0-register.md docs/pages/4-changelog/index.md
git commit -m "docs: document match option on TargetConfig"
```
