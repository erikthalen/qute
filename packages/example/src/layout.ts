import { html } from 'hono/html'
import type { HtmlEscapedString } from 'hono/utils/html'
import { loginButton } from './components/login-button.ts'
import { userButton } from './components/user-button.ts'
import { cartButton } from './components/cart-button.ts'
import { type Cart } from './server.ts'
import { cartDrawer } from './components/cart-drawer.ts'

export function layout(
  content: HtmlEscapedString | Promise<HtmlEscapedString>,
  user?: string,
  cart: Cart = {},
  title: string = '',
): HtmlEscapedString | Promise<HtmlEscapedString> {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} - Ajax</title>
        <script type="importmap">
          {
            "imports": {
              "@erikt/ajax": "/ajax.js",
              "idiomorph": "https://esm.sh/idiomorph@0.7.4"
            }
          }
        </script>
        <link rel="stylesheet" href="https://esm.sh/@erikt/ui" />
        <link rel="stylesheet" href="/style.css" />
        <link rel="stylesheet" href="/transitions.css" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTExIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDE3Ljk5OHYtLjVsLTguMTMtMTQuOTlhMSAxIDAgMCAwLTEuNzQgMGwtOC4xMyAxNC45ODl2LjVjMCAxLjY1OSA0LjAzIDMuMDAzIDkgMy4wMDNzOS0xLjM0NCA5LTMuMDAyIi8+PC9zdmc+"
        />

        <!-- <script src="/qute.js" type="module"></script> -->
        <script src="/client.js" type="module"></script>
      </head>
      <body>
        <aside class="idle-animation"></aside>
        <aside class="idle-view-transition"></aside>
        <aside class="markers"></aside>

        <header>
          <a href="/" id="link-home">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 17.998v-.5l-8.13 -14.99a1 1 0 0 0 -1.74 0l-8.13 14.989v.5c0 1.659 4.03 3.003 9 3.003s9 -1.344 9 -3.002"
              />
            </svg>
          </a>

          <nav>
            <a href="/about" id="link-about">About</a>
            <a href="/store" id="link-store">Store</a>
          </nav>

          <span>
            ${user ? userButton(user) : loginButton()}

            <!--  -->

            ${cartDrawer(cart)}

            <!-- {cartButton(cartCount)} -->
          </span>
        </header>

        <main id="main">${content}</main>
      </body>
    </html>`
}
