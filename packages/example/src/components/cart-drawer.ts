import { html } from 'hono/html'
import type { HtmlEscapedString } from 'hono/utils/html'
import { icon } from './icon.ts'
import { type Cart } from '../server.ts'
import { cartPage } from '../pages/cart.ts'

export function cartDrawer(
  cart: Cart,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const count = Object.values(cart).reduce((sum, n) => sum + n, 0)

  return html`
    <button
      id="cart-button"
      class="button ghost square"
      aria-label="Cart${count > 0 ? ` (${count} items)` : ''}"
      data-tooltip="bottom"
      style="position:relative;text-decoration:none"
      onclick="document.getElementById('cart-drawer').showModal()"
    >
      ${icon('cart')}
      ${count > 0 ? html`<span id="cart-count">${count}</span>` : ''}
    </button>

    <dialog id="cart-drawer" closedby="any">
      <article>
        <header>
          <strong>Cart</strong>
          <strong>${count} items</strong>
        </header>

        ${cartPage(cart, 'cart-drawer-content')}
      </article>
    </dialog>

    <style>
      #cart-drawer {
        top: 1rem;
        right: 1rem;
        bottom: auto;
        left: auto;

        background: var(--ui-neutral-0);

        view-transition-name: cart-drawer;

        article {
          header {
            justify-content: space-between;
          }
        }

        &::backdrop {
          backdrop-filter: blur(1px);
          background: rgba(0, 0, 0, 0.1);
          view-transition-name: cart-drawer-backdrop;
        }
      }
    </style>
  `
}
