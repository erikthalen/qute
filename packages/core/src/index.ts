export type {
  AjaxConfig,
  AjaxContext,
  Hook,
  ErrorHook,
  Plugin,
  Replacer,
  TargetConfig,
  SwapStrategy,
  MethodType,
} from './types.js'

export {
  preload,
  morph,
  debug,
  loading,
  history,
  headers,
  head,
} from './plugins/index.js'

export type {
  PreloadPlugin,
  PreloadOptions,
  PreloadStrategy,
  PreloadEagerness,
  IgnoreRule,
  LoadingTarget,
} from './plugins/index.js'

export { use, register } from './ajax.js'
export { default } from './ajax.js'
