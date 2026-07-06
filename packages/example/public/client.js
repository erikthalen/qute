import ajax, {
  morph,
  preload,
  debug,
  loading,
  history,
  headers,
  head,
} from '@erikt/ajax'

const preloader = preload({ strategy: 'fetch' })

ajax.use(preloader)
ajax.use(morph)
ajax.use(debug)
ajax.use(loading())

ajax.use(head({ title: true }))

ajax.register({
  target: '#link-store',
  plugins: [history('push')],
  swaps: [{ replace: '#main' }],
})

// ajax.register({
//   target: '#cart-button',
//   transitions: ['slide-left'],
//   plugins: [history('push')],
//   swaps: [{ replace: '#main' }],
// })

ajax.register({
  target: '#cart-page form',
  trigger: ['change', 'submit'],
  swaps: [
    {
      replace: '#cart-page ul',
      with: ['#cart-page ul', '#cart-page .empty'],
      mode: 'outerHTML',
      transition: 'update-cart-page',
      if: (current, next) => current.children.length !== next.children.length,
    },
    {
      replace: '#cart-button',
      mode: 'outerHTML',
      transition: 'update-cart-count',
    },
  ],
})

ajax.register({
  target: '#cart-drawer form',
  trigger: ['change', 'submit'],
  plugins: [preloader.invalidate()],
  swaps: [
    {
      replace: '#cart-page ul',
      with: ['#cart-page ul', '#cart-page .empty'],
      mode: 'outerHTML',
      transition: 'update-cart-page',
    },
    {
      replace: '#cart-drawer',
    },
    {
      replace: '#cart-button',
      mode: 'outerHTML',
      transition: 'update-cart-count',
    },
  ],
})

ajax.register({
  target: '#product form',
  transitions: ['update-cart-count'],
  plugins: [
    loading((ctx) => ctx.element.querySelector('[type="submit"]')),
    preloader.invalidate('/cart'),
  ],
  swaps: [
    {
      replace: '#cart-button',
    },
    {
      replace: '#cart-drawer',
    },
  ],
})

ajax.register({
  target: '#login-form form',
  transitions: ['form-submitted', 'user-login'],
  swaps: [
    {
      replace: '#login-form',
      with: '#form-response',
    },
    {
      replace: '#profile',
      with: '#user',
      mode: 'outerHTML',
    },
  ],
})

let dir = 'down'

function change() {
  document.startViewTransition({
    update: () => {
      document.querySelector('.idle-view-transition').style.translate =
        dir === 'down' ? '0 100px' : '0 0px'

      if (dir === 'down') {
        dir = 'up'
      } else {
        dir = 'down'
      }
    },
    types: ['idle-view-transition'],
  })
}

setTimeout(change, 100)
// setInterval(change, 3000);
