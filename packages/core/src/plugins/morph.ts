import type { Plugin } from '../types.js'
import { defaultReplace } from '../ajax.js'

type IdiomorphModule = {
  Idiomorph: {
    morph(
      oldNode: Element,
      newNode: Element | string,
      options?: { morphStyle?: 'innerHTML' | 'outerHTML' },
    ): void
  }
}

let cached: IdiomorphModule | null = null

async function load(): Promise<IdiomorphModule | null> {
  try {
    if (!cached) cached = await import('idiomorph')
    return cached
  } catch {
    console.warn(
      '[ajax] morph plugin requires "idiomorph" — install it as a dependency or remove the morph plugin.',
    )
    return null
  }
}

export const morph: Plugin = {
  async swap(ctx, next) {
    const IdiomorphModule = await load()
    if (!IdiomorphModule) return next()

    const { Idiomorph } = IdiomorphModule

    ctx.replace = (current, incoming, mode) => {
      if (mode !== 'innerHTML' && mode !== 'outerHTML') {
        return defaultReplace(current, incoming, mode)
      }
      Idiomorph.morph(
        current,
        mode === 'innerHTML' ? incoming.innerHTML : incoming.outerHTML,
        {
          morphStyle: mode,
        },
      )
      return current
    }

    return next()
  },
}
