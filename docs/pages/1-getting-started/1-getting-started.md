---
label: Getting started
---

# Quick start

This guide walks through building a page that swaps content without full
reloads, with an animated transition.

## 1. Load Ajax

Add the import map to your HTML `<head>`:

```html index.html
<script type="importmap">
  {
    "imports": {
      "@erikt/ajax": "https://esm.sh/@erikt/ajax"
    }
  }
</script>
```

## 2. Mark up your page

Ajax works with your existing HTML. You need a trigger element (a link or form)
and a target element to swap content into:

```html index.html
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<main id="content">
  <h1>Home</h1>
  <p>Welcome to the home page.</p>
</main>
```

The fetched page must contain an element matching the same selector (`#content`)
for the swap to work.

## 3. Register

Tell Ajax which elements trigger swaps and what to swap:

```js app.js
import ajax, { history } from '@erikt/ajax'

ajax.register({
  target: 'nav a',
  plugins: [history('push')],
  swaps: [{ replace: '#content' }],
})
```

Clicking any `<a>` inside `nav` now fetches the href, picks `#content` out of
the response, and swaps it into the current page — no full reload.

## 4. Add a transition

Pass transition type names at the registration level, then define the animation in CSS:

```html index.html
<script type="module">
  import ajax, { history } from '@erikt/ajax'

  ajax.register({
    target: 'nav a',
    transitions: ['fade'],
    plugins: [history('push')],
    swaps: [{ replace: '#content' }],
  })
</script>

<style>
  html:active-view-transition-type(fade) {
    #content {
      view-transition-name: content;
    }
    &::view-transition-old(content) {
      animation: 200ms ease both fade-out;
    }
    &::view-transition-new(content) {
      animation: 200ms ease both fade-in;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
</style>
```

## Next steps

- [Transitions](/api/transitions) — slide, FLIP, direction-aware animations
- [register()](/api/register) — full API reference for `ajax.register()`
- [Morph plugin](/plugins/plugin-morph) — preserve focus and element state across swaps
- [Preload plugin](/plugins/plugin-preload) — prefetch pages before the user clicks
