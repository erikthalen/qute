import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { readFile } from 'node:fs/promises'
import type { Context } from 'hono'
import { layout } from './layout.ts'
import { homePage } from './pages/home.ts'
import { aboutPage } from './pages/about.ts'
import { storePage } from './pages/store.ts'
import { loginPage } from './pages/login.ts'
import { cartPage } from './pages/cart.ts'
import { profilePage } from './pages/profile.ts'

const THROTTLE_DELAY = Number(process.env.THROTTLE_DELAY ?? 0)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type Cart = Record<string, number>

function getCart(c: Context): Cart {
  const cookie = getCookie(c, 'cart')
  return cookie ? JSON.parse(cookie) : {}
}

function cartTotal(cart: Cart): number {
  return Object.values(cart).reduce((sum, n) => sum + n, 0)
}

function saveCart(c: Context, cart: Cart): void {
  setCookie(c, 'cart', JSON.stringify(cart), { path: '/' })
}

const app = new Hono()

app.use(compress())

app.get('/ajax.js', async (c) => {
  const js = await readFile(
    new URL(import.meta.resolve('@erikt/ajax')),
    'utf-8',
  )
  c.header('Content-Type', 'application/javascript')
  return c.body(js)
})

// app.use("/*", async (c, next) => {
//   await next();
//   const isPrefetch = c.req.header("Sec-Purpose")?.startsWith("prefetch");
//   c.header("Cache-Control", isPrefetch ? "max-age=10" : "no-store");
// });

app.use('/*', serveStatic({ root: './public' }))

app.get('/', async (c) => {
  await sleep(THROTTLE_DELAY)
  return c.html(
    layout(
      homePage(),
      getCookie(c, 'user'),
      getCart(c),
      'Swip swop, fragment swap',
    ),
  )
})
app.get('/about', async (c) => {
  await sleep(THROTTLE_DELAY)
  return c.html(
    layout(aboutPage(), getCookie(c, 'user'), getCart(c), 'About page'),
  )
})
app.get('/store', async (c) => {
  await sleep(THROTTLE_DELAY)
  const variant = c.req.query('variant') as
    | 'small'
    | 'medium'
    | 'large'
    | undefined
  return c.html(
    layout(storePage(variant), getCookie(c, 'user'), getCart(c), 'Shop now!'),
  )
})

app.get('/login', async (c) => {
  await sleep(THROTTLE_DELAY)
  return c.html(layout(loginPage(), getCookie(c, 'user'), getCart(c)))
})

app.get('/profile', async (c) => {
  await sleep(THROTTLE_DELAY)
  const user = getCookie(c, 'user')

  if (!user) {
    return c.redirect('/login')
  }

  return c.html(layout(profilePage(user), getCookie(c, 'user'), getCart(c)))
})
app.get('/cart', async (c) => {
  await sleep(THROTTLE_DELAY)
  const cart = getCart(c)
  return c.html(layout(cartPage(cart), getCookie(c, 'user'), cart))
})

app.get('/logout', (c) => {
  deleteCookie(c, 'user')
  return c.redirect('/login')
})

app.post('/login', async (c) => {
  const { name } = await c.req.parseBody<{ name: string }>()
  setCookie(c, 'user', name, { httpOnly: true, path: '/' })
  return c.redirect('/profile')
})

app.post('/cart', async (c) => {
  const { variant } = await c.req.parseBody<{ variant: string }>()
  const cart = getCart(c)
  cart[variant] = (cart[variant] ?? 0) + 1
  saveCart(c, cart)
  return c.redirect('/cart')
})

app.post('/cart-update', async (c) => {
  const { variantId, quantity } = await c.req.parseBody<{
    variantId: string
    quantity: string
  }>()
  const qty = Math.max(0, parseInt(quantity, 10) || 0)
  const cart = getCart(c)
  if (qty === 0) {
    delete cart[variantId]
  } else {
    cart[variantId] = qty
  }
  saveCart(c, cart)
  return c.redirect('/cart')
})

const server = serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('http://localhost:3000')
})

process.on('SIGTERM', () => server.close())
