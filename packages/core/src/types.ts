export type MethodType = 'GET' | 'POST'

export type SwapStrategy =
  | 'innerHTML'
  | 'outerHTML'
  | 'beforebegin'
  | 'afterbegin'
  | 'beforeend'
  | 'afterend'

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

export type AjaxConfig = {
  /** CSS selector for the element(s) that trigger the request */
  target: string
  /** DOM event that triggers the request. Defaults to `"click"` for links, `"submit"` for forms */
  trigger?: string | string[]
  /** DOM swaps to perform after the response is received */
  swaps: TargetConfig[]
  /** Plugins to run for this registration (merged with global plugins) */
  plugins?: Plugin[]
  /** Whether to call `preventDefault()` on the trigger event. Defaults to `true` */
  prevent?: boolean
  /** View Transition API type names passed to `startViewTransition()`. Skipped if API is unavailable */
  transitions?: string[] | ((context: AjaxContext) => string[])
}

export type AjaxContext = {
  /** DOM event name that triggered the request (e.g. `"click"`) */
  trigger: string
  /** The element that was interacted with */
  element: HTMLElement
  /** URL being fetched, taken from `href` or `action` */
  url: string
  /** HTTP method derived from the element (`"GET"` for links, form `method` attribute for forms) */
  method: MethodType
  /** Form data — only present for form submissions */
  body?: FormData
  /** Request headers. Mutate in a `request` hook to add or override headers */
  headers: Record<string, string>
  /** The registration config that produced this request */
  config: AjaxConfig
  /** The raw fetch Response — available after the fetch, inside `swap` hooks */
  response?: Response
  /** Parsed response document — available after the fetch, inside `swap` hooks */
  incomingDocument?: Document
  /** Elements that were updated during the swap — populated after `swap` runs */
  swappedElements: Element[]
  replace: Replacer
}

export type Replacer = (
  current: Element,
  incoming: Element,
  mode: SwapStrategy,
) => Element | null

export type Hook = (
  context: AjaxContext,
  next: () => Promise<void>,
) => Promise<void> | void

export type ErrorHook = (error: unknown, context: AjaxContext) => void

export type Plugin = {
  key?: string
  attach?: (element: HTMLElement, config: AjaxConfig) => void
  request?: Hook
  swap?: Hook
  error?: ErrorHook
}
