# Plugins

Most functionality of Ajax are coming from plugins. Three run by default on every registration, you do
not need to import or configure them. The rest are opt-in: import and pass to
`ajax.use()` for global scope, or include in the `plugins` array on a specific
registration.

## Built-in

These are always active:

| Plugin                      | Purpose                                             |
| --------------------------- | --------------------------------------------------- |
| [headers](/plugins/headers) | Adds `X-Ajax-Request: true` to every fetch          |
| [scripts](/plugins/scripts) | Re-executes `<script>` tags inside swapped elements |
| [events](/plugins/events)   | Dispatches `ajax:*` CustomEvents on `document`      |

## Optional

Import from `@erikt/ajax` and register with `ajax.use()` or per-registration:

| Plugin                    | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| [loading](/plugins/loading) | Sets `aria-busy="true"` on an element during a request |
| [history](/plugins/history) | Calls `pushState` or `replaceState` after a swap       |
| [debug](/plugins/debug)     | Logs colored, grouped output for every lifecycle stage |
| [morph](/plugins/morph)     | Replaces the default swap with Idiomorph diffing       |
| [preload](/plugins/preload) | Preloads links as they scroll into view                |
| [head](/plugins/head)       | Updates `<head>` metadata after a swap                 |
