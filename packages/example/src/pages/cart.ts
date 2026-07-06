import { html } from 'hono/html'
import type { HtmlEscapedString } from 'hono/utils/html'
import { product } from '../data/product.ts'
import { icon } from '../components/icon.ts'

export function cartPage(
  cart: Record<string, number>,
  id?: string,
): HtmlEscapedString | Promise<HtmlEscapedString> {
  const items = Object.entries(cart).flatMap(([id, quantity]) => {
    const variant = product.variants.find((v) => v.id === id)
    return variant ? [{ ...variant, quantity }] : []
  })

  return html`
    <div id="${id ?? 'cart-page'}">
      <h1 class="sr-only">Cart</h1>

      ${items.length === 0
        ? html`
            <section class="empty">
              ${icon('cart')}
              <h3>Your cart is empty</h3>
              <p>Add something from the store to get started.</p>
              <a href="/store" class="button">Go to store</a>
            </section>
          `
        : html`<ul>
            ${items.map(
              (item) => html`
                <li style="--vt-name: ${item.id}">
                  <img src="${item.image}" alt="${item.name}" />

                  <strong>${item.name}</strong>

                  <form method="post" action="/cart-update">
                    <input type="hidden" name="variantId" value="${item.id}" />

                    <fieldset role="group">
                      <input
                        type="number"
                        value="${item.quantity}"
                        min="0"
                        readonly
                        name="quantity"
                        style="width:6ch"
                      />
                      <button
                        type="button"
                        class="ghost square"
                        aria-label="Decrement"
                        onclick="const i=this.closest('form').querySelector('[name=quantity]');i.stepDown();i.dispatchEvent(new Event('change',{bubbles:true}))"
                      >
                        ${icon('minus')}
                      </button>
                      <button
                        type="button"
                        class="ghost square"
                        aria-label="Increment"
                        onclick="const i=this.closest('form').querySelector('[name=quantity]');i.stepUp();i.dispatchEvent(new Event('change',{bubbles:true}))"
                      >
                        ${icon('plus')}
                      </button>
                    </fieldset>
                  </form>

                  <form method="post" action="/cart-update">
                    <input type="hidden" name="variantId" value="${item.id}" />
                    <input type="hidden" name="quantity" value="0" />
                    <button
                      type="submit"
                      class="ghost square"
                      aria-label="Remove"
                    >
                      ${icon('x')}
                    </button>
                  </form>
                </li>
              `,
            )}
          </ul>`}
    </div>
  `
}
