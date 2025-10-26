import type { Product, CartItem } from '@/types'

// Baitech WhatsApp business number
const WHATSAPP_NUMBER = '254799954672'

/**
 * Generate WhatsApp URL for single product inquiry/order
 */
export function generateProductWhatsAppUrl(product: Product): string {
  const message = `Hello Baitech! 👋

I'm interested in the following product:

📦 *${product.name}*
💰 Price: Ksh ${product.price.toLocaleString()}
🏷️ Category: ${product.category}
${product.stock > 0 ? `✅ In Stock: ${product.stock} available` : '❌ Out of Stock'}

I would like to:
[ ] Get more information
[ ] Place an immediate order
[ ] Check delivery options

Please assist me. Thank you!`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Generate WhatsApp URL for cart checkout
 */
export function generateCartWhatsAppUrl(items: CartItem[]): string {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const itemsList = items
    .map((item, index) =>
      `${index + 1}. *${item.name}*
   Quantity: ${item.quantity}
   Price: Ksh ${(item.price * item.quantity).toLocaleString()}`
    )
    .join('\n\n')

  const message = `Hello Baitech! 👋

I would like to place an order for the following items:

${itemsList}

━━━━━━━━━━━━━━━━━
💵 *Total: Ksh ${total.toLocaleString()}*

Please confirm availability and delivery details. Thank you!`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Generate WhatsApp URL for general inquiry
 */
export function generateGeneralInquiryUrl(subject?: string): string {
  const message = subject
    ? `Hello Baitech! 👋\n\nI have a question about: ${subject}\n\nPlease assist me. Thank you!`
    : `Hello Baitech! 👋\n\nI would like to inquire about your products and services.\n\nPlease assist me. Thank you!`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Open WhatsApp in new window
 */
export function openWhatsApp(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}
